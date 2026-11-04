// Only imported by MP-WEIXIN. The native App detail page keeps its own renderer.
export function buildMiniDeviceUrl({ deviceId, token, platformWebBase, thingsPanelApiBase, lang = 'zh-CN' }) {
  if (!deviceId) throw new Error('缺少设备 ID，请返回列表重新进入')
  if (!token) throw new Error('登录状态已失效，请重新登录')
  const base = String(platformWebBase || '').replace(/\/+$/, '')
  const origin = base.match(/^https?:\/\/[^/]+/i)?.[0]
  if (!origin || !/^https:\/\//i.test(base) && !/^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?:\/|$)/i.test(base)) throw new Error('小程序设备页面需要 HTTPS 网页服务')
  const apiOrigin = String(thingsPanelApiBase || '').match(/^https?:\/\/[^/]+/i)?.[0]
  const localPreview = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin)
  if (origin !== apiOrigin && !localPreview) throw new Error('请将小程序网页与设备接口配置到同一服务域名')
  // Fragment is consumed and removed by the H5 bootstrap before external scripts load.
  const launch = { deviceId: String(deviceId), token: String(token), lang }
  return `${base}/mp-device/index.html#launch=${encodeURIComponent(JSON.stringify(launch))}`
}
