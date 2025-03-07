<template>
	<view class="container">
		<view class="section">
			<view class="label">{{$t('pages.notify.alertName')}}</view>
			<view class="value">{{detail.name}}</view>
		</view>
		<view class="section">
			<view class="label">{{$t('pages.notify.sceneLinkageName')}}</view>
			<view class="value">{{detail.alarm_config_name}}</view>
		</view>
		<view class="section">
			<view class="label">{{$t('pages.notify.alertTime')}}</view>
			<view class="value">{{formatDate(detail.created_at)}}</view>
		</view>
		<view class="section">
			<view class="label">{{$t('pages.notify.alarmStatus')}}</view>
			<view class="value">{{$t(`pages.notify.alarmStatuses.${detail.alarm_status}`)}}</view>
		</view>
		<view class="section">
			<view class="label">{{$t('pages.notify.alertContent')}}</view>
			<view class="value">{{detail.content}}</view>
		</view>
		<view class="section">
			<view class="label">{{$t('pages.notify.alarmDescription')}}</view>
			<view class="value">{{detail.warning_description}}</view>
		</view>
		<view class="section" v-if="detail.alarm_device_list && detail.alarm_device_list.length">
			<view class="label">{{$t('pages.notify.alarmDevices')}}</view>
			<view class="device-list">
				<view class="device-item" v-for="(device, index) in detail.alarm_device_list" :key="index">
					<view class="device-name">{{device.device_name}}</view>
					<view class="device-info">
						<text class="info-item">{{$t('pages.notify.deviceID')}}：{{device.id}}</text>
						<text class="info-item">{{$t('pages.notify.deviceName')}}：{{device.name}}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import dayjs from 'dayjs'

export default {
	data() {
		return {
			detail: {}
		}
	},
	onShow() {
		uni.setNavigationBarTitle({
			title: this.$t('pages.notifyDetailTitle')
		})
	},
	onLoad(options) {
		const eventChannel = this.getOpenerEventChannel();
		if (eventChannel) {
			eventChannel.on('acceptData', (data) => {
				if (data && data.item) {
					this.detail = data.item;
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
			return dayjs(date).format('YYYY-MM-DD HH:mm')
		}
	}
}
</script>

<style scoped>
.container {
	padding: 20px;
}

.section {
	margin-bottom: 20px;
}

.label {
	font-size: 14px;
	color: #666;
	margin-bottom: 5px;
}

.value {
	font-size: 16px;
	color:#333;
}

.device-list {
	margin-top: 10px;
}

.device-item {
	padding: 10px;
	border: 1px solid #eee;
	border-radius: 4px;
	margin-bottom: 8px;
}

.device-name {
	font-size: 14px;
	font-weight: bold;
	color: #333;
	margin-bottom: 5px;
}

.device-info {
	display: flex;
	flex-direction: column;
	gap: 3px;
}

.info-item {
	font-size: 12px;
	color: #666;
}
</style>
