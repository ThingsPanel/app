/** 推送排查日志：不记录密码、token 或完整通知内容。 */
export function logPushDebug(stage, details = {}, level = 'info') {
  const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log
  logger(`[PushDebug] ${stage}`, JSON.stringify({ time: new Date().toISOString(), ...details }))
}

export function pushDebugContext() {
  return {
    server: uni.getStorageSync('serverAddress') || 'https://demo.thingspanel.cn',
    email: uni.getStorageSync('email') || '',
    hasToken: Boolean(uni.getStorageSync('access_token')),
    cachedPushId: uni.getStorageSync('push_id') || ''
  }
}

export function pushDebugError(error) {
  return { message: error?.message || error?.errMsg || '未知错误', code: error?.code, statusCode: error?.statusCode }
}
