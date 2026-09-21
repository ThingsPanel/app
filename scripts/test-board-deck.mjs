import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

function component(path, globals = {}) {
  const source = fs.readFileSync(new URL(path, import.meta.url), 'utf8')
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
  return vm.runInNewContext(script.replace('export default', 'globalThis.component =') + '; component', { setTimeout, clearTimeout, ...globals })
}
function instance(component, props = {}) {
  const events = []
  const value = { ...component.data(), ...props, $emit: (...args) => events.push(args), events }
  for (const [key, method] of Object.entries(component.methods)) value[key] = method.bind(value)
  for (const [key, getter] of Object.entries(component.computed || {})) Object.defineProperty(value, key, { get: () => getter.call(value) })
  return value
}

const requests = []
const deck = component('../components/board-deck/index.vue', { BoardViewer: {}, BoardLoading: {}, createBoardsClient: () => ({ dashboards: params => new Promise((resolve, reject) => requests.push({ params, resolve, reject })) }) })
const state = instance(deck, { initialId: 'b', homeMode: false, showBack: false })
const load = state.load()
assert.equal(requests[0].params.limit, 100)
assert.equal(requests[0].params.projectId, undefined)
requests[0].resolve({ data: [{ id: 'a' }, { id: 'b' }], meta: { totalPages: 2 } })
await new Promise(resolve => setImmediate(resolve))
requests[1].resolve({ data: [{ id: 'b' }, { id: 'c' }], meta: { totalPages: 2 } })
await load
assert.equal(state.boards.length, 3)
assert.equal(state.current.id, 'b')
state.change(1); assert.equal(state.current.id, 'c')
state.change(-1); assert.equal(state.current.id, 'c', 'rapid repeat is suppressed')
clearTimeout(state.unlockTimer); state.switching = false
state.change(1); assert.equal(state.index, 2, 'last page does not wrap')
let completedGuides = 0
state.$refs = { viewer: { dismissSwipeGuide() { completedGuides++ } } }
state.change(1, 'swipe'); assert.equal(completedGuides, 0, 'boundary does not complete tutorial')
state.change(-1, 'swipe'); assert.equal(completedGuides, 1, 'accepted swipe completes tutorial')
clearTimeout(state.unlockTimer); state.switching = false
state.change(1); clearTimeout(state.unlockTimer); state.switching = false
const stale = state.load(); deck.beforeUnmount.call(state)
requests[2].resolve({ data: [{ id: 'late' }], meta: { totalPages: 1 } }); await stale
assert.equal(state.current.id, 'c')
const home = instance(deck, { initialId: 'deleted', homeMode: true })
const missing = home.load(); requests[3].resolve({ data: [{ id: 'a' }], meta: { totalPages: 1 } }); await missing
assert.equal(home.events[0][0], 'unavailable')
const failed = instance(deck)
const first = failed.load(); requests[4].reject(new Error('offline')); await first
assert.equal(failed.error, 'offline')
const retry = failed.load(); requests[5].resolve({ data: [], meta: { totalPages: 0 } }); await retry
assert.equal(failed.error, ''); assert.equal(failed.boards.length, 0)

// Execute the actual renderjs gesture layer with a minimal DOM, not a copy of its logic.
const viewerSource = fs.readFileSync(new URL('../components/board-viewer/index.vue', import.meta.url), 'utf8')
const bridge = viewerSource.match(/<script module="boardBridge" lang="renderjs">([\s\S]*?)<\/script>/)[1]
const observers = class { observe() {} disconnect() {} }
const element = () => ({ style: {}, setAttribute() {}, remove() {}, setPointerCapture() {}, contentWindow: { postMessage() {} } })
const BoardFrame = vm.runInNewContext(bridge.slice(0, bridge.lastIndexOf('export default')) + '; BoardFrame', {
  URL, Date, Math, Map, ResizeObserver: observers, MutationObserver: observers,
  document: { createElement: element, body: {} }, window: { addEventListener() {}, removeEventListener() {}, innerWidth: 390, innerHeight: 844 }
})
const host = { clientWidth: 390, clientHeight: 650, isConnected: true, appendChild() {}, closest() { return false }, getBoundingClientRect: () => ({ left: 0, top: 0, right: 390 }) }
const events = []
const frame = new BoardFrame(host, { url: 'https://example.test/embed', paging: true, browse: true }, event => events.push(event))
const event = (x, y, pointerId = 1) => ({ clientX: x, clientY: y, pointerId })
const swipe = (x, y) => { frame.gestures.onpointerdown(event(150, 350)); frame.gestures.onpointerup(event(x, y)) }
swipe(150, 200); assert.equal(events.pop().pageDirection, 1)
swipe(150, 500); assert.equal(events.pop().pageDirection, -1)
swipe(160, 330); assert.equal(events.length, 0, 'tap/jitter does not switch')
swipe(300, 330); assert.equal(events.length, 0, 'horizontal drag does not switch')
frame.gestures.onpointerdown(event(150, 350)); frame.gestures.onpointercancel(event(150, 150)); assert.equal(events.length, 0)
frame.gestures.onpointerdown(event(150, 350)); frame.gestures.onpointerdown(event(180, 350, 2)); frame.gestures.onpointerup(event(150, 150)); assert.equal(events.length, 0, 'pinch does not switch')
frame.gestures.onpointerup(event(180, 150, 2))
frame.setInteractive(true); swipe(150, 100); assert.equal(events.length, 0, 'widget mode does not switch')
frame.setInteractive(false); frame.position.zoom = 2; swipe(150, 100); assert.equal(events.length, 0, 'zoomed canvas drag does not switch')
frame.destroy()
console.log('Board deck: all pages, deduplication, initial selection, bounds, stale loads, deleted home, retry, and actual renderjs gestures passed.')
