<template>
  <view class="thingsvis-settings">
    <text class="settings-title">连接配置</text>
    <text class="settings-description">设置仅用于当前服务器。标准 Docker 部署填写 ThingsPanel 前端访问地址即可。</text>
    <text class="field-label">ThingsPanel 前端地址</text>
    <input v-model="form.platformWebBase" class="address-input" :placeholder="defaults.platformWebBase || 'https://服务器域名:8080'" />
    <text class="field-label">ThingsVis 页面地址（可选）</text>
    <input v-model="form.thingsVisPageUrl" class="address-input" placeholder="留空使用前端地址下的 /main/" />
    <text class="field-label">ThingsVis API 地址（可选）</text>
    <input v-model="form.thingsVisApiBase" class="address-input" placeholder="留空使用前端地址下的 /thingsvis-api" />
    <text class="settings-description">地址需可由手机访问。请使用 HTTP 或 HTTPS 完整地址；不要填写 Docker 容器内部地址。</text>
    <text v-if="error" class="settings-error">{{ error }}</text>
    <button class="save-button" @click="save">保存设置</button>
  </view>
</template>

<script>
import { getThingsVisSettings, resolveThingsVisAddresses, saveThingsVisSettings } from '@/utils/thingsvis-address'

export default {
  name: 'ThingsvisSettings',
  emits: ['saved'],
  data() {
    return { form: { platformWebBase: '', thingsVisPageUrl: '', thingsVisApiBase: '' }, defaults: {}, error: '' }
  },
  created() {
    try {
      this.form = getThingsVisSettings()
      this.defaults = resolveThingsVisAddresses()
    } catch (error) {
      this.error = error.message || '无法读取部署设置'
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
.thingsvis-settings { padding: 22px 20px; background: #fff; font-family: inherit; }
.settings-title { display: block; font-size: 15px; font-weight: 600; color: #182230; }
.settings-description { display: block; margin-top: 10px; font-size: 11px; line-height: 1.8; color: #7c879b; }
.field-label { display: block; margin: 22px 0 10px; font-size: 12px; color: #5f6d82; }
.address-input { height: 42px; padding: 0 12px; border: 1px solid #edf0f5; border-radius: 4px; background: #fafbfe; font-size: 12px; font-family: inherit; }
.settings-error { display: block; margin-top: 10px; color: #c4320a; font-size: 12px; }
.save-button { margin-top: 24px; border-radius: 4px; background: #1677ff; color: #fff; font-size: 13px; line-height: 42px; font-family: inherit; }
.save-button::after { border: 0; }
</style>
