import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { extractDeviceFields, parseDeviceSchema, normalizeDeviceValues, normalizeDeviceWrite, collectDeviceHistory, normalizeHistoryRows } from '../utils/thingsvis-device-schema.js'

const fields = extractDeviceFields({ telemetry: { list: [{ key: 'power', data_type: 'int' }] }, attributes: [{ key: 'enabled', data_type: 'bool' }], commands: [{ key: 'restart', data_type: 'json' }] })
assert.equal(fields[0].dataType, 'telemetry')
assert.deepEqual(normalizeDeviceValues({ data: [{ key: 'power', value: 0 }] }), { power: 0 })
const original = { canvas: { width: 390, height: 844 }, nodes: [{ type: 'interaction/basic-switch', props: { value: '{{ ds.device.data.power }}' } }], dataSources: [{ id: 'device', type: 'PLATFORM_FIELD', config: { deviceId: '__template__' } }] }
const schema = parseDeviceSchema(original, 'real-device', fields)
assert.equal(schema.dataSources[0].config.deviceId, 'real-device')
assert.equal(original.dataSources[0].config.deviceId, '__template__')
assert.equal(schema.canvas.responsive, false)
assert.equal(schema.nodes[0].events[0].actions[0].dataSourceId, 'device')
const withManual = structuredClone(original)
withManual.nodes[0].events = [{ event: 'change', actions: [{ type: 'callWrite', dataSourceId: 'device', payload: 'payload' }] }]
assert.equal(parseDeviceSchema(withManual, 'real-device', fields).nodes[0].events[0].actions.length, 1)
assert.equal(parseDeviceSchema(null, 'device', fields), null)
assert.throws(() => parseDeviceSchema('{bad', 'device', fields))
assert.deepEqual(normalizeDeviceWrite({ power: false }, fields), { kind: 'telemetry', data: { power: 0 } })
assert.deepEqual(normalizeDeviceWrite({ enabled: 'false' }, fields), { kind: 'attribute', data: { enabled: false } })
assert.throws(() => normalizeDeviceWrite({ power: 'invalid' }, fields))
assert.throws(() => normalizeDeviceWrite({ foreign: 1 }, fields))
assert.throws(() => normalizeDeviceWrite({ power: 1, enabled: true }, fields))
assert.throws(() => normalizeDeviceWrite({ enabled: 'invalid' }, fields))
assert.equal(collectDeviceHistory(schema, { dataSourceId: 'device', fieldIds: ['power'] }).size, 0)
assert.equal(collectDeviceHistory({ ...schema, nodes: [{ props: { timeRangePreset: '1h', series: '{{ ds.device.data.power__history }}' } }] }).get('power'), 'last_1h')
assert.deepEqual(normalizeHistoryRows([{ ts: 1700000000, value: 0 }, { ts: '1700000000000', value: 1 }, { ts: 'invalid', value: 2 }]), [{ ts: 1700000000000, value: 0 }, { ts: 1700000000000, value: 1 }])
console.log('ThingsVis device schema checks passed')

const historyNode = { props: {}, data: [{ expression: '{{ ds.device.data.power__history }}', historyConfig: { timeRange: '24h' } }] }
const historySchema = { ...schema, nodes: [historyNode] }
assert.equal(collectDeviceHistory(historySchema).get('power'), 'last_24h')
assert.equal(collectDeviceHistory(historySchema, { fieldIds: ['power__history'] }).get('power'), 'last_24h')
assert.equal(collectDeviceHistory(historySchema, { fieldIds: ['power__history'], historyConfig: { timeRange: '1h' } }).get('power'), 'last_1h')
original.nodes.push(historyNode)
assert.equal(parseDeviceSchema(original, 'real-device', fields).dataSources[0].config.bufferSize, 1, '历史绑定必须开启专用消息缓冲')

// 使用真实 runtime 和模拟传输检查写控制、去重与关闭；不会向设备发送请求。
const calls = [], messages = [], states = []
const historyRows = Array.from({ length: 8200 }, (_, i) => ({ ts: 1700000000 + i * 10, value: i % 60 }))
globalThis.__deviceApi = async (path, data, method) => {
  calls.push({ path, data, method })
  if (path.startsWith('device/template/detail/')) return { app_chart_config: original }
  if (path === 'device/model/telemetry') return [{ key: 'power', data_type: 'int' }]
  if (path.startsWith('device/model/')) return []
  if (path === 'user/detail') return { id: 'user', userName: 'tester', email: 'test@example.com', authority: 'SYS_ADMIN' }
  if (path.startsWith('telemetry/datas/current/')) return [{ key: 'power', value: 1 }]
  if (path === 'telemetry/datas/pub') return { accepted: true }
  if (path === 'telemetry/datas/statistic') {
    assert.equal(data.time_range, 'last_24h')
    return historyRows
  }
  throw new Error(`Unexpected API: ${path}`)
}
globalThis.uni = {
  getStorageSync: () => 'test-token',
  request: options => {
    assert.equal(options.data.userInfo.tenantId, 'thingspanel-sys-admin')
    options.success({ statusCode: 200, data: { accessToken: 'test-sso' } })
  },
  connectSocket: () => ({ onOpen() {}, onMessage() {}, onError() {}, onClose() {}, close() {} })
}
const helperUrl = `data:text/javascript;base64,${Buffer.from(await readFile(new URL('../utils/thingsvis-device-schema.js', import.meta.url))).toString('base64')}`
const runtimeSource = (await readFile(new URL('../services/thingsvis-device-runtime.js', import.meta.url), 'utf8'))
  .replace("import { requestDeviceApi } from '../api/modules/device-overview.js'", 'const requestDeviceApi = globalThis.__deviceApi')
  .replace("'../utils/thingsvis-device-schema.js'", JSON.stringify(helperUrl))
const { createDeviceRuntime } = await import(`data:text/javascript;base64,${Buffer.from(runtimeSource).toString('base64')}`)
const runtime = createDeviceRuntime({ deviceId: 'real-device', device: { name: 'device', is_online: 1, device_config: { device_template_id: 'template' } }, addresses: { thingsVisPageUrl: 'https://example.com/main.html', thingsVisApiBase: 'https://example.com/thingsvis-api', thingsPanelApiBase: 'https://example.com/api/v1' }, onMessage: item => messages.push(item), onState: item => states.push(item) })
const started = await runtime.start()
assert.equal(calls.filter(call => call.path === 'telemetry/datas/statistic').length, 1)
assert.equal(messages.length, 0, '历史预加载期间不推送实时点或历史消息')
assert.ok(started.url.startsWith('https://example.com/main.html#/embed?'))
await runtime.handleMessage({ type: 'READY' })
assert.equal(messages.at(-1).type, 'tv:init')
await runtime.handleMessage({ type: 'LOADED' })
assert.equal(messages.length, 1, 'LOADED 不应提前发送随后会重复回填的历史')
await runtime.handleMessage({ type: 'thingsvis:requestFieldData', payload: { dataSourceId: 'device', fieldIds: ['power'], deviceId: 'real-device' } })
assert.equal(messages[1].type, 'tv:platform-history', '历史必须先于实时值发给图表')
assert.equal(messages[1].payload.bufferLimit, historyRows.length)
assert.equal(messages[1].payload.history.length, historyRows.length, '完整历史不能被默认缓冲大小截断')
assert.equal(messages[2].type, 'tv:platform-data')
assert.equal(messages[2].payload.fields.power__history, undefined, '历史数组不能再作为实时字段进入嵌套缓冲')
assert.equal(calls.filter(call => call.path === 'telemetry/datas/statistic').length, 1, 'LOADED 不重复拉取历史')
assert.equal(calls.filter(call => call.path.startsWith('telemetry/datas/current/')).length, 1, '握手不重复查询已预加载的实时首值')
assert.equal(messages.filter(item => item.type === 'tv:platform-history').length, 1, '一轮初始化只回填一次完整历史')
assert.equal(calls.filter(call => call.path === 'telemetry/datas/statistic').length, 1, '数据源握手复用首屏历史')
assert.ok(messages.filter(item => item.type === 'tv:platform-data').every(item => Object.keys(item.payload.fields).every(key => !key.endsWith('__history'))), '握手重放也不能将历史塞入实时字段')
assert.equal(states.at(-1).status, 'ready')
await runtime.handleMessage({ type: 'tv:error', payload: { message: 'runtime failed' } })
assert.deepEqual(states.at(-1), { status: 'warning', message: 'runtime failed' })
const request = { type: 'tv:platform-write', requestId: 'one', payload: { deviceId: 'real-device', dataSourceId: 'device', data: { power: false } } }
await Promise.all([runtime.handleMessage(request), runtime.handleMessage(request)])
assert.equal(calls.filter(call => call.path === 'telemetry/datas/pub').length, 1)
assert.equal(messages.at(-1).success, true)
await runtime.handleMessage({ ...request, requestId: 'two', payload: { ...request.payload, deviceId: 'foreign' } })
assert.equal(messages.at(-1).success, false)
assert.equal(calls.filter(call => call.path === 'telemetry/datas/pub').length, 1)
runtime.stop()
const count = messages.length
await runtime.handleMessage(request)
assert.equal(messages.length, count)
console.log('ThingsVis device runtime mock checks passed')
