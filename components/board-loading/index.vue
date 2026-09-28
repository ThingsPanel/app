<template>
  <view class="board-loading" :class="{ dark, leaving: !active }" :style="{ background }" role="status" aria-label="正在加载看板" :aria-busy="active">
    <view v-if="visible" class="loading-status">
      <view class="loading-spinner" aria-hidden="true">
        <view v-for="segment in 12" :key="segment" class="loading-spoke" :style="{ transform: 'rotate(' + (segment - 1) * 30 + 'deg)', animationDelay: ((segment - 1) / 12 - 1) + 's' }" />
      </view>
      <text v-if="slow" class="loading-caption">正在准备看板，请稍候…</text>
    </view>
  </view>
</template>
<script>
export default {
  props: { background: { type: String, default: '#ffffff' }, dark: Boolean, active: { type: Boolean, default: true } },
  data() { return { visible: false, slow: false } },
  mounted() {
    this.showTimer = setTimeout(() => { this.visible = true }, 300)
    this.slowTimer = setTimeout(() => { this.slow = true }, 3000)
  },
  beforeUnmount() { clearTimeout(this.showTimer); clearTimeout(this.slowTimer) }
}
</script>
<style scoped>
.board-loading { position:absolute; inset:0; z-index:2; overflow:hidden; color:#51515c; opacity:1; transition:opacity .18s ease-out; }
.board-loading.leaving { opacity:0; pointer-events:none; }
.loading-status { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:13px; white-space:nowrap; }
.loading-spinner { position:relative; flex:0 0 18px; width:18px; height:18px; color:#737780; }
.loading-spoke { position:absolute; top:0; left:8px; width:2px; height:5px; border-radius:1px; background:currentColor; transform-origin:1px 9px; opacity:.25; animation:loading-spoke 1s linear infinite; }
.loading-caption { position:absolute; top:calc(50% + 20px); left:0; right:0; text-align:center; }
.dark { color:#d0d5df; }
.dark .loading-spinner { color:#a4a9b2; }
@keyframes loading-spoke { from { opacity:1; } to { opacity:.25; } }
@media(prefers-reduced-motion:reduce) { .loading-spoke { animation:none; opacity:.65; } .board-loading { transition:none; } }
</style>
