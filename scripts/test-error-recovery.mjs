import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const timers = new Map()
let timerId = 0, aborts = 0, requestOptions
const context = {
  setTimeout(fn) { timers.set(++timerId, fn); return timerId },
  clearTimeout(id) { timers.delete(id) },
  uni: { getStorageSync: () => '', request(options) { requestOptions = options; return { abort() { aborts++ } } } }
}
const request = vm.runInNewContext(read('api/client.js').replace('export function', 'function').replace('export default { request }', 'request'), context)
const first = request({ url: '/test' })
assert.equal(requestOptions.timeout, 20000)
const rejected = assert.rejects(first, error => error.code === 'REQUEST_TIMEOUT')
timers.values().next().value()
await rejected
assert.equal(aborts, 1)
assert.equal(timers.size, 0)
requestOptions.success({ statusCode: 200, data: {} }) // Late success cannot undo timeout.
const success = request({ url: '/test' })
requestOptions.success({ statusCode: 200, data: 'ok' })
assert.equal((await success).data, 'ok'); assert.equal(timers.size, 0)
context.uni.request = () => { throw new Error('native failure') }
await assert.rejects(request({ url: '/test' }), /native failure/)
assert.equal(timers.size, 0)

const diagnostics = vm.runInNewContext(read('services/app-errors.js').replaceAll('export function', 'function') + '; ({ reportAppError, getAppErrors })', {
  console: { warn() {} }, getCurrentPages: () => [{ route: 'pages/dashboard/boards' }]
})
for (let i = 0; i < 100; i++) diagnostics.reportAppError(new Error('password=secret token=private'), 'vue')
const records = diagnostics.getAppErrors()
assert.equal(records.length, 1); assert.equal(records[0].count, 100)
assert.ok(!JSON.stringify(records).includes('secret'))
records[0].count = 0
assert.equal(diagnostics.getAppErrors()[0].count, 100)

function component(path, globals = {}) {
  const script = read(path).match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
  return vm.runInNewContext(script.replace('export default', 'const component =') + '; component', { ...context, ...globals })
}
let stopped = 0, resolveStart
const viewer = component('components/board-viewer/index.vue', {
  BoardLoading: {}, reportAppError() {},
  createBoardRuntime: () => ({ start: () => new Promise(resolve => { resolveStart = resolve }), stop() { stopped++ } })
})
const state = { ...viewer.data.call({}), boardId: 'test', $emit() {} }
for (const [key, fn] of Object.entries(viewer.methods)) state[key] = fn.bind(state)
const loading = state.reload()
assert.equal(state.phase, 'loading')
timers.values().next().value()
assert.equal(state.phase, 'error'); assert.equal(stopped, 1)
assert.equal(state.frameState.url, '')
resolveStart({ name: 'late', canvas: { mode: 'grid' } }); await loading
assert.equal(state.phase, 'error', 'late results cannot revive a failed viewer')
state.onFrameEvent({ session: state.session - 1, message: { type: 'tv:render-ready' } })
assert.equal(state.phase, 'error')
state.runtime = { stop() { throw new Error('broken cleanup') } }
state.failBoard('failed')
assert.equal(state.runtime, null); assert.equal(state.frameState.url, '')
assert.equal(timers.size, 0)

const plotScript = read('features/devices/components/telemetry-history-sheet.vue').match(/<script module="plot" lang="renderjs">([\s\S]*?)<\/script>/)[1]
let disposed = 0, failed
const plot = vm.runInNewContext(plotScript.replace(/import .* from 'echarts'/, '').replace('export default', 'const component =') + '; component', {
  echarts: { init: () => ({ setOption() { throw new Error('chart failure') }, dispose() { disposed++ } }) },
  document: { getElementById: () => ({}) }
})
const chart = { ...plot.methods, $ownerInstance: { callMethod(name, event) { failed = { name, event } } } }
chart.update({ id: 'test', requestId: 9, points: [[1, 2]] })
assert.equal(disposed, 1); assert.equal(chart.chart, null)
assert.equal(failed.name, 'onChartError'); assert.equal(failed.event.requestId, 9)
console.log('Error recovery passed: deadlines, abort, late results, safe diagnostics, board cleanup and chart failure isolation.')
