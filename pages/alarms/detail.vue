<template>
	<view class="tp-box">

		<view class="tp-content">
			<view class="alert-card" :class="getLevelClass(detail.alarm_level)">
				<view class="card-inner">
					<view class="alert-heading">
						<text class="alert-heading-title">{{detail.name || '--'}}</text>
						<text class="alert-badge">{{$t(`pages.alarms.alarmLevels.${detail.alarm_level || 'default'}`)}}</text>
					</view>

					<view class="alert-meta">
						<view class="meta-item" v-if="detail.alarm_config_name && detail.alarm_config_name !== detail.name">
							<text class="meta-label">{{$t('pages.alarmRules.name')}}</text>
							<text class="meta-value">{{detail.alarm_config_name || '--'}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.alarms.alertTime')}}</text>
							<text class="meta-value time-value">{{formatDate(alertTimeValue)}}</text>
						</view>
						<view class="meta-item">
							<text class="meta-label">{{$t('pages.alarms.alarmStatus')}}</text>
							<text class="meta-value status-value" :class="statusClass">{{$t(`pages.alarms.alarmStatuses.${detail.alarm_status || 'default'}`)}}</text>
						</view>
					</view>
				</view>
			</view>

			<view class="tp-panel detail-section" v-if="detail.content">
				<view class="section-header">
					<text class="section-title">{{$t('pages.alarms.alertContent')}}</text>
				</view>
				<text class="section-text">{{detail.content || '--'}}</text>
			</view>

			<view class="tp-panel detail-section" v-if="detail.description && detail.description.trim() !== (detail.content || '').trim()">
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
						<view class="device-info">
							<view class="info-row">
								<text class="info-label">{{$t('pages.alarms.deviceName')}}</text>
								<text class="info-value">{{device.device_name || device.name || '--'}}</text>
							</view>
							<view class="info-row">
								<text class="info-label">{{$t('pages.alarms.deviceID')}}</text>
								<text class="info-value">{{device.id || '--'}}</text>
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
		statusClass() {
			// N=正常/已恢复，其余按等级色显示，与顶部等级标签保持一致
			const status = String(this.detail?.alarm_status ?? '').toUpperCase()
			const statusMap = {
				N: 'status-normal',
				H: 'status-high',
				M: 'status-medium',
				L: 'status-low',
				'1': 'status-high',
				'2': 'status-medium',
				'3': 'status-low'
			}
			return statusMap[status] || 'status-unknown'
		},
		alertTimeValue() {
			return this.detail?.create_at
				|| this.detail?.created_at
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
			// 接口既有 'H'/'M'/'L' 字符串，也有 '1'/'2'/'3' 数字，两种都要认
			const levelMap = {
				H: 'level-high',
				M: 'level-medium',
				L: 'level-low',
				'1': 'level-high',
				'2': 'level-medium',
				'3': 'level-low'
			}
			return levelMap[String(level ?? '').toUpperCase()] || 'level-default'
		}
	}
}
</script>

<style lang="scss" scoped>
.tp-box {
	width: 100%;
	min-height: 100vh;
	background: #F2F2F7;
	position: relative;
	overflow: hidden;
	color: #51515c;
	font-size: 22rpx;
	font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif;

	/* 告警等级色板（鲜艳实色，与 alarm-rules 保持一致；本地声明避免依赖全局注入时序） */
	--alarm-high: #FF4D35;
	--alarm-medium: #FF9500;
	--alarm-low: #1677ff;
	--alarm-default: #98a2b3;
	--alarm-status-normal: #08bf63;
}

.tp-content {
	position: relative;
	z-index: 1;
	padding: 24rpx 28rpx calc(40rpx + env(safe-area-inset-bottom));
	display: flex;
	flex-direction: column;
	gap: 22rpx;
}

.tp-panel {
	background: #ffffff;
	border-radius: 12rpx;
	border: 0;
	box-shadow: none;
	overflow: hidden;
}

/* 顶部告警卡 */
.alert-card {
	position: relative;
	background: #ffffff;
	border-radius: 12rpx;
	overflow: hidden;
}

.card-inner {
	padding: 24rpx;
}

.alert-heading {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 24rpx;
	padding-bottom: 24rpx;
	border-bottom: 1rpx solid #eeeef2;
}

.alert-heading-title {
	flex: 1;
	min-width: 0;
	color: #1d1d1f;
	font-size: 27rpx;
	font-weight: 600;
	line-height: 38rpx;
	word-break: break-word;
}

/* 等级标签：饱和主色实底 + 白字，与列表页统一 */
.alert-badge {
	flex-shrink: 0;
	padding: 4rpx 12rpx;
	border-radius: 6rpx;
	font-size: 20rpx;
	line-height: 28rpx;
	font-weight: 600;
	color: #ffffff;
	background: var(--alarm-default);
}

.alert-card.level-high .alert-badge { background: var(--alarm-high); }
.alert-card.level-medium .alert-badge { background: var(--alarm-medium); }
.alert-card.level-low .alert-badge { background: var(--alarm-low); }

/* 单列布局：标签定宽、值自适应。不用 grid，避免小程序端退化为两列挤压换行 */
.alert-meta {
	display: flex;
	flex-direction: column;
	gap: 18rpx;
}

.meta-item {
	display: flex;
	align-items: flex-start;

	.meta-label {
		flex: 0 0 156rpx;
		width: 156rpx;
		color: #73737d;
		font-size: 22rpx;
		line-height: 36rpx;
	}

	.meta-value {
		flex: 1;
		min-width: 0;
		color: #1d1d1f;
		font-size: 22rpx;
		font-weight: 500;
		line-height: 36rpx;
		word-break: break-word;

		&.time-value {
			font-variant-numeric: tabular-nums;
			font-weight: 400;
			color: #51515c;
		}

		&.status-value {
			font-weight: 600;

			/* N=正常/已恢复 用项目绿；L/M/H 复用等级色，与上方标签一致 */
			&.status-normal { color: var(--alarm-status-normal); }
			&.status-high { color: var(--alarm-high); }
			&.status-medium { color: var(--alarm-medium); }
			&.status-low { color: var(--alarm-low); }
		}
	}
}

.detail-section {
	padding: 24rpx;

	.section-header {
		display: flex;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.section-accent {
		width: 6rpx;
		height: 26rpx;
		border-radius: 3rpx;
		background: #1677ff;
		margin-right: 12rpx;
		flex-shrink: 0;
	}

	.section-title {
		flex: 1;
		min-width: 0;
		font-size: 27rpx;
		font-weight: 600;
		color: #1d1d1f;
	}

	.section-count {
		flex-shrink: 0;
		font-size: 20rpx;
		color: #73737d;
	}

	.section-text {
		font-size: 22rpx;
		color: #51515c;
		line-height: 1.7;
		white-space: pre-wrap;
		word-break: break-word;
	}
}

.device-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.device-card {
	border: 0;
	border-radius: 12rpx;
	padding: 16rpx 0;
	background: #fff;
	box-shadow: none;
}

.device-header {
	display: flex;
	align-items: center;
	margin-bottom: 16rpx;
	gap: 12rpx;
}

.device-icon {
	width: 48rpx;
	height: 48rpx;
	border-radius: 12rpx;
	background: #EAF2FF;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;

	.dot {
		width: 12rpx;
		height: 12rpx;
		background: #1677ff;
		border-radius: 50%;
	}
}

.device-name {
	flex: 1;
	min-width: 0;
	font-size: 26rpx;
	font-weight: 600;
	color: #1d1d1f;
	word-break: break-word;
}

.device-info {
	display: flex;
	flex-direction: column;
	gap: 10rpx;
}

.info-row {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	font-size: 22rpx;
	color: #1d1d1f;
	gap: 20rpx;

	.info-label {
		color: #73737d;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.info-value {
		font-weight: 500;
		color: #1d1d1f;
		flex: 1;
		min-width: 0;
		text-align: left;
		word-break: break-all;
	}
}

.empty-card {
	padding: 24rpx;
	text-align: center;
}

.empty-text {
	font-size: 22rpx;
	color: #73737d;
}
</style>
