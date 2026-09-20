<template>
  <view class="tab-heading" :class="{ 'tab-heading-inset': inset }">
    <view class="tab-heading-row">
      <view class="tab-heading-copy">
        <text class="tab-heading-title">{{ title }}</text>
        <text v-if="meta" class="tab-heading-meta">{{ meta }}</text>
      </view>
      <view class="tab-heading-actions"><slot /></view>
    </view>
    <view v-if="subtitle" class="tab-heading-subtitle">{{ subtitle }}</view>
  </view>
</template>

<script>
export default {
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    meta: { type: String, default: '' },
    inset: Boolean
  }
}
</script>

<style scoped>
.tab-heading { box-sizing:border-box; margin:0; padding:calc(24rpx + env(safe-area-inset-top)) 28rpx 24rpx; color:#1d1d1f; font-family:inherit; }
.tab-heading-inset { margin-left:-28rpx; margin-right:-28rpx; }
.tab-heading-row { display:flex; align-items:center; justify-content:space-between; height:72rpx; gap:16rpx; }
.tab-heading-copy { display:flex; align-items:baseline; gap:16rpx; min-width:0; }
.tab-heading-title { display:block; margin:0; padding:0; font-size:44rpx; font-weight:600; line-height:60rpx; white-space:nowrap; }
.tab-heading-meta { color:#73737d; font-size:22rpx; font-weight:400; line-height:32rpx; white-space:nowrap; }
.tab-heading-actions { display:flex; align-items:center; flex-shrink:0; }
.tab-heading-subtitle { height:32rpx; margin-top:6rpx; color:#73737d; font-size:22rpx; font-weight:400; line-height:32rpx; }
</style>
