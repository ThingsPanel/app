<template>
	<view class="device-detail-page">
		<view v-if="detailError" class="detail-notice" role="alert">
			<text>{{ detailError }}</text>
			<button size="mini" @click="loadDevice">重试</button>
		</view>
		<scroll-view class="page-scroll" scroll-y>
			<view class="device-summary">
				<view class="device-identity">
					<view class="device-image-card">
						<image
							class="device-image"
							:src="deviceImageSrc"
							mode="aspectFit"
							@error="imageLoadFailed = true"
						/>
					</view>

					<view class="device-main">
						<view class="title-line">
							<text class="device-name">{{ deviceName }}</text>
							<view class="status-dot" :class="{ 'status-dot--online': isOnline }" role="img" :aria-label="statusLabel" :title="statusLabel" />
						</view>

						<view class="context-line">
							<view class="context-details">
								<view v-for="(item, index) in contextItems" :key="`${item}-${index}`" class="context-item">
									<view v-if="index" class="context-divider" aria-hidden="true" />
									<text class="context-text">{{ item }}</text>
								</view>
								<button class="edit-action" hover-class="inline-action--pressed" aria-label="编辑设备名称" :disabled="!detailLoaded" @click="openNameEditor">
									<image class="edit-icon" src="/static/icon/device-edit.svg" mode="aspectFit" aria-hidden="true" />
								</button>
							</view>
						</view>
						<view class="last-report">
							<text class="last-report-label">最后上报</text>
							<text class="last-report-time">{{ lastReportedAt }}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="detail-panel">
				<view class="detail-tabs" role="tablist">
					<view
						v-for="tab in tabs"
						:key="tab.key"
						class="detail-tab"
						:class="{ 'detail-tab--active': activeTab === tab.key }"
						hover-class="detail-tab--pressed"
						:aria-label="tab.label"
						:aria-selected="activeTab === tab.key"
						role="tab"
						@click="activeTab = tab.key"
					>
						<text>{{ tab.label }}</text>
						<view v-if="activeTab === tab.key" class="tab-indicator" />
					</view>
				</view>
				<view class="tab-content" :aria-label="`${activeTabLabel}内容区域`" role="tabpanel">
					<view v-if="detailLoading && !detailLoaded" class="detail-state">正在加载设备信息…</view>
					<template v-else-if="detailLoaded && pageVisible">
						<device-overview-tab v-if="activeTab === 'overview'" :device="device" :device-id="deviceId" />
						<device-automation-tab v-else-if="activeTab === 'automation'" :key="refreshKey" :device="device" :device-id="deviceId" />
						<device-alarm-tab v-else-if="activeTab === 'alarm'" :key="refreshKey" :device="device" :device-id="deviceId" />
						<device-information-tab v-else :key="refreshKey" :device="device" :device-id="deviceId" @saved="loadDevice" />
					</template>
				</view>
			</view>
		</scroll-view>

		<app-tabbar active-path="pages/devices/index" />
		<ConfirmationModal v-model="editingName" title="设备名称" confirm-text="保存" :loading="savingName" :auto-close="false" @confirm="saveName">
            <template #text>
                <input v-model="nameDraft" class="app-dialog-input" maxlength="255" placeholder="请输入设备名称" aria-label="设备名称" :disabled="savingName" @confirm="saveName" />
                <text v-if="nameError" class="app-dialog-error" role="alert">{{ nameError }}</text>
            </template>
        </ConfirmationModal>
	</view>
</template>

<script>
import dayjs from 'dayjs'
import ConfirmationModal from '@/components/confirmation-modal/index.vue'
import AppTabbar from '@/components/app-tabbar.vue'
import { getDeviceDetail, updateDeviceName } from '@/api/modules/device-overview'
import DeviceOverviewTab from '@/features/devices/components/device-overview-tab.vue'
import DeviceAutomationTab from '@/features/devices/components/device-automation-tab.vue'
import DeviceAlarmTab from '@/features/devices/components/device-alarm-tab.vue'
import DeviceInformationTab from '@/features/devices/components/device-information-tab.vue'

const DEVICE_SNAPSHOT_KEY = 'device_detail_preview'

export default {
	components: { ConfirmationModal, AppTabbar, DeviceOverviewTab, DeviceAutomationTab, DeviceAlarmTab, DeviceInformationTab },
	data() {
		return {
			device: {},
			deviceId: '',
			activeTab: 'overview',
			imageLoadFailed: false,
			detailLoading: false,
			detailLoaded: false,
			detailError: '',
			pageVisible: false,
			refreshKey: 0,
			requestVersion: 0,
			editingName: false,
			nameDraft: '',
			nameError: '',
			savingName: false,
			tabs: [
				{ key: 'overview', label: '概览' },
				{ key: 'automation', label: '自动化' },
				{ key: 'alarm', label: '告警' },
				{ key: 'information', label: '信息' }
			]
		}
	},
	computed: {
		deviceName() {
			return this.device.name || '未命名设备'
		},
		hasKnownStatus() {
			return this.device.is_online !== undefined && this.device.is_online !== null && this.device.is_online !== ''
		},
		isOnline() {
			return this.hasKnownStatus && Number(this.device.is_online) === 1
		},
		statusLabel() {
			if (!this.hasKnownStatus) return '状态未知'
			return this.isOnline ? '在线' : '离线'
		},
		deviceImageSrc() {
			const path = this.device.image_url || this.device.device_config?.image_url
			if (!path || this.imageLoadFailed) return '/static/image/default-device-hub.png'
			if (/^https?:\/\//i.test(path)) return path
			const server = String(uni.getStorageSync('serverAddress') || 'https://demo.thingspanel.cn').replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
			return `${server}/${String(path).replace(/^\/+/, '')}`
		},
		deviceTypeLabel() {
			return {
				1: '直连设备',
				2: '网关设备',
				3: '子设备'
			}[String(this.device.device_config?.device_type || this.device.device_type)] || ''
		},
		contextItems() {
			return [
				this.deviceTypeLabel,
				this.device.device_config_name,
				this.device.group_name || this.device.device_group_name
			].filter(Boolean)
		},
		lastReportedAt() {
			const timestamp = this.device.ts || this.device.t
			if (timestamp && dayjs(timestamp).isValid()) return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
			return this.device.latest_ts_name || '--'
		},
		activeTabLabel() {
			return this.tabs.find(item => item.key === this.activeTab)?.label || ''
		}
	},
	onLoad(options) {
		this.deviceId = options.device_id || options.d_id || ''
		const snapshot = uni.getStorageSync(DEVICE_SNAPSHOT_KEY)
		if (snapshot && this.deviceId && snapshot.id === this.deviceId) {
			this.device = snapshot
			this.deviceId = snapshot.id || this.deviceId
		}
	},
	onShow() {
		this.detailLoaded = false
		this.pageVisible = true
		this.refreshKey += 1
		this.loadDevice()
	},
	onHide() {
		this.pageVisible = false
		this.requestVersion += 1
	},
	onUnload() {
		this.pageVisible = false
		this.requestVersion += 1
	},
	methods: {
		async loadDevice() {
			const version = ++this.requestVersion
			this.detailError = ''
			if (!this.deviceId) {
				this.detailError = '缺少设备 ID，请从设备列表重新进入'
				return
			}
			this.detailLoading = true
			try {
				const device = await getDeviceDetail(this.deviceId)
				if (version !== this.requestVersion) return
				if (!device || device.id !== this.deviceId) throw new Error('设备详情数据无效')
				this.device = device
				this.detailLoaded = true
				this.imageLoadFailed = false
			} catch (error) {
				if (version === this.requestVersion) this.detailError = error.message || '设备信息加载失败'
			} finally {
				if (version === this.requestVersion) this.detailLoading = false
			}
		},
		goBack() {
			uni.navigateBack()
		},
		openNameEditor() {
			if (!this.detailLoaded) return
			this.nameDraft = this.device.name || ''
			this.nameError = ''
			this.editingName = true
		},
		async saveName() {
			if (this.savingName) return
			const name = this.nameDraft.trim()
			if (!name) { this.nameError = '请输入设备名称'; return }
			this.savingName = true
			this.nameError = ''
			try {
				await updateDeviceName(this.deviceId, name)
				this.device = { ...this.device, name }
				this.editingName = false
				uni.showToast({ title: '已保存', icon: 'success' })
			} catch (error) {
				this.nameError = error.message || '保存失败'
			} finally {
				this.savingName = false
			}
		},
	}
}
</script>

<style lang="scss">
.device-detail-page {
	--detail-primary: var(--tp-color-primary, #1677ff);
	--detail-text: #172033;
	--detail-secondary: #748096;
	--detail-border: #e8edf3;
	--detail-canvas:#F2F2F7;
	position: relative;
	width: 100%;
	max-width: 430px;
	height: calc(100vh - var(--window-top, 0px));
	display: flex;
	flex-direction: column;
	margin: 0 auto;
	background: #ffffff;
	color: var(--detail-text);
	/* 中文字体优先，避免西文字体的系统补字落到宋体；子组件统一继承。 */
	font-family: inherit;
	font-size: 13px;
	font-weight: 400;
	-webkit-font-smoothing: antialiased;
}

.top-action--pressed, .inline-action--pressed, .detail-tab--pressed { opacity: .56; }

.page-scroll { flex: 1; min-height: 0; height: 0; background: var(--detail-canvas); }
.device-summary { --summary-muted: #657187; --summary-label-width: 72px; --summary-column-gap: 12px; padding: 16px 20px 8px; background: #ffffff; box-sizing: border-box; }
.device-summary text { font-family: inherit; }
.device-identity { display: grid; grid-template-columns: var(--summary-label-width) minmax(0, 1fr); align-items: start; column-gap: var(--summary-column-gap); }
.device-summary .device-image-card { display: flex; align-items: center; justify-content: center; width: var(--summary-label-width); height: 72px; }
.device-summary .device-image { width: 64px; height: 64px; }
.device-main { flex: 1; min-width: 0; }
.device-summary .title-line { min-width: 0; line-height: 26px; }
.device-summary .device-name { overflow-wrap: anywhere; color: var(--detail-text); font-size: 18px; font-weight: 600; }
.device-summary .status-dot { display: inline-block; vertical-align: text-top; width: 6px; height: 6px; margin-left: 8px; border-radius: 50%; background: #a9b1be; }
.device-summary .status-dot--online { background: var(--alarm-status-normal, var(--tp-color-success, #08bf63)); }

.context-line { display: flex; align-items: center; justify-content: space-between; gap: 8px; min-width: 0; min-height: 28px; }
.context-details { display: flex; flex: 1; align-items: center; gap: 8px; min-width: 0; }
.context-item { display: flex; align-items: center; gap: 8px; min-width: 0; max-width: 100%; }
.context-item:first-child { flex-shrink: 0; }
.context-text { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--summary-muted); font-size: 12px; line-height: 20px; }
.context-divider { flex: 0 0 3px; width: 3px; height: 3px; border-radius: 50%; background: #c5ccd6; }
.device-summary .edit-action, .device-summary .copy-action { position: relative; display: flex; align-items: center; justify-content: center; flex: 0 0 44px; width: 44px; height: 44px; margin: 0; padding: 0; border: 0; border-radius: 8px; background: transparent; line-height: 1; cursor: pointer; }
.device-summary .edit-action::after, .device-summary .copy-action::after { border: 0; }
.device-summary .edit-action { margin: -8px 0 -8px -8px; }
.device-summary .edit-action:focus-visible, .device-summary .copy-action:focus-visible { outline: 2px solid var(--detail-primary); outline-offset: -2px; }
.device-summary .edit-action[disabled], .device-summary .copy-action[disabled] { opacity: .4; cursor: default; }
.edit-icon { width: 16px; height: 16px; }

.device-summary .last-report { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 8px; margin-top: 4px; font-size: 12px; line-height: 20px; }
.device-summary .last-report-label { flex-shrink: 0; color: var(--summary-muted); }
.device-summary .last-report-time { min-width: 0; overflow-wrap: anywhere; color: var(--summary-muted); font-variant-numeric: tabular-nums; }

.detail-panel { min-height: 720rpx; background: var(--detail-canvas); border-radius: 0; overflow: hidden; }
.detail-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); height: 80rpx; padding: 0 18rpx; background: #ffffff; border-bottom: 2rpx solid var(--detail-border); box-sizing: border-box; }
.detail-tab { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; color: #69758b; font-size: 14px; font-weight: 400; line-height: 22px; }
.detail-tab--active { color: var(--detail-primary); font-weight: 500; }
.tab-indicator { position: absolute; bottom: 0; left: 50%; width: 64rpx; height: 5rpx; border-radius: 3rpx; background: var(--detail-primary); transform: translateX(-50%); }
.tab-content { min-height: 640rpx; background: var(--detail-canvas); }

@media screen and (min-width: 768px) {
	.device-detail-page { box-shadow: 0 0 0 1px #edf0f4; }
}

.device-detail-page { background: #f7f8fb; }
.device-detail-page { --detail-canvas:#f7f8fb; --detail-text:#192231; --detail-secondary:#7a8499; }
.device-detail-page input, .device-detail-page button, .device-detail-page .uni-input-input, .device-detail-page .uni-input-placeholder { font-family: inherit; }
.detail-notice { position: absolute; top: 0; left: 0; right: 0; z-index: 25; display: flex; align-items: center; justify-content: space-between; gap: 16rpx; padding: 16rpx 24rpx; background: #fff2ee; color: var(--tp-color-danger, #ff4d35); font-size: 25rpx; }
.detail-notice button { flex-shrink: 0; margin: 0; }
.detail-state { padding: 64rpx 32rpx; text-align: center; color: #73737d; font-size: 28rpx; }
</style>
