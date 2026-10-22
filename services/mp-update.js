let manager
let initialized = false
let foreground = false
let ready = false
let prompted = false

function promptWhenReady() {
  if (!foreground || !ready || prompted) return
  prompted = true
  try {
    uni.showModal({
      title: '新版本已准备好',
      content: '重启后即可使用最新版本，请先完成当前操作。',
      cancelText: '稍后',
      confirmText: '立即重启',
      success(result) {
        if (!result.confirm) return
        try { manager.applyUpdate() }
        catch (error) { console.warn('小程序应用更新失败', error) }
      },
      fail(error) { console.warn('小程序更新提示未显示', error) }
    })
  } catch (error) { console.warn('小程序更新提示未显示', error) }
}

export function initMpUpdate() {
  if (initialized) return
  initialized = true
  try {
    manager = uni.getUpdateManager()
    manager.onUpdateReady(() => { ready = true; promptWhenReady() })
    // A failed download must not interrupt login or the current operation.
    manager.onUpdateFailed(() => { console.warn('小程序新版本下载失败，继续使用当前版本') })
  } catch (error) { console.warn('小程序更新管理器不可用', error) }
}

export function setMpUpdateForeground(value) {
  foreground = value
  promptWhenReady()
}
