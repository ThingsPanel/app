<template>
	<view class="telemetry-fallback">
		<text v-if="streamState" class="telemetry-stream-state" role="status">{{ streamState }}</text>

		<view v-if="loading" class="telemetry-loading" role="status">
			<view v-for="n in 2" :key="n" class="telemetry-skeleton" />
		</view>
		<view v-else-if="error" class="telemetry-error" role="alert">
			<text>{{ error }}</text>
			<button size="mini" @click="load">重新加载</button>
		</view>
		<view v-else-if="!items.length" class="telemetry-empty" role="status">
			<text class="telemetry-empty-title">暂无遥测数据</text>
			<text class="telemetry-empty-hint">设备上报数据后会自动显示在这里</text>
		</view>
		<view v-else class="telemetry-list">
			<view v-for="item in items" :key="item.key" class="telemetry-card">
				<view class="telemetry-card-head">
					<text class="telemetry-name">{{ item.name }}</text>
					<text v-if="item.name !== item.key" class="telemetry-key">{{ item.key }}</text>
					<view class="field-actions">
						<button @click="openHistory(item, 'history')">历史列表</button>
						<button :disabled="typeof item.value !== 'number' || item.dataType === 'enum'" @click="openHistory(item, 'trend')">趋势</button>
						<button aria-label="更多" @click="more(item)">···</button>
					</view>
				</view>
				<view class="telemetry-value-line">
					<text class="telemetry-value">{{ displayValue(item.value) }}</text>
					<text v-if="item.unit" class="telemetry-unit">{{ item.unit }}</text>
				</view>
				<view class="telemetry-time-line">
					<text>{{ formatTime(item.ts) }}</text>
				</view>
			</view>
		</view>
		<telemetry-history-sheet v-if="selectedField" :device-id="deviceId" :field="selectedField" :mode="historyMode" @close="selectedField = null" />
	</view>
  <app-action-sheet ref="appActionSheet" />
</template>

<script>
import dayjs from 'dayjs'
import { requestDeviceApi } from '@/api/modules/device-overview'
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'
import { rowsOf } from '@/utils/thingsvis-device-schema'
import TelemetryHistorySheet from './telemetry-history-sheet.vue'

export default {
	components: { TelemetryHistorySheet },
	props: {
		device: { type: Object, required: true },
		deviceId: { type: String, required: true }
	},
	data() {
		return {
			selectedField: null,
			historyMode: 'history',
			items: [],
			fieldMeta: {},
			loading: true,
			error: '',
			streamState: ''
		}
	},
	mounted() { this.load() },
	beforeUnmount() { this.dispose() },
	methods: {
		openHistory(item, mode) { this.selectedField = item; this.historyMode = mode },
		more(item) {
			this.$refs.appActionSheet.open({ itemList: ['删除遥测字段'], destructiveIndex: 0, success: result => {
				if (result.tapIndex !== 0) return
				uni.showModal({ title: '删除遥测字段', content: `确认删除 ${item.name} 的遥测数据？此操作不可撤销。`, confirmColor: '#c64b4b', success: async result => {
					if (!result.confirm) return
					try {
						await requestDeviceApi('telemetry/datas', { device_id: this.deviceId, key: item.key }, 'DELETE')
						this.items = this.items.filter(row => row.key !== item.key)
						uni.showToast({ title: '已删除', icon: 'success' })
					} catch (error) { uni.showToast({ title: error.message || '删除失败', icon: 'none' }) }
				} })
			} })
		},
		dispose() {
			this.loadVersion = (this.loadVersion || 0) + 1
			clearInterval(this.heartbeat)
			clearTimeout(this.reconnectTimer)
			this.reconnectTimer = null
			const socket = this.socket
			this.socket = null
			socket?.close({})
		},
		async load() {
			this.dispose()
			const version = this.loadVersion
			this.loading = true
			this.error = ''
			this.streamState = ''
			try {
				await this.loadFieldMeta()
				const current = await requestDeviceApi(`telemetry/datas/current/${encodeURIComponent(this.deviceId)}`)
				if (version !== this.loadVersion) return
				this.items = []
				this.applyRows(rowsOf(current))
				this.loading = false
				this.connect()
			} catch (error) {
				if (version !== this.loadVersion) return
				this.loading = false
				this.error = error.message || '遥测数据加载失败'
			}
		},
		async loadFieldMeta() {
			const templateId = this.device?.device_config?.device_template_id
			if (!templateId) return
			try {
				const result = await requestDeviceApi('device/model/telemetry', {
					page: 1,
					page_size: 1000,
					device_template_id: templateId
				})
				this.fieldMeta = Object.fromEntries(rowsOf(result).map(item => {
					const key = item.key || item.data_identifier || item.identifier || item.id
					return [key, { name: item.name || item.data_name || item.label || key, unit: item.unit || '', dataType: String(item.data_type || '').toLowerCase() }]
				}).filter(([key]) => key))
			} catch {
				// 物模型元数据只用于补充名称和单位，失败时仍展示原始遥测键。
				this.fieldMeta = {}
			}
		},
		applyRows(rows) {
			const previous = new Map(this.items.map(item => [item.key, item]))
			for (const row of rows) {
				const key = row?.key || row?.label
				if (!key || key === 'systime') continue
				const old = previous.get(key) || {}
				const meta = this.fieldMeta[key] || {}
				previous.set(key, {
					key,
					dataType: meta.dataType || row.data_type || old.dataType,
					name: meta.name || old.name || key,
					unit: meta.unit || old.unit || '',
					value: row.value !== undefined ? row.value : old.value,
					ts: row.ts || row.time || row.timestamp || old.ts || Date.now()
				})
			}
			this.items = [...previous.values()]
		},
		applyMessage(value) {
			if (Array.isArray(value)) { this.applyRows(value); return }
			const source = value?.data ?? value?.payload ?? value?.fields ?? value
			if (Array.isArray(source)) { this.applyRows(source); return }
			if (!source || typeof source !== 'object') return
			if (source.key) { this.applyRows([source]); return }
			const ts = value?.ts || value?.time || value?.timestamp || value?.systime || Date.now()
			this.applyRows(Object.entries(source).map(([key, item]) => ({ key, value: item?.value ?? item, ts: item?.ts || ts })))
		},
		connect() {
			const token = uni.getStorageSync('access_token')
			if (!token) return
			const addresses = resolveThingsVisAddresses()
			const socket = uni.connectSocket({
				url: `${addresses.thingsPanelApiBase.replace(/^http/, 'ws')}/telemetry/datas/current/ws`,
				complete() {}
			})
			this.socket = socket
			socket.onOpen(() => {
				if (this.socket !== socket) return
				this.streamState = ''
				socket.send({ data: JSON.stringify({ device_id: this.deviceId, token }) })
				clearInterval(this.heartbeat)
				this.heartbeat = setInterval(() => { if (this.socket === socket) socket.send({ data: 'ping' }) }, 8000)
			})
			socket.onMessage(event => {
				if (this.socket !== socket || event.data === 'ping' || event.data === 'pong') return
				try { this.applyMessage(JSON.parse(event.data)) } catch { this.streamState = '实时数据解析异常' }
			})
			const reconnect = () => {
				if (this.socket !== socket) return
				this.socket = null
				clearInterval(this.heartbeat)
				socket.close({})
				this.streamState = '实时数据重连中'
				clearTimeout(this.reconnectTimer)
				this.reconnectTimer = setTimeout(() => this.connect(), 3000)
			}
			socket.onError(reconnect)
			socket.onClose(reconnect)
		},
		displayValue(value) {
			if (value === undefined || value === null || value === '') return '--'
			if (typeof value === 'boolean') return value ? '是' : '否'
			if (typeof value === 'object') {
				try { return JSON.stringify(value) } catch { return String(value) }
			}
			return String(value)
		},
		formatTime(value) {
			if (!value || !dayjs(value).isValid()) return '等待设备上报'
			return `更新于 ${dayjs(value).format('MM-DD HH:mm:ss')}`
		}
	}
}
</script>

<style scoped>
.telemetry-fallback { padding: 0 20px 24px; color: #202938; background: #fff; font-family: inherit; }
.telemetry-stream-state { display: block; margin-bottom: 12px; color: #a66a00; font-size: 11px; line-height: 18px; }
.telemetry-list { display: flex; flex-direction: column; }
.telemetry-card { padding: 16rpx 0 24rpx; border-bottom: 1rpx solid #f0f2f6; }
.field-actions { display:flex; align-items:center; margin-left:auto; flex-shrink:0; }
.field-actions button { margin:0; padding:0 7px; min-height:44px; font:inherit; font-size:12px; line-height:44px; color:#1677ff; background:transparent; border-radius:0; }
.field-actions button::after { border:0; }
.field-actions button[disabled] { color:#b6bdc8; background:transparent; }
.telemetry-card-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; min-width: 0; }
.telemetry-name { min-width: 0; overflow-wrap:anywhere; color: #202938; font-size: 26rpx; line-height: 40rpx; font-weight: 400; }
.telemetry-key { flex-shrink: 1; min-width: 0; overflow: hidden; color: #a1a9b7; font-size: 10px; line-height: 16px; text-overflow: ellipsis; white-space: nowrap; }
.telemetry-value-line { display: flex; align-items: baseline; gap: 6px; min-width: 0; margin-top: 5px; }
.telemetry-value { max-width: 100%; overflow: hidden; color: #202938; font-size: 32rpx; font-weight: 500; line-height: 44rpx; text-overflow: ellipsis; white-space: nowrap; font-variant-numeric: tabular-nums; }
.telemetry-unit { color: #6f7b8f; font-size: 12px; line-height: 20px; }
.telemetry-time-line { display: flex; align-items: center; gap: 6px; margin-top: 4px; color: #98a1b1; font-size: 10px; line-height: 16px; font-variant-numeric: tabular-nums; }
.telemetry-live-dot { width: 5px; height: 5px; border-radius: 50%; background: #08bf63; }
.telemetry-loading { display: flex; flex-direction: column; gap: 10px; }
.telemetry-skeleton { height: 112px; border-radius: 10px; background: linear-gradient(100deg, #edf0f4 20%, #f8f9fb 50%, #edf0f4 80%); background-size: 240% 100%; animation: telemetry-shimmer 1.5s ease-in-out infinite; }
.telemetry-error, .telemetry-empty { display: flex; align-items: center; flex-direction: column; gap: 10px; padding: 36px 20px; color: #7b8699; font-size: 12px; line-height: 20px; text-align: center; }
.telemetry-error { color: #ad3c35; }
.telemetry-error button { margin: 0; padding: 0 16px; color: #1677ff; background: #f3f7ff; border: 0; border-radius: 4px; font-size: 12px; line-height: 40px; }
.telemetry-error button::after { border: 0; }
.telemetry-empty-title { color: #566277; font-size: 13px; }
.telemetry-empty-hint { color: #98a1b1; font-size: 11px; }
@keyframes telemetry-shimmer { from { background-position: 100% 0; } to { background-position: -100% 0; } }
</style>
