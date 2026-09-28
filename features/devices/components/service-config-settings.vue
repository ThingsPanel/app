<template>
  <view class="service-config-settings">
    <text class="settings-caption">以下地址留空时按当前服务器地址自动推导，仅在自部署或前后端分离部署时才需要修改。</text>
    <text class="field-label">平台前端地址</text>
    <input v-model="form.platformWebBase" class="address-input" :placeholder="defaults.platformWebBase || 'https://服务器域名:8080'" />
    <text class="field-label">可视化页面地址（可选）</text>
    <input v-model="form.thingsVisPageUrl" class="address-input" placeholder="留空自动使用默认地址" />
    <text class="field-label">可视化 API 地址（可选）</text>
    <input v-model="form.thingsVisApiBase" class="address-input" placeholder="留空自动使用默认地址" />
    <text v-if="error" class="settings-error">{{ error }}</text>
    <button class="save-button" @click="save">保存设置</button>
  </view>
</template>

<script>
import { getThingsVisSettings, resolveThingsVisAddresses, saveThingsVisSettings } from '@/utils/thingsvis-address'

export default {
  name: 'ServiceConfigSettings',
  emits: ['saved'],
  data() {
    return { form: { platformWebBase: '', thingsVisPageUrl: '', thingsVisApiBase: '' }, defaults: {}, error: '' }
  },
  created() {
    try {
      this.form = getThingsVisSettings()
      this.defaults = resolveThingsVisAddresses()
    } catch (error) {
      this.error = error.message || '无法读取服务配置'
    }
  },
  methods: {
    save() {
      try {
        const addresses = saveThingsVisSettings(this.form)
        this.error = ''
        this.$emit('saved', addresses)
      } catch (error) {
        this.error = error.message || '保存失败，请检查地址后重试'
      }
    }
  }
}
</script>

<style scoped>
.service-config-settings { padding: 0 28rpx 48rpx; background: #f2f2f7; font-family: inherit; }
.settings-caption { display:block; padding:28rpx 24rpx; background:#fff; border-bottom:1rpx solid #edf1f6; color:#73737d; font-size:22rpx; line-height:34rpx; }
.field-label { display:block; padding:28rpx 24rpx 10rpx; background:#fff; color:#667085; font-size:22rpx; line-height:32rpx; }
.address-input { display:block; box-sizing:border-box; width:100%; height:76rpx; padding:0 24rpx; background:#fff; border:0; border-bottom:1rpx solid #edf1f6; color:#344054; font-size:24rpx; font-family:inherit; }
.address-input::placeholder { color:#b3bdca; }
.settings-error { display:block; margin-top:18rpx; color:var(--tp-color-danger, #ff4d35); font-size:22rpx; }
.save-button { width:100%; height:88rpx; margin-top:36rpx; border:0; border-radius:0; background:var(--tp-color-primary, #1677ff); color:#fff; font-size:26rpx; font-weight:400; line-height:88rpx; font-family:inherit; }
.save-button::after { border: 0; }
</style>
