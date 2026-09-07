<template>
  <view
    class="device-card"
    :class="{ 'offline-card': !isOnline, 'device-card--row': layout === 'list' }"
    @click="$emit('select', device)"
  >
    <view class="status-dot" :class="statusClass" :aria-label="$t(hasAlarm ? 'pages.devices.alarming' : isOnline ? 'pages.devices.online' : 'pages.devices.offline')" />
    <view class="card-inner">
      <view class="device-icon-wrapper tp-flex tp-flex-j-c tp-flex-a-c" :class="{ 'device-icon-placeholder': !device.image_url || imageLoadFailed }">
        <image
          :src="deviceImageSrc"
          class="device-img"
          :class="{ 'device-img-default': !device.image_url || imageLoadFailed }"
          mode="aspectFit"
          @error="handleImageError"
        />
      </view>
      <view class="device-info tp-flex tp-flex-col">
        <view class="device-name text-ellipsis">{{ device.name }}</view>
        <view v-if="deviceTypeLabel || device.display_groups" class="device-context tp-flex tp-flex-a-c">
          <text v-if="deviceTypeLabel" class="context-type">{{ deviceTypeLabel }}</text>
          <text v-if="deviceTypeLabel && device.display_groups" class="context-separator">|</text>
          <text v-if="device.display_groups" class="context-group text-ellipsis">{{ device.display_groups }}</text>
        </view>
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
        1: '/static/icon/device-flat-direct.svg',
        2: '/static/icon/device-flat-gateway.svg',
        3: '/static/icon/device-flat-subdevice.svg'
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
  background: var(--device-glass-surface, #fff);
  border: 0;
  border-radius: var(--device-card-radius, 16rpx);
  box-shadow: var(--device-glass-shadow, none);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
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
  grid-template-columns: 80rpx minmax(0, 1fr);
  grid-template-rows: 80rpx 28rpx;
  column-gap: 16rpx;
  row-gap: 8rpx;
  height: 144rpx;
  padding: 14rpx 18rpx;
  box-sizing: border-box;
}

.device-icon-wrapper {
  grid-column: 1;
  grid-row: 1;
  align-self: start;
  width: 80rpx;
  height: 80rpx;
  flex-direction: column;
  overflow: hidden;
  background: transparent;
}

.device-img { width: 72rpx; height: 54rpx; }
.device-icon-placeholder { background:transparent; }
.device-img-default { width: 80rpx; height: 80rpx; }

.device-info {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  padding-right: 0;
  padding-top: 4rpx;
  justify-content: flex-start;
  gap: 5rpx;
}

.device-name {
  min-width: 0;
  color: #172033;
  font-size: 23rpx;
  font-weight: 600;
  line-height: 34rpx;
}

.device-context { min-width: 0; color: #68788e; font-size: 19rpx; line-height: 30rpx; overflow: hidden; }
.context-separator { margin:0 8rpx; color:#b5bfcd; flex-shrink:0; }
.context-group { min-width:0; }
.context-type { flex-shrink: 0; white-space: nowrap; }

.device-meta {
  position: absolute;
  left: 114rpx;
  right: 18rpx;
  bottom: 14rpx;
  height: 28rpx;
  min-width: 0;
  justify-content: flex-start;
  color: #738197;
  font-size: 17rpx;
  font-family: Arial, sans-serif;
  line-height: 28rpx;
  white-space: nowrap;
  overflow: hidden;

  .time-val { display:block; flex:1; min-width:0; line-height:28rpx; font-variant-numeric:tabular-nums; }
}
.clock-icon { width: 22rpx; height: 22rpx; margin-right: 6rpx; flex-shrink: 0; }

.device-card--row {
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  border: 0;
  border-bottom: 1rpx solid #e8edf3;
  border-radius: 0;
  &:last-child { border-bottom: 0; }
  .card-inner { height: 150rpx; padding: 16rpx 24rpx; grid-template-rows: 80rpx 30rpx; column-gap: 22rpx; }
  .device-name { font-size: 27rpx; line-height: 38rpx; }
  .device-context { font-size: 22rpx; }
  .device-meta { left:126rpx; right:24rpx; bottom:16rpx; font-size:20rpx; }
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
