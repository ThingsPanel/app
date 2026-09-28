<template>
  <view v-if="showValue" class="app-dialog-mask" @touchmove.stop.prevent @click.stop="cancel(2)">
    <view class="app-dialog" role="dialog" aria-modal="true" :aria-label="settings.title" @click.stop>
      <slot name="title"><view v-if="settings.title" class="app-dialog-title">{{ settings.title }}</view></slot>
      <view class="app-dialog-body">
        <slot name="text"><text v-if="settings.text" class="app-dialog-copy">{{ settings.text }}</text></slot>
      </view>
      <view class="app-dialog-actions">
        <button v-if="!settings.noCancel" class="app-dialog-button" :style="cancelStyle" :disabled="loading" hover-class="app-dialog-pressed" @click="cancel(1)">{{ settings.cancelText }}</button>
        <button class="app-dialog-button app-dialog-confirm" :class="{ 'app-dialog-danger': settings.danger }" :style="confirmStyle" :disabled="loading" :loading="loading" hover-class="app-dialog-pressed" @click="confirm">{{ settings.confirmText }}</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ConfirmationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    title: { type: String, default: '提示' },
    text: { type: String, default: '' },
    noCancel: { type: Boolean, default: false },
    cancelText: { type: String, default: '取消' },
    confirmText: { type: String, default: '确定' },
    cancelStyle: { type: [String, Object] },
    confirmStyle: { type: [String, Object] },
    prevent: { type: Boolean, default: true },
    danger: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    autoClose: { type: Boolean, default: true }
  },
  emits: ['update:modelValue', 'confirm', 'cancel', 'event'],
  data() { return { showValue: this.modelValue, request: null } },
  computed: {
    settings() {
      const options = this.request
      return options ? {
        title: options.title || this.title,
        text: options.content || '',
        noCancel: options.showCancel === false,
        cancelText: options.cancelText || this.cancelText,
        confirmText: options.confirmText || this.confirmText,
        danger: options.danger ?? this.danger
      } : this
    }
  },
  watch: {
    modelValue(value) { this.showValue = value },
    showValue(value) { this.$emit('update:modelValue', value) }
  },
  methods: {
    // Imperative entry for confirmations opened from menus and list actions.
    open(options = {}) { this.request = options; this.showValue = true },
    settle(result) {
      const request = this.request
      this.request = null
      if (request) {
        try { request.success?.(result) } finally { request.complete?.(result) }
      }
    },
    confirm() {
      if (this.loading) return
      if (this.autoClose) this.showValue = false
      const result = { from: 'confirm', confirm: true, cancel: false }
      this.$emit('confirm', result)
      this.$emit('event', result)
      this.settle(result)
    },
    cancel(type) {
      if (this.loading || (this.prevent && type === 2)) return
      this.showValue = false
      const result = { from: type === 1 ? 'cancel' : 'mask', confirm: false, cancel: true }
      this.$emit('cancel', result)
      this.$emit('event', result)
      this.settle(result)
    }
  }
}
</script>
