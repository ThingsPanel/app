<template>
  <view class="web-view-page">
    <web-view v-if="url" :src="url" :style="{ width: '100%', height: '100%' }" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: '',
      pageTitle: ''
    }
  },
  onLoad(options) {
    const decodedUrl = decodeURIComponent(options.url || '')
    const lang = uni.getStorageSync('language')
    const separator = decodedUrl.includes('?') ? '&' : '?'
    this.url = `${decodedUrl}${separator}lang=${lang}`
    this.pageTitle = options.title ? decodeURIComponent(options.title) : ''
    this.applyNavTitle()
  },
  onShow() {
    this.applyNavTitle()
  },
  methods: {
    applyNavTitle() {
      if (!this.pageTitle) return
      this.$nextTick(() => {
        setTimeout(() => {
          uni.setNavigationBarTitle({
            title: this.pageTitle
          })
        }, 100)
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
