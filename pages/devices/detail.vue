<template>
	<view class="device-detail-page">
		<view class="safe-area-top" />
		<view class="top-bar">
			<view class="top-action" hover-class="top-action--pressed" aria-label="返回" @click="goBack">
				<view class="back-icon" />
			</view>
			<view class="top-actions">
				<view class="top-action" hover-class="top-action--pressed" aria-label="扫描设备" @click="showStaticHint">
					<image class="top-action-icon" src="/static/icon/device-scan.svg" mode="aspectFit" />
				</view>
				<view class="top-action" hover-class="top-action--pressed" aria-label="更多操作" @click="showStaticHint">
					<view class="more-icon" aria-hidden="true">
						<view v-for="index in 3" :key="index" class="more-dot" />
					</view>
				</view>
			</view>
		</view>

		<scroll-view class="page-scroll" scroll-y>
			<view class="device-summary">
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
						<view class="status-badge" :class="statusClass">
							<view class="status-dot" />
							<text>{{ statusLabel }}</text>
						</view>
					</view>

					<view v-if="contextItems.length" class="context-line">
						<template v-for="(item, index) in contextItems" :key="`${item}-${index}`">
							<view v-if="index" class="context-divider" />
							<text class="context-text">{{ item }}</text>
						</template>
						<view class="edit-action" hover-class="inline-action--pressed" aria-label="编辑设备信息" @click="showStaticHint">
							<view class="edit-icon" />
						</view>
					</view>

					<view class="meta-list">
						<view class="meta-row">
							<text class="meta-label">设备 ID</text>
							<view class="meta-value-group">
								<text class="meta-value meta-value--id">{{ deviceId || '--' }}</text>
								<view class="copy-action" hover-class="inline-action--pressed" aria-label="复制设备 ID" @click="copyDeviceId">
									<view class="copy-icon copy-icon--back" />
									<view class="copy-icon copy-icon--front" />
								</view>
							</view>
						</view>
						<view class="meta-row">
							<text class="meta-label">固件版本</text>
							<text class="meta-value">{{ firmwareVersion }}</text>
						</view>
						<view class="meta-row">
							<text class="meta-label">最后上报</text>
							<text class="meta-value meta-value--time">{{ lastReportedAt }}</text>
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
				<view class="tab-content" :aria-label="`${activeTabLabel}内容区域`" />
			</view>
		</scroll-view>

		<view class="bottom-navigation">
			<view
				v-for="item in navigationItems"
				:key="item.pagePath"
				class="navigation-item"
				:class="{ 'navigation-item--active': item.key === 'devices' }"
				hover-class="navigation-item--pressed"
				@click="openNavigation(item)"
			>
				<view class="navigation-icon-wrap">
					<image
						class="navigation-icon"
						:class="{ 'navigation-icon--alarm': item.key === 'alarms' }"
						:src="item.key === 'devices' ? item.selectedIcon : item.icon"
						mode="aspectFit"
					/>
					<view v-if="item.key === 'alarms' && hasAlarm" class="navigation-badge" />
				</view>
				<text>{{ item.label }}</text>
			</view>
		</view>
	</view>
</template>

<script>
const DEVICE_SNAPSHOT_KEY = 'device_detail_preview'

export default {
	data() {
		return {
			device: {},
			deviceId: '',
			activeTab: 'overview',
			imageLoadFailed: false,
			tabs: [
				{ key: 'overview', label: '概览' },
				{ key: 'automation', label: '自动化' },
				{ key: 'alarm', label: '告警' },
				{ key: 'information', label: '信息' }
			],
				navigationItems: [
				{ key: 'dashboard', label: '首页', pagePath: '/pages/dashboard/index', icon: '/static/tabbar/dashboard.png', selectedIcon: '/static/tabbar/dashboard-selected.png' },
				{ key: 'devices', label: '设备', pagePath: '/pages/devices/index', icon: '/static/tabbar/devices.png', selectedIcon: '/static/tabbar/devices-selected.png' },
				{ key: 'automation', label: '自动化', pagePath: '/pages/automation/index', icon: '/static/tabbar/automation.png', selectedIcon: '/static/tabbar/automation-selected.png' },
				{ key: 'alarms', label: '告警', pagePath: '/pages/alarms/index', icon: '/static/icon/notify.svg', selectedIcon: '/static/icon/notify.svg', routeType: 'page' },
				{ key: 'account', label: '我的', pagePath: '/pages/account/index', icon: '/static/tabbar/account.png', selectedIcon: '/static/tabbar/account-selected.png' }
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
		statusClass() {
			if (!this.hasKnownStatus) return 'status-badge--unknown'
			return this.isOnline ? 'status-badge--online' : 'status-badge--offline'
		},
		hasAlarm() {
			const alarmStatus = String(this.device.warn_status || '').trim().toUpperCase()
			return alarmStatus !== '' && alarmStatus !== 'N'
		},
		deviceImageSrc() {
			return !this.imageLoadFailed && this.device.image_url
				? this.device.image_url
				: '/static/image/default-device-hub.png'
		},
		deviceTypeLabel() {
			return {
				1: '直连设备',
				2: '网关设备',
				3: '子设备'
			}[String(this.device.device_type)] || ''
		},
		contextItems() {
			return [
				this.deviceTypeLabel,
				this.device.device_config_name,
				this.device.group_name || this.device.device_group_name
			].filter(Boolean)
		},
		firmwareVersion() {
			return this.device.current_version || this.device.firmware_version || '--'
		},
		lastReportedAt() {
			return this.device.latest_ts_name || '--'
		},
		activeTabLabel() {
			return this.tabs.find(item => item.key === this.activeTab)?.label || ''
		}
	},
	onLoad(options) {
		this.deviceId = options.device_id || ''
		const snapshot = uni.getStorageSync(DEVICE_SNAPSHOT_KEY)
		if (snapshot && (!this.deviceId || snapshot.id === this.deviceId)) {
			this.device = snapshot
			this.deviceId = snapshot.id || this.deviceId
		}
	},
	methods: {
		goBack() {
			uni.navigateBack()
		},
		showStaticHint() {
			uni.showToast({ title: '静态页面，功能待接入', icon: 'none' })
		},
		copyDeviceId() {
			if (!this.deviceId) return
			uni.setClipboardData({ data: this.deviceId })
		},
		openNavigation(item) {
			if (item.routeType === 'page') {
				uni.navigateTo({ url: item.pagePath })
				return
			}
			uni.switchTab({ url: item.pagePath })
		}
	}
}
</script>

<style lang="scss">
.device-detail-page {
	--detail-primary: #1677ff;
	--detail-text: #172033;
	--detail-secondary: #748096;
	--detail-border: #e8edf3;
	--detail-canvas: #f6f8fb;
	position: relative;
	width: 100%;
	max-width: 430px;
	min-height: 100vh;
	margin: 0 auto;
	background: #ffffff;
	color: var(--detail-text);
}

.safe-area-top { height: env(safe-area-inset-top); background: #ffffff; }
.top-bar { display: flex; align-items: center; justify-content: space-between; height: 96rpx; padding: 0 20rpx; background: #ffffff; box-sizing: border-box; }
.top-actions { display: flex; align-items: center; gap: 8rpx; }
.top-action { display: flex; align-items: center; justify-content: center; width: 88rpx; height: 88rpx; border-radius: 16rpx; }
.top-action--pressed, .inline-action--pressed, .detail-tab--pressed, .navigation-item--pressed { opacity: .56; }
.top-action-icon { width: 48rpx; height: 48rpx; }
.back-icon { width: 25rpx; height: 25rpx; border-left: 4rpx solid #172033; border-bottom: 4rpx solid #172033; transform: rotate(45deg); }
.more-icon { display: flex; align-items: center; gap: 8rpx; }
.more-dot { width: 7rpx; height: 7rpx; border-radius: 50%; background: #172033; }

.page-scroll { height: calc(100vh - 96rpx - env(safe-area-inset-top) - 104rpx - env(safe-area-inset-bottom)); background: var(--detail-canvas); }
.device-summary { display: flex; gap: 26rpx; padding: 20rpx 40rpx 38rpx; background: #ffffff; box-sizing: border-box; }
.device-image-card { display: flex; align-items: center; justify-content: center; flex: 0 0 208rpx; height: 208rpx; margin-top: 4rpx; background: #ffffff; border: 2rpx solid var(--detail-border); border-radius: 22rpx; overflow: hidden; }
.device-image { width: 176rpx; height: 176rpx; }
.device-main { flex: 1; min-width: 0; }
.title-line { display: flex; align-items: center; min-width: 0; min-height: 52rpx; gap: 14rpx; }
.device-name { min-width: 0; overflow: hidden; color: var(--detail-text); font-size: 34rpx; font-weight: 650; line-height: 46rpx; white-space: nowrap; text-overflow: ellipsis; }
.status-badge { display: flex; align-items: center; flex-shrink: 0; gap: 8rpx; color: #68758a; font-size: 24rpx; line-height: 34rpx; }
.status-dot { width: 13rpx; height: 13rpx; border-radius: 50%; background: #a9b1be; }
.status-badge--online { color: #263143; }
.status-badge--online .status-dot { background: #08bf63; }
.status-badge--offline .status-dot { background: #a9b1be; }
.status-badge--unknown .status-dot { background: #f0a020; }

.context-line { display: flex; align-items: center; min-width: 0; min-height: 42rpx; margin-top: 2rpx; overflow: hidden; }
.context-text { flex-shrink: 1; min-width: 0; overflow: hidden; color: #657187; font-size: 26rpx; line-height: 38rpx; white-space: nowrap; text-overflow: ellipsis; }
.context-divider { flex: 0 0 2rpx; width: 2rpx; height: 25rpx; margin: 0 12rpx; background: #cfd6e0; }
.edit-action, .copy-action { position: relative; display: flex; align-items: center; justify-content: center; flex: 0 0 64rpx; width: 64rpx; height: 64rpx; }
.edit-icon { width: 20rpx; height: 6rpx; border: 3rpx solid #7c879a; border-radius: 3rpx; transform: rotate(-45deg); }

.meta-list { display: flex; flex-direction: column; gap: 12rpx; margin-top: 22rpx; }
.meta-row { display: grid; grid-template-columns: 106rpx minmax(0, 1fr); align-items: center; min-height: 32rpx; column-gap: 12rpx; }
.meta-label { color: #657187; font-size: 24rpx; line-height: 34rpx; }
.meta-value-group { display: flex; align-items: center; min-width: 0; }
.meta-value { min-width: 0; overflow: hidden; color: #657187; font-size: 24rpx; line-height: 34rpx; white-space: nowrap; text-overflow: ellipsis; font-variant-numeric: tabular-nums; }
.meta-value--id { flex: 1; }
.meta-value--time { overflow: visible; white-space: normal; }
.copy-icon { position: absolute; width: 19rpx; height: 19rpx; border: 2rpx solid #7c879a; border-radius: 4rpx; box-sizing: border-box; }
.copy-icon--back { margin: -7rpx 0 0 -7rpx; }
.copy-icon--front { margin: 7rpx 0 0 7rpx; background: #ffffff; }

.detail-panel { min-height: 720rpx; background: var(--detail-canvas); border-radius: 48rpx 48rpx 0 0; overflow: hidden; }
.detail-tabs { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); height: 80rpx; padding: 0 18rpx; background: #ffffff; border-bottom: 2rpx solid var(--detail-border); box-sizing: border-box; }
.detail-tab { position: relative; display: flex; align-items: center; justify-content: center; min-width: 0; color: #566278; font-size: 28rpx; font-weight: 500; line-height: 40rpx; }
.detail-tab--active { color: var(--detail-primary); font-weight: 600; }
.tab-indicator { position: absolute; right: 24rpx; bottom: 0; left: 24rpx; height: 5rpx; border-radius: 5rpx 5rpx 0 0; background: var(--detail-primary); }
.tab-content { min-height: 640rpx; background: var(--detail-canvas); }

.bottom-navigation { position: fixed; z-index: 20; bottom: 0; left: 50%; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); width: 100%; max-width: 430px; height: calc(104rpx + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); background: rgba(255, 255, 255, .98); border-top: 2rpx solid #edf0f4; box-sizing: border-box; transform: translateX(-50%); }
.navigation-item { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 5rpx; color: #7f8ca0; font-size: 19rpx; line-height: 26rpx; }
.navigation-item--active { color: var(--detail-primary); }
.navigation-icon-wrap { position: relative; display: flex; align-items: center; justify-content: center; width: 48rpx; height: 48rpx; }
.navigation-icon { width: 44rpx; height: 44rpx; }
.navigation-icon--alarm { width: 42rpx; height: 42rpx; opacity: .55; }
.navigation-badge { position: absolute; top: -2rpx; right: -2rpx; width: 13rpx; height: 13rpx; background: #ff3b30; border: 3rpx solid #ffffff; border-radius: 50%; }

@media screen and (min-width: 768px) {
	.device-detail-page { box-shadow: 0 0 0 1px #edf0f4; }
}
</style>
