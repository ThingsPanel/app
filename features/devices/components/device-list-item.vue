<template>
  <view
    class="device-card"
    :class="{ 'alarm-active': hasAlarm }"
    @click="$emit('select', device)"
  >
    <view class="card-inner tp-flex tp-flex-row tp-flex-j-s">
      <view class="device-main tp-flex tp-flex-row tp-flex-1 tp-overflow-hidden">
        <view class="device-icon-wrapper tp-flex tp-flex-j-c tp-flex-a-c" :class="isOnline ? 'online' : 'offline'">
          <image v-if="device.image_url" :src="device.image_url" class="device-img" mode="aspectFit" />
          <text v-else class="iconfont iconequipment" />
        </view>
        <view class="device-info tp-flex tp-flex-col tp-flex-j-c">
          <view class="device-name text-ellipsis">{{ device.name }}</view>
          <view class="device-tags">
            <text v-if="deviceTypeLabel" class="device-tag">{{ deviceTypeLabel }}</text>
          </view>
          <view v-if="device.device_config_name" class="device-meta text-ellipsis">
            <text class="label">{{ $t('pages.devices.deviceTemplate') }}:</text>
            {{ device.device_config_name }}
          </view>
          <view v-if="device.protocol_type" class="device-meta text-ellipsis">
            <text class="label">{{ $t('pages.devices.accessProtocol') }}:</text>
            {{ device.protocol_type }}
          </view>
          <view class="device-meta">
            <text class="label">{{ $t('pages.deviceDetail.reportTime') }}:</text>
            <text class="time-val">{{ device.latest_ts_name || '--' }}</text>
          </view>
        </view>
      </view>
      <view class="device-status tp-flex tp-flex-col tp-flex-a-e tp-flex-j-c">
        <view v-if="hasAlarm" class="alarm-indicator">
          <text class="alarm-symbol">!</text>
          <text>{{ $t('pages.devices.alarming') }}</text>
        </view>
        <view class="status-badge" :class="isOnline ? 'status-on' : 'status-off'">
          <view class="dot" />
          <text>{{ isOnline ? $t('pages.deviceDetail.online') : $t('pages.deviceDetail.offline') }}</text>
        </view>
        <text class="row-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'DeviceListItem',
  props: {
    device: { type: Object, required: true }
  },
  emits: ['select'],
  computed: {
    hasAlarm() {
      return this.device.warn_status === 'Y'
    },
    isOnline() {
      return Number(this.device.is_online) === 1
    },
    deviceTypeLabel() {
      return {
        1: this.$t('pages.devices.directDevice'),
        2: this.$t('pages.devices.gateway'),
        3: this.$t('pages.devices.subDevice')
      }[String(this.device.device_type)] || ''
    }
  }
}
</script>

<style lang="scss">
@import '@/styles/tokens.scss';

.device-card {
  background: $color-surface;
  border-bottom: 2rpx solid #e1e9e6;
  transition: background-color 0.15s ease;
  &:active { background: #eaf3f0; }

  &.alarm-active { background: #fffaf7; }
}

.card-inner {
  min-height: 142rpx;
  padding: 24rpx 20rpx;
  box-sizing: border-box;
}

.device-main { min-width: 0; }

.device-icon-wrapper {
  width: 84rpx;
  height: 84rpx;
  margin-right: 22rpx;
  flex-shrink: 0;
  overflow: hidden;
  background: #edf1ef;
  border: 2rpx solid #d8e2de;
  border-radius: $radius-small;

  &.online {
    background: #e6f1ed;
    border-color: #9bc9bd;
  }

  .iconfont {
    color: #82928d;
    font-size: 40rpx;
  }
}

.device-img { width: 100%; height: 100%; }

.device-info {
  min-width: 0;
  padding-right: 16rpx;
}

.device-name {
  margin-bottom: 6rpx;
  color: $color-text;
  font-size: 30rpx;
  font-weight: 600;
}

.device-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-bottom: 8rpx;
}

.device-tag {
  padding: 2rpx 8rpx;
  color: #5f716b;
  background: #eef3f1;
  border-left: 4rpx solid #9aaba5;
  font-size: 19rpx;
  line-height: 28rpx;
}

.device-meta {
  color: $color-text-secondary;
  font-size: 22rpx;
  line-height: 32rpx;

  .label { margin-right: 8rpx; color: #8b9b96; }
  .time-val { font-family: monospace; }
}

.device-status { min-width: 88rpx; }

.alarm-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  color: #ba3f22;
  font-size: 22rpx;
  font-weight: 700;
}

.alarm-symbol {
  width: 26rpx;
  height: 26rpx;
  margin-right: 8rpx;
  color: #fff;
  background: #d95232;
  border-radius: 50%;
  font-size: 19rpx;
  line-height: 26rpx;
  text-align: center;
}

.status-badge {
  display: flex;
  align-items: center;
  padding: 6rpx 0 8rpx;
  color: #7d8985;
  border-bottom: 2rpx solid #aab6b2;
  font-size: 22rpx;
  font-weight: 600;

  .dot {
    width: 10rpx;
    height: 10rpx;
    margin-right: 10rpx;
    background: #9aa8a3;
    border-radius: 50%;
  }

  &.status-on {
    color: $color-brand-700;
    border-color: $color-brand-300;
    .dot { background: $color-brand-700; }
  }
}

.row-arrow {
  margin-top: 16rpx;
  color: #8b9b96;
  font: 36rpx/1 serif;
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
