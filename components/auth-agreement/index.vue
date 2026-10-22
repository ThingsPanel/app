<template>
  <view class="agreement">
    <view class="agreement-row">
      <checkbox-group class="agreement-control" @change="$emit('update:modelValue', $event.detail.value.includes('agree'))">
        <label class="agreement-check"><checkbox value="agree" :checked="modelValue" color="#1677ff" aria-label="同意用户服务协议和隐私政策" /></label>
      </checkbox-group>
      <view class="agreement-copy">
        <text @tap="$emit('update:modelValue', !modelValue)">我已阅读并同意</text><text class="agreement-link" @tap.stop="openAgreement('terms')">《用户服务协议》</text><text>和</text><text class="agreement-link" @tap.stop="openAgreement('privacy')">《隐私政策》</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: { modelValue: { type: Boolean, default: false } },
  emits: ['update:modelValue'],
  methods: {
    openAgreement(type) {
      uni.navigateTo({ url: `/pages/web-view/legal?type=${type === 'privacy' ? 'privacy' : 'terms'}` })
    }
  }
}
</script>

<style scoped>
.agreement { width: 100%; box-sizing: border-box; margin: 12px 0 0; }
.agreement-row { display: flex; width: 100%; align-items: flex-start; }
/* Global checkbox-group styles use width:100%; constrain this flex item. */
.agreement-control { flex: 0 0 24px; width: 24px; min-width: 24px; }
.agreement-check { display: flex; align-items: center; justify-content: flex-start; width: 24px; height: 40px; margin: 0; padding: 0; box-sizing: border-box; }
.agreement-check checkbox { flex-shrink: 0; margin: 0; transform: scale(.54); transform-origin: left center; }
.agreement-copy { flex: 1 1 0%; width: 0; min-width: 0; padding-top: 9px; font-size: 13px; line-height: 22px; color: #626b80; white-space: normal; }
.agreement-link { color: #1677ff; }
</style>
