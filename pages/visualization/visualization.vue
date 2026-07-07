<template>
  <view class="web-view-page">
    <web-view v-if="url" :src="url" :style="{ width: '100%', height: '100%' }" />
  </view>
</template>

<script>
import { buildWebViewUrl } from '@/common/platformWeb.js'

export default {
  data() {
    return {
      url: ''
    }
  },
  onLoad() {
    this.setNavTitle()
  },
  onShow() {
    this.refreshWebViewUrl()
    this.setNavTitle()
  },
  methods: {
    setNavTitle() {
      this.$nextTick(() => {
        setTimeout(() => {
          uni.setNavigationBarTitle({
            title: this.$t('pages.visualizationTitle')
          })
        }, 100)
      })
    },
    refreshWebViewUrl() {
      const token = uni.getStorageSync('access_token')
      const lang = uni.getStorageSync('language')
      this.url = buildWebViewUrl('/visualization-app', {
        token,
        lang
      })
    }
  }
}
</script>

<style scoped>
.web-view-page {
  width: 100%;
  height: 100%;
}
</style>
