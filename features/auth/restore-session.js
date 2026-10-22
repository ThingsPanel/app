import httpClient from '@/api/client'
import { clearSessionStorage } from './session'

// Validate saved credentials without invoking the global login-expired modal.
export async function restoreSession({ storage, request = httpClient.request } = {}) {
  // Keep uni calls in the function body: the MP compiler skips parameter initializers.
  storage = storage || {
    getStorageSync: key => uni.getStorageSync(key),
    removeStorageSync: key => uni.removeStorageSync(key)
  }
  const token = storage.getStorageSync('access_token')
  if (!token) return 'missing'
  const server = storage.getStorageSync('serverAddress') || 'https://cloud.thingspanel.cn'
  const current = () => storage.getStorageSync('access_token') === token && (storage.getStorageSync('serverAddress') || 'https://cloud.thingspanel.cn') === server
  try {
    const base = String(server).replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
    const response = await request({ url: `${base}/api/v1/user/detail`, header: { 'x-token': token }, timeout: 10000 })
    if (!current()) return 'stale'
    if (Number(response.statusCode) === 401 || Number(response.data?.code) === 401) {
      clearSessionStorage(storage); return 'expired'
    }
    return Number(response.data?.code) === 200 ? 'valid' : 'unavailable'
  } catch (error) {
    if (!current()) return 'stale'
    if (Number(error?.statusCode) === 401) { clearSessionStorage(storage); return 'expired' }
    // Offline and server errors do not mean that the saved session has expired.
    return 'unavailable'
  }
}
