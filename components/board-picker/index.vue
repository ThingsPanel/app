<template>
  <uni-popup ref="popup" type="bottom" background-color="#fff" :safe-area="false" @change="changed">
    <view class="picker" role="dialog" aria-label="选择看板" @keydown.esc="close">
      <view class="picker-heading"><text>{{ title }}</text><button aria-label="关闭选择看板" @click="close">×</button></view>
      <view class="picker-search"><AppSearch v-model="keyword" placeholder="搜索全部看板" @input="searchLater" @search="search" @clear="search" /></view>
      <scroll-view scroll-y class="picker-list" @scrolltolower="load(false)">
        <button v-for="board in rows" :key="board.id" class="picker-row" :aria-pressed="board.id === currentId" @click="select(board)">
          <view class="picker-copy"><text>{{ board.name }}</text><text v-if="board.id === currentId" class="picker-current">当前看板</text></view><text v-if="board.id === currentId" class="picker-check">✓</text>
        </button>
        <view v-if="error" class="picker-state"><text>{{ error }}</text><button @click="load(page === 0)">重试</button></view>
        <view v-else-if="loading" class="picker-state">正在加载…</view>
        <view v-else-if="!rows.length" class="picker-state">{{ keyword.trim() ? '没有匹配的看板' : '暂无可用看板' }}</view>
        <button v-else-if="page < totalPages" class="picker-more" @click="load(false)">加载更多</button>
      </scroll-view>
    </view>
  </uni-popup>
</template>

<script>
import AppSearch from '@/components/app-search/index.vue'
import { createBoardsClient } from '@/api/modules/boards'
export default {
  components: { AppSearch },
  props: { currentId: { type: String, default: '' }, title: { type: String, default: '切换看板' } },
  emits: ['select', 'visibility'],
  data() { return { opened: false, keyword: '', rows: [], page: 0, totalPages: 0, loading: false, error: '', generation: 0 } },
  beforeUnmount() { this.cancel() },
  methods: {
    open() {
      this.cancel(); this.opened = true; this.keyword = ''; this.rows = []; this.page = 0; this.totalPages = 0
      this.$refs.popup.open(); this.$emit('visibility', true); this.load(true)
    },
    cancel() { this.generation++; clearTimeout(this.timer); this.loading = false },
    close() { this.$refs.popup.close(); this.cancel(); this.opened = false; this.$emit('visibility', false) },
    changed(event) { if (!event.show && this.opened) { this.cancel(); this.opened = false; this.$emit('visibility', false) } },
    select(board) { this.close(); this.$emit('select', { id: board.id, name: board.name }) },
    searchLater() { this.cancel(); this.rows = []; this.page = 0; this.totalPages = 0; this.error = ''; this.loading = true; this.timer = setTimeout(() => this.search(), 300) },
    search() { clearTimeout(this.timer); this.load(true) },
    async load(reset) {
      if (!this.opened || (!reset && (this.loading || this.page >= this.totalPages))) return
      const generation = ++this.generation; const page = reset ? 1 : this.page + 1
      if (reset) { this.rows = []; this.page = 0; this.totalPages = 0 }
      this.loading = true; this.error = ''
      try {
        if (reset) this.client = createBoardsClient()
        const result = await this.client.dashboards({ page, ...(this.keyword.trim() ? { keyword: this.keyword.trim() } : {}) })
        if (!this.opened || generation !== this.generation) return
        this.rows = [...new Map([...this.rows, ...result.data].map(board => [board.id, board])).values()]
        this.page = page; this.totalPages = Number(result.meta?.totalPages ?? Math.ceil(Number(result.meta?.total ?? this.rows.length) / 20))
      } catch (error) { if (this.opened && generation === this.generation) this.error = error.message || '加载失败，请重试' }
      finally { if (generation === this.generation) this.loading = false }
    }
  }
}
</script>

<style scoped>
.picker { border-radius:24rpx 24rpx 0 0; overflow:hidden; padding-bottom:env(safe-area-inset-bottom); background:#fff; color:#202938; }
.picker-heading { display:flex; align-items:center; justify-content:space-between; padding:12rpx 28rpx; font-size:32rpx; font-weight:600; }
.picker button { margin:0; border:0; border-radius:0; min-height:44px; font:inherit; background:transparent; }
.picker button::after { border:0; }
.picker-heading button { width:44px; padding:0; font-size:28px; color:#667085; }
.picker-search { padding:0 28rpx 20rpx; }
.picker-search :deep(.app-search-field) { background:#f2f2f7; min-height:44px; }
.picker-search :deep(.app-search-input) { font-size:28rpx; height:44px; }
.picker-search :deep(.app-search-clear) { min-width:44px; height:44px; }
.picker-list { height:52vh; }
.picker .picker-row { display:flex; align-items:center; gap:24rpx; width:100%; text-align:left; padding:24rpx 32rpx; line-height:1.5; border-bottom:1px solid #f0f1f4; font-size:28rpx; }
.picker-copy { flex:1; min-width:0; overflow-wrap:anywhere; }
.picker-current { display:block; color:#1677ff; font-size:24rpx; margin-top:4rpx; }
.picker-check { color:#1677ff; }
.picker-row:active { background:#f2f6ff; }
.picker-state { padding:40rpx; text-align:center; color:#667085; font-size:26rpx; }
.picker .picker-more,.picker-state button { width:100%; color:#1677ff; font-size:28rpx; }
</style>
