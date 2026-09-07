<template>
	<view class="tp-box">

		<view class="tp-content">
			<view class="tp-panel alert-card">
				<view class="card-inner">
					<view class="alert-header">
						<view class="alert-badge" :class="getLevelClass(detail.alarm_level)">
							<view class="badge-dot"></view>
							<text class="badge-text">{{$t(`pages.alarms.alarmLevels.${detail.alarm_level || 'default'}`)}}</text>
						</view>
						<!-- <text v-if="item.warning_description" class="alert-desc">{{detail.warning_description || '--'}}</text> -->
					</view>

					<view class="alert-meta">
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.alarms.alertName')}}</text>
							<text class="meta-value">{{detail.name || '--'}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.alarms.sceneLinkageName')}}</text>
							<text class="meta-value">{{detail.alarm_config_name || '--'}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.alarms.alertTime')}}</text>
							<text class="meta-value time-value">{{formatDate(alertTimeValue)}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.alarms.alarmStatus')}}</text>
							<text class="meta-value status-value">{{$t(`pages.alarms.alarmStatuses.${detail.alarm_status || 'default'}`)}}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="tp-panel detail-section">
				<view class="section-header">
					<text class="section-title">{{$t('pages.alarms.alertContent')}}</text>
				</view>
				<text class="section-text">{{detail.content || '--'}}</text>
			</view>

			<view class="tp-panel detail-section">
				<view class="section-header">
					<text class="section-title">{{$t('pages.alarms.alarmDescription')}}</text>
				</view>
				<text class="section-text">{{detail.description || '--'}}</text>
			</view>

			<view class="tp-panel detail-section" v-if="deviceList.length">
				<view class="section-header">
					<text class="section-title">{{$t('pages.alarms.alarmDevices')}}</text>
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
								<text class="info-label">{{$t('pages.alarms.deviceID')}}</text>
								<text class="info-value">{{device.id || '--'}}</text>
							</view>
							<view class="info-row">
								<text class="info-label">{{$t('pages.alarms.deviceName')}}</text>
								<text class="info-value">{{device.name || '--'}}</text>
							</view>
						</view>
					</view>
				</view>
			</view>

			<view class="tp-panel empty-card" v-else>
				<text class="empty-text">{{$t('pages.alarms.noDevices')}}</text>
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
					title: this.$t('pages.alarmDetailTitle')
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
	background: #F7FAFF;
	position: relative;
	overflow: hidden;
	color: #51515c;
	font-size: 28rpx;
}

.tp-content {
	position: relative;
	z-index: 1;
	padding: 24rpx 28rpx 80rpx;
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.tp-panel {
	background: #ffffff;

	border-radius: 12rpx;
	border: 0;
	box-shadow: none;
	overflow: hidden;
}

.card-inner {
	padding: 24rpx;
}

.alert-header {
	border-bottom: 1px solid rgba(15, 23, 42, 0.06);
	padding-bottom: 28rpx;
	margin-bottom: 28rpx;

	.alert-desc {
		font-size: 34rpx;
		font-weight: 600;
		color: #1d1d1f;
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
			box-shadow: none;
		}
	}

	&.level-medium {
		background: rgba(245, 158, 11, 0.12);
		color: #f59e0b;

		.badge-dot {
			background: #f59e0b;
			box-shadow: none;
		}
	}

	&.level-low {
		background: rgba(100, 108, 255, 0.12);
		color: #646cff;

		.badge-dot {
			background: #646cff;
			box-shadow: none;
		}
	}

	&.level-default {
		background: rgba(148, 163, 184, 0.12);
		color: #73737d;

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
		color: #73737d;
	}

	.meta-value {
		font-size: 30rpx;
		color: #1d1d1f;
		font-weight: 600;
		line-height: 1.4;

		&.time-value {
			font-variant-numeric: tabular-nums;
			color: #51515c;
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
		color: #1d1d1f;
	}

	.section-count {
		font-size: 26rpx;
		color: #73737d;
	}

	.section-text {
		font-size: 28rpx;
		color: #51515c;
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
	border: 0;
	border-radius: 24rpx;
	padding: 28rpx;
	background: #ffffff;
	box-shadow: none;
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
		box-shadow: none;
	}
}

.device-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #1d1d1f;
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
	color: #1d1d1f;
	gap: 20rpx;

	.info-label {
		color: #73737d;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.info-value {
		font-weight: 600;
		color: #1d1d1f;
		flex: 1;
		text-align: right;
		word-break: break-all;
	}
}

.empty-card {
	padding: 24rpx 28rpx;
	text-align: center;
}

.empty-text {
	font-size: 28rpx;
	color: #73737d;
}

.tp-box { background: #F2F2F7; }
</style>
