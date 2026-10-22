<template>
  <view class="legal-page">
    <view v-for="(block, index) in document.blocks" :key="index" :class="['legal-block', 'legal-' + block.type]">
      <text selectable>{{ block.type === 'li' ? '• ' : '' }}{{ block.text }}</text>
    </view>
    <button class="legal-related" @tap="openRelated">查看{{ kind === 'terms' ? '隐私政策' : '用户服务协议' }}</button>
  </view>
</template>

<script>
import documents from './legal-content.json'
export default {
  data() { return { kind: 'terms' } },
  computed: { document() { return documents[this.kind] } },
  onLoad(options) {
    this.kind = options.type === 'privacy' ? 'privacy' : 'terms'
    uni.setNavigationBarTitle({ title: this.kind === 'terms' ? '用户服务协议' : '隐私政策' })
  },
  methods: {
    openRelated() {
      uni.redirectTo({ url: `/pages/web-view/legal?type=${this.kind === 'terms' ? 'privacy' : 'terms'}` })
    }
  }
}
</script>

<style scoped>
.legal-page { padding: 24px 20px calc(32px + env(safe-area-inset-bottom)); background: #fff; min-height: 100vh; box-sizing: border-box; }
.legal-block { color: #374151; font-size: 15px; line-height: 1.9; margin-bottom: 16px; overflow-wrap: anywhere; word-break: break-word; }
.legal-h1 { font-size: 22px; line-height: 1.5; font-weight: 600; color: #111827; }
.legal-h2 { margin-top: 28px; font-size: 18px; font-weight: 600; color: #111827; }
.legal-li { padding-left: 8px; }
.legal-related { margin-top: 28px; color: #1677ff; background: #f2f6ff; font-size: 14px; }
.legal-related::after { border: 0; }
</style>
