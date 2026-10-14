<template>
  <view v-if="native && loggedIn" class="notification-guide">
    <button v-if="entry" class="notification-row entry-row" @click="openDetail">
      <text class="row-label">{{ $t('notificationGuide.pageTitle') }}</text>
      <text class="row-value" :class="{ actionable: !authorized }">{{ $t('notificationGuide.' + statusKey) }}</text>
      <view class="chevron" />
    </button>
    <view v-else class="notification-detail">
      <view class="notification-group">
        <button class="notification-row" :disabled="busy" @click="openSettings">
          <text>{{ $t('notificationGuide.permission') }}</text>
          <text class="row-value" :class="{ actionable: !authorized }">{{ $t('notificationGuide.' + statusKey) }}</text>
          <view class="chevron" />
        </button>
      </view>
      <text class="notification-note">{{ $t('notificationGuide.permissionHint') }}</text>
      <text v-if="feedback" class="notification-feedback" role="status">{{ feedback }}</text>
    </view>
  </view>
</template>
<script>
import { notificationPermission, enableNotifications, registerNotificationDevice, logNotificationError } from '@/services/notification-permission'
export default {
  props: { entry: Boolean },
  data() { return { native: false, permission: 'unknown', loggedIn: false, busy: false, feedback: '' } },
  computed: {
    authorized() { return this.permission === 'authorized' },
    statusKey() { return { authorized: 'enabled', denied: 'disabled', 'not determined': 'disabled' }[this.permission] || 'unknown' }
  },
  mounted() {
    // #ifdef APP-PLUS
    this.native = true
    this.refresh()
    uni.$on('notification-permission-refresh', this.refresh)
    // #endif
  },
  beforeUnmount() { if (this.native) uni.$off('notification-permission-refresh', this.refresh) },
  methods: {
    refresh() {
      this.loggedIn = Boolean(uni.getStorageSync('access_token'))
      this.permission = notificationPermission()
      if (this.loggedIn && this.permission === 'authorized') {
        registerNotificationDevice().catch(logNotificationError)
      }
    },
    openDetail() { uni.navigateTo({ url: '/pages/account/notifications' }) },
    async openSettings() {
      if (this.busy) return
      this.busy = true; this.feedback = ''
      try { await enableNotifications() }
      catch (error) { logNotificationError(error); this.feedback = this.$t('notificationGuide.settingsFailed') }
      finally { this.busy = false; this.refresh() }
    }

  }
}
</script>
<style scoped>
.notification-row { display:flex; align-items:center; gap:16rpx; width:100%; min-height:88rpx; margin:0; padding:20rpx 24rpx; box-sizing:border-box; background:#fff; color:#1d1d1f; text-align:left; font-family:inherit; font-size:26rpx; line-height:38rpx; border-radius:12rpx; }
.notification-row::after { border:0; }
.entry-row { padding:18rpx 0; min-height:84rpx; font-size:24rpx; line-height:36rpx; border-radius:0; border-bottom:1rpx solid #edf1f6; }
.row-label { color:#5f5f6b; }
.row-value { flex:1; min-width:0; text-align:right; color:#73737d; }
.actionable { color:var(--tp-color-primary,#1677ff); }
.chevron { width:5px; height:5px; border-top:1.5px solid #9ba8ba; border-right:1.5px solid #9ba8ba; transform:rotate(45deg); margin-left:auto; margin-right:2px; flex-shrink:0; }
.notification-group { overflow:hidden; border-radius:12rpx; background:#fff; }
.notification-note,.notification-feedback { display:block; margin:14rpx 24rpx 0; color:#73737d; font-size:24rpx; line-height:36rpx; }
.notification-feedback { color:var(--tp-color-primary,#1677ff); }
button:focus-visible { outline:2px solid var(--tp-color-primary,#1677ff); outline-offset:2px; }
button[disabled] { opacity:.5; }
</style>
