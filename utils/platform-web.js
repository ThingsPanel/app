/** 本地开发时社区版 Vite 默认端口 */
const LOCAL_H5_DEV_BASE = 'http://localhost:5002'

/**
 * 获取 ThingsPanel Web 前端基址，供 App WebView 加载 H5 页面使用。
 */
export function getPlatformWebBase() {
  const webViewBase = uni.getStorageSync('webViewBase')
  if (webViewBase) {
    return String(webViewBase).replace(/\/$/, '')
  }

  const server = uni.getStorageSync('serverAddress') || 'https://demo.thingspanel.cn'

  // 本地 API（如 localhost:8000）通常不含最新 H5，开发时默认走 Vite dev server
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(String(server))) {
    return LOCAL_H5_DEV_BASE
  }

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
