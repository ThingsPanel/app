<template>
  <view class="board-loading" :class="{ dark }" :style="{ background }" role="status" aria-label="正在加载看板" aria-busy="true">
    <image v-if="previewUrl && !failed" class="board-preview" :src="previewUrl" mode="aspectFit" @load="visible = true" @error="failed = true" />
    <view class="loading-status" :class="{ 'with-preview': visible && !failed }"><view class="loading-spinner" /><text>{{ visible && !failed ? '预览 · 正在连接实时数据' : '正在加载看板' }}</text></view>
  </view>
</template>
<script>
export default {
  props: { thumbnail: { type: String, default: '' }, background: { type: String, default: '#ffffff' }, dark: Boolean },
  data() { return { failed: false, visible: false } },
  computed: { previewUrl() { const value = this.thumbnail.trim(); if (/^(https?:\/\/|data:image\/)/i.test(value)) return value; return value && /^[A-Za-z0-9+/=\s]+$/.test(value) ? `data:image/png;base64,${value}` : '' } },
  watch: { thumbnail() { this.failed = false; this.visible = false } }
}
</script>
<style scoped>
.board-loading { position:absolute; inset:0; z-index:2; overflow:hidden; color:#51515c; }
.board-preview { position:absolute; inset:0; width:100%; height:100%; opacity:.7; pointer-events:none; }
.loading-status { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:14px; font-size:13px; white-space:nowrap; }
.loading-status.with-preview { top:auto; bottom:24px; transform:translateX(-50%); flex-direction:row; gap:8px; padding:7px 10px; border-radius:4px; background:rgba(242,242,247,.94); }
.loading-spinner { width:22px; height:22px; box-sizing:border-box; border:2px solid rgba(22,119,255,.12); border-top-color:var(--tp-color-primary,#1677ff); border-radius:50%; animation:loading-turn .9s linear infinite; }
.with-preview .loading-spinner { width:16px; height:16px; }
.dark { color:#d0d5df; }
.dark .with-preview { background:rgba(25,29,38,.94); }
@keyframes loading-turn { to { transform:rotate(360deg); } }
@media(prefers-reduced-motion:reduce) { .loading-spinner { animation:none; } }
</style>
