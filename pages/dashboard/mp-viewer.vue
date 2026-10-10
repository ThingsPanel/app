<template>
  <web-view v-if="url" :src="url" @load="applyTitle" @error="viewerError" />
  <view v-else class="viewer-state">
    <text>{{ error || '正在打开看板…' }}</text>
    <button v-if="error" @click="load">重试</button>
  </view>
</template>
<script>
import { createBoardsClient } from '@/api/modules/boards'
import { buildMpBoardViewerUrl } from '@/utils/mp-board-viewer'
export default {
  data() { return { id: '', name: '看板', url: '', error: '', generation: 0, disposed: false } },
  onLoad(options) {
    this.id = options.id || ''
    this.name = options.name || '看板'
    this.applyTitle()
    this.load()
  },
  onUnload() { this.disposed = true; this.generation++; this.url = '' },
  methods: {
    // 微信会用网页 document.title 更新导航栏；加载完成后恢复看板名称。
    applyTitle() {
      if (!this.disposed) uni.setNavigationBarTitle({ title: this.name })
    },
    async load() {
      const generation = ++this.generation
      this.url = ''; this.error = ''
      try {
        if (!this.id) throw new Error('缺少看板编号，请返回列表重新打开')
        const preview = await createBoardsClient().preview(this.id)
        if (this.disposed || generation !== this.generation) return
        this.name = preview.dashboard?.name || this.name
        this.applyTitle()
        this.url = buildMpBoardViewerUrl(this.id, preview)
      } catch (error) {
        if (!this.disposed && generation === this.generation) this.error = error.message || '无法打开看板，请重试'
      }
    },
    viewerError() {
      this.generation++
      this.url = ''
      this.error = '看板网页加载失败，请检查网络及微信业务域名配置'
    }
  }
}
</script>
<style scoped>
.viewer-state { min-height:80vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:24rpx; padding:40rpx; color:#73737d; font-size:28rpx; text-align:center; }
.viewer-state button { font-size:28rpx; color:#1677ff; }
</style>
