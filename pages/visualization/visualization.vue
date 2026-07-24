<template>
  <view class="web-view-page">
    <web-view v-if="url" :src="url" :style="{ width: '100%', height: '100%' }" @message="handleWebViewMessage" />
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
    // #ifdef H5
    window.addEventListener('message', this.handleWindowMessage)
    // #endif
  },
  onUnload() {
    // #ifdef H5
    window.removeEventListener('message', this.handleWindowMessage)
    // #endif
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
      const statusBarHeight = uni.getSystemInfoSync().statusBarHeight || 0
      this.url = buildWebViewUrl('/visualization-app', {
        token,
        lang,
        statusBarHeight
      })
    },
    handleWebViewMessage(event) {
      const messages = event?.detail?.data
      if (!Array.isArray(messages)) return
      messages.forEach(message => this.openSubWebViewPage(message))
    },
    handleWindowMessage(event) {
      this.openSubWebViewPage(event?.data)
    },
    openSubWebViewPage(message) {
      if (!message || message.type !== 'tp:open-webview-page' || !message.url) return

      const query = [`url=${encodeURIComponent(message.url)}`]
      if (message.title) {
        query.push(`title=${encodeURIComponent(message.title)}`)
      }

      uni.navigateTo({
        url: `/pages/webViewPage/webViewPage?${query.join('&')}`
      })
    }
  }
}
</script>

<style scoped>
.web-view-page {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}
</style>

<style>
/* #ifdef H5 */
body.pages-visualization-visualization uni-page-body {
  height: calc(100vh - 44px - var(--window-bottom, 0px));
}

body.pages-visualization-visualization .web-view-page {
  height: 100%;
}
/* #endif */
</style>
