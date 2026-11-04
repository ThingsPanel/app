<template>
  <view>
    <web-view v-if="url" :src="url" @load="loaded" @error="failed" />
    <view v-else class="mp-device-error" role="alert"><text>{{ loading ? '正在打开设备详情…' : error }}</text><button v-if="!loading" @click="open">重试</button></view>
  </view>
</template>
<script>
import { resolveThingsVisAddresses } from '@/utils/thingsvis-address'
import { buildMiniDeviceUrl, checkMiniDeviceEntry } from '@/utils/mp-device-url'
export default {
  props: { deviceId: { type: String, required: true } },
  data() { return { url: '', error: '', loading: false, loadVersion: 0 } },
  watch: { deviceId: { immediate: true, handler() { this.open() } } },
  beforeUnmount() { this.loadVersion++ },
  methods: {
    async open() {
      const version = ++this.loadVersion
      this.url = ''
      this.error = ''
      this.loading = true
      try {
        const url = buildMiniDeviceUrl({ deviceId: this.deviceId, token: uni.getStorageSync('access_token'), lang: uni.getStorageSync('language') || 'zh-CN', ...resolveThingsVisAddresses() })
        await checkMiniDeviceEntry(url, options => uni.request(options))
        if (version === this.loadVersion) this.url = url
      } catch (cause) { if (version === this.loadVersion) this.error = cause.message }
      finally { if (version === this.loadVersion) this.loading = false }
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
