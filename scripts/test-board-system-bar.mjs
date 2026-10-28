import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'

const read = path => fs.readFileSync(new URL('../' + path, import.meta.url), 'utf8')
const source = read('services/board-system-bar.js').replace('export function', 'function') + '; acquireBoardSystemBar'
const colors = vm.runInNewContext(read('utils/tabbar-appearance.js').replace('export const', 'const') + '; BOARD_TABBAR_COLORS')
const component = path => vm.runInNewContext(read(path).match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*$/gm, '').replace('export default', 'globalThis.result =') + '; result', { BOARD_TABBAR_COLORS: colors, BoardDeck: {}, AppTabbar: {} })
const tabbar = component('components/app-tabbar.vue')
const shell = component('components/board-tab-deck/index.vue')
for (const dark of [false, true]) {
  const style = tabbar.computed.barStyle.call({ immersive: true, dark, config: { height: '52px' } })
  assert.equal(style.backgroundColor, colors[dark ? 'dark' : 'light'])
  assert.match(style.backgroundColor, /^#[\da-f]{6}$/i) // opaque on both light and dark canvases
  let systemColor
  shell.methods.syncSystemBar.call({ customTabs: true, systemBarDark: dark,
    systemBar: { update(color) { systemColor = color } } })
  assert.equal(systemColor, style.backgroundColor)
}
const state = { color: -1, flags: 16 | 1024, contrast: true }
const original = { ...state }
const nativeWindow = {}, decor = {}, activity = {}
const acquire = vm.runInNewContext(source, {
  console,
  plus: { os: { name: 'Android', version: '13' }, android: {
    runtimeMainActivity: () => activity,
    invoke(object, method, value) {
      switch (method) {
        case 'getWindow': return nativeWindow
        case 'getDecorView': return decor
        case 'getNavigationBarColor': return state.color
        case 'getSystemUiVisibility': return state.flags
        case 'isNavigationBarContrastEnforced': return state.contrast
        case 'setNavigationBarColor': state.color = value; break
        case 'setSystemUiVisibility': state.flags = value; break
        case 'setNavigationBarContrastEnforced': state.contrast = value; break
        default: throw new Error('Unexpected native call: ' + method)
      }
    }
  } }
})
let nativeColor
shell.methods.syncSystemBar.call({ customTabs: true, systemBarDark: true,
  systemBar: { update(color) { nativeColor = color } } })
assert.equal(nativeColor, tabbar.computed.barStyle.call({ immersive: true, dark: true, config: { height: '52px' } }).backgroundColor)
const first = acquire(nativeColor, true)
assert.equal(state.color, 0xff141c28 | 0)
assert.equal(state.flags & 16, 0) // light gesture indicator on dark background
assert.equal(state.flags & 1024, 1024)
assert.equal(state.contrast, false)
first.update('#f8fafd', false)
assert.equal(state.flags & 16, 16)
const second = acquire('#141c28', true)
first.release() // outgoing page must not restore white beneath the incoming board
assert.equal(state.color, 0xff141c28 | 0)
state.flags |= 4096 // unrelated fullscreen flags can change while a board is open
second.release()
assert.equal(state.color, original.color)
assert.equal(state.contrast, original.contrast)
assert.equal(state.flags & 16, original.flags & 16)
assert.equal(state.flags & 4096, 4096)
second.release() // cleanup is idempotent; stale updates cannot recolor another page
second.update('#141c28', true)
assert.equal(state.color, original.color)

for (const globals of [{}, { plus: { os: { name: 'iOS' } } }]) {
  const noop = vm.runInNewContext(source, globals)('#141c28', true)
  noop.update('#f8fafd', false); noop.release()
}
const manifest = JSON.parse(read('manifest.json').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, ''))
assert.equal(manifest['app-plus'].safearea.bottom.offset, 'none')
assert.match(read('components/app-tabbar.vue'), /padding-bottom: env\(safe-area-inset-bottom\)/)
console.log('Board system bar passed: colors, indicator contrast, overlapping owners, exit restoration and iOS CSS safe-area configuration.')
