import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const tick = () => new Promise(resolve => setImmediate(resolve))
function manager() {
  const calls = []
  const acquire = vm.runInNewContext(read('services/board-tabbar.js').replace('export function', 'function') + '; acquireBoardTabbar', {
    uni: { hideTabBar(options) { calls.push({ kind: 'hide', ...options }) }, showTabBar(options) { calls.push({ kind: 'show', ...options }) } }
  })
  const finish = (success = true) => { const call = calls.shift(); call[success ? 'success' : 'fail'](); call.complete(); return call.kind }
  return { acquire, calls, finish }
}
const tabs = manager(), state = []
const release = tabs.acquire(value => state.push(value))
await tick()
assert.equal(tabs.calls.length, 1)
assert.equal(tabs.finish(), 'hide')
assert.deepEqual(state, [true])
release(); await tick()
assert.equal(tabs.finish(), 'show')

// Rapid departure before native hide completes must restore navigation afterwards.
const late = manager()
let staleCallback = 0
const leave = late.acquire(() => staleCallback++)
await tick(); leave(); late.finish(); await tick()
assert.equal(staleCallback, 0)
assert.equal(late.finish(), 'show')

// Consecutive board shells share ownership without flashing the native bar.
const shared = manager()
const first = shared.acquire(() => {})
await tick(); shared.finish()
first(); const secondState = []; const second = shared.acquire(v => secondState.push(v))
await tick(); assert.equal(shared.calls.length, 0); assert.deepEqual(secondState, [true])
second(); await tick(); assert.equal(shared.finish(), 'show')

// Unsupported native hide keeps the native bar, never adds a duplicate custom bar.
const failed = manager(), failures = []
const cleanup = failed.acquire(v => failures.push(v))
await tick(); failed.finish(false); await tick()
assert.deepEqual(failures, [false]); assert.equal(failed.calls.length, 0)
cleanup(); await tick(); assert.equal(failed.calls.length, 0)

function component(path, globals) {
  const script = read(path).match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
  return vm.runInNewContext(script.replace('export default', 'globalThis.result =') + '; result', globals)
}
const config = JSON.parse(read('pages.json')).tabBar
let switched = ''
const bar = component('components/app-tabbar.vue', { pages: { tabBar: config }, uni: { switchTab({ url }) { switched = url } } })
const ctx = { ...bar.data(), activePath: config.list[0].pagePath, immersive: true, dark: true }
assert.equal(bar.methods.itemColor.call(ctx, config.list[0]), '#67dff0')
assert.equal(bar.methods.iconStyle.call(ctx, config.list[0]).maskImage, `url(/${config.list[0].selectedIconPath})`)
assert.match(read('components/app-tabbar.vue'), /background-color:currentColor/)
bar.methods.open.call(ctx, config.list[0]); assert.equal(switched, '')
bar.methods.open.call(ctx, config.list[2]); assert.equal(switched, '/' + config.list[2].pagePath)
// Device detail uses this component too: tapping its active tab must still return to the list.
switched = ''; ctx.immersive = false
bar.methods.open.call(ctx, config.list[0]); assert.equal(switched, '/' + config.list[0].pagePath)
assert.equal(bar.computed.barStyle.call(ctx).backgroundColor, config.backgroundColor)

const nativeCalls = []
const viewer = component('components/board-viewer/index.vue', { BoardLoading: {}, uni: { hideTabBar() { nativeCalls.push('hide') }, showTabBar() { nativeCalls.push('show') } }, plus: { screen: { lockOrientation() {} } } })
viewer.methods.applyFullscreen.call({ managedTabbar: true }, true)
viewer.methods.applyFullscreen.call({ managedTabbar: true }, false)
assert.deepEqual(nativeCalls, [])
viewer.methods.applyFullscreen.call({ managedTabbar: false }, true)
viewer.methods.applyFullscreen.call({ managedTabbar: false }, false)
assert.deepEqual(nativeCalls, ['hide', 'show'])
assert.match(read('components/board-tab-deck/index.vue'), /customTabs && !fullscreen/)
assert.match(read('components/app-tabbar.vue'), /env\(safe-area-inset-bottom\)/)
console.log('Board tabbar passed: visibility ownership/races, native fallback, shared destinations, detail navigation and fullscreen isolation.')
