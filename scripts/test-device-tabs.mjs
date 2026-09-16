import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createRenderer } from 'vue'

const require = createRequire(import.meta.url)
async function sourceModule(file) {
  const source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')
    .replace("from 'vue'", `from '${pathToFileURL(require.resolve('vue')).href}'`)
  return import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
}
const { buildAdditionalInfo, validateCoordinates, parseExtensionDefinitions } = await sourceModule('features/devices/utils/device-information.js')
assert.deepEqual(parseExtensionDefinitions('{}'), [])
assert.deepEqual(parseExtensionDefinitions('[]'), [])
assert.deepEqual(parseExtensionDefinitions(null), [])
assert.throws(() => parseExtensionDefinitions('{invalid'))
assert.throws(() => parseExtensionDefinitions('{"unexpected":true}'))
const fields = [
  { name: 'count', type: 'Number', value: '0', enable: true },
  { name: 'active', type: 'Boolean', value: false, enable: true },
  { name: 'hidden', type: 'String', value: 'overwritten', enable: false }
]
const original = { count: 9, active: true, hidden: 'retained', other: { id: 7 } }
assert.deepEqual(buildAdditionalInfo(original, fields), { count: 0, active: false, hidden: 'retained', other: { id: 7 } })
assert.equal(original.count, 9, 'saving must not mutate the original response')
const legacy = { owner: 'retained', extendedInfo: [{ name: 'count', value: 9, desc: 'retained' }, { name: 'unconfigured', value: 'retained' }] }
assert.deepEqual(buildAdditionalInfo(legacy, fields), { owner: 'retained', extendedInfo: [{ name: 'count', value: 0, desc: 'retained' }, { name: 'unconfigured', value: 'retained' }, { name: 'active', value: false }] })
assert.throws(() => buildAdditionalInfo({}, [{ name: 'count', type: 'Number', value: 'abc', enable: true }]), /有效数字/)
assert.equal(validateCoordinates('0', '0'), '0,0')
assert.equal(validateCoordinates('', ''), '')
for (const coordinates of [['181', '20'], ['10', '-91'], ['10', ''], ['NaN', '0']]) assert.throws(() => validateCoordinates(...coordinates))

const { useDeviceList } = await sourceModule('features/devices/utils/use-device-list.js')
const requests = []
let list
const renderer = createRenderer({ insert() {}, remove() {}, createElement: () => ({}), createText: () => ({}), createComment: () => ({}), setText() {}, setElementText() {}, parentNode() {}, nextSibling() {}, patchProp() {} })
const app = renderer.createApp({ setup() {
  list = useDeviceList(page => new Promise((resolve, reject) => requests.push({ page, resolve, reject })))
  return () => null
} })
app.mount({})
const stale = list.load(true)
const latest = list.load(true)
requests[1].resolve({ list: [{ id: 'latest' }], total: 3 })
await latest
requests[0].resolve({ list: [{ id: 'stale' }], total: 1 })
await stale
assert.deepEqual(list.items.value, [{ id: 'latest' }], 'older requests must not overwrite refreshed data')
const failed = list.load()
requests[2].reject(new Error('network failure'))
await failed
assert.equal(list.error.value, 'network failure')
const retry = list.load()
assert.equal(requests[3].page, 2, 'retry must request the same failed page')
await list.load()
assert.equal(requests.length, 4, 'duplicate pagination while loading must be ignored')
requests[3].resolve({ list: [{ id: 'second' }], total: 3 })
await retry
assert.deepEqual(list.items.value.map(item => item.id), ['latest', 'second'])
// 接口无数据时返回 null / 缺省 list / 直接返回数组，都应视为空列表而不是格式异常
const emptyPayload = list.load(true)
requests[4].resolve(null)
await emptyPayload
assert.deepEqual(list.items.value, [], 'null 响应应视为空列表')
assert.equal(list.error.value, '', 'null 响应不应报格式异常')
assert.equal(list.total.value, 0)
const missingList = list.load(true)
requests[5].resolve({ total: 0 })
await missingList
assert.deepEqual(list.items.value, [], '缺省 list 字段应视为空列表')
assert.equal(list.error.value, '')
const rawArray = list.load(true)
requests[6].resolve([{ id: 'raw' }])
await rawArray
assert.deepEqual(list.items.value.map(item => item.id), ['raw'], '直接返回数组时应正常展示')
assert.equal(list.error.value, '')
const malformedList = list.load(true)
requests[7].resolve({ list: 'oops' })
await malformedList
assert.equal(list.error.value, '服务返回的列表格式异常', 'list 存在但不是数组时才报格式异常')
const pending = list.load()
app.unmount()
requests[8].resolve({ list: [{ id: 'unmounted' }], total: 3 })
await pending
assert.equal(list.items.value.length, 0, 'unmounted components must ignore pending results')
await list.load(true)
assert.equal(requests.length, 9, 'unmounted components must not issue further requests')
console.log('Device tabs: preservation, coordinates, pagination failures, duplicate requests, stale responses, empty payloads and unmount checks passed.')
