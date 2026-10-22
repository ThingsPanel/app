export function getAppVersionLabel() {
  try {
    // #ifdef MP-WEIXIN
    const account = uni.getAccountInfoSync().miniProgram || {}
    if (account.envVersion === 'develop') return '开发版'
    if (account.envVersion === 'trial') return '体验版'
    const version = String(account.version || '').trim()
    return version ? `v${version.replace(/^v/i, '')}` : '正式版'
    // #endif
    // #ifdef APP-PLUS
    const info = uni.getAppBaseInfo()
    // HBuilderX run uses the launcher's package version, not this project's.
    if (process.env.NODE_ENV === 'development') {
      const resourceVersion = String(info.appWgtVersion || '').trim()
      return resourceVersion ? `v${resourceVersion.replace(/^v/i, '')}（调试版）` : '调试版'
    }
    const appVersion = String(info.appVersion || '').trim()
    return appVersion ? `v${appVersion.replace(/^v/i, '')}` : '版本信息暂不可用'
    // #endif
  } catch {
    return '版本信息暂不可用'
  }
  return ''
}
