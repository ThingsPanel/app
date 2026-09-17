/**
 * 后端返回的设备图片是相对路径，需要拼上服务地址前缀才能加载。
 *
 * 服务地址形如 http://host:port/api/v1，图片走同源根路径，所以先把 /api/v1 去掉。
 */
export function resolveServerBaseUrl(serverAddress) {
  const address = serverAddress ?? uni.getStorageSync('serverAddress')
  return address ? String(address).replace('/api/v1', '').replace(/\/$/, '') : ''
}

export function buildDeviceImageUrl(imagePath, serverAddress) {
  if (!imagePath) return ''
  return `${resolveServerBaseUrl(serverAddress)}/${String(imagePath).replace(/^\//, '')}`
}
