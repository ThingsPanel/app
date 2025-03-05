<template>
  <view class="web-view-page">
    <web-view :src="url" :style="{ width: '100%', height: '100%' }" />
  </view>
</template>

<script>
export default {
  data() {
    return {
      url: ''
    };
  },
  onShow(){
    uni.setNavigationBarTitle({
        title: this.$t('pages.deviceDetailTitle')
      })
  },
  onLoad(options) {
    const decodedUrl = decodeURIComponent(options.url);
    const lang = uni.getStorageSync('language'); // 获取当前系统语言
    
    // 将lang作为参数添加到URL中
    const separator = decodedUrl.includes('?') ? '&' : '?';
    this.url = `${decodedUrl}${separator}lang=${lang}`;
  }
};
</script>

<style scoped>
.web-view-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
</style>
