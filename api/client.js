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
    ...options,
    url: buildRequestUrl(options.url || '')
  }

  requestOptions.header = {
    'content-type': 'application/json',
    ...(options.header || {})
  }

  return new Promise((resolve, reject) => {
    uni.request({
      ...requestOptions,
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          resolve(response)
          return
        }
        reject(response)
      },
      fail(error) {
        reject(error)
      }
    })
  })
}

export default { request }
