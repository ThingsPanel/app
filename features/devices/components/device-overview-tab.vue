<template>
	<view class="device-overview">
		<device-visualization-skeleton v-if="phase === 'loading'" />
		<device-telemetry-fallback v-if="phase === 'empty'" :device="device" :device-id="deviceId" />
		<view v-if="phase === 'error'" class="overview-state overview-state--error" role="status">
			<text>{{ statusMessage }}</text>
			<button v-if="phase === 'error'" size="mini" @click="reload">重新加载</button>
			<text v-if="phase === 'error'" class="connection-hint">连接地址可在“我的 → 服务配置”中调整</text>
		</view>
		<text v-if="streamMessage" class="overview-stream-state" role="status">{{ streamMessage }}</text>
		<!-- #ifdef APP-PLUS || H5 -->
		<!-- 使用视图层 iframe，避免原生 web-view 铺满页面并覆盖 Tab 和底部导航。 -->
		<view
			:id="frameId"
			class="overview-frame"
			:class="{ 'overview-frame--loading': phase === 'loading' }"
			:frame-state="frameState"
			:change:frame-state="thingsvisBridge.syncFrame"
			:message-packet="messagePacket"
			:change:message-packet="thingsvisBridge.sendMessages"
		/>
		<!-- #endif -->
	</view>
</template>

<script>
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'
import { createDeviceRuntime } from '@/services/thingsvis-device-runtime'
import DeviceVisualizationSkeleton from './device-visualization-skeleton.vue'
import DeviceTelemetryFallback from './device-telemetry-fallback.vue'

let frameSequence = 0

export default {
	components: { DeviceVisualizationSkeleton, DeviceTelemetryFallback },
	props: {
		device: { type: Object, required: true },
		deviceId: { type: String, required: true }
	},
	data() {
		return {
			frameId: `thingsvis-device-${++frameSequence}`,
			frameState: null,
			messagePacket: null,
			phase: 'loading',
			statusMessage: '正在加载设备可视化…',
			streamMessage: '',
			session: 0
		}
	},
	mounted() { this.reload() },
	beforeUnmount() { this.dispose() },
	methods: {
		dispose() {
			this.session += 1
			clearTimeout(this.readyTimer)
			clearTimeout(this.sendTimer)
			this.sendTimer = null
			this.runtime?.stop()
			this.runtime = null
			this.pendingMessages = []
			this.frameState = { id: this.frameId, session: this.session, url: '' }
		},
		async reload() {
			this.dispose()
			this.phase = 'loading'
			this.statusMessage = '正在加载设备可视化…'
			this.streamMessage = ''
			// #ifndef APP-PLUS || H5
			this.phase = 'error'
			this.statusMessage = '当前平台不支持内嵌设备可视化，请使用 Android、iOS 或 Web 版'
			return
			// #endif
			const session = this.session
			try {
				const addresses = resolveThingsVisAddresses()
				this.runtime = createDeviceRuntime({
					device: this.device,
					deviceId: this.deviceId,
					addresses,
					onMessage: message => {
						if (session !== this.session) return
						this.pendingMessages.push(message)
						if (this.sendTimer) return
						// 一次传递同一批首值/历史消息，避免视图层只收到最后一条响应。
						this.sendTimer = setTimeout(() => {
							this.sendTimer = null
							this.messagePacket = { session, sequence: Date.now(), messages: this.pendingMessages.splice(0) }
						}, 0)
					},
					onState: state => {
						if (session !== this.session) return
						if (state.status === 'warning') { this.streamMessage = state.message; return }
						// LOADED 只代表配置已接收，不能撤掉骨架。
						if (state.status === 'ready') return
						if (state.status === 'error') this.dispose()
						this.phase = state.status
						this.statusMessage = state.message || ''
					}
				})
				const result = await this.runtime.start()
				if (session !== this.session || !result?.url) return
				this.frameState = { id: this.frameId, session, url: result.url, canvas: result.canvas }
				this.readyTimer = setTimeout(() => {
					if (session !== this.session || this.phase === 'ready') return
					this.dispose()
					this.phase = 'error'
					this.statusMessage = '可视化未完成渲染，请检查网络及 ThingsVis 是否已更新到支持渲染就绪通知的版本'
				}, 25000)
			} catch (error) {
				if (session !== this.session) return
				this.dispose()
				this.phase = 'error'
				this.statusMessage = error.message || '设备可视化加载失败'
			}
		},
		onFrameEvent(event) {
			if (event.session !== this.session) return
			if (event.message?.type === 'tv:render-ready') {
				clearTimeout(this.readyTimer)
				this.phase = 'ready'
				return
			}
			if (event.message?.type === 'ERROR' && this.phase === 'loading') {
				event.error = typeof event.message.payload === 'string' ? event.message.payload : '可视化组件加载失败'
			}
			if (event.error) {
				this.dispose()
				this.phase = 'error'
				this.statusMessage = event.error
				return
			}
			Promise.resolve(this.runtime?.handleMessage(event.message)).catch(() => {
				if (event.session === this.session) this.streamMessage = '设备数据处理失败，请刷新后重试'
			})
		}
	}
}
</script>

<!-- #ifdef APP-PLUS || H5 -->
<script module="thingsvisBridge" lang="renderjs">
export default {
	methods: {
		cleanupFrame() {
			if (this.frameListener) window.removeEventListener('message', this.frameListener)
			this.frameResizeObserver?.disconnect()
			this.frameRemovalObserver?.disconnect()
			this.deviceFrame?.remove()
			this.deviceFrame = null
		},
		syncFrame(value) {
			this.cleanupFrame()
			if (!value?.url) return
			const host = document.getElementById(value.id)
			if (!host) return
			const frame = document.createElement('iframe')
			const origin = new URL(value.url).origin
			this.deviceFrame = frame
			this.frameSession = value.session
			this.frameOrigin = origin
			frame.title = '设备 ThingsVis 可视化'
			frame.setAttribute('referrerpolicy', 'no-referrer')
			frame.setAttribute('allow', 'fullscreen')
			frame.style.cssText = 'display:block;width:100%;border:0;background:#fff;'
			const resize = () => {
				const width = Number(value.canvas?.width)
				const height = Number(value.canvas?.height)
				frame.style.height = `${width > 0 && height > 0 ? Math.max(160, host.clientWidth * height / width) : 480}px`
			}
			this.frameListener = event => {
				if (event.source !== frame.contentWindow || event.origin !== origin) return
				const message = event.data
				if (!message || typeof message !== 'object') return
				if (message.type === 'tv:content-height') {
					const height = Number(message.payload?.height)
					if (Number.isFinite(height) && height > 0) frame.style.height = `${Math.min(20000, Math.max(160, height))}px`
					return
				}
				const accepted = ['READY', 'LOADED', 'ERROR', 'tv:ready', 'tv:loaded', 'tv:render-ready', 'thingsvis:editor-ready', 'tv:request-init', 'tv:platform-write', 'thingsvis:requestFieldData', 'tv:error']
				if (accepted.includes(message.type)) this.$ownerInstance.callMethod('onFrameEvent', { session: value.session, message })
			}
			window.addEventListener('message', this.frameListener)
			frame.onerror = () => this.$ownerInstance.callMethod('onFrameEvent', { session: value.session, error: 'ThingsVis 页面加载失败，请检查连接地址' })
			frame.src = value.url
			host.appendChild(frame)
			resize()
			this.frameResizeObserver = new ResizeObserver(resize)
			this.frameResizeObserver.observe(host)
			// renderjs 不支持卸载钩子；DOM 移除时主动注销监听，切换 Tab 不保留连接桥。
			this.frameRemovalObserver = new MutationObserver(() => {
				if (!host.isConnected) this.cleanupFrame()
			})
			this.frameRemovalObserver.observe(document.body, { childList: true, subtree: true })
		},
		sendMessages(packet) {
			if (!this.deviceFrame || packet?.session !== this.frameSession) return
			// H5 的绑定值仍是 Vue Proxy；结构化克隆不能传 Proxy，先还原为协议 JSON。
			for (const message of packet.messages || []) {
				this.deviceFrame.contentWindow.postMessage(JSON.parse(JSON.stringify(message)), this.frameOrigin)
			}
		}
	}
}
</script>
<!-- #endif -->

<style scoped>
.device-overview { position: relative; background: #fff; }
/* 保持 iframe 有真实尺寸，隐藏期间也能初始化图表。 */
.overview-frame--loading { position: absolute; top: 0; left: 0; opacity: 0; pointer-events: none; }
.overview-state button { margin: 0; padding: 0 16px; color: #1677ff; background: #f3f7ff; border-radius: 4px; font-size: 12px; line-height: 40px; }
.overview-state button::after { border: 0; }
.overview-state { display: flex; align-items: center; flex-direction: column; gap: 16px; padding: 36px 20px; color: #737f94; font-size: 13px; line-height: 1.7; text-align: center; }
.overview-state--error { color: #ad3c35; }
.overview-stream-state { display: block; padding: 10px 16px; color: #946200; background: #fff8e8; font-size: 11px; }
.connection-hint { color: #8b95a6; font-size: 11px; }
.overview-frame { width: 100%; overflow: hidden; }
</style>
