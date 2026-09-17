<template>
  <view class="board-detail" :class="{ 'board-detail--fullscreen': fullscreen }" :style="{ '--board-background': background }">
    <view v-if="!fullscreen" class="board-nav" :style="{ paddingTop: statusBarHeight + 'px' }">
      <button class="nav-action" aria-label="返回" @click="goBack"><view class="back-icon" /></button>
      <text class="board-title">{{ title }}</text>
      <button class="nav-action" aria-label="横屏查看" @click="toggleFullscreen"><image class="screen-icon" src="/static/icon/device-rotate.svg" mode="aspectFit" /></button>
    </view>
    <view class="board-stage">
      <!-- #ifdef APP-PLUS || H5 -->
      <view :id="frameId" class="board-frame" :frame-state="frameState" :change:frame-state="boardBridge.syncFrame" :message-packet="messagePacket" :change:message-packet="boardBridge.sendMessages" :command="command" :change:command="boardBridge.control" />
      <!-- #endif -->
      <view v-if="phase === 'loading' || phase === 'error' || phase === 'empty'" class="board-state" role="status">
        <text>{{ statusMessage }}</text>
        <button v-if="phase === 'error'" @click="reload">重新加载</button>
      </view>
      <text v-if="warning" class="board-warning" role="status">{{ warning }}</text>
      <view v-if="fullscreen" class="fullscreen-actions">
        <button aria-label="返回看板列表" @click="goBack">返回</button>
        <button aria-label="退出横屏" @click="toggleFullscreen">退出横屏</button>
      </view>
      <view v-if="frameState?.url && phase !== 'error'" class="board-tools">
        <template v-if="!isGrid">
          <button aria-label="缩小看板" @click="sendCommand('zoom-out')">−</button>
          <button aria-label="适应屏幕" @click="sendCommand('reset')">复位</button>
          <button aria-label="放大看板" @click="sendCommand('zoom-in')">＋</button>
          <button :aria-pressed="interactive" @click="toggleInteractive">{{ interactive ? '移动画布' : '操作组件' }}</button>
        </template>
        <button v-if="phase === 'loaded'" aria-label="重新加载看板" @click="reload">刷新</button>
      </view>
    </view>
  </view>
</template>

<script>
import { createBoardRuntime } from '@/services/thingsvis-board-runtime'
let sequence = 0
// 45 秒内未收到 tv:render-ready 时原本会提示「未收到组件渲染完成通知，如内容缺失请刷新或检查
// ThingsVis 服务版本」。老版本 ThingsVis 本就不发该事件，属误报，暂时隐藏。
// 需要恢复时把这里改回提示文案即可。
const RENDER_READY_WARNING = ''
export default {
  data() { return { boardId: '', title: '看板', frameId: `board-viewer-${++sequence}`, frameState: null, messagePacket: null, command: null, phase: 'loading', statusMessage: '正在加载看板…', warning: '', background: '#f5f6f8', fullscreen: false, interactive: false, isGrid: false, statusBarHeight: 0, session: 0 } },
  onLoad(options) {
    this.boardId = options.id || ''
    this.title = options.name || '看板'
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
    this.reload()
  },
  onBackPress(event) { if (event.from !== 'navigateBack' && this.fullscreen) { this.toggleFullscreen(); return true } return false },
  onUnload() { this.dispose(); this.restorePortrait() },
  methods: {
    dispose() {
      this.session++; clearTimeout(this.readyTimer); clearTimeout(this.sendTimer)
      this.sendTimer = null; this.pendingMessages = []; this.runtime?.stop(); this.runtime = null
      this.frameState = { id: this.frameId, session: this.session, url: '' }
    },
    async reload() {
      this.dispose(); this.phase = 'loading'; this.warning = ''; this.statusMessage = '正在加载看板…'; this.interactive = false
      if (!this.boardId) { this.phase = 'error'; this.statusMessage = '缺少看板 ID'; return }
      const session = this.session
      try {
        this.runtime = createBoardRuntime({ boardId: this.boardId,
          onMessage: message => {
            if (session !== this.session) return
            this.pendingMessages.push(message)
            if (this.sendTimer) return
            this.sendTimer = setTimeout(() => { this.sendTimer = null; this.messagePacket = { session, sequence: Date.now(), messages: this.pendingMessages.splice(0) } }, 0)
          }, onState: state => { if (session === this.session && state.message) this.warning = state.message }
        })
        const result = await this.runtime.start()
        if (session !== this.session) return
        if (!result) throw new Error('登录或服务器已切换，请重新打开看板')
        this.title = result.name || this.title
        this.background = typeof result.canvas.background === 'string' ? result.canvas.background : result.canvas.background?.color || '#f5f6f8'
        this.isGrid = result.canvas.mode === 'grid'; this.interactive = this.isGrid
        if (result.empty) { this.phase = 'empty'; this.statusMessage = '看板尚未添加内容'; return }
        this.frameState = { id: this.frameId, session, ...result }
        this.readyTimer = setTimeout(() => {
          if (session !== this.session || this.phase === 'ready') return
          if (this.phase === 'loading') { this.phase = 'error'; this.statusMessage = '看板连接超时，请重试'; this.runtime?.stop() }
          else if (RENDER_READY_WARNING) this.warning = RENDER_READY_WARNING
        }, 45000)
      } catch (error) { if (session === this.session) { this.dispose(); this.phase = 'error'; this.statusMessage = error.message || '看板加载失败' } }
    },
    onFrameEvent(event) {
      if (event.session !== this.session) return
      if (event.error) { this.phase = 'error'; this.statusMessage = event.error; return }
      const type = event.message?.type
      // 老版本固定画布没有 render-ready：允许显示配置，但不谎报实际组件渲染成功。
      if (['LOADED', 'tv:loaded'].includes(type) && this.phase === 'loading') this.phase = 'loaded'
      if (type === 'tv:render-ready') { this.phase = 'ready'; clearTimeout(this.readyTimer) }
      Promise.resolve(this.runtime?.handleMessage(event.message)).catch(error => { if (event.session === this.session) this.warning = error.message || '看板数据加载失败' })
    },
    sendCommand(kind, enabled) { this.command = { session: this.session, sequence: (this.command?.sequence || 0) + 1, kind, enabled } },
    toggleInteractive() { this.interactive = !this.interactive; this.sendCommand('interact', this.interactive) },
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
      // #ifdef APP-PLUS
      plus.screen.lockOrientation(this.fullscreen ? 'landscape-primary' : 'portrait-primary')
      // #endif
      this.sendCommand('reset')
    },
    restorePortrait() {
      // #ifdef APP-PLUS
      if (this.fullscreen) plus.screen.lockOrientation('portrait-primary')
      // #endif
      this.fullscreen = false
    },
    goBack() { this.restorePortrait(); uni.navigateBack({ fail: () => uni.redirectTo({ url: '/pages/dashboard/boards' }) }) }
  }
}
</script>

<!-- #ifdef APP-PLUS || H5 -->
<script module="boardBridge" lang="renderjs">
// uni-app Vue3 的 renderjs 无法 import 模块（Vue2 可以），构建会报 Could not resolve，
// 因此这里内联依赖，保持自包含。逻辑与 utils/thingsvis-board-frame.js 及
// utils/thingsvis-board-schema.js 的 fitBoardViewport 一致，改动请同步。
function fitBoardViewport(width, height, zoom = 1, x = 0, y = 0) {
  const scale = Math.max(1, Math.min(5, Number(zoom) || 1))
  return { zoom: scale, x: Math.max(-width * (scale - 1), Math.min(0, x)), y: Math.max(-height * (scale - 1), Math.min(0, y)) }
}

// 仅在 renderjs 视图层使用。跨域消息必须同时核验来源窗口和 origin。
class BoardFrame {
  constructor(host, state, notify) {
    this.host = host; this.state = state; this.notify = notify
    this.position = { zoom: 1, x: 0, y: 0 }; this.pointers = new Map()
    this.origin = new URL(state.url).origin
    this.frame = document.createElement('iframe')
    this.frame.title = state.name || '看板'
    this.frame.setAttribute('referrerpolicy', 'no-referrer')
    this.frame.setAttribute('allow', 'fullscreen')
    this.frame.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:0;transform-origin:0 0;'
    this.frame.onerror = () => notify({ error: '看板页面加载失败，请检查服务配置' })
    this.listener = event => {
      if (event.source !== this.frame.contentWindow || event.origin !== this.origin || !event.data || typeof event.data !== 'object') return
      const accepted = ['READY', 'LOADED', 'ERROR', 'tv:ready', 'tv:loaded', 'tv:render-ready', 'tv:error', 'tv:request-init', 'thingsvis:editor-ready', 'thingsvis:requestFieldData', 'tv:platform-write']
      if (accepted.includes(event.data.type)) notify({ message: event.data })
    }
    window.addEventListener('message', this.listener)
    this.frame.src = state.url; host.appendChild(this.frame)
    this.gestures = document.createElement('div')
    this.gestures.style.cssText = 'position:absolute;inset:0;touch-action:none;cursor:grab;'
    this.gestures.setAttribute('aria-hidden', 'true')
    host.appendChild(this.gestures)
    const point = event => {
      const rect = host.getBoundingClientRect()
      // H5 竖屏下的横屏预览通过 CSS 旋转，换算到画布坐标。
      const rotated = host.closest('.board-detail--fullscreen') && window.innerHeight > window.innerWidth
      return rotated ? { x: event.clientY - rect.top, y: rect.right - event.clientX } : { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    this.gestures.onpointerdown = event => { this.gestures.setPointerCapture(event.pointerId); this.pointers.set(event.pointerId, point(event)); this.anchor() }
    this.gestures.onpointermove = event => {
      if (!this.pointers.has(event.pointerId)) return
      this.pointers.set(event.pointerId, point(event))
      const points = [...this.pointers.values()], first = points[0]
      if (points.length > 1 && this.start.distance) {
        const second = points[1], distance = Math.hypot(second.x - first.x, second.y - first.y)
        const zoom = Math.max(1, Math.min(5, this.start.zoom * distance / this.start.distance))
        this.position = fitBoardViewport(host.clientWidth, host.clientHeight, zoom,
          (first.x + second.x) / 2 - this.start.contentX * zoom,
          (first.y + second.y) / 2 - this.start.contentY * zoom)
      } else this.position = fitBoardViewport(host.clientWidth, host.clientHeight, this.start.zoom, this.start.x + first.x - this.start.point.x, this.start.y + first.y - this.start.point.y)
      this.draw()
    }
    const up = event => { this.pointers.delete(event.pointerId); this.anchor() }
    this.gestures.onpointerup = up; this.gestures.onpointercancel = up
    this.gestures.ondblclick = () => this.zoom(this.position.zoom > 1 ? 1 : 2)
    this.gestures.onwheel = event => { event.preventDefault(); this.zoom(this.position.zoom * (event.deltaY < 0 ? 1.15 : 0.87)) }
    this.resize = new ResizeObserver(() => this.reset())
    this.resize.observe(host)
    this.removal = new MutationObserver(() => { if (!host.isConnected) this.destroy() })
    this.removal.observe(document.body, { childList: true, subtree: true })
    this.setInteractive(state.canvas?.mode === 'grid')
  }
  anchor() {
    const points = [...this.pointers.values()]
    this.start = { ...this.position, point: points[0] }
    if (points.length > 1) {
      this.start.distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
      this.start.contentX = ((points[0].x + points[1].x) / 2 - this.position.x) / this.position.zoom
      this.start.contentY = ((points[0].y + points[1].y) / 2 - this.position.y) / this.position.zoom
    }
  }
  zoom(value) {
    const { zoom, x, y } = this.position, width = this.host.clientWidth, height = this.host.clientHeight
    const next = Math.max(1, Math.min(5, value))
    this.position = fitBoardViewport(width, height, next, width / 2 - (width / 2 - x) * next / zoom, height / 2 - (height / 2 - y) * next / zoom)
    this.draw()
  }
  reset() { this.position = { zoom: 1, x: 0, y: 0 }; this.pointers.clear(); this.draw() }
  draw() { const p = this.position; this.frame.style.transform = `translate(${p.x}px,${p.y}px) scale(${p.zoom})` }
  setInteractive(enabled) { this.gestures.style.display = enabled ? 'none' : 'block'; this.frame.style.pointerEvents = enabled ? 'auto' : 'none'; this.pointers.clear() }
  command(value) {
    if (value.kind === 'reset') this.reset()
    if (value.kind === 'zoom-in') this.zoom(this.position.zoom * 1.25)
    if (value.kind === 'zoom-out') this.zoom(this.position.zoom / 1.25)
    if (value.kind === 'interact') this.setInteractive(value.enabled)
  }
  send(messages) { for (const message of messages || []) this.frame.contentWindow?.postMessage(JSON.parse(JSON.stringify(message)), this.origin) }
  destroy() {
    window.removeEventListener('message', this.listener)
    this.resize?.disconnect(); this.removal?.disconnect(); this.pointers.clear()
    this.frame.remove(); this.gestures.remove()
  }
}

export default {
  methods: {
    syncFrame(state) {
      this.viewer?.destroy(); this.viewer = null
      if (!state?.url) return
      const host = document.getElementById(state.id)
      if (!host) return
      this.viewer = new BoardFrame(host, state, event => this.$ownerInstance.callMethod('onFrameEvent', { ...event, session: state.session }))
    },
    sendMessages(packet) { if (this.viewer && packet && packet.session === this.viewer.state.session) this.viewer.send(packet.messages) },
    control(command) { if (this.viewer && command && command.session === this.viewer.state.session) this.viewer.command(command) }
  }
}
</script>
<!-- #endif -->

<style scoped>
.board-detail { position:fixed; inset:0; display:flex; flex-direction:column; background:var(--board-background); color:#202938; font-family:'PingFang SC','Microsoft YaHei',sans-serif; }
.board-detail button { margin:0; border:0; border-radius:0; font-family:inherit; font-size:26rpx; font-weight:400; min-height:44px; line-height:44px; padding:0 16rpx; }
.board-detail button::after { border:0; }
.board-detail button:active { opacity:.65; }
.board-nav { flex-shrink:0; display:flex; align-items:center; min-height:44px; background:#f2f2f7; }
.board-title { flex:1; min-width:0; text-align:center; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-size:30rpx; }
.board-detail .nav-action { width:50px; height:44px; display:flex; align-items:center; justify-content:center; background:transparent; }
.back-icon { width:12px; height:12px; border-left:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg); }
.screen-icon { width:19px; height:19px; }
.board-stage { position:relative; flex:1; min-height:0; overflow:hidden; }
.board-frame { position:absolute; inset:0; overflow:hidden; }
.board-state { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24rpx; background:#f5f6f8; color:#667085; font-size:26rpx; padding:32rpx; text-align:center; }
.board-state button { color:#1677ff; background:#eaf2ff; }
.board-tools { position:absolute; bottom:calc(12px + env(safe-area-inset-bottom)); left:50%; transform:translateX(-50%); display:flex; white-space:nowrap; background:rgba(20,29,44,.9); }
.board-tools button,.fullscreen-actions button { color:#fff; background:transparent; min-width:44px; font-size:13px; }
.board-warning { position:absolute; left:0; right:0; top:0; padding:8px 16px; background:#fff5dd; color:#79520b; font-size:24rpx; }
.fullscreen-actions { position:absolute; top:env(safe-area-inset-top); left:env(safe-area-inset-left); right:env(safe-area-inset-right); display:flex; justify-content:space-between; pointer-events:none; }
.fullscreen-actions button { pointer-events:auto; background:rgba(20,29,44,.9); }
.board-detail--fullscreen { z-index:999; }
/* #ifdef H5 */
@media (orientation:portrait) { .board-detail--fullscreen { width:100vh; height:100vw; inset:auto; top:0; left:0; transform-origin:top left; transform:translateX(100vw) rotate(90deg); } }
/* #endif */
</style>
