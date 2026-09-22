<template>
  <view class="board-deck">
    <BoardLoading v-if="loading" />
    <view v-else-if="error" class="deck-state"><text>{{ error }}</text><button @click="load">重新加载</button><button v-if="homeMode" @click="$emit('system-home')">返回系统首页</button></view>
    <view v-else-if="!boards.length" class="deck-state"><text>暂无看板</text><text class="deck-note">创建看板后，就能在这里直接查看。</text></view>
    <view v-else class="deck-slide" :class="direction < 0 ? 'slide-previous' : 'slide-next'" :key="current.id">
      <BoardViewer ref="viewer" :initial-id="current.id" :initial-name="current.name" :home-mode="homeMode" :show-back="showBack"
        :initial-fullscreen="fullscreen" deck-mode :page-index="index" :page-count="boards.length"
        @fullscreen-change="fullscreen = $event" @page-change="change" @back="$emit('back')"
        @system-home="$emit('system-home')" @unavailable="$emit('unavailable', $event)" />
    </view>
  </view>
</template>
<script>
import BoardLoading from '@/components/board-loading/index.vue'
import BoardViewer from '@/components/board-viewer/index.vue'
import { createBoardsClient } from '@/api/modules/boards'
export default {
  components: { BoardViewer, BoardLoading },
  props: { initialId: { type: String, default: '' }, homeMode: { type: Boolean, default: false }, showBack: { type: Boolean, default: false } },
  emits: ['back', 'system-home', 'unavailable', 'change'],
  data() { return { boards: [], index: 0, loading: true, error: '', direction: 1, generation: 0, fullscreen: false } },
  computed: { current() { return this.boards[this.index] } },
  mounted() { this.load() },
  beforeUnmount() {
    this.generation++; clearTimeout(this.unlockTimer)
    if (this.fullscreen) {
      uni.showTabBar({ animation: false, fail() {} })
      // #ifdef APP-PLUS
      plus.screen.lockOrientation('portrait-primary')
      // #endif
    }
  },
  methods: {
    handleBack() { return this.$refs.viewer?.handleBack() || false },
    async load() {
      const generation = ++this.generation
      this.loading = true; this.error = ''
      try {
        const client = createBoardsClient(); const boards = []
        let page = 1
        while (true) {
          const result = await client.dashboards({ page, limit: 100 })
          if (generation !== this.generation) return
          boards.push(...result.data)
          if (result.meta?.totalPages ? page >= result.meta.totalPages : result.data.length < 100) break
          page++
        }
        this.boards = [...new Map(boards.map(board => [board.id, board])).values()]
        const selected = this.boards.findIndex(board => board.id === this.initialId)
        if (this.homeMode && this.initialId && selected < 0) { this.$emit('unavailable', { id: this.initialId }); return }
        if (this.showBack && this.initialId && selected < 0) throw new Error('看板已删除或不可访问')
        this.index = Math.max(0, selected)
        if (this.current) this.$emit('change', this.current)
      } catch (error) { if (generation === this.generation) this.error = error.message || '看板加载失败' }
      finally { if (generation === this.generation) this.loading = false }
    },
    change(direction, source) {
      if (this.homeMode || this.switching) return
      const next = this.index + direction
      if (next < 0 || next >= this.boards.length) return
      if (source === 'swipe') this.$refs.viewer?.dismissSwipeGuide()
      this.switching = true; this.direction = direction; this.index = next
      this.$emit('change', this.current)
      this.unlockTimer = setTimeout(() => { this.switching = false }, 280)
    }
  }
}
</script>
<style scoped>
.board-deck { position:relative; width:100%; height:100%; overflow:hidden; background:#f2f2f7; }
.deck-slide { position:absolute; inset:0; }
.slide-next { animation:arrive-next .24s ease-out; }
.slide-previous { animation:arrive-previous .24s ease-out; }
@keyframes arrive-next { from { transform:translateY(36px); opacity:.45 } to { transform:translateY(0); opacity:1 } }
@keyframes arrive-previous { from { transform:translateY(-36px); opacity:.45 } to { transform:translateY(0); opacity:1 } }
@media(prefers-reduced-motion:reduce) { .deck-slide { animation:none; } }
.deck-state { height:100%; box-sizing:border-box; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:20rpx; padding:40rpx; color:#667085; text-align:center; font-size:28rpx; }
.deck-state button { min-height:44px; color:#1677ff; font-size:28rpx; background:#fff; border-radius:12rpx; }
.deck-state button::after { border:0; }
.deck-note { font-size:24rpx; }
</style>
