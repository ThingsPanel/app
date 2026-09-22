import { fitBoardViewport } from './thingsvis-board-schema.js'

// Keep in sync with the inline App renderjs BoardFrame in components/board-viewer/index.vue.
export class BoardFrame {
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
    this.gestures.onpointerdown = event => {
      if (this.interactive || (event.pointerType === 'mouse' && event.button !== 0)) return
      try { this.gestures.setPointerCapture(event.pointerId) } catch { /* A cancelled pointer may no longer be capturable. */ }
      this.pointers.set(event.pointerId, point(event))
      if (this.pointers.size === 1) {
        this.swipeStart = point(event); this.swipeTime = Date.now()
        this.hadMultiplePointers = false; this.moved = false; this.startedZoomed = this.position.zoom > 1
      } else { this.hadMultiplePointers = true; this.lastTap = null }
      this.anchor()
    }
    this.gestures.onpointermove = event => {
      if (this.interactive || !this.pointers.has(event.pointerId)) return
      this.pointers.set(event.pointerId, point(event))
      const points = [...this.pointers.values()], first = points[0]
      if (this.swipeStart && Math.hypot(first.x - this.swipeStart.x, first.y - this.swipeStart.y) > 10) { this.moved = true; this.lastTap = null }
      // Only single-finger browsing is reserved for paging; two fingers always reach pinch handling.
      if (this.state.browse && this.position.zoom === 1 && points.length === 1) return
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
      if (this.interactive || !this.pointers.has(event.pointerId)) return
      const end = point(event)
      if (this.state.paging && this.swipeStart && !this.hadMultiplePointers && !this.startedZoomed && this.position.zoom === 1) {
        const dy = end.y - this.swipeStart.y, dx = end.x - this.swipeStart.x
        if (Date.now() - this.swipeTime < 1000 && Math.abs(dy) >= 64 && Math.abs(dy) > Math.abs(dx) * 1.4) this.notify({ pageDirection: dy < 0 ? 1 : -1 })
      }
      const touchTap = event.pointerType === 'touch' || event.pointerType === 'pen'
      if (touchTap && this.swipeStart && !this.hadMultiplePointers && !this.moved && Date.now() - this.swipeTime < 300 && Math.hypot(end.x - this.swipeStart.x, end.y - this.swipeStart.y) < 10) {
        if (this.lastTap && Date.now() - this.lastTap.time < 320 && Math.hypot(end.x - this.lastTap.x, end.y - this.lastTap.y) < 24) {
          this.doubleTap(); this.lastTap = null
        } else this.lastTap = { ...end, time: Date.now() }
      } else this.lastTap = null
      this.swipeStart = null; this.pointers.delete(event.pointerId); this.anchor()
    }
    this.gestures.onpointerup = up
    this.gestures.onpointercancel = () => this.clearGesture()
    this.gestures.onlostpointercapture = event => { if (this.pointers.has(event.pointerId)) this.clearGesture() }
    this.gestures.ondblclick = event => { if (!this.interactive && (!event?.pointerType || event.pointerType === 'mouse') && Date.now() - (this.lastTouchDoubleTap || 0) > 500) this.doubleTap(false) }
    this.gestures.onwheel = event => { event.preventDefault(); if (this.state.paging && !this.interactive && this.position.zoom === 1) { if (Math.abs(event.deltaY) > 30 && Date.now() - (this.lastWheel || 0) > 700) { this.lastWheel = Date.now(); this.notify({ pageDirection: event.deltaY > 0 ? 1 : -1 }) } } else if (!this.state.browse) this.zoom(this.position.zoom * (event.deltaY < 0 ? 1.15 : 0.87)) }
    this.resize = new ResizeObserver(() => this.reset())
    this.resize.observe(host)
    this.removal = new MutationObserver(() => { if (!host.isConnected) this.destroy() })
    this.removal.observe(document.body, { childList: true, subtree: true })
    this.blurListener = () => this.clearGesture()
    this.visibilityListener = () => { if (document.hidden) this.clearGesture() }
    window.addEventListener('blur', this.blurListener)
    document.addEventListener?.('visibilitychange', this.visibilityListener)
    this.setInteractive(state.interactive || (!state.browse && state.canvas?.mode === 'grid'))
  }
  clearGesture() {
    const ids = [...this.pointers.keys()]
    this.pointers.clear(); this.swipeStart = null; this.lastTap = null; this.start = null
    this.hadMultiplePointers = false; this.moved = false
    for (const id of ids) { try { this.gestures.releasePointerCapture?.(id) } catch { /* Pointer already released. */ } }
  }
  doubleTap(touch = true) {
    if (touch) this.lastTouchDoubleTap = Date.now()
    if (this.state.browse) this.reset()
    else this.zoom(this.position.zoom > 1 ? 1 : 2)
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
  reset() { this.position = { zoom: 1, x: 0, y: 0 }; this.clearGesture(); this.draw() }
  draw() {
    const p = this.position; this.frame.style.transform = `translate(${p.x}px,${p.y}px) scale(${p.zoom})`
    const zoomed = p.zoom > 1
    if (zoomed !== Boolean(this.reportedZoomed)) { this.reportedZoomed = zoomed; this.notify({ zoomed }) }
  }
  setInteractive(enabled) { this.interactive = enabled; this.gestures.style.display = enabled ? 'none' : 'block'; this.frame.style.pointerEvents = enabled ? 'auto' : 'none'; this.clearGesture() }
  command(value) {
    if (value.kind === 'reset') this.reset()
    if (value.kind === 'zoom-in') this.zoom(this.position.zoom * 1.25)
    if (value.kind === 'zoom-out') this.zoom(this.position.zoom / 1.25)
    if (value.kind === 'interact') { this.reset(); this.setInteractive(value.enabled) }
  }
  send(messages) { for (const message of messages || []) this.frame.contentWindow?.postMessage(JSON.parse(JSON.stringify(message)), this.origin) }
  destroy() {
    this.clearGesture()
    window.removeEventListener('blur', this.blurListener)
    document.removeEventListener?.('visibilitychange', this.visibilityListener)
    window.removeEventListener('message', this.listener)
    this.resize?.disconnect(); this.removal?.disconnect(); this.pointers.clear()
    this.frame.remove(); this.gestures.remove()
  }
}
