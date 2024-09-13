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
  onLoad(options) {
    this.url = decodeURIComponent(options.url);
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