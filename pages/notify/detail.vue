<template>
	<view class="tp-box">
		<view class="bg-glow-1"></view>
		<view class="bg-glow-2"></view>

		<view class="tp-content">
			<view class="tp-panel alert-card">
				<view class="card-inner">
					<view class="alert-header">
						<view class="alert-badge" :class="getLevelClass(detail.alarm_level)">
							<view class="badge-dot"></view>
							<text class="badge-text">{{$t(`pages.notify.alarmLevels.${detail.alarm_level || 'default'}`)}}</text>
						</view>
						<!-- <text class="alert-desc">{{detail.warning_description || '--'}}</text> -->
					</view>

					<view class="alert-meta">
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.notify.alertName')}}</text>
							<text class="meta-value">{{detail.name || '--'}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.notify.sceneLinkageName')}}</text>
							<text class="meta-value">{{detail.alarm_config_name || '--'}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.notify.alertTime')}}</text>
							<text class="meta-value time-value">{{formatDate(alertTimeValue)}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.notify.alarmStatus')}}</text>
							<text class="meta-value status-value">{{$t(`pages.notify.alarmStatuses.${detail.alarm_status || 'default'}`)}}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="tp-panel detail-section">
				<view class="section-header">
					<text class="section-title">{{$t('pages.notify.alertContent')}}</text>
				</view>
				<text class="section-text">{{detail.content || '--'}}</text>
			</view>

			<view class="tp-panel detail-section">
				<view class="section-header">
					<text class="section-title">{{$t('pages.notify.alarmDescription')}}</text>
				</view>
				<text class="section-text">{{detail.description || '--'}}</text>
			</view>

			<view class="tp-panel detail-section" v-if="deviceList.length">
				<view class="section-header">
					<text class="section-title">{{$t('pages.notify.alarmDevices')}}</text>
					<text class="section-count">{{deviceList.length}}</text>
				</view>
				<view class="device-list">
					<view class="device-card" v-for="(device, index) in deviceList" :key="index">
						<view class="device-header">
							<view class="device-icon">
								<view class="dot"></view>
							</view>
							<view class="device-name">{{device.device_name || device.name || '--'}}</view>
						</view>
						<view class="device-info">
							<view class="info-row">
								<text class="info-label">{{$t('pages.notify.deviceID')}}</text>
								<text class="info-value">{{device.id || '--'}}</text>
							</view>
							<view class="info-row">
								<text class="info-label">{{$t('pages.notify.deviceName')}}</text>
								<text class="info-value">{{device.name || '--'}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="tp-panel empty-card" v-else>
				<text class="empty-text">{{$t('pages.notify.noDevices')}}</text>
			</view>
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs'

export default {
	data() {
		return {
			detail: {
				alarm_device_list: [],
				created_at: ''
			}
		}
	},
	computed: {
		deviceList() {
			return this.detail?.alarm_device_list || []
		},
		alertTimeValue() {
			return this.detail?.create_at
				|| this.detail?.createdAt
				|| this.detail?.alarm_time
				|| this.detail?.alarmTime
				|| this.detail?.timestamp
				|| ''
		}
	},
	onShow() {
		this.$nextTick(() => {
			setTimeout(() => {
				uni.setNavigationBarTitle({
					title: this.$t('pages.notifyDetailTitle')
				})
			}, 100)
		})
	},
	onLoad() {
		const eventChannel = this.getOpenerEventChannel();
		if (eventChannel) {
			eventChannel.on('acceptData', (data) => {
				if (data && data.item) {
					this.detail = {
						alarm_device_list: [],
						...data.item
					};
				} else {
					console.error('Invalid data received:', data);
				}
			});
		} else {
			console.error('Failed to get event channel');
		}
	},
	methods: {
		formatDate(date) {
			if (!date && date !== 0) {
				return '--'
			}
			if (typeof date === 'number' || /^\d+$/.test(date)) {
				const num = Number(date)
				const ms = num < 1e12 ? num * 1000 : num
				const parsedNum = dayjs(ms)
				if (parsedNum.isValid()) {
					return parsedNum.format('YYYY-MM-DD HH:mm')
				}
			}
			const parsed = dayjs(date)
			if (parsed.isValid()) {
				return parsed.format('YYYY-MM-DD HH:mm')
			}
			return date || '--'
		},
		getLevelClass(level) {
			const levelMap = {
				'1': 'level-high',
				'2': 'level-medium',
				'3': 'level-low'
			}
			return levelMap[level] || 'level-default'
		}
	}
}
</script>

<style lang="scss" scoped>
.tp-box {
	width: 100%;
	min-height: 100vh;
	background: #f5f7fa;
	position: relative;
	overflow: hidden;
	color: #334155;
	font-size: 28rpx;
}

.bg-glow-1,
.bg-glow-2 {
	position: absolute;
	border-radius: 50%;
	z-index: 0;
	pointer-events: none;
	filter: blur(40px);
}

.bg-glow-1 {
	top: -10%;
	left: -20%;
	width: 700rpx;
	height: 700rpx;
	background: radial-gradient(circle, rgba(239, 68, 68, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
}

.bg-glow-2 {
	bottom: 0;
	right: -10%;
	width: 600rpx;
	height: 600rpx;
	background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
}

.tp-content {
	position: relative;
	z-index: 1;
	padding: 40rpx 30rpx 80rpx;
	display: flex;
	flex-direction: column;
	gap: 30rpx;
}

.tp-panel {
	background: rgba(255, 255, 255, 0.85);
	backdrop-filter: blur(18px);
	border-radius: 32rpx;
	border: 1px solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 12rpx 40rpx rgba(15, 23, 42, 0.08);
	overflow: hidden;
}

.card-inner {
	padding: 34rpx;
}

.alert-header {
	border-bottom: 1px solid rgba(15, 23, 42, 0.06);
	padding-bottom: 28rpx;
	margin-bottom: 28rpx;

	.alert-desc {
		font-size: 34rpx;
		font-weight: 600;
		color: #0f172a;
		line-height: 1.5;
		margin-top: 20rpx;
		display: block;
	}
}

.alert-badge {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 26rpx;
	border-radius: 50rpx;
	font-size: 24rpx;
	font-weight: 600;

	.badge-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		margin-right: 12rpx;
	}

	.badge-text {
		font-size: 24rpx;
	}

	&.level-high {
		background: rgba(239, 68, 68, 0.12);
		color: #ef4444;

		.badge-dot {
			background: #ef4444;
			box-shadow: 0 0 8rpx rgba(239, 68, 68, 0.5);
		}
	}

	&.level-medium {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;

		.badge-dot {
			background: #f59e0b;
			box-shadow: 0 0 8rpx rgba(245, 158, 11, 0.5);
		}
	}

	&.level-low {
		background: rgba(100, 108, 255, 0.12);
		color: #646cff;

		.badge-dot {
			background: #646cff;
			box-shadow: 0 0 8rpx rgba(100, 108, 255, 0.5);
		}
	}

	&.level-default {
		background: rgba(148, 163, 184, 0.12);
		color: #94a3b8;

		.badge-dot {
			background: #94a3b8;
		}
	}
}

.alert-meta {
	display: grid;
	grid-template-columns: repeat(2, minmax(0, 1fr));
	gap: 28rpx 24rpx;
}

.meta-item {
	display: flex;
	flex-direction: column;
	gap: 8rpx;

	.meta-label {
		font-size: 24rpx;
		color: #94a3b8;
	}

	.meta-value {
		font-size: 30rpx;
		color: #0f172a;
		font-weight: 600;
		line-height: 1.4;

		&.time-value {
			font-family: monospace;
			color: #475569;
		}

		&.status-value {
			color: #22c55e;
		}
	}
}

.detail-section {
	padding: 30rpx 34rpx;

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
	}

	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #0f172a;
	}

	.section-count {
		font-size: 26rpx;
		color: #94a3b8;
	}

	.section-text {
		font-size: 28rpx;
		color: #334155;
		line-height: 1.7;
		white-space: pre-wrap;
	}
}

.device-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.device-card {
	border: 1px solid rgba(15, 23, 42, 0.04);
	border-radius: 24rpx;
	padding: 28rpx;
	background: #fff;
	box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.04);
}

.device-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
	gap: 16rpx;
}

.device-icon {
	width: 56rpx;
	height: 56rpx;
	border-radius: 16rpx;
	background: rgba(99, 102, 241, 0.12);
	display: flex;
	align-items: center;
	justify-content: center;

	.dot {
		width: 12rpx;
		height: 12rpx;
		background: #6366f1;
		border-radius: 50%;
		box-shadow: 0 0 10rpx rgba(99, 102, 241, 0.5);
	}
}

.device-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1e293b;
}

.device-info {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	font-size: 26rpx;
	color: #1e293b;
	gap: 20rpx;

	.info-label {
		color: #94a3b8;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.info-value {
		font-weight: 600;
		color: #0f172a;
		flex: 1;
		text-align: right;
		word-break: break-all;
	}
}

.empty-card {
	padding: 30rpx;
	text-align: center;
}

.empty-text {
	font-size: 28rpx;
	color: #94a3b8;
}
</style>
