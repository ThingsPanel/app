<template>
  <view class="web-view-page">
    <web-view
      v-if="url"
      :src="url"
      @message="handleWebViewMessage"
      :style="{ width: '100%', height: '100%' }"
    />
  </view>
</template>

<script>
import { buildWebViewUrl } from '@/common/platformWeb.js'

export default {
  data() {
    return {
      url: '',
      navSyncTimer: null,
      showingNativeNav: true
    }
  },
  onLoad() {
    this.setNavTitle()
  },
  onShow() {
    this.refreshWebViewUrl()
    this.startNavSync()
  },
  onHide() {
    this.stopNavSync()
    this.toggleNativeNav(true)
  },
  onUnload() {
    this.stopNavSync()
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
    getPageWebview() {
      const pages = getCurrentPages()
      const page = pages[pages.length - 1]
      if (!page) return null

      if (typeof page.$getAppWebview === 'function') {
        return page.$getAppWebview()
      }

      if (page.$scope && typeof page.$scope.$getAppWebview === 'function') {
        return page.$scope.$getAppWebview()
      }

      return null
    },
    getEmbeddedWebview() {
      const pageWebview = this.getPageWebview()
      if (!pageWebview || typeof pageWebview.children !== 'function') return null

      const children = pageWebview.children()
      if (!children || !children.length) return null

      for (let i = children.length - 1; i >= 0; i -= 1) {
        const child = children[i]
        if (child && child.getURL) {
          return child
        }
      }

      return children[0]
    },
    toggleNativeNav(show) {
      if (this.showingNativeNav === show) return
      this.showingNativeNav = show

      const title = this.$t('pages.visualizationTitle')

      // #ifdef APP-PLUS
      const pageWebview = this.getPageWebview()
      if (!pageWebview) return

      if (show) {
        pageWebview.setStyle({
          titleNView: {
            backgroundColor: '#FFFFFF',
            titleText: title,
            titleColor: '#000000',
            titleSize: '17px',
            autoBackButton: false
          }
        })
      } else {
        pageWebview.setStyle({
          titleNView: false
        })
      }
      return
      // #endif

      uni.setNavigationBarTitle({
        title: show ? title : '\u200b'
      })
    },
    handleWebViewMessage(event) {
      const messages = event.detail?.data || []
      messages.forEach(item => {
        if (item?.type === 'nativeNav') {
          this.toggleNativeNav(item.show !== false)
        }
      })
    },
    syncEmbeddedView() {
      const embeddedWebview = this.getEmbeddedWebview()
      if (!embeddedWebview) return

      embeddedWebview.evalJS(
        `(function(){try{return window.__getVisualizationView?window.__getVisualizationView():'projects'}catch(e){return 'projects'}})()`,
        result => {
          this.toggleNativeNav(result === 'projects')
        }
      )
    },
    startNavSync() {
      this.stopNavSync()
      this.syncEmbeddedView()

      // #ifdef APP-PLUS
      this.navSyncTimer = setInterval(() => {
        this.syncEmbeddedView()
      }, 400)
      // #endif
    },
    stopNavSync() {
      if (this.navSyncTimer) {
        clearInterval(this.navSyncTimer)
        this.navSyncTimer = null
      }
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
