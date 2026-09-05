<template>
  <view
    class="device-card"
    :class="{ 'offline-card': !isOnline, 'device-card--row': layout === 'list' }"
    @click="$emit('select', device)"
  >
    <view class="status-dot" :class="statusClass" />
    <view class="card-inner">
      <view class="device-icon-wrapper tp-flex tp-flex-j-c tp-flex-a-c">
        <image
          :src="deviceImageSrc"
          class="device-img"
          :class="{ 'device-img-default': !device.image_url || imageLoadFailed }"
          mode="aspectFit"
          @error="handleImageError"
        />
      </view>
      <view class="device-info tp-flex tp-flex-col tp-flex-j-c">
        <view class="device-name text-ellipsis">{{ device.name }}</view>
        <view class="device-context tp-flex tp-flex-a-c">
          <image v-if="deviceTypeIcon" :src="deviceTypeIcon" class="context-type-icon" mode="aspectFit" />
          <text v-if="deviceTypeLabel" class="context-type">{{ deviceTypeLabel }}</text>
        </view>
        <text v-if="device.display_address" class="device-address text-ellipsis">{{ device.display_address }}</text>
      </view>
      <view class="device-meta tp-flex tp-flex-a-c">
        <block v-if="device.latest_ts_name">
          <image src="/static/icon/device-clock.svg" class="clock-icon" />
          <text class="time-val text-ellipsis">{{ device.latest_ts_name }}</text>
        </block>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DeviceListItem',
  props: {
    device: { type: Object, required: true },
    layout: { type: String, default: 'grid', validator: value => ['grid', 'list'].includes(value) }
  },
  emits: ['select'],
  data() {
    return { imageLoadFailed: false }
  },
  watch: {
    'device.image_url'() {
      this.imageLoadFailed = false
    }
  },
  computed: {
    deviceImageSrc() {
      return !this.imageLoadFailed && this.device.image_url
        ? this.device.image_url
        : '/static/image/default-device-hub.png'
    },
    hasAlarm() {
      const alarmStatus = String(this.device.warn_status || '').trim().toUpperCase()
      return alarmStatus !== '' && alarmStatus !== 'N'
    },
    isOnline() {
      return Number(this.device.is_online) === 1
    },
    statusClass() {
      if (this.hasAlarm) return 'status-alarm'
      return this.isOnline ? 'status-on' : 'status-off'
    },
    deviceTypeLabel() {
      return {
        1: this.$t('pages.devices.directDevice'),
        2: this.$t('pages.devices.gateway'),
        3: this.$t('pages.devices.subDevice')
      }[String(this.device.device_type)] || ''
    },
    deviceTypeIcon() {
      return {
        1: '/static/icon/device-type-direct-terminal.svg',
        2: '/static/icon/device-type-gateway-green.svg',
        3: '/static/icon/device-type-subdevice.svg'
      }[String(this.device.device_type)] || ''
    }
  },
  methods: {
    handleImageError() {
      this.imageLoadFailed = true
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/tokens.scss';

.device-card {
  position: relative;
  background: $color-surface;
  border: 2rpx solid #edf0f3;
  border-radius: 10rpx;
  box-shadow: none;
  overflow: hidden;
  transition: background-color 0.15s ease;
  &:active { background: #f6f8fb; }

}

.status-dot { position: absolute; z-index: 2; right: 16rpx; top: 14rpx; width: 10rpx; height: 10rpx; background: #a8b0bd; border: 3rpx solid #fff; border-radius: 50%; }
.status-dot.status-on { background: #08bf63; }
.status-dot.status-alarm { background: #ff3b30; animation: device-alarm-blink 1s ease-in-out infinite; }

@keyframes device-alarm-blink {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(255, 59, 48, .25); }
  50% { opacity: .35; box-shadow: 0 0 0 7rpx rgba(255, 59, 48, 0); }
}

.card-inner {
  display: grid;
  grid-template-columns: 88rpx minmax(0, 1fr);
  grid-template-rows: 94rpx minmax(30rpx, 1fr);
  column-gap: 14rpx;
  height: 170rpx;
  padding: 15rpx 15rpx 12rpx;
  box-sizing: border-box;
}

.device-icon-wrapper {
  grid-column: 1;
  grid-row: 1;
  align-self: center;
  width: 88rpx;
  height: 88rpx;
  overflow: hidden;
  background: transparent;
}

.device-img { width: 100%; height: 100%; }
.device-img-default { width: 82rpx; height: 82rpx; }

.device-info {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  padding-right: 12rpx;
  gap: 5rpx;
}

.device-name {
  min-width: 0;
  color: #172033;
  font-size: 23rpx;
  font-weight: 600;
  line-height: 34rpx;
}

.device-context { min-width: 0; color: #8993a4; font-size: 19rpx; line-height: 30rpx; overflow: hidden; }
.context-type-icon { width: 24rpx; height: 24rpx; margin-right: 6rpx; flex-shrink: 0; }
.context-type { flex-shrink: 0; white-space: nowrap; }
.device-address { width: 100%; color: #8993a4; font-size: 18rpx; line-height: 26rpx; }

.device-meta {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  align-self: end;
	width: 100%;
  justify-content: flex-start;
  color: #8a94a6;
  font-size: 17rpx;
  line-height: 28rpx;
  white-space: nowrap;
  overflow: hidden;

  .time-val { min-width: 0; max-width: calc(100% - 28rpx); font-variant-numeric: tabular-nums; }
}
.clock-icon { width: 22rpx; height: 22rpx; margin-right: 6rpx; flex-shrink: 0; }

.device-card--row {
  border: 0;
  border-bottom: 1rpx solid #e8edf3;
  border-radius: 0;
  &:last-child { border-bottom: 0; }
  .card-inner { height: 152rpx; padding: 16rpx 24rpx; grid-template-rows: 80rpx 30rpx; column-gap: 22rpx; }
  .device-name { font-size: 27rpx; line-height: 38rpx; }
  .device-context { font-size: 22rpx; }
  .device-meta { font-size: 20rpx; }
  .status-dot { right: 24rpx; top: 28rpx; }
}

@media (prefers-reduced-motion: reduce) {
  .status-dot.status-alarm { animation: none; }
}

.text-ellipsis { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.tp-flex { display: flex; }
.tp-flex-col { flex-direction: column; }
.tp-flex-row { flex-direction: row; }
.tp-flex-j-s { justify-content: space-between; }
.tp-flex-j-c { justify-content: center; }
.tp-flex-a-c { align-items: center; }
.tp-flex-a-e { align-items: flex-end; }
.tp-flex-1 { flex: 1; }
.tp-overflow-hidden { overflow: hidden; }
</style>
