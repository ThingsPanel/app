import api from '@/api/request'

// 详情页接口统一使用完整 API 基址，兼容服务器设置中带 /api/v1 的地址。
export async function requestDeviceApi(path, data, method = 'GET') {
  const server = String(uni.getStorageSync('serverAddress') || 'https://demo.thingspanel.cn')
    .replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
  const response = await api.apiRequest(`${server}/api/v1/${path.replace(/^\/+/, '')}`, data, method)
  if (response?.code !== 200) {
    throw new Error(response?.message || response?.msg || '请求失败，请稍后重试')
  }
  return response.data
}

export function getDeviceDetail(deviceId) {
  return requestDeviceApi(`device/detail/${encodeURIComponent(deviceId)}`)
}

export function updateDeviceName(deviceId, name) {
  return requestDeviceApi('device', { id: deviceId, name }, 'PUT')
}
