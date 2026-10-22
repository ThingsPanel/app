const VERSION = '2026-10-15'
const KEY = 'mpAgreementConsent'

export function hasMpConsent() {
  return uni.getStorageSync(KEY)?.version === VERSION
}

export function requireMpConsent(accepted) {
  if (!accepted) {
    uni.showToast({ title: '请先阅读并同意用户服务协议和隐私政策', icon: 'none' })
    return false
  }
  uni.setStorageSync(KEY, { version: VERSION, acceptedAt: new Date().toISOString() })
  return true
}
