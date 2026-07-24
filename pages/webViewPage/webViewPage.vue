<template>
  <view class="web-view-page">
    <web-view
      v-if="url"
      :src="url"
      :style="{ width: '100%', height: '100%' }"
      @load="applyNavTitle"
    />
  </view>
</template>

<script>
function safeDecodeRouteValue(value) {
  let decoded = String(value || '')
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(decoded)
      if (next === decoded) break
      decoded = next
    } catch (error) {
      break
    }
  }
  return decoded
}

export default {
  data() {
    return {
      url: '',
      pageTitle: '',
      isLandscape: false
    }
  },
  onLoad(options) {
    const decodedUrl = safeDecodeRouteValue(options.url)
    const lang = uni.getStorageSync('language')
    const separator = decodedUrl.includes('?') ? '&' : '?'
    this.url = `${decodedUrl}${separator}lang=${lang}`
    this.pageTitle = options.title ? safeDecodeRouteValue(options.title) : ''
    this.applyNavTitle()
  },
  onShow() {
    this.applyNavTitle()
  },
  onNavigationBarButtonTap(event) {
    if (event.index === 0) {
      this.toggleOrientation()
    }
  },
  onUnload() {
    this.restorePortrait()
  },
  methods: {
    resolveNavTitle() {
      return this.pageTitle || this.$t('pages.deviceDetailTitle')
    },
    applyNavTitle() {
      this.$nextTick(() => {
        setTimeout(() => {
          uni.setNavigationBarTitle({
            title: this.resolveNavTitle()
          })
        }, 100)
      })
    },
    toggleOrientation() {
      // #ifdef APP-PLUS
      this.isLandscape = !this.isLandscape
      plus.screen.lockOrientation(this.isLandscape ? 'landscape-primary' : 'portrait-primary')
      // #endif
    },
    restorePortrait() {
      // #ifdef APP-PLUS
      if (this.isLandscape) {
        plus.screen.lockOrientation('portrait-primary')
      }
      this.isLandscape = false
      // #endif
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
body.pages-webViewPage-webViewPage uni-page-body {
  height: calc(100vh - 44px);
}

body.pages-webViewPage-webViewPage .web-view-page {
  height: 100%;
}
/* #endif */
</style>
