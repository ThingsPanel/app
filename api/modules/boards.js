import { requestDeviceApi } from './device-overview'
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'

export function createBoardsClient() {
  const addresses = resolveThingsVisAddresses()
  const platformToken = uni.getStorageSync('access_token')
  let token = '', authenticating = null
  function checkSession() {
    if (!platformToken || platformToken !== uni.getStorageSync('access_token') || addresses.thingsVisApiBase !== resolveThingsVisAddresses().thingsVisApiBase) throw new Error('登录或服务器已切换，请重新打开看板')
  }
  function request(path, data, method = 'GET', bearer = '') {
    checkSession()
    return new Promise((resolve, reject) => uni.request({
      url: `${addresses.thingsVisApiBase}/${path}`, data, method, timeout: 20000,
      header: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
      success: resolve, fail: () => reject(new Error('无法连接看板服务，请检查网络或可视化连接设置'))
    }))
  }
  async function authenticate() {
    if (!authenticating) authenticating = (async () => {
      const user = await requestDeviceApi('user/detail')
      const id = user.userId || user.id
      if (!id) throw new Error('无法获取当前用户身份')
      const admin = user.authority === 'SYS_ADMIN' || user.roles?.includes('SYS_ADMIN')
      const response = await request('auth/sso', {
        platform: 'thingspanel', platformToken,
        userInfo: { id, email: user.email || `${user.userName}@thingspanel.local`, name: user.userName || 'ThingsPanel User', tenantId: admin ? 'thingspanel-sys-admin' : String(user.tenantId || user.tenant_id || 'default') },
        role: admin ? 'SUPER_ADMIN' : user.authority === 'TENANT_ADMIN' ? 'TENANT_ADMIN' : 'EDITOR'
      }, 'POST')
      if (response.statusCode < 200 || response.statusCode >= 300 || !response.data?.accessToken) throw new Error('看板认证失败，请检查登录状态和可视化连接设置')
      checkSession(); token = response.data.accessToken
    })().finally(() => { authenticating = null })
    return authenticating
  }
  async function get(path, params, retry = true) {
    checkSession()
    if (!token) await authenticate()
    const response = await request(path, params, 'GET', token)
    if (response.statusCode === 401 && retry) { token = ''; return get(path, params, false) }
    if (response.statusCode < 200 || response.statusCode >= 300) throw new Error(response.statusCode === 403 ? '没有权限查看这些看板' : '看板加载失败，请重试')
    checkSession()
    if ((path === 'projects' || path === 'dashboards') && !Array.isArray(response.data?.data)) throw new Error('看板服务返回格式异常')
    return response.data
  }
  return {
    async projects() {
      const rows = []; let page = 1
      while (true) {
        const result = await get('projects', { page, limit: 100 })
        rows.push(...result.data)
        if (result.meta?.totalPages ? page >= result.meta.totalPages : result.data.length < 100) break
        page++
      }
      return rows
    },
    dashboards(params) { return get('dashboards', { limit: 20, ...params }) },
    async thumbnail(id) {
      const result = await get(`dashboards/${encodeURIComponent(id)}/thumbnail`)
      return result?.thumbnail || result?.data?.thumbnail || ''
    }
  }
}
