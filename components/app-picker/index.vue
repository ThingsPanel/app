<template>
  <view class="app-picker">
    <view role="button" :aria-label="title" :aria-disabled="disabled" tabindex="0" @click="open" @keydown.enter.prevent="open" @keydown.space.prevent="open"><slot /></view>
    <uni-popup ref="popup" type="bottom" background-color="#fff" :safe-area="false" @change="popupChanged">
      <view class="app-choice" role="dialog" :aria-label="title">
        <view class="app-choice__header">
          <button class="app-choice__action" @click="cancel">取消</button>
          <text class="app-choice__title">{{ title }}</text>
          <button class="app-choice__action app-choice__confirm" :disabled="!range.length" @click="confirm">完成</button>
        </view>
        <scroll-view scroll-y :show-scrollbar="false" class="app-choice__list app-sheet-scroll" :style="{ height: Math.min(range.length * 104, 624) + 'rpx' }" :scroll-into-view="selectedId">
          <button v-for="(option, index) in range" :id="`${id}-${index}`" :key="index" class="app-choice__option" :class="{ 'is-selected': draft === index }" :aria-pressed="draft === index" @click="draft = index">
            <text>{{ label(option) }}</text><text v-if="draft === index" class="app-choice__check">✓</text>
          </button>
        </scroll-view>
        <text v-if="!range.length" class="app-choice__empty">暂无可选项</text>
      </view>
    </uni-popup>
  </view>
</template>

<script>
let sequence = 0
export default {
  name: 'AppPicker',
  props: {
    range: { type: Array, default: () => [] },
    rangeKey: { type: String, default: '' },
    value: { type: [Number, String], default: 0 },
    disabled: Boolean,
    title: { type: String, default: '请选择' },
    mode: { type: String, default: 'selector' }
  },
  emits: ['change', 'cancel'],
  data() { return { draft: 0, id: `app-choice-${++sequence}`, selectedId: '', committed: false, opened: false } },
  methods: {
    label(option) { return this.rangeKey ? option?.[this.rangeKey] : option },
    open() {
      if (this.disabled) return
      this.draft = Math.max(0, Math.min(Number(this.value) || 0, this.range.length - 1))
      this.committed = false; this.opened = true
      this.$refs.popup.open()
      this.$nextTick(() => { this.selectedId = `${this.id}-${this.draft}` })
    },
    cancel() { this.$refs.popup.close() },
    confirm() {
      if (!this.range.length) return
      this.committed = true
      this.$emit('change', { detail: { value: this.draft } })
      this.$refs.popup.close()
    },
    popupChanged(event) {
      if (!event.show && this.opened) {
        if (!this.committed) this.$emit('cancel')
        this.opened = false; this.selectedId = ''
      }
    }
  }
}
</script>

<style scoped>
.app-picker { min-width:0; }
.app-choice { padding-bottom:calc(24rpx + env(safe-area-inset-bottom)); color:var(--sheet-text); font-family:var(--sheet-font); }
.app-choice__header { display:grid; grid-template-columns:120rpx minmax(0,1fr) 120rpx; align-items:center; min-height:104rpx; padding:0 24rpx; border-bottom:2rpx solid var(--sheet-divider); }
.app-choice__title { font-size:32rpx; font-weight:600; text-align:center; }
.app-choice button { margin:0; border:0; border-radius:0; background:transparent; font-family:inherit; box-shadow:none; }
.app-choice button::after { border:0; }
.app-choice__action { padding:0; font-size:28rpx; line-height:96rpx; color:var(--sheet-muted); }
.app-choice__confirm { color:var(--sheet-accent); font-weight:600; }
.app-choice__confirm[disabled] { color:#98a2b3; }
.app-choice__list { max-height:45vh; }
.app-choice .app-choice__option { display:flex; align-items:center; justify-content:space-between; gap:32rpx; width:100%; min-height:104rpx; padding:24rpx 40rpx; font-size:30rpx; line-height:56rpx; text-align:left; color:var(--sheet-text); }
.app-choice text { font-family:inherit; }
.app-choice__option text:first-child { overflow-wrap:anywhere; }
.app-choice .app-choice__option.is-selected { color:var(--sheet-accent); background:#f0f6ff; font-weight:500; }
.app-choice__check { flex-shrink:0; font-size:36rpx; }
.app-choice__empty { display:block; padding:56rpx; text-align:center; color:var(--sheet-muted); font-size:28rpx; }
.app-choice button:focus-visible { outline:4rpx solid var(--sheet-accent); outline-offset:-6rpx; }
</style>
