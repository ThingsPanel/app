// Local mobile preference only. Never mutate the tenant-wide ThingsVis homeFlag.
export const HOME_PREFERENCE_KEY = 'mobileDashboardHome.v1'

export function createHomePreferenceStore({ storage, getSession, getProfile }) {
  let cachedIdentity = null
  async function open() {
    const session = getSession()
    if (!session.token) throw new Error('请先登录')
    const sessionKey = JSON.stringify([session.server, session.boardsServer, session.token])
    if (cachedIdentity?.key !== sessionKey) {
      const profile = await getProfile()
      const id = profile.userId || profile.id
      const tenant = profile.authority === 'SYS_ADMIN' || profile.roles?.includes('SYS_ADMIN')
        ? 'thingspanel-sys-admin' : profile.tenantId || profile.tenant_id || 'default'
      if (!id) throw new Error('无法获取当前账号，请重新登录')
      const current = getSession()
      if (current.token !== session.token || current.server !== session.server || current.boardsServer !== session.boardsServer) throw new Error('账号或服务器已切换，请重试')
      cachedIdentity = { key: sessionKey, scope: JSON.stringify([session.server, session.boardsServer, String(tenant), String(id)]) }
    }
    const scope = cachedIdentity.scope
    function check() {
      const current = getSession()
      if (current.token !== session.token || current.server !== session.server || current.boardsServer !== session.boardsServer) throw new Error('账号或服务器已切换，请重试')
    }
    function records() {
      const value = storage.getStorageSync(HOME_PREFERENCE_KEY)
      return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
    }
    const guideKey = 'mobileDashboardGuide.v1'
    function guides() { const value = storage.getStorageSync(guideKey); return value && typeof value === 'object' && !Array.isArray(value) ? value : {} }
    return {
      guideSeen(kind) { check(); return guides()[scope]?.[kind] === true },
      finishGuide(kind) { check(); const all = guides(); storage.setStorageSync(guideKey, { ...all, [scope]: { ...all[scope], [kind]: true } }) },
      resetGuides() { check(); const all = { ...guides() }; delete all[scope]; storage.setStorageSync(guideKey, all) },
      read() {
        check()
        const value = records()[scope]
        return typeof value?.id === 'string' && value.id ? { id: value.id, name: String(value.name || '看板') } : null
      },
      save(board) {
        check()
        if (!board?.id || typeof board.id !== 'string') throw new Error('请选择有效的看板')
        storage.setStorageSync(HOME_PREFERENCE_KEY, { ...records(), [scope]: { id: board.id, name: String(board.name || '看板') } })
      },
      reset() {
        check()
        const value = { ...records() }; delete value[scope]
        storage.setStorageSync(HOME_PREFERENCE_KEY, value)
      }
    }
  }
  return { open }
}
