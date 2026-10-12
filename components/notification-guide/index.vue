<template>
  <view v-if="native && loggedIn" class="notification-guide">
    <view v-if="!compact || showGuide" class="notification-card">
      <view class="notification-copy"><text class="notification-title">{{ $t('notificationGuide.' + (authorized ? 'enabledTitle' : 'title')) }}</text><text class="notification-description">{{ $t('notificationGuide.description') }}</text></view>
      <view v-if="!compact" class="notification-status"><text>{{ $t('notificationGuide.permission') }}</text><text>{{ $t('notificationGuide.' + statusKey) }}</text></view>
      <view class="notification-actions">
        <button v-if="compact" class="notification-later" @click="dismiss">{{ $t('notificationGuide.later') }}</button>
        <button v-if="authorized && !compact" :disabled="busy" class="notification-primary" @click="testNotification">{{ $t('notificationGuide.test') }}</button>
        <button v-else :disabled="busy" class="notification-primary" @click="openSettings">{{ $t('notificationGuide.' + (permission === 'not determined' ? 'continue' : 'settings')) }}</button>
      </view>
      <button v-if="authorized && !compact" class="notification-settings" :disabled="busy" @click="openSettings">{{ $t('notificationGuide.manage') }}</button>
      <text v-if="feedback" class="notification-feedback" role="status">{{ feedback }}</text>
      <text v-if="!compact" class="notification-note">{{ $t('notificationGuide.note') }}</text>
    </view>
  </view>
</template>
<script>
import { notificationPermission, enableNotifications, registerNotificationDevice, logNotificationError } from '@/services/notification-permission'
export default {
  props: { compact: Boolean },
  data() { return { native: false, permission: 'unknown', loggedIn: false, dismissed: false, busy: false, feedback: '' } },
  computed: {
    authorized() { return this.permission === 'authorized' },
    statusKey() { return { authorized: 'enabled', denied: 'disabled', 'not determined': 'undetermined' }[this.permission] || 'unknown' },
    showGuide() { return !this.dismissed && ['denied', 'not determined'].includes(this.permission) }
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
      this.dismissed = Boolean(uni.getStorageSync('notification-guide-dismissed'))
      if (this.loggedIn && this.permission === 'authorized') {
        registerNotificationDevice().catch(logNotificationError)
      }
    },
    dismiss() { uni.setStorageSync('notification-guide-dismissed', true); this.dismissed = true },
    async openSettings() {
      if (this.busy) return
      this.busy = true; this.feedback = ''
      try { await enableNotifications() }
      catch (error) { logNotificationError(error); this.feedback = this.$t('notificationGuide.settingsFailed') }
      finally { this.busy = false; this.refresh() }
    },
    testNotification() {
      if (this.busy) return
      this.refresh()
      if (!this.authorized) return
      this.busy = true; this.feedback = ''
      const finish = () => { this.busy = false }
      try { uni.createPushMessage({
        title: 'ThingsPanel', content: this.$t('notificationGuide.testContent'), payload: { notification_test: true },
        success: () => { this.feedback = this.$t('notificationGuide.testCreated'); finish() },
        fail: error => { logNotificationError(error); this.feedback = this.$t('notificationGuide.testFailed') + ' ' + (error?.errMsg || error?.message || ''); finish() }
      }) } catch (error) { logNotificationError(error); this.feedback = this.$t('notificationGuide.testFailed'); finish() }
    }
  }
}
</script>
<style scoped>
.notification-card { margin:16px 0; padding:20px 16px; border-radius:12px; background:#fff; color:#1d1d1f; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
.notification-copy { display:flex; flex-direction:column; gap:8px; }
.notification-title { font-size:17px; font-weight:600; line-height:24px; }
.notification-description { font-size:14px; line-height:21px; color:#73737d; }
.notification-status { display:flex; justify-content:space-between; gap:12px; padding:16px 0; margin-top:8px; border-bottom:1px solid #edf1f6; font-size:14px; }
.notification-actions { display:flex; align-items:center; justify-content:flex-end; gap:12px; margin-top:16px; }
.notification-actions button,.notification-settings { margin:0; min-height:44px; padding:0 18px; font-size:15px; line-height:44px; font-family:inherit; border-radius:10px; }
.notification-actions button::after,.notification-settings::after { border:0; }
.notification-primary { background:var(--tp-color-primary,#1677ff); color:white; }
.notification-later,.notification-settings { background:transparent; color:var(--tp-color-primary,#1677ff); }
.notification-settings { display:block; margin:8px auto 0; }
.notification-note,.notification-feedback { display:block; margin-top:14px; color:#73737d; font-size:12px; line-height:19px; }
.notification-feedback { color:var(--tp-color-primary,#1677ff); font-size:14px; }
button:focus-visible { outline:2px solid var(--tp-color-primary,#1677ff); outline-offset:2px; }
button[disabled] { opacity:.5; }
</style>
