<template>
  <view class="app-search-bar">
    <view class="app-search-field">
      <image class="app-search-icon" src="/static/icon/device-search.svg" mode="aspectFit" />
      <input class="app-search-input" :value="modelValue" :disabled="disabled" :placeholder="placeholder" :aria-label="placeholder" placeholder-class="app-search-placeholder" confirm-type="search" @input="onInput" @confirm="$emit('search', $event)" />
      <button v-if="clearable && modelValue" class="app-search-clear" :disabled="disabled" :aria-label="$t('pages.devices.clear')" @click="clear">×</button>
    </view>
    <button v-if="actionLabel" class="app-search-action" :disabled="disabled" @click="$emit('action')">
      <image v-if="actionIcon" class="app-search-action-icon" :src="actionIcon" mode="aspectFit" />
      <text>{{ actionLabel }}</text>
    </button>
    <slot />
  </view>
</template>

<script>
export default {
  name: 'AppSearch',
  props: {
    modelValue: { type: String, default: '' },
    modelModifiers: { type: Object, default: () => ({}) },
    placeholder: { type: String, default: '' },
    actionLabel: { type: String, default: '' },
    actionIcon: { type: String, default: '' },
    clearable: { type: Boolean, default: true },
    disabled: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'input', 'search', 'action', 'clear'],
  methods: {
    onInput(event) {
      const value = event.detail.value;
      this.$emit('update:modelValue', this.modelModifiers.trim ? value.trim() : value);
      this.$emit('input', event);
    },
    clear() {
      this.$emit('update:modelValue', '');
      this.$emit('input', { detail: { value: '' } });
      this.$emit('clear');
    }
  }
}
</script>

<style scoped>
.app-search-bar { display:flex; align-items:center; gap:14rpx; width:100%; min-width:0; box-sizing:border-box; }
.app-search-field { display:flex; align-items:center; flex:1; min-width:0; height:56rpx; padding:0 18rpx; box-sizing:border-box; background:#fff; border:0; border-radius:14rpx; }
.app-search-icon { width:24rpx; height:24rpx; flex-shrink:0; opacity:.55; }
.app-search-input { flex:1; min-width:0; height:52rpx; margin:0; padding:0 14rpx; box-sizing:border-box; border:0; border-radius:0; background:transparent; color:#1d1d1f; font-family:inherit; font-size:22rpx; }
.app-search-placeholder { color:#8b95a5; font-family:inherit; font-size:22rpx; }
.app-search-bar .app-search-clear { display:flex; align-items:center; justify-content:center; flex-shrink:0; width:40rpx; height:52rpx; margin:0 -8rpx 0 0; padding:0; background:transparent; border:0; border-radius:0; color:#8b95a5; font-family:inherit; font-size:32rpx; line-height:1; }
.app-search-bar .app-search-action { display:flex; align-items:center; justify-content:center; flex-shrink:0; gap:8rpx; min-width:112rpx; height:56rpx; margin:0; padding:0 14rpx; box-sizing:border-box; background:#fff; border:0; border-radius:14rpx; box-shadow:none; color:#1d1d1f; font-family:inherit; font-size:22rpx; font-weight:400; line-height:32rpx; }
.app-search-clear::after,.app-search-action::after { border:0; }
.app-search-action-icon { width:24rpx; height:24rpx; flex-shrink:0; }
.app-search-action:active { opacity:.7; }
.app-search-action[disabled],.app-search-input[disabled] { opacity:.5; }
</style>
