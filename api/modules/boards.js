import { requestDeviceApi } from './device-overview'
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'

// 列表和查看器共享短期认证；仅保留当前会话，不持久化凭证或看板数据。
let sharedAuth = null
const AUTH_TTL = 5 * 60 * 1000

export function createBoardsClient() {
  const addresses = resolveThingsVisAddresses()
  const platformToken = uni.getStorageSync('access_token')
  let token = ''
  const scope = JSON.stringify([platformToken, addresses.thingsPanelApiBase, addresses.thingsVisApiBase])
  if (sharedAuth?.scope !== scope) sharedAuth = { scope, token: '', expiresAt: 0, pending: null }
  const auth = sharedAuth
  function checkSession() {
    const current = resolveThingsVisAddresses()
    if (!platformToken || platformToken !== uni.getStorageSync('access_token') || addresses.thingsVisApiBase !== current.thingsVisApiBase || addresses.thingsPanelApiBase !== current.thingsPanelApiBase || auth !== sharedAuth) throw new Error('登录或服务器已切换，请重新打开看板')
  }
  function request(path, data, method = 'GET', bearer = '') {
    checkSession()
    return new Promise((resolve, reject) => uni.request({
      url: `${addresses.thingsVisApiBase}/${path}`, data, method, timeout: 20000,
      header: { 'Content-Type': 'application/json', ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}) },
      success: resolve, fail: () => reject(new Error('无法连接看板服务，请检查网络或服务配置'))
    }))
  }
  async function authenticate() {
    checkSession()
    if (auth.token && Date.now() < auth.expiresAt) { token = auth.token; return }
    if (!auth.pending) auth.pending = (async () => {
      const user = await requestDeviceApi('user/detail')
      const id = user.userId || user.id
      if (!id) throw new Error('无法获取当前用户身份')
      const admin = user.authority === 'SYS_ADMIN' || user.roles?.includes('SYS_ADMIN')
      const response = await request('auth/sso', {
        platform: 'thingspanel', platformToken,
        userInfo: { id, email: user.email || `${user.userName}@thingspanel.local`, name: user.userName || 'ThingsPanel User', tenantId: admin ? 'thingspanel-sys-admin' : String(user.tenantId || user.tenant_id || 'default') },
        role: admin ? 'SUPER_ADMIN' : user.authority === 'TENANT_ADMIN' ? 'TENANT_ADMIN' : 'EDITOR'
      }, 'POST')
      if (response.statusCode < 200 || response.statusCode >= 300 || !response.data?.accessToken) throw new Error('看板认证失败，请检查登录状态和服务配置')
      checkSession(); auth.token = response.data.accessToken
      auth.expiresAt = Date.now() + AUTH_TTL
    })().finally(() => { auth.pending = null })
    await auth.pending
    checkSession(); token = auth.token
  }
  async function get(path, params, retry = true) {
    checkSession()
    await authenticate()
    const usedToken = token
    const response = await request(path, params, 'GET', usedToken)
    checkSession()
    if (response.statusCode === 401) {
      // 迟到的旧请求不能清除其他请求刚刷新的 token。
      if (auth.token === usedToken) { auth.token = ''; auth.expiresAt = 0 }
      if (retry) return get(path, params, false)
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      const error = new Error(response.statusCode === 403 ? '没有权限查看此看板' : response.statusCode === 404 ? '看板已删除或不可访问' : '看板加载失败，请重试')
      error.statusCode = response.statusCode
      throw error
    }
    checkSession()
    if ((path === 'projects' || path === 'dashboards') && !Array.isArray(response.data?.data)) throw new Error('看板服务返回格式异常')
    return response.data
  }
  return {
    async preview(id) {
      const result = await get(`dashboards/${encodeURIComponent(id)}`)
      checkSession()
      return { dashboard: result.data || result, token, platformToken, addresses }
    },
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
