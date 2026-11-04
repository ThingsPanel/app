<template>
  <view class="export-state"><text>{{ message }}</text><button v-if="!busy" @click="download">重新打开</button></view>
</template>
<script>
import { requestDeviceApi } from '@/api/modules/device-overview'
export default {
  data() { return { query: null, busy: false, message: '正在准备导出文件…' } },
  onLoad(options) {
    this.query = { device_id: options.device_id, key: options.key, start_time: Number(options.start_time), end_time: Number(options.end_time) }
    this.download()
  },
  methods: {
    async download() {
      if (this.busy) return
      this.busy = true; this.message = '正在准备导出文件…'
      try {
        const q = this.query
        if (!q?.device_id || !q.key || !Number.isFinite(q.start_time) || !Number.isFinite(q.end_time) || q.start_time > q.end_time || q.end_time-q.start_time > 31*86400000) throw new Error('导出参数无效，请返回设备详情重试')
        const result = await requestDeviceApi('telemetry/datas/history/pagination', { ...q, page: 1, page_size: 20, export_excel: true })
        const server = String(uni.getStorageSync('serverAddress') || 'https://cloud.thingspanel.cn').replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
        const file = String(result?.filePath || '')
        if (!file || /[\\\r\n]/.test(file) || file.startsWith('//')) throw new Error('导出文件地址无效')
        const url = /^https?:\/\//i.test(file) ? file : server + '/' + file.replace(/^\/+/, '')
        if (!url.startsWith(server + '/')) throw new Error('导出文件地址与当前服务不一致')
        const downloaded = await new Promise((resolve,reject) => uni.downloadFile({ url, success: resolve, fail: () => reject(new Error('文件下载失败，请重试')) }))
        if (downloaded.statusCode !== 200) throw new Error('文件下载失败，请重试')
        await new Promise((resolve,reject) => uni.openDocument({ filePath: downloaded.tempFilePath, showMenu: true, success: resolve, fail: () => reject(new Error('文件无法打开，请重试')) }))
        this.message = '文件已打开，可在文档菜单中保存或分享'
      } catch (cause) { this.message = cause.message || '导出失败，请重试' }
      finally { this.busy = false }
    }
  }
}
</script>
<style scoped>
.export-state { padding:48rpx; text-align:center; color:#657187; font-size:28rpx; line-height:1.8; }
.export-state button { margin-top:24rpx; font-size:28rpx; color:#1677ff; }
</style>
