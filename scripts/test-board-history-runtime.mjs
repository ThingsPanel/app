import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import * as helpers from '../utils/thingsvis-device-schema.js'

for (const [timeRange, aggWindow] of [['1h','30s'], ['24h','5m'], ['7d','30m'], ['30d','3h']]) {
  assert.equal(helpers.normalizeHistoryConfig({ timeRange }).aggWindow, aggWindow)
}
const schema = { dataSources: [{ id: 'd' }], nodes: [{ data: [{ expression: '{{ ds.d.data.temperature__history }}', historyConfig: { timeRange: '7d', aggWindow: '1h', aggFunction: 'MAX' } }] }] }
assert.deepEqual(helpers.collectDeviceHistoryConfigs(schema).get('temperature'), { timeRange: 'last_7d', aggWindow: '1h', aggFunction: 'max' })
assert.equal(helpers.collectDeviceHistoryConfigs({ ...schema, dataSources: [{ id: 'other' }] }).size, 0)
assert.equal(helpers.collectDeviceHistoryConfigs(schema, { fieldIds: ['temperature'] }).size, 1, 'legacy root-field subscription must replay explicitly bound history')
assert.equal(helpers.collectDeviceHistoryConfigs({ ...schema, nodes: [] }, { fieldIds: ['temperature'] }).size, 0)

const calls = [], messages = [], states = [], sockets = []
let failHistory = true, releaseQuery
const factory = vm.runInNewContext(fs.readFileSync(new URL('../services/thingsvis-device-runtime.js', import.meta.url), 'utf8').replace(/^import .*$/gm, '').replace('export function', 'function') + '; createDeviceRuntime', {
  ...helpers, setInterval: () => 1, clearInterval() {}, clearTimeout() {}, setTimeout,
  uni: { getStorageSync: () => 'test', connectSocket: () => { const socket = { onOpen() {}, onMessage() {}, onError() {}, onClose() {}, close() {} }; sockets.push(socket); return socket } },
  requestDeviceApi: async (path, query) => {
    if (path === 'device/model/telemetry') return [{ key: 'temperature', data_type: 'float' }]
    if (path.startsWith('device/model/')) return []
    if (path.includes('/current/')) return [{ key: 'temperature', value: 20 }]
    if (path === 'telemetry/datas/statistic') {
      calls.push(query)
      if (failHistory) throw new Error('history offline')
      return new Promise(resolve => { releaseQuery = () => resolve([{ ts: 1700000000000, value: 20 }]) })
    }
    throw new Error('unexpected ' + path)
  }
})
const runtime = factory({ device: { device_config: { device_template_id: 'template' } }, deviceId: 'device', addresses: { thingsPanelApiBase: 'https://example.test/api/v1' }, dataOnly: { schema }, onMessage: m => messages.push(m), onState: s => states.push(s) })
await runtime.start()
assert.equal(calls[0].aggregate_window, '1h')
assert.equal(calls[0].aggregate_function, 'max')
assert.equal(calls[0].time_range, 'last_7d')
await runtime.handleMessage({ type: 'LOADED' })
assert.equal(sockets.length, 2, 'failed history must not stop real-time sockets')
assert.ok(states.some(s => s.status === 'warning' && s.message === 'history offline'))
failHistory = false
const request = { type: 'thingsvis:requestFieldData', payload: { dataSourceId: 'd', fieldIds: ['temperature__history'] } }
const a = runtime.handleMessage(request), b = runtime.handleMessage(request)
assert.equal(calls.length, 2, 'one retry shared by concurrent requests')
releaseQuery(); await Promise.all([a,b])
await runtime.handleMessage(request)
assert.equal(calls.length, 2, 'successful preload/retry result reused briefly')
assert.ok(messages.some(m => m.type === 'tv:platform-history'))
await runtime.handleMessage({ type: 'thingsvis:requestFieldData', payload: { dataSourceId: 'd', fieldIds: ['temperature'] } })
assert.equal(calls.length, 2, 'live-only requests do not query history')
runtime.stop()
console.log('Board history runtime passed: complete configs, range defaults, source isolation, failure recovery and request deduplication.')
