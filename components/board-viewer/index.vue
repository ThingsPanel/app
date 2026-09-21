<template>
  <view class="board-detail" :class="{ 'board-detail--fullscreen': fullscreen, 'board-detail--dark': darkCanvas, 'board-detail--home': homeMode && !fullscreen }" :style="{ '--board-background': background }">
    <view v-if="!fullscreen && !homeMode" class="board-nav" @touchstart="startSwipe" @touchend="endSwipe" :style="{ paddingTop: statusBarHeight + 'px' }">
      <button v-if="showBack" class="nav-action" aria-label="返回" @click="goBack"><view class="back-icon" /></button>
      <view class="board-title"><text>{{ title }}</text></view>
      <text v-if="deckMode" class="page-position">{{ pageIndex + 1 }} / {{ pageCount }}</text>
      <button class="nav-action" aria-label="搜索看板" @click="openSearch"><image class="toolbar-icon" src="/static/icon/board-search.svg" mode="aspectFit" /></button>
    </view>
    <view class="board-stage">
      <!-- #ifdef APP-PLUS || H5 -->
      <view :id="frameId" class="board-frame" :frame-state="frameState" :change:frame-state="boardBridge.syncFrame" :message-packet="messagePacket" :change:message-packet="boardBridge.sendMessages" :command="command" :change:command="boardBridge.control" />
      <!-- #endif -->
      <transition name="preview-fade"><BoardLoading v-if="phase === 'loading'" :thumbnail="previewThumbnail" :background="background" :dark="darkCanvas" /></transition>
      <view v-if="phase === 'error' || phase === 'empty'" class="board-state" role="status" @touchstart="startSwipe" @touchend="endSwipe">
        <text>{{ statusMessage }}</text>
        <button v-if="phase === 'error'" @click="reload">重新加载</button>
        <button v-if="homeMode && phase === 'error'" @click="$emit('system-home')">返回系统首页</button>
      </view>
      <text v-if="warning" class="board-warning" role="status">{{ warning }}</text>
      <view v-if="showSwipeGuide" class="swipe-guide" aria-hidden="true">
        <view class="swipe-demo" :class="{ downward: pageIndex === pageCount - 1 }"><image src="/static/icon/board-touch.svg" /></view>
        <text>{{ pageIndex === pageCount - 1 ? '下滑查看上一张' : '上滑查看下一张' }}</text>
      </view>
      <view v-if="fullscreen" class="fullscreen-actions">
        <button aria-label="返回" @click="fullscreenBack">返回</button>
        <button aria-label="退出横屏" @click="toggleFullscreen">退出横屏</button>
      </view>
      <view v-if="!homeMode && ['ready', 'loaded'].includes(phase)" class="side-tools">
        <button v-if="!fullscreen" aria-label="横屏查看" @click="toggleFullscreen"><image src="/static/icon/device-rotate.svg" /><text>横屏</text></button>
        <button :class="{ selected: isHome }" :disabled="savingHome" :aria-pressed="isHome" @click="setAsHome"><image :src="isHome ? '/static/icon/board-check.svg' : '/static/icon/board-home.svg'" /><text>{{ isHome ? '已设首页' : '设为首页' }}</text></button>
        <button :class="{ selected: interactive }" :aria-pressed="interactive" :disabled="!['ready', 'loaded'].includes(phase)" @click="toggleInteractive"><image :src="interactive ? '/static/icon/board-check.svg' : '/static/icon/board-touch.svg'" /><text>{{ interactive ? '完成操作' : '操作看板' }}</text></button>
      </view>
      <text v-if="operationTip" class="operation-tip" role="status">可点击控件、拖动图表，点“完成操作”后继续滑动</text>
      <view v-if="!homeMode && frameState?.url && ['ready', 'loaded'].includes(phase)" class="board-tools">
        <template v-if="!isGrid">
          <button aria-label="缩小看板" @click="sendCommand('zoom-out')">−</button>
          <button aria-label="适应屏幕" @click="sendCommand('reset')">复位</button>
          <button aria-label="放大看板" @click="sendCommand('zoom-in')">＋</button>
        </template>
        <button aria-label="重新加载看板" @click="reload">刷新</button>
      </view>
    </view>
  </view>
</template>

<script>
import BoardLoading from '@/components/board-loading/index.vue'
import { createBoardRuntime } from '@/services/thingsvis-board-runtime'
import { openHomePreference } from '@/services/dashboard-home'
let sequence = 0
// 45 秒内未收到 tv:render-ready 时原本会提示「未收到组件渲染完成通知，如内容缺失请刷新或检查
// ThingsVis 服务版本」。老版本 ThingsVis 本就不发该事件，属误报，暂时隐藏。
// 需要恢复时把这里改回提示文案即可。
const RENDER_READY_WARNING = ''
export default {
  components: { BoardLoading },
  props: { initialId: { type: String, required: true }, initialName: { type: String, default: '看板' }, homeMode: { type: Boolean, default: false }, showBack: { type: Boolean, default: false }, deckMode: { type: Boolean, default: false }, pageIndex: { type: Number, default: 0 }, pageCount: { type: Number, default: 1 } },
  emits: ['back', 'system-home', 'unavailable', 'page-change'],
  data() { return { previewThumbnail: '', boardId: '', title: '看板', frameId: `board-viewer-${++sequence}`, frameState: null, messagePacket: null, command: null, phase: 'loading', statusMessage: '正在加载看板…', warning: '', background: '#ffffff', fullscreen: false, interactive: false, isGrid: false, statusBarHeight: 0, session: 0, guidePending: false, operationTip: false, isHome: false, savingHome: false } },
  computed: { darkCanvas() {
    const color = this.background || ''
    const hex = color.match(/^#([a-f0-9]{6}|[a-f0-9]{3})$/i)
    const rgb = hex ? (hex[1].length === 3 ? hex[1].split('').map(v => parseInt(v + v, 16)) : [0, 2, 4].map(i => parseInt(hex[1].slice(i, i + 2), 16))) : color.match(/[\d.]+/g)?.slice(0, 3).map(Number)
    return rgb?.length === 3 && rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722 < 140
  }, showSwipeGuide() { return !this.homeMode && this.guidePending && this.deckMode && this.pageCount > 1 && !this.interactive && !this.fullscreen && ['ready', 'loaded'].includes(this.phase) } },
  watch: {
    showSwipeGuide(visible) {
      clearTimeout(this.guideTimer)
      if (visible) this.guideTimer = setTimeout(() => this.dismissSwipeGuide(), 6000)
    }
  },
  mounted() {
    this.boardId = this.initialId
    this.title = this.initialName
    this.statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
    this.reload()
    this.loadPreferences()
  },
  beforeUnmount() { this.disposed = true; clearTimeout(this.guideTimer); clearTimeout(this.operationTimer); this.dispose(); this.restorePortrait() },
  methods: {
    async loadPreferences() {
      try {
        const preference = await openHomePreference()
        if (this.disposed) return
        this.preference = preference
        this.isHome = preference.read()?.id === this.boardId
        this.guidePending = !preference.guideSeen('swipe')
      } catch { /* Preference failure must not prevent viewing. */ }
    },
    dismissSwipeGuide() {
      this.guidePending = false
      try { this.preference?.finishGuide('swipe') } catch { /* Can retry next visit. */ }
    },
    requestPage(direction) {
      if (this.homeMode || this.interactive || this.fullscreen) return
      this.$emit('page-change', direction, 'swipe')
    },
    dismissOperationTip() {
      clearTimeout(this.operationTimer)
      this.operationTip = false
      try { this.preference?.finishGuide('operate') } catch { /* Can retry next visit. */ }
    },
    async setAsHome() {
      if (this.savingHome) return
      this.savingHome = true
      try {
        const preference = await openHomePreference()
        if (this.disposed) return
        preference.save({ id: this.boardId, name: this.title }); this.isHome = true
        uni.showToast({ title: '已设为首页，可在“我的 → App 首页”恢复', icon: 'none', duration: 3000 })
      } catch (error) { uni.showToast({ title: error.message || '设置失败，请重试', icon: 'none' }) }
      finally { this.savingHome = false }
    },
    handleBack() {
      if (this.fullscreen) { this.toggleFullscreen(); return true }
      return false
    },
    startSwipe(event) { this.swipeStart = event.touches?.length === 1 ? { y: event.touches[0].clientY, x: event.touches[0].clientX, time: Date.now() } : null },
    endSwipe(event) {
      const start = this.swipeStart; this.swipeStart = null
      const end = event.changedTouches?.[0]
      if (!start || !end || !this.deckMode || Date.now() - start.time > 1000) return
      const dy = end.clientY - start.y, dx = end.clientX - start.x
      if (Math.abs(dy) >= 64 && Math.abs(dy) > Math.abs(dx) * 1.4) this.requestPage(dy < 0 ? 1 : -1)
    },
    openSearch() { uni.navigateTo({ url: '/pages/dashboard/search' }) },
    fullscreenBack() { if (this.showBack) this.goBack(); else this.toggleFullscreen() },
    dispose() {
      clearTimeout(this.operationTimer)
      this.session++; clearTimeout(this.readyTimer); clearTimeout(this.sendTimer)
      this.sendTimer = null; this.pendingMessages = []; this.runtime?.stop(); this.runtime = null
      this.frameState = { id: this.frameId, session: this.session, url: '' }
    },
    async reload() {
      this.dispose(); this.phase = 'loading'; this.warning = ''; this.statusMessage = '正在加载看板…'; this.interactive = false; this.operationTip = false
      if (!this.boardId) { this.phase = 'error'; this.statusMessage = '缺少看板 ID'; return }
      const session = this.session
      try {
        this.runtime = createBoardRuntime({ boardId: this.boardId,
          onMessage: message => {
            if (session !== this.session) return
            this.pendingMessages.push(message)
            if (this.sendTimer) return
            this.sendTimer = setTimeout(() => { this.sendTimer = null; this.messagePacket = { session, sequence: Date.now(), messages: this.pendingMessages.splice(0) } }, 0)
          }, onState: state => { if (session !== this.session) return; if (state.message) this.warning = state.message; if (typeof state.thumbnail === 'string') this.previewThumbnail = state.thumbnail }
        })
        const result = await this.runtime.start()
        if (session !== this.session) return
        if (!result) throw new Error('登录或服务器已切换，请重新打开看板')
        this.title = result.name || this.title
        this.background = typeof result.canvas.background === 'string' ? result.canvas.background : result.canvas.background?.color || '#f5f6f8'
        this.isGrid = result.canvas.mode === 'grid'; this.interactive = this.homeMode || (!this.deckMode && this.isGrid)
        if (result.empty) { this.phase = 'empty'; this.statusMessage = '看板尚未添加内容'; return }
        this.frameState = { id: this.frameId, session, ...result, paging: !this.homeMode && this.deckMode && this.pageCount > 1, browse: !this.homeMode && this.deckMode, interactive: this.interactive }
        this.readyTimer = setTimeout(() => {
          if (session !== this.session || this.phase === 'ready') return
          if (this.phase === 'loading') { this.phase = 'error'; this.statusMessage = '看板连接超时，请重试'; this.runtime?.stop() }
          else if (RENDER_READY_WARNING) this.warning = RENDER_READY_WARNING
        }, 45000)
      } catch (error) { if (session === this.session) { this.dispose(); this.phase = 'error'; this.statusMessage = error.message || '看板加载失败'; if ([403, 404].includes(error.statusCode)) this.$emit('unavailable', { id: this.boardId }) } }
    },
    onFrameEvent(event) {
      if (event.session !== this.session) return
      if (event.pageDirection && !this.interactive && !this.fullscreen) { this.requestPage(event.pageDirection); return }
      if (event.error) { this.phase = 'error'; this.statusMessage = event.error; return }
      const type = event.message?.type
      // 老版本固定画布没有 render-ready：允许显示配置，但不谎报实际组件渲染成功。
      if (['LOADED', 'tv:loaded'].includes(type) && this.phase === 'loading') this.phase = 'loaded'
      if (type === 'tv:render-ready') { this.phase = 'ready'; clearTimeout(this.readyTimer) }
      Promise.resolve(this.runtime?.handleMessage(event.message)).catch(error => { if (event.session === this.session) this.warning = error.message || '看板数据加载失败' })
    },
    sendCommand(kind, enabled) { this.command = { session: this.session, sequence: (this.command?.sequence || 0) + 1, kind, enabled } },
    toggleInteractive() {
      this.interactive = !this.interactive; this.sendCommand('interact', this.interactive)
      if (this.interactive) {
        this.dismissSwipeGuide()
        try { this.operationTip = !this.preference?.guideSeen('operate') } catch { this.operationTip = true }
        if (this.operationTip) this.operationTimer = setTimeout(() => this.dismissOperationTip(), 5000)
      } else this.dismissOperationTip()
    },
    toggleFullscreen() {
      this.fullscreen = !this.fullscreen
      if (this.fullscreen) uni.hideTabBar({ animation: false, fail() {} })
      else uni.showTabBar({ animation: false, fail() {} })
      // #ifdef APP-PLUS
      plus.screen.lockOrientation(this.fullscreen ? 'landscape-primary' : 'portrait-primary')
      // #endif
      this.sendCommand('reset')
    },
    restorePortrait() {
      if (this.fullscreen) uni.showTabBar({ animation: false, fail() {} })
      // #ifdef APP-PLUS
      if (this.fullscreen) plus.screen.lockOrientation('portrait-primary')
      // #endif
      this.fullscreen = false
    },
    goBack() { this.restorePortrait(); this.$emit('back') }
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
    this.gestures.onpointerdown = event => { this.gestures.setPointerCapture(event.pointerId); this.pointers.set(event.pointerId, point(event)); if (this.pointers.size === 1) { this.swipeStart = point(event); this.swipeTime = Date.now(); this.hadMultiplePointers = false } else this.hadMultiplePointers = true; this.anchor() }
    this.gestures.onpointermove = event => {
      if (!this.pointers.has(event.pointerId) || (this.state.browse && this.position.zoom === 1)) return
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
    const up = event => {
      const end = point(event)
      if (this.state.paging && this.swipeStart && !this.hadMultiplePointers && this.position.zoom === 1 && !this.interactive) {
        const dy = end.y - this.swipeStart.y, dx = end.x - this.swipeStart.x
        if (Date.now() - this.swipeTime < 1000 && Math.abs(dy) >= 64 && Math.abs(dy) > Math.abs(dx) * 1.4) this.notify({ pageDirection: dy < 0 ? 1 : -1 })
      }
      this.swipeStart = null; this.pointers.delete(event.pointerId); this.anchor()
    }
    this.gestures.onpointerup = up; this.gestures.onpointercancel = event => { this.swipeStart = null; this.pointers.delete(event.pointerId); this.anchor() }
    this.gestures.ondblclick = () => { if (!this.state.browse) this.zoom(this.position.zoom > 1 ? 1 : 2) }
    this.gestures.onwheel = event => { event.preventDefault(); if (this.state.paging && !this.interactive && this.position.zoom === 1) { if (Math.abs(event.deltaY) > 30 && Date.now() - (this.lastWheel || 0) > 700) { this.lastWheel = Date.now(); this.notify({ pageDirection: event.deltaY > 0 ? 1 : -1 }) } } else if (!this.state.browse) this.zoom(this.position.zoom * (event.deltaY < 0 ? 1.15 : 0.87)) }
    this.resize = new ResizeObserver(() => this.reset())
    this.resize.observe(host)
    this.removal = new MutationObserver(() => { if (!host.isConnected) this.destroy() })
    this.removal.observe(document.body, { childList: true, subtree: true })
    this.setInteractive(state.interactive || (!state.browse && state.canvas?.mode === 'grid'))
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
  setInteractive(enabled) { this.interactive = enabled; this.gestures.style.display = enabled ? 'none' : 'block'; this.frame.style.pointerEvents = enabled ? 'auto' : 'none'; this.pointers.clear() }
  command(value) {
    if (value.kind === 'reset') this.reset()
    if (value.kind === 'zoom-in') this.zoom(this.position.zoom * 1.25)
    if (value.kind === 'zoom-out') this.zoom(this.position.zoom / 1.25)
    if (value.kind === 'interact') { this.reset(); this.setInteractive(value.enabled) }
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
.preview-fade-leave-active { transition:opacity .18s ease-out; pointer-events:none; }
.preview-fade-leave-to { opacity:0; }
@media(prefers-reduced-motion:reduce) { .preview-fade-leave-active { transition:none; } }
.board-detail { position:absolute; inset:0; display:flex; flex-direction:column; background:var(--board-background); color:#202938; font-family: inherit; }
.board-detail button { margin:0; border:0; border-radius:0; font-family:inherit; font-size:26rpx; font-weight:400; min-height:44px; line-height:44px; padding:0 16rpx; }
.board-detail button::after { border:0; }
.board-detail button:active { opacity:.65; }
.board-nav { padding-left:8px; padding-right:4px; flex-shrink:0; display:flex; align-items:center; min-height:44px; background:#f2f2f7; }
.board-detail .board-title { display:flex; align-items:center; justify-content:flex-start; padding:8px 8px; gap:8px; background:transparent; flex:1; min-width:0; text-align:center; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; font-size:30rpx; font-weight:500; }
.board-detail .nav-action { flex:0 0 40px; width:40px; height:44px; padding:0; display:flex; align-items:center; justify-content:center; background:transparent; }
.back-icon { width:12px; height:12px; border-left:1.5px solid currentColor; border-bottom:1.5px solid currentColor; transform:rotate(45deg); }
.board-title text:first-child { overflow:hidden; text-overflow:ellipsis; }
.toolbar-icon { width:19px; height:19px; }
.board-stage { position:relative; flex:1; min-height:0; overflow:hidden; }
.board-frame { position:absolute; inset:0; overflow:hidden; }
.board-state { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24rpx; background:#f5f6f8; color:#667085; font-size:26rpx; padding:32rpx; text-align:center; }
.board-state button { color:var(--tp-color-primary, #1677ff); background:#eaf2ff; }
.board-warning { position:absolute; left:0; right:0; top:0; padding:8px 16px; background:#fff5dd; color:var(--tp-color-warning, #ff9500); font-size:24rpx; }
.board-detail--fullscreen { position:fixed; z-index:999; }
/* #ifdef H5 */
@media (orientation:portrait) { .board-detail--fullscreen { width:100vh; height:100vw; inset:auto; top:0; left:0; transform-origin:top left; transform:translateX(100vw) rotate(90deg); } }
/* #endif */
.page-position { flex-shrink:0; font-size:11px; color:#8993a3; font-variant-numeric:tabular-nums; margin-right:6px; }
.side-tools { position:absolute; right:12px; top:50%; transform:translateY(-50%); display:flex; flex-direction:column; gap:8px; }
.board-detail .side-tools button { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; width:56px; min-height:52px; padding:4px 0; border-radius:0; background:transparent; color:#73737d; font-size:11px; line-height:16px; font-weight:400; }
.side-tools image { width:21px; height:21px; opacity:.85; }
.board-detail--dark .side-tools button { color:#e4e7ee; }
.board-detail--dark .side-tools image { filter:brightness(0) invert(1); }
.board-detail .side-tools .selected { color:var(--tp-color-primary,#1677ff); }
.side-tools button[disabled] { opacity:.45; }
.board-tools { position:absolute; bottom:16px; left:50%; transform:translateX(-50%); display:flex; white-space:nowrap; background:#29313e; border-radius:6px; padding:0 4px; }
.board-detail .board-tools button,.board-detail .fullscreen-actions button { color:#fff; background:transparent; min-width:44px; font-size:13px; }
.board-detail .board-tools button { font-size:12px; font-weight:400; padding:0 7px; }
.fullscreen-actions { position:absolute; top:env(safe-area-inset-top,0px); left:env(safe-area-inset-left,0px); right:env(safe-area-inset-right,0px); display:flex; justify-content:space-between; pointer-events:none; }
.board-detail .fullscreen-actions button { pointer-events:auto; background:rgba(20,29,44,.9); }
.operation-tip { position:absolute; bottom:70px; left:16px; right:80px; color:#51515c; background:rgba(242,242,247,.94); padding:6px 8px; font-size:12px; line-height:1.6; pointer-events:none; }
.swipe-guide { position:absolute; left:50%; bottom:110px; transform:translateX(-50%); display:flex; flex-direction:column; align-items:center; gap:8px; color:#fff; text-shadow:0 1px 3px #000; font-size:13px; white-space:nowrap; pointer-events:none; }
.swipe-demo { height:80px; width:36px; position:relative; }
.swipe-demo::before { content:'↑'; position:absolute; top:0; left:11px; font-size:26px; }
.swipe-demo image { position:absolute; width:32px; height:32px; left:2px; top:44px; filter:brightness(0) invert(1) drop-shadow(0 1px 2px #555); animation:swipe-preview 2s ease-in-out 3; }
.swipe-demo.downward { transform:rotate(180deg); }
@keyframes swipe-preview { 0%,15% { transform:translateY(0); opacity:.4; } 65%,85% { transform:translateY(-32px); opacity:1; } 100% { transform:translateY(-32px); opacity:0; } }
@media(prefers-reduced-motion:reduce) { .swipe-demo image { animation:none; } }
@media(max-height:450px) { .side-tools { top:50%; bottom:auto; flex-direction:column; } }
</style>
