import httpClient from './client'

const AUTH_ERROR_CODES = new Set([401, 402, 403])
let authModalVisible = false

function getAuthHeaders(headers = {}) {
  const accessToken = uni.getStorageSync('access_token')
  return {
    ...headers,
    ...(accessToken ? { 'x-token': accessToken } : {})
  }
}

function handleAuthError() {
  if (authModalVisible) return
  authModalVisible = true

  uni.showModal({
    title: '提示',
    content: '登录状态已过期，请重新登录。',
    showCancel: false,
    complete() {
      uni.clearStorageSync()
      uni.reLaunch({ url: '/pages/login/index' })
      authModalVisible = false
    }
  })
}

/**
 * 统一业务请求入口。保持历史调用约定，直接返回后端响应体。
 */
export async function apiRequest(url, data, method = 'GET', headers = {}) {
  const response = await httpClient.request({
    url,
    data: data || {},
    method: method.toUpperCase(),
    header: getAuthHeaders(headers)
  })
  const responseBody = response.data

  if (AUTH_ERROR_CODES.has(responseBody?.code)) handleAuthError()
  return responseBody
}

export default { apiRequest }
