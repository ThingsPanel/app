/** Reserve the native status bar and capsule band for a custom WeChat header. */
export function calculateMpHeaderLayout(windowInfo = {}, capsule = {}) {
  const statusBarHeight = Number.isFinite(windowInfo.statusBarHeight) ? Math.max(0, windowInfo.statusBarHeight) : 20
  const validCapsule = Number.isFinite(capsule.top) && Number.isFinite(capsule.bottom)
    && capsule.top >= statusBarHeight && capsule.bottom > capsule.top
  const top = validCapsule ? capsule.top : statusBarHeight + 6
  const height = validCapsule ? capsule.bottom - capsule.top : 32
  const width = windowInfo.windowWidth || 375
  const right = validCapsule && capsule.left > 0 ? Math.max(0, width - capsule.left) + 8 : 104
  return { paddingTop: top + 'px', '--mp-heading-height': height + 'px', '--mp-heading-right': right + 'px' }
}
