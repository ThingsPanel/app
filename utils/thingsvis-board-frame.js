import { fitBoardViewport } from './thingsvis-board-schema.js'

// 仅在 renderjs 视图层使用。跨域消息必须同时核验来源窗口和 origin。
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
