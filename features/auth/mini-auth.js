// Adapter dependencies are injected so account binding and server isolation can
// be tested without a phone. A WeChat code is never written to persistent storage.
export function createMiniAuth({ request, login, getServer, storage }) {
  const base = () => String(getServer()).trim().replace(/\/+$/, '')
  const context = () => {
    const server = base()
    if (!/^https:\/\/[^/?#]+(?:\/[^?#]*)?$/.test(server)) throw new Error('微信登录需要 HTTPS 服务地址')
    return { server, current: () => server === base() }
  }
  const call = async (ctx, path, data, token) => {
    if (!ctx.current()) throw new Error('服务器已切换，请重新登录')
    const response = await request({ url: ctx.server + path, method: data ? 'POST' : 'GET', data,
      header: token ? { Authorization: `Bearer ${token}` } : {} })
    if (!ctx.current()) throw new Error('服务器已切换，请重新登录')
    if (response.data?.code !== 200) throw new Error('认证未完成，请重试')
    return response.data.data
  }
  const code = async () => {
    const result = await login()
    if (!result?.code) throw new Error('未获取到微信登录凭证，请重试')
    return result.code
  }
  return {
    async providers() {
      const result = await call(context(), '/api/v1/auth/login-options?channel=mp-weixin')
      return result?.external?.enabled && Array.isArray(result.external.providers)
        ? result.external.providers.filter(p => p.kind === 'wechat-mini') : []
    },
    async signIn(provider) {
      const ctx = context()
      return call(ctx, '/api/v1/auth/wechat-mini/login', { provider, code: await code() })
    },
    async bind(provider, token, password, salt = '') {
      const ctx = context()
      return call(ctx, '/api/v1/auth/wechat-mini/bind', { provider, password, salt, code: await code() }, token)
    },
    async accept(session) {
      if (!session?.token || !(session.expires_in > 0)) throw new Error('登录结果无效')
      const server = base()
      const response = await request({ url: server + '/api/v1/user/detail', method: 'GET', header: { 'x-token': session.token } })
      if (server !== base()) throw new Error('服务器已切换，请重新登录')
      if (response.data?.code !== 200 || !response.data?.data?.id) throw new Error('用户信息加载失败，请重新登录')
      storage.setStorageSync('access_token', session.token)
      storage.removeStorageSync('password')
      storage.removeStorageSync('wx_code')
      return response.data.data
    }
  }
}
