/**
 * 获取 ThingsPanel Web 前端基址，供 App WebView 加载 H5 页面使用。
 */
export function getPlatformWebBase() {
  const webViewBase = uni.getStorageSync('webViewBase')
  if (webViewBase) {
    return String(webViewBase).replace(/\/$/, '')
  }

  const server = uni.getStorageSync('serverAddress') || 'https://demo.thingspanel.cn'
  return String(server).replace(/\/api\/v1\/?$/, '').replace(/\/$/, '')
}

/**
 * 构建 WebView 页面 URL。
 * @param {string} path 例如 /visualization-app
 * @param {Record<string, string | number | undefined | null>} params 查询参数
 */
export function buildWebViewUrl(path, params = {}) {
  const base = getPlatformWebBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')

  return `${base}${normalizedPath}${query ? `?${query}` : ''}`
}
