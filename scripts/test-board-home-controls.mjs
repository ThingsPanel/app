import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { compile, createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const orientations = [], tabOwners = [], timers = new Map()
let mode = 'fixed', timerId = 0
const globals = {
  BoardLoading: {}, BoardViewer: {}, reportAppError(error) { throw error },
  createBoardRuntime: () => ({ start: async () => ({ name: 'Home', url: 'https://example.test/embed', canvas: { mode } }), stop() {} }),
  plus: { screen: { lockOrientation(value) { orientations.push(value) }, unlockOrientation() { orientations.push('auto') } } },
  acquireBoardTabbar() {
    const owner = { released: false }; tabOwners.push(owner)
    return () => { owner.released = true }
  },
  setTimeout(callback) { const id = ++timerId; timers.set(id, callback); return id },
  clearTimeout(id) { timers.delete(id) }
}
function component(path) {
  const source = read(path).replace(/\/\/ #ifdef MP-WEIXIN[\s\S]*?\/\/ #endif/g, '')
  const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
  return vm.runInNewContext(script.replace('export default', 'const result =') + '; result', { ...globals })
}
function instance(options, props) {
  const result = { ...options.data.call(props), ...props, $emit() {} }
  for (const [name, method] of Object.entries(options.methods)) result[name] = method.bind(result)
  for (const [name, getter] of Object.entries(options.computed || {})) Object.defineProperty(result, name, { get: () => getter.call(result) })
  return result
}
const viewer = component('components/board-viewer/index.vue')
const home = instance(viewer, { initialId: 'home', homeMode: true, managedTabbar: true, deckMode: true, initialFullscreen: false })
home.boardId = 'home'
await home.reload()
assert.equal(orientations.at(-1), 'auto', 'opening a fixed home releases the previous portrait lock')
assert.equal(home.frameState.interactive, true, 'home still starts with working widget controls')
home.toggleInteractive()
assert.equal(home.interactive, false)
assert.equal(home.command.kind, 'interact'); assert.equal(home.command.enabled, false)
home.toggleInteractive()
assert.equal(home.command.enabled, true, 'home can return to widget operation after browsing')
home.toggleFullscreen()
assert.equal(orientations.at(-1), 'landscape-primary')
home.toggleFullscreen()
assert.equal(orientations.at(-1), 'auto', 'exiting home fullscreen restores device rotation rather than persisting a portrait lock')
assert.equal(tabOwners.length, 0, 'a managed home never independently toggles the native bar')
home.dispose()

mode = 'grid'
const before = orientations.length
const grid = instance(viewer, { homeMode: true, managedTabbar: true, deckMode: true, initialFullscreen: false })
grid.boardId = 'grid'; await grid.reload()
assert.equal(orientations.length, before, 'responsive grid homes keep their existing orientation policy')
assert.equal(grid.interactive, true); grid.dispose()

// Standalone fullscreen and an incoming home share the same native ownership API.
const deck = component('components/board-deck/index.vue')
const standalone = instance(deck, { managedTabbar: false, homeMode: false })
standalone.setFullscreen(true); standalone.setFullscreen(true)
assert.equal(tabOwners.length, 1, 'repeated fullscreen events do not leak ownership')
standalone.setFullscreen(false)
assert.equal(tabOwners[0].released, true)
standalone.setFullscreen(true); deck.beforeUnmount.call(standalone)
assert.equal(tabOwners[1].released, true, 'leaving fullscreen releases the native bar through the shared manager')
const homeDeck = instance(deck, { managedTabbar: true, homeMode: true })
deck.beforeUnmount.call(homeDeck)
assert.equal(orientations.at(-1), 'portrait-primary', 'leaving home restores normal app page orientation')

// Render the real Vue template to check that controls are reachable in each mode.
const template = read('components/board-viewer/index.vue').match(/<template>([\s\S]*?)<\/template>/)[1]
const render = compile(template)
async function html({ homeMode, isGrid = false, interactive = true, fullscreen = false }) {
  return renderToString(createSSRApp({ ...viewer, render,
    data() { return { ...viewer.data.call(this), phase: 'ready', isGrid, interactive, fullscreen,
      boardBridge: { syncFrame() {}, sendMessages() {}, control() {} } } }
  }, { initialId: 'board', homeMode, managedTabbar: true, deckMode: true }))
}
const fixedHtml = await html({ homeMode: true })
assert.match(fixedHtml, /aria-label="横屏查看"/)
assert.match(fixedHtml, /aria-label="完成看板操作"/)
assert.doesNotMatch(fixedHtml, /aria-label="设为首页"/)
assert.match(await html({ homeMode: true, interactive: false }), /aria-label="操作看板"/)
assert.doesNotMatch(await html({ homeMode: true, isGrid: true }), /class="side-tools"/)
assert.match(await html({ homeMode: true, fullscreen: true }), /aria-label="退出全屏"/)
assert.match(await html({ homeMode: false }), /<text>首页<\/text>/)
console.log('Home board controls passed: native rotation lifecycle, browse/widget switching, fullscreen tab ownership and real template visibility.')
