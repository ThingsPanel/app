<template>
  <view class="notification-page"><NotificationGuide /></view>
</template>
<script>
import NotificationGuide from '@/components/notification-guide/index.vue'
export default {
  components: { NotificationGuide },
  onShow() {
    uni.setNavigationBarTitle({ title: this.$t('notificationGuide.pageTitle') })
    this.$nextTick(() => uni.$emit('notification-permission-refresh'))
  }
}
</script>
<style scoped>
.notification-page { min-height:100vh; box-sizing:border-box; padding:24rpx 28rpx; background:#F2F2F7; }
</style>
