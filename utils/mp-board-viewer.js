import { buildMiniPageUrl } from './mp-device-url.js'

export function buildMpBoardViewerUrl(id, preview) {
  if (!id || !preview?.token || !preview?.platformToken) throw new Error('看板认证失败，请重新登录')
  // The same-origin H5 host supplies realtime data and platform credentials to ThingsVis.
  // Its bootstrap consumes the fragment before scripts load; admin login storage is untouched.
  return buildMiniPageUrl({
    platformWebBase: preview.addresses?.platformWebBase,
    thingsPanelApiBase: preview.addresses?.thingsPanelApiBase,
    launch: { kind: 'board', boardId: String(id), token: preview.platformToken, visToken: preview.token, lang: 'zh-CN' }
  })
}
