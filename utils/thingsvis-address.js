const DEFAULT_SERVER = 'https://demo.thingspanel.cn'
export const THINGSVIS_SETTINGS_KEY = 'thingsvisDeploymentSettings'

function storageOrDefault(storage) {
  if (storage) return storage
  // uni-app 的 Web 编译按方法裁剪 API，不能把整个 uni 对象当存储适配器传递。
  return {
    getStorageSync: key => uni.getStorageSync(key),
    setStorageSync: (key, value) => uni.setStorageSync(key, value)
  }
}

function normalizeAddress(value, label, page = false) {
  const address = String(value || '').trim()
  if (!/^https?:\/\//i.test(address) || /[\s\\?#]/.test(address)) {
    throw new Error(`${label}必须是完整的 HTTP 或 HTTPS 地址，不能包含查询参数或片段`)
  }
  const match = address.match(/^(https?):\/\/([^/]+)(\/.*)?$/i)
  if (!match || match[2].includes('@') || !match[2] || /[<>"']/.test(address)) {
    throw new Error(`${label}格式不正确，不能包含用户名或密码`)
  }
  const authority = match[2]
  if (!/^(?:\[[0-9a-f:]+\]|[a-z0-9.-]+)(?::\d{1,5})?$/i.test(authority)) {
    throw new Error(`${label}的主机或端口格式不正确`)
  }
  const port = authority.match(/:(\d+)$/)
  if (port && (Number(port[1]) < 1 || Number(port[1]) > 65535)) {
    throw new Error(`${label}端口必须在 1 到 65535 之间`)
  }
  const path = (match[3] || '').replace(/\/+$/, '')
  const base = `${match[1].toLowerCase()}://${authority.toLowerCase()}${path}`
  return page && !/\.[a-z0-9]+$/i.test(path) ? `${base}/` : base
}

function serverBase(serverAddress) {
  return normalizeAddress(serverAddress || DEFAULT_SERVER, 'ThingsPanel 服务器地址').replace(/\/api\/v1$/i, '')
}

export function getThingsVisSettings(serverAddress, storage) {
  const source = storageOrDefault(storage)
  const scope = serverBase(serverAddress === undefined ? source?.getStorageSync('serverAddress') : serverAddress)
  const records = source?.getStorageSync(THINGSVIS_SETTINGS_KEY)
  const settings = records && typeof records === 'object' ? records[scope] : null
  return {
    platformWebBase: settings?.platformWebBase || '',
    thingsVisPageUrl: settings?.thingsVisPageUrl || '',
    thingsVisApiBase: settings?.thingsVisApiBase || ''
  }
}

/**
 * 当前服务器下是否存在自定义地址覆盖，供「我的 → 服务配置」显示「已配置 / 默认」。
 * 三项里任意一项非空即算已配置；全部为空表示完全按服务器地址自动推导。
 */
export function hasCustomAddressSettings(serverAddress, storage) {
  const settings = getThingsVisSettings(serverAddress, storage)
  return Boolean(settings.platformWebBase || settings.thingsVisPageUrl || settings.thingsVisApiBase)
}

/** Explicit options keep address resolution testable without uni-app or network access. */
export function resolveThingsVisAddresses(options) {
  const source = storageOrDefault(options?.storage)
  const serverAddress = options ? options.serverAddress : source?.getStorageSync('serverAddress')
  const webViewBase = options ? options.webViewBase : source?.getStorageSync('webViewBase')
  const settings = options?.settings || getThingsVisSettings(serverAddress, source)
  const apiRoot = serverBase(serverAddress)
  const platformWebBase = normalizeAddress(settings.platformWebBase || webViewBase || apiRoot, 'ThingsPanel 前端地址')
  return {
    platformWebBase,
    thingsVisPageUrl: normalizeAddress(settings.thingsVisPageUrl || `${platformWebBase}/main/`, 'ThingsVis 页面地址', true),
    thingsVisApiBase: normalizeAddress(settings.thingsVisApiBase || `${platformWebBase}/thingsvis-api`, 'ThingsVis API 地址'),
    thingsPanelApiBase: `${apiRoot}/api/v1`
  }
}

export function saveThingsVisSettings(settings, options = {}) {
  const source = storageOrDefault(options.storage)
  if (!source) throw new Error('当前环境无法保存部署设置')
  const serverAddress = options.serverAddress === undefined ? source.getStorageSync('serverAddress') : options.serverAddress
  const webViewBase = options.webViewBase === undefined ? source.getStorageSync('webViewBase') : options.webViewBase
  const clean = {
    platformWebBase: String(settings.platformWebBase || '').trim(),
    thingsVisPageUrl: String(settings.thingsVisPageUrl || '').trim(),
    thingsVisApiBase: String(settings.thingsVisApiBase || '').trim()
  }
  const addresses = resolveThingsVisAddresses({ serverAddress, webViewBase, settings: clean })
  for (const key of Object.keys(clean)) {
    if (clean[key]) clean[key] = addresses[key]
  }
  const records = source.getStorageSync(THINGSVIS_SETTINGS_KEY)
  source.setStorageSync(THINGSVIS_SETTINGS_KEY, {
    ...(records && typeof records === 'object' ? records : {}),
    [serverBase(serverAddress)]: clean
  })
  return addresses
}
