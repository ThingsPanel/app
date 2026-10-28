// Android's system gesture/navigation strip is outside the WebView, so CSS cannot
// paint it. Share ownership across consecutive board shells and restore it on exit.
const owners = new Map()
let nativeBar = null

function openNativeBar() {
  // #ifdef APP-PLUS
  if (typeof plus === 'undefined' || plus.os.name !== 'Android') return null
  try {
    const android = plus.android
    const window = android.invoke(android.runtimeMainActivity(), 'getWindow')
    const decor = android.invoke(window, 'getDecorView')
    const originalColor = android.invoke(window, 'getNavigationBarColor')
    const lightNavigation = 16 // View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR (API 26)
    const originalLight = android.invoke(decor, 'getSystemUiVisibility') & lightNavigation
    const version = Number.parseInt(plus.os.version, 10)
    const originalContrast = version >= 10 ? android.invoke(window, 'isNavigationBarContrastEnforced') : null
    const foreground = value => {
      if (version < 8) return
      const flags = android.invoke(decor, 'getSystemUiVisibility')
      android.invoke(decor, 'setSystemUiVisibility', (flags & ~lightNavigation) | value)
    }
    return {
      update({ color, dark }) {
        android.invoke(window, 'setNavigationBarColor', Number.parseInt(color.slice(1), 16) | 0xff000000)
        if (originalContrast !== null) android.invoke(window, 'setNavigationBarContrastEnforced', false)
        foreground(dark ? 0 : lightNavigation)
      },
      restore() {
        android.invoke(window, 'setNavigationBarColor', originalColor)
        if (originalContrast !== null) android.invoke(window, 'setNavigationBarContrastEnforced', originalContrast)
        foreground(originalLight)
      }
    }
  } catch (error) { console.warn('Board system bar unavailable:', error?.message || error) }
  // #endif
  return null
}

function apply() {
  try {
    if (owners.size) nativeBar?.update([...owners.values()].pop())
    else { nativeBar?.restore(); nativeBar = null }
  } catch (error) { console.warn('Board system bar update failed:', error?.message || error) }
}

export function acquireBoardSystemBar(color, dark) {
  const owner = Symbol('board-system-bar')
  if (!owners.size) nativeBar = openNativeBar()
  owners.set(owner, { color, dark }); apply()
  return {
    update(color, dark) { if (owners.has(owner)) { owners.set(owner, { color, dark }); apply() } },
    release() { if (owners.delete(owner)) apply() }
  }
}
