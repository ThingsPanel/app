import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

function component(path) {
  const source = fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
  return vm.runInNewContext(script.replace('export default', 'const component =') + '; component', { AppPicker: {} })
}
const history = component('features/devices/components/telemetry-history-sheet.vue')
const picker = component('components/app-picker/index.vue')
const closes = []
const parent = { $emit: name => closes.push(name) }
for (const event of [undefined, {}, { detail: { value: 1 } }, { detail: { value: '2026-09-22' } }, { detail: { value: '12:00' } }, { show: true, type: 'bottom' }]) {
  history.methods.onPopupChange.call(parent, event)
}
assert.equal(closes.length, 0, 'filter/date/time changes and popup opening cannot close history')

let popupCloses = 0
const events = []
const child = {
  range: ['最近1小时', '最近24小时'], draft: 1, opened: true, committed: false, selectedId: 'choice-1',
  $refs: { popup: { close() { popupCloses++ } } },
  $emit(name, value) { events.push({ name, value }); if (name === 'change') history.methods.onPopupChange.call(parent, value) }
}
picker.methods.popupChanged.call(child, { detail: { value: 1 } })
assert.equal(child.opened, true); assert.equal(events.length, 0)
picker.methods.confirm.call(child)
assert.equal(events[0].name, 'change'); assert.equal(events[0].value.detail.value, 1)
assert.equal(popupCloses, 1); assert.equal(closes.length, 0)
picker.methods.popupChanged.call(child, { show: false, type: 'bottom' })
assert.equal(child.opened, false); assert.equal(events.length, 1, 'confirm does not emit cancel')
child.opened = true; child.committed = false
picker.methods.popupChanged.call(child, { show: false, type: 'bottom' })
assert.equal(events.at(-1).name, 'cancel'); assert.equal(closes.length, 0)
history.methods.onPopupChange.call(parent, { show: false, type: 'bottom' })
assert.deepEqual(closes, ['close'], 'explicit popup closing remains functional')

const requests = [], draws = [], opened = []
const state = {
  rangeIndex: 1, windowIndex: 0, aggregateIndex: 0, chartIndex: 0,
  ranges: ['custom', 'hour', 'day'], windows: ['raw', 'minute'], aggregates: ['avg', 'max'], chartTypes: ['line', 'bar', 'scatter'],
  $nextTick: fn => fn(), $refs: { filterPicker: { open: () => opened.push(state.activeFilter) } }
}
for (const [key, fn] of Object.entries(history.methods)) state[key] = fn.bind(state)
state.load = reset => requests.push(reset)
state.draw = () => draws.push(state.chartIndex)
for (const [key, fn] of Object.entries(history.computed)) {
  if (key !== 'stats') Object.defineProperty(state, key, { get: fn.bind(state) })
}
for (const [key, index] of [['rangeIndex', 2], ['windowIndex', 1], ['aggregateIndex', 1], ['chartIndex', 2]]) {
  state.openFilter(key)
  assert.equal(opened.at(-1), key)
  assert.equal(state.filterValue, state[key])
  assert.ok(Array.isArray(state.filterOptions))
  state.confirmFilter({ detail: { value: String(index) } })
  assert.equal(state[key], index)
}
assert.deepEqual(requests, [true, true, true], 'time/window/aggregate reload once; chart type only redraws')
assert.deepEqual(draws, [2])
state.openFilter('rangeIndex'); state.confirmFilter({ detail: { value: 2 } })
assert.equal(requests.length, 3, 'confirming an unchanged filter does not query again')
console.log('History popup passed: filter/date/time events ignored, selection commits, cancel stays local, explicit close preserved.')
