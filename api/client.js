const DEFAULT_SERVER_URL = 'https://demo.thingspanel.cn'

function getServerUrl() {
  const configuredServer = uni.getStorageSync('serverAddress')
  return String(configuredServer || DEFAULT_SERVER_URL).replace(/\/$/, '')
}

function buildRequestUrl(url) {
  if (/^https?:\/\//i.test(url)) return url
  return `${getServerUrl()}${url.startsWith('/') ? url : `/${url}`}`
}

/**
 * 对 uni.request 的最小封装。业务状态码、鉴权和页面跳转由上层 request.js 处理。
 */
export function request(options = {}) {
  const requestOptions = {
    data: {},
    dataType: 'json',
    header: { 'content-type': 'application/json' },
    method: 'GET',
    responseType: 'text',
    timeout: 20000,
    ...options,
    url: buildRequestUrl(options.url || '')
  }

  requestOptions.header = {
    'content-type': 'application/json',
    ...(options.header || {})
  }

  return new Promise((resolve, reject) => {
    let settled = false, task
    const timeout = Number(requestOptions.timeout) > 0 ? Number(requestOptions.timeout) : 20000
    const finish = (callback, value) => {
      if (settled) return
      settled = true; clearTimeout(timer); callback(value)
    }
    const timer = setTimeout(() => {
      const error = new Error('请求超时，请检查网络后重试')
      error.code = 'REQUEST_TIMEOUT'
      finish(reject, error)
      try { task?.abort() } catch { /* Already completed or unsupported. */ }
    }, timeout)
    try { task = uni.request({
      ...requestOptions,
      timeout,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          finish(resolve, response)
          return
        }
        finish(reject, response)
      },
      fail(error) {
        finish(reject, error)
      }
    }) } catch (error) { finish(reject, error) }
  })
}

export default { request }
