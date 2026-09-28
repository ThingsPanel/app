import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const source = fs.readFileSync(new URL('../components/board-viewer/index.vue', import.meta.url), 'utf8')
const bridge = source.match(/<script module="boardBridge" lang="renderjs">([\s\S]*?)<\/script>/)[1]
const exported = fs.readFileSync(new URL('../utils/thingsvis-board-frame.js', import.meta.url), 'utf8')
assert.equal(bridge.slice(bridge.indexOf('class BoardFrame'), bridge.lastIndexOf('export default')).replaceAll('\r\n', '\n').trim(), exported.slice(exported.indexOf('class BoardFrame')).replaceAll('\r\n', '\n').trim(), 'App and reusable gesture implementations stay identical')
let now = 10000
const windows = new Map(), documents = new Map()
const window = { innerWidth: 390, innerHeight: 844, addEventListener: (key, fn) => windows.set(key, fn), removeEventListener: key => windows.delete(key) }
const document = {
  hidden: false, body: {},
  createElement: () => ({ style: {}, setAttribute() {}, remove() {}, setPointerCapture() {}, releasePointerCapture() {}, contentWindow: { postMessage() {} } }),
  addEventListener: (key, fn) => documents.set(key, fn), removeEventListener: key => documents.delete(key)
}
const Observer = class { observe() {} disconnect() {} }
const BoardFrame = vm.runInNewContext(bridge.slice(0, bridge.lastIndexOf('export default')) + '; BoardFrame', {
  URL, Date: { now: () => now }, Math, Map, document, window, ResizeObserver: Observer, MutationObserver: Observer
})
const host = { clientWidth: 390, clientHeight: 650, isConnected: true, appendChild() {}, closest: () => false, getBoundingClientRect: () => ({ left: 0, top: 0, right: 390 }) }
const events = []
const frame = new BoardFrame(host, { url: 'https://example.test/embed', paging: true, browse: true }, event => events.push(event))
const e = (x, y, id = 1) => ({ clientX: x, clientY: y, pointerId: id, pointerType: 'touch' })
const down = (x, y, id) => frame.gestures.onpointerdown(e(x, y, id))
const move = (x, y, id) => frame.gestures.onpointermove(e(x, y, id))
const up = (x, y, id) => frame.gestures.onpointerup(e(x, y, id))
const pages = () => events.filter(event => event.pageDirection)
function pinch() { down(100, 200); down(200, 200, 2); move(300, 200, 2) }
pinch()
assert.equal(frame.position.zoom, 2, 'pinch starts from original scale in browse mode')
assert.equal(frame.position.x, -100, 'content under pinch midpoint stays anchored')
up(300, 200, 2)
move(80, 180)
assert.equal(frame.position.x, -120, 'remaining finger pans without jumping')
up(80, 180)
assert.equal(pages().length, 0)
down(100, 200); move(100, 400); up(100, 400)
assert.equal(pages().length, 0, 'zoomed drag cannot change page')
now += 1000
down(120, 200); up(120, 200); now += 150; down(121, 201); up(121, 201)
assert.equal(frame.position.zoom, 1, 'two touch taps restore original scale')
frame.gestures.ondblclick({})
assert.equal(frame.position.zoom, 1, 'synthetic dblclick after touch does not apply twice')
down(100, 350); move(100, 150); up(100, 150)
assert.equal(pages().at(-1).pageDirection, 1, 'paging resumes after reset')
const pageCount = pages().length
frame.reset(); pinch(); move(150, 200, 2)
assert.equal(frame.position.zoom, 1, 'pinch inward clamps to original scale')
up(150, 200, 2); move(100, 400); up(100, 400)
assert.equal(pages().length, pageCount, 'pinch ending at 1x does not become a swipe')
frame.reset(); down(100, 200); down(200, 200, 2); move(1200, 200, 2)
assert.equal(frame.position.zoom, 5, 'zoom maximum is bounded')
frame.gestures.onpointercancel(e(100, 200))
assert.equal(frame.pointers.size, 0); assert.equal(frame.lastTap, null)
up(1200, 200, 2)
assert.equal(pages().length, pageCount)
frame.reset(); down(100, 200); frame.gestures.onlostpointercapture(e(100, 200))
assert.equal(frame.pointers.size, 0)
down(100, 200); windows.get('blur')(); assert.equal(frame.pointers.size, 0)
down(100, 200); document.hidden = true; documents.get('visibilitychange')(); assert.equal(frame.pointers.size, 0)
frame.command({ kind: 'interact', enabled: true })
pinch()
assert.equal(frame.position.zoom, 1); assert.equal(frame.pointers.size, 0)
assert.equal(frame.gestures.style.display, 'none'); assert.equal(frame.frame.style.pointerEvents, 'auto')
frame.command({ kind: 'interact', enabled: false }); pinch(); assert.equal(frame.position.zoom, 2)
frame.reset(); down(100, 200); down(100, 200, 2); move(200, 200, 2)
assert.ok(Number.isFinite(frame.position.zoom), 'coincident pointers cannot produce NaN or Infinity')
frame.destroy(); assert.equal(windows.size, 0); assert.equal(documents.size, 0)

// CSS-rotated portrait preview uses board coordinates, while native landscape does not.
const rotated = new BoardFrame({ ...host, closest: () => true }, { url: 'https://example.test/embed', browse: true }, () => {})
rotated.gestures.onpointerdown(e(100, 100))
rotated.gestures.onpointerdown(e(100, 200, 2))
rotated.gestures.onpointermove(e(100, 300, 2))
assert.equal(rotated.position.zoom, 2)
rotated.destroy()
for (const canvas of [{ mode: 'grid' }, { mode: 'fixed' }]) {
  const home = new BoardFrame(host, { url: 'https://example.test/embed', canvas, interactive: true }, () => {})
  assert.equal(home.gestures.style.display, 'none', 'home retains widget interaction')
  home.destroy()
}
const standalone = new BoardFrame(host, { url: 'https://example.test/embed', canvas: { mode: 'fixed' } }, () => {})
standalone.doubleTap(); assert.equal(standalone.position.zoom, 2, 'standalone fixed canvas retains double-tap zoom')
standalone.doubleTap(); assert.equal(standalone.position.zoom, 1); standalone.destroy()

const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
const component = vm.runInNewContext(script.replace('export default', 'const component =') + '; component', { BoardLoading: {}, clearTimeout })
const guide = { homeMode: false, interactive: false, zoomGuidePending: true, showSwipeGuide: false, phase: 'ready' }
assert.equal(component.computed.showZoomGuide.call(guide), true)
for (const override of [{ homeMode: true }, { interactive: true }, { showSwipeGuide: true }, { phase: 'error' }, { phase: 'loading' }]) {
  assert.equal(component.computed.showZoomGuide.call({ ...guide, ...override }), false)
}
let paged = false
component.methods.requestPage.call({ zoomed: true, $emit() { paged = true } }, 1)
assert.equal(paged, false, 'header swipe also respects zoom lock')
let finishedGuide
const dismissed = { zoomGuidePending: true, preference: { finishGuide(kind) { finishedGuide = kind } } }
component.methods.dismissZoomGuide.call(dismissed)
assert.equal(dismissed.zoomGuidePending, false)
assert.equal(finishedGuide, 'zoom', 'close persists the existing per-account guide preference')
assert.match(source, /aria-label="关闭缩放提示"/)
assert.match(source, /@click.stop="dismissZoomGuide"/)
console.log('Board zoom passed: pinch/pan, page isolation, double-tap, limits, cancellation, mode switching, rotated preview, home and guide scope.')
