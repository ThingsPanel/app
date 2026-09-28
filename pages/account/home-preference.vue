<template>
  <view class="preference-page">
    <text class="intro">选择打开 App 和点击“首页”时显示的内容。</text>
    <view v-if="loading" class="state">正在读取首页设置…</view>
    <view v-else-if="error" class="state"><text>{{ error }}</text><button @click="load">重试</button></view>
    <template v-else>
      <view class="options">
        <button class="option" :aria-pressed="!home" @click="restore">
          <view class="radio" :class="{ selected: !home }" /><view class="copy"><text class="label">系统默认首页</text><text class="description">设备概览、告警动态与快捷入口</text></view><text v-if="!home" class="current">已选择</text>
        </button>
        <button class="option" :aria-pressed="Boolean(home)" @click="$refs.picker.open()">
          <view class="radio" :class="{ selected: home }" /><view class="copy"><text class="label">指定看板</text><text class="description">{{ home?.name || '选择经常查看的看板' }}</text></view><view class="chevron" />
        </button>
      </view>
      <button v-if="home" class="restore" @click="restore">恢复系统默认首页</button>
      <text class="hint">仅对当前账号在这台设备上的 App 生效，不影响其他人或网页版。</text>
    </template>
    <BoardPicker ref="picker" title="选择首页看板" :current-id="home?.id || ''" @select="select" />
  </view>
</template>
<script>
import BoardPicker from '@/components/board-picker/index.vue'
import { openHomePreference } from '@/services/dashboard-home'
export default {
  components: { BoardPicker },
  data() { return { home: null, loading: true, error: '' } },
  onLoad() { this.load() },
  onUnload() { this.disposed = true },
  onBackPress() { if (this.$refs.picker?.opened) { this.$refs.picker.close(); return true } return false },
  methods: {
    async load() {
      this.loading = true; this.error = ''
      try { this.preference = await openHomePreference(); if (!this.disposed) this.home = this.preference.read() }
      catch (error) { if (!this.disposed) this.error = error.message }
      finally { if (!this.disposed) this.loading = false }
    },
    select(board) {
      try { this.preference.save(board); this.home = this.preference.read(); uni.showToast({ title: '已更新我的首页', icon: 'none' }) }
      catch (error) { uni.showToast({ title: error.message, icon: 'none' }) }
    },
    restore() {
      if (!this.home) return
      try { this.preference.reset(); this.home = null; uni.showToast({ title: '已恢复系统默认首页', icon: 'none' }) }
      catch (error) { uni.showToast({ title: error.message, icon: 'none' }) }
    }
  }
}
</script>
<style scoped>
.preference-page { --account-radius:12rpx; min-height:100vh; box-sizing:border-box; padding:24rpx 28rpx calc(36rpx + env(safe-area-inset-bottom)); background:#f2f2f7; color:#1d1d1f; font-family:inherit; }
.intro,.hint { display:block; color:#73737d; font-size:22rpx; line-height:32rpx; padding:0 2rpx; margin-bottom:18rpx; }
.hint { margin-top:18rpx; }
.options { padding:0 24rpx; background:#fff; border-radius:var(--account-radius); box-shadow:none; overflow:hidden; }
.preference-page button { margin:0; min-height:44px; border:0; border-radius:0; font-family:inherit; font-size:24rpx; font-weight:400; }
.preference-page button::after { border:0; }
.preference-page .option { display:flex; align-items:center; gap:16rpx; width:100%; min-height:84rpx; padding:18rpx 0; box-sizing:border-box; text-align:left; background:transparent; line-height:36rpx; }
.preference-page .option + .option { border-top:1rpx solid #edf1f6; }
.copy { flex:1; min-width:0; }
.label { display:block; font-size:24rpx; color:#5f5f6b; }
.description { display:block; margin-top:4rpx; color:#73737d; font-size:22rpx; line-height:32rpx; overflow-wrap:anywhere; }
.radio { flex-shrink:0; width:28rpx; height:28rpx; box-sizing:border-box; border:1px solid #b8c0cc; border-radius:50%; }
.radio.selected { border:4px solid var(--tp-color-primary,#1677ff); }
.current { flex-shrink:0; color:var(--tp-color-primary,#1677ff); font-size:22rpx; }
.chevron { width:5px; height:5px; border-top:1.5px solid #9ba8ba; border-right:1.5px solid #9ba8ba; transform:rotate(45deg); margin-right:2px; flex-shrink:0; }
.preference-page .restore { margin-top:24rpx; height:84rpx; line-height:84rpx; padding:0 24rpx; color:var(--tp-color-primary,#1677ff); background:#fff; border-radius:var(--account-radius); font-size:24rpx; box-shadow:none; }
.state { padding:48rpx 24rpx; text-align:center; font-size:24rpx; line-height:36rpx; color:#73737d; }
.state button { color:var(--tp-color-primary,#1677ff); }
</style>
