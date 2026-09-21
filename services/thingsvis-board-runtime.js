import { createBoardsClient } from '../api/modules/boards.js'
import { requestDeviceApi } from '../api/modules/device-overview.js'
import { createDeviceRuntime } from './thingsvis-device-runtime.js'
import { prepareBoardSchema } from '../utils/thingsvis-board-schema.js'
import { collectDeviceHistory } from '../utils/thingsvis-device-schema.js'
import { resolveThingsVisAddresses } from '../utils/thingsvis-address.js'

export function createBoardRuntime({ boardId, onMessage, onState }) {
  let stopped = false, prepared, preview, loaded = false
  const channels = new Map(), pending = new Map()
  const current = () => !stopped && preview && preview.platformToken === uni.getStorageSync('access_token') && preview.addresses.thingsVisApiBase === resolveThingsVisAddresses().thingsVisApiBase
  const emit = message => { if (current()) onMessage(message) }
  const warn = message => { if (current()) onState({ status: 'warning', message }) }
  async function start() {
    const client = createBoardsClient()
    preview = await client.preview(boardId)
    if (!current()) return null
    if (preview.dashboard.thumbnail) onState({ thumbnail: preview.dashboard.thumbnail })
    else void client.thumbnail(boardId).then(thumbnail => { if (current() && thumbnail) onState({ thumbnail }) }).catch(() => {})
    prepared = prepareBoardSchema(preview.dashboard)
    for (const source of prepared.schema.dataSources) {
      if (source.type === 'PLATFORM_FIELD' && collectDeviceHistory(prepared.schema, { dataSourceId: source.id }).size) source.config.bufferSize = Math.max(100, Number(source.config.bufferSize) || 0)
    }
    const params = { mode: 'embedded', context: 'dashboard', provider: 'thingspanel', saveTarget: 'host', toolbar: '0', token: preview.token, thingsvisApiBaseUrl: preview.addresses.thingsVisApiBase, platformApiBaseUrl: preview.addresses.thingsPanelApiBase }
    return {
      url: preview.addresses.thingsVisPageUrl.split('#')[0] + '#/embed?' + Object.entries(params).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&'),
      canvas: prepared.schema.canvas, name: preview.dashboard.name, empty: !prepared.schema.nodes.length
    }
  }
  async function channel(deviceId) {
    if (!current() || !prepared.devices.has(deviceId)) throw new Error('设备不属于当前看板')
    if (!pending.has(deviceId)) pending.set(deviceId, (async () => {
      const device = await requestDeviceApi(`device/detail/${encodeURIComponent(deviceId)}`)
      if (!current()) return null
      const ids = prepared.devices.get(deviceId)
      const schema = { ...prepared.schema, dataSources: prepared.schema.dataSources.filter(source => ids.includes(source.id)), nodes: prepared.schema.nodes }
      const runtime = createDeviceRuntime({ device, deviceId, addresses: preview.addresses, dataOnly: { schema },
        onMessage: emit, onState: state => { if (state.message && ['warning', 'error'].includes(state.status)) warn(state.message) } })
      channels.set(deviceId, runtime)
      await runtime.start()
      if (!current()) { runtime.stop(); return null }
      await runtime.handleMessage({ type: 'LOADED' })
      return runtime
    })().catch(error => { channels.get(deviceId)?.stop(); channels.delete(deviceId); pending.delete(deviceId); throw error }))
    return pending.get(deviceId)
  }
  async function handleMessage(message) {
    if (!current() || !prepared || !message) return
    const payload = message.payload || {}
    if (['READY', 'tv:ready', 'thingsvis:editor-ready', 'tv:request-init'].includes(message.type)) {
      emit({ type: 'tv:init', payload: { data: prepared.schema, config: { mode: 'app', saveTarget: 'host', token: preview.token, platformToken: preview.platformToken, thingsvisApiBaseUrl: preview.addresses.thingsVisApiBase, platformApiBaseUrl: preview.addresses.thingsPanelApiBase } } })
    } else if (['LOADED', 'tv:loaded'].includes(message.type)) {
      if (loaded) return
      loaded = true
      // 首值、历史、WebSocket 按设备隔离。静态看板不创建设备连接。
      for (const id of prepared.devices.keys()) channel(id).catch(error => warn(error.message))
    } else if (['thingsvis:requestFieldData', 'tv:platform-write'].includes(message.type)) {
      const source = prepared.schema.dataSources.find(item => item.id === payload.dataSourceId && item.type === 'PLATFORM_FIELD')
      const id = source?.config.deviceId || payload.deviceId
      try {
        if (!id || !prepared.devices.has(id) || (payload.deviceId && source && payload.deviceId !== id)) throw new Error('设备数据源不匹配')
        const runtime = await channel(id)
        await runtime?.handleMessage({ ...message, payload: { ...payload, deviceId: id } })
      } catch (error) {
        if (message.type === 'tv:platform-write') emit({ type: 'tv:platform-write-result', requestId: message.requestId, success: false, error: error.message })
        else warn(error.message)
      }
    } else if (['ERROR', 'tv:error'].includes(message.type)) {
      warn(typeof payload === 'string' ? payload : payload.message || payload.error || '部分看板组件加载失败')
    }
  }
  function stop() { stopped = true; channels.forEach(runtime => runtime.stop()); channels.clear(); pending.clear() }
  return { start, handleMessage, stop }
}
