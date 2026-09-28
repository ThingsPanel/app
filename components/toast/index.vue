<template><view v-if="false" /></template>

<script>
// Compatibility wrapper: legacy pages now use the same toast as newer pages.
export default {
  name: 'AppToast',
  props: {
    msg: { type: String, default: '' },
    icon: { type: String, default: '' },
    direction: { type: String, default: 'col' },
    location: { type: String, default: 'middle' },
    duration: { type: Number, default: 2000 }
  },
  beforeUnmount() { this.finishPending() },
  methods: {
    finishPending() {
      clearTimeout(this.timer)
      this.resolvePending?.()
      this.resolvePending = null
    },
    show() {
      this.finishPending()
      uni.showToast({ title: this.msg, icon: 'none', ...(this.icon ? { image: this.icon } : {}), duration: this.duration })
      return new Promise(resolve => {
        this.resolvePending = resolve
        this.timer = setTimeout(() => this.finishPending(), this.duration)
      })
    }
  }
}
</script>
