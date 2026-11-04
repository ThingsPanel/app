<template>
  <view>
    <web-view v-if="url" :src="url" @load="loaded" @error="failed" />
    <view v-else class="mp-device-error" role="alert"><text>{{ error }}</text><button @click="open">重试</button></view>
  </view>
</template>
<script>
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'
import { buildMiniDeviceUrl } from '@/utils/mp-device-url'
export default {
  props: { deviceId: { type: String, required: true } },
  data() { return { url: '', error: '' } },
  watch: { deviceId: { immediate: true, handler() { this.open() } } },
  methods: {
    open() {
      this.error = ''
      try {
        this.url = buildMiniDeviceUrl({ deviceId: this.deviceId, token: uni.getStorageSync('access_token'), lang: uni.getStorageSync('language') || 'zh-CN', ...resolveThingsVisAddresses() })
      } catch (cause) { this.url = ''; this.error = cause.message }
    },
    loaded() { uni.setNavigationBarTitle({ title: '设备详情' }) },
    failed() { this.url = ''; this.error = '设备页面打开失败，请确认网页已更新且已配置微信业务域名' }
  }
}
</script>
<style scoped>
.mp-device-error { padding:48rpx; color:#657187; text-align:center; font-size:28rpx; line-height:1.8; }
.mp-device-error button { margin-top:24rpx; color:#1677ff; font-size:28rpx; }
</style>
