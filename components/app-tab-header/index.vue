<template>
  <view class="tab-heading" :class="{ 'tab-heading-inset': inset }" :style="platformHeaderStyle">
    <!-- #ifdef MP-WEIXIN -->
    <view class="mp-heading-row">
      <text class="mp-heading-title">{{ title }}</text>
      <text v-if="meta && !metaBelow" class="mp-heading-meta">{{ meta }}</text>
    </view>
    <view v-if="subtitle || (metaBelow && meta) || $slots.default" class="mp-heading-toolbar">
      <text class="mp-heading-subtitle">{{ subtitle || (metaBelow ? meta : '') }}</text>
      <view class="tab-heading-actions"><slot /></view>
    </view>
    <!-- #endif -->
    <!-- #ifndef MP-WEIXIN -->
    <view class="tab-heading-row">
      <view class="tab-heading-copy">
        <text class="tab-heading-title">{{ title }}</text>
        <text v-if="meta" class="tab-heading-meta">{{ meta }}</text>
      </view>
      <view class="tab-heading-actions"><slot /></view>
    </view>
    <view v-if="subtitle" class="tab-heading-subtitle">{{ subtitle }}</view>
    <!-- #endif -->
  </view>
</template>

<script>
// #ifdef MP-WEIXIN
import { calculateMpHeaderLayout } from '@/utils/mp-header-inset'
function getHeaderStyle() {
  const windowInfo = uni.getWindowInfo()
  let capsule = {}
  try { capsule = uni.getMenuButtonBoundingClientRect() || {} } catch { /* Use the standard navigation band. */ }
  return calculateMpHeaderLayout(windowInfo, capsule)
}
// #endif
export default {
  data() {
    let platformHeaderStyle = {}
    // #ifdef MP-WEIXIN
    platformHeaderStyle = getHeaderStyle()
    // #endif
    return { platformHeaderStyle }
  },
  mounted() {
    // #ifdef MP-WEIXIN
    this.updateHeaderInset = () => { this.platformHeaderStyle = getHeaderStyle() }
    uni.onWindowResize(this.updateHeaderInset)
    // #endif
  },
  beforeUnmount() {
    // #ifdef MP-WEIXIN
    uni.offWindowResize(this.updateHeaderInset)
    // #endif
  },
  props: {
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    meta: { type: String, default: '' },
    inset: Boolean,
    metaBelow: Boolean
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
/* #ifdef MP-WEIXIN */
.tab-heading { padding-bottom:16rpx; }
.mp-heading-row { display:flex; align-items:center; gap:12rpx; height:var(--mp-heading-height); padding-right:var(--mp-heading-right); margin-right:-28rpx; min-width:0; }
.mp-heading-title { font-size:36rpx; font-weight:600; line-height:48rpx; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.mp-heading-meta { flex-shrink:0; color:#73737d; font-size:22rpx; }
.mp-heading-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12rpx; min-height:64rpx; margin-top:8rpx; }
.mp-heading-subtitle { min-width:0; color:#73737d; font-size:22rpx; line-height:32rpx; }
/* #endif */
</style>
