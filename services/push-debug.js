/** 推送排查日志：不记录密码、token 或完整通知内容。 */
export function logPushDebug(stage, details = {}, level = 'info') {
  if (process.env.NODE_ENV !== 'development') return
  // HBuilderX can hide subsequent console arguments behind its error overlay.
  try {
    const message = `[PushDebug] ${stage} ${JSON.stringify({ time: new Date().toISOString(), ...details })}`
    if (level === 'error') console.error(message)
    else if (level === 'warn') console.warn(message)
    else console.log(message)
  } catch { /* Diagnostics must never interrupt login or startup. */ }
}

export function pushDebugContext() {
  return {
    server: uni.getStorageSync('serverAddress') || 'https://cloud.thingspanel.cn',
    email: uni.getStorageSync('email') || '',
    hasToken: Boolean(uni.getStorageSync('access_token')),
    cachedPushId: uni.getStorageSync('push_id') || ''
  }
}

export function pushDebugError(error) {
  return { message: error?.message || error?.errMsg || '未知错误', code: error?.code ?? error?.errCode, statusCode: error?.statusCode }
}
