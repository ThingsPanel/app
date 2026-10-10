// Standalone loading uses the existing ThingsVis embed API, without App's iframe handshake.
export function buildMpBoardViewerUrl(id, preview) {
  if (!id || !preview?.token) throw new Error('看板认证失败，请重新登录')
  const addresses = preview.addresses
  for (const value of [addresses?.thingsVisPageUrl, addresses?.thingsVisApiBase]) {
    if (!/^https:\/\//i.test(value || '')) throw new Error('微信看板需要 HTTPS 服务，请检查服务配置')
  }
  const params = {
    id,
    mpViewer: '1',
    title: preview.dashboard?.name || '看板',
    token: preview.token,
    thingsvisApiBaseUrl: addresses.thingsVisApiBase,
    toolbar: '0'
  }
  // Keep authentication in the fragment; do not send the ThingsPanel login token to the web page.
  const query = Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
  return `${addresses.thingsVisPageUrl.replace(/#.*$/, '')}#/embed?${query}`
}
