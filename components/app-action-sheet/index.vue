<template>
  <uni-popup ref="popup" type="bottom" background-color="#fff" :safe-area="false" @change="changed">
    <view class="app-actions" role="dialog" :aria-label="options.title || '操作菜单'">
      <text v-if="options.title" class="app-actions__title">{{ options.title }}</text>
      <scroll-view scroll-y :show-scrollbar="false" class="app-actions__items app-sheet-scroll" :style="{ height: Math.min(items.length * 104, 624) + 'rpx' }">
        <button v-for="(item, index) in items" :key="index" class="app-actions__item" :class="{ danger: options.destructiveIndex === index }" @click="select(index)">{{ item }}</button>
      </scroll-view>
      <view class="app-actions__gap" />
      <button class="app-actions__cancel" @click="cancel">{{ $t('common.cancel') }}</button>
    </view>
  </uni-popup>
</template>
<script>
export default {
  name: 'AppActionSheet',
  data() { return { options: {}, opened: false, settled: false } },
  computed: { items() { return this.options.itemList || [] } },
  methods: {
    open(options = {}) { this.options = options; this.opened = true; this.settled = false; this.$refs.popup.open() },
    select(tapIndex) {
      if (this.settled) return
      this.settled = true
      this.$refs.popup.close()
      const result = { tapIndex, errMsg: 'showActionSheet:ok' }
      this.options.success?.(result); this.options.complete?.(result)
    },
    cancel() { this.$refs.popup.close() },
    changed(event) {
      if (event.show || !this.opened) return
      this.opened = false
      if (this.settled) return
      this.settled = true
      const result = { errMsg: 'showActionSheet:fail cancel' }
      this.options.fail?.(result); this.options.complete?.(result)
    }
  }
}
</script>
<style scoped>
.app-actions { padding-bottom:env(safe-area-inset-bottom); color:var(--sheet-text); background:#fff; font-family:var(--sheet-font); }
.app-actions__title { display:block; padding:28rpx 40rpx; text-align:center; color:var(--sheet-muted); font-size:24rpx; line-height:36rpx; font-family:inherit; border-bottom:1rpx solid var(--sheet-divider); }
.app-actions__items { max-height:50vh; }
.app-actions button { display:flex; align-items:center; justify-content:center; margin:0; padding:24rpx 40rpx; width:100%; min-height:104rpx; box-sizing:border-box; border:0; border-radius:0; box-shadow:none; background:#fff; color:var(--sheet-text); font-family:var(--sheet-font); font-size:28rpx; font-weight:400; line-height:44rpx; }
.app-actions button::after { border:0; }
.app-actions .app-actions__item + .app-actions__item { border-top:1rpx solid var(--sheet-divider); }
.app-actions .danger { color:#d54941; }
.app-actions__gap { height:16rpx; background:#f2f3f5; }
.app-actions button:active { background:#f5f6f8; }
.app-actions button:focus-visible { outline:2rpx solid var(--sheet-accent); outline-offset:-4rpx; }
</style>
