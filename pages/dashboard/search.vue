<template>
  <view class="search-page">
    <view class="search-header"><AppSearch v-model="keyword" placeholder="输入看板名称" @input="searchLater" @search="search" @clear="search" /></view>
    <text class="results-label">{{ keyword.trim() ? '搜索结果' : '全部看板' }}<text v-if="!loading"> · {{ total }}</text></text>
    <view class="results">
      <button v-for="board in rows" :key="board.id" class="result-row" @click="openBoard(board)">
        <view class="result-cover"><image v-if="thumbnailUrl(board.thumbnail) && !board.thumbnailFailed" :src="thumbnailUrl(board.thumbnail)" mode="aspectFit" lazy-load @error="board.thumbnailFailed = true" /><image v-else src="/static/icon/dashboard-default-cover.png" mode="aspectFill" /></view>
        <view class="result-copy"><text class="result-name">{{ board.name }}</text><text v-if="date(board.updatedAt)" class="result-date">{{ date(board.updatedAt) }}</text></view>
      </button>
    </view>
    <view v-if="error" class="search-state"><text>{{ error }}</text><button @click="load(page === 0)">重试</button></view>
    <text v-else-if="loading" class="search-state">正在搜索…</text>
    <text v-else-if="!rows.length" class="search-state">{{ keyword.trim() ? '没有找到相关看板，换个名称试试' : '暂无可用看板' }}</text>
    <button v-else-if="page < totalPages" class="load-more" @click="load(false)">加载更多</button>
  </view>
</template>
<script>
import AppSearch from '@/components/app-search/index.vue'
import { createBoardsClient } from '@/api/modules/boards'
export default {
  components: { AppSearch },
  data() { return { keyword: '', rows: [], total: 0, page: 0, totalPages: 0, loading: false, error: '', generation: 0, disposed: false } },
  onLoad() { this.load(true) },
  onUnload() { this.disposed = true; this.generation++; clearTimeout(this.timer) },
  onReachBottom() { this.load(false) },
  methods: {
    searchLater() { clearTimeout(this.timer); this.generation++; this.rows = []; this.page = 0; this.total = 0; this.totalPages = 0; this.error = ''; this.loading = true; this.timer = setTimeout(() => this.search(), 300) },
    search() { clearTimeout(this.timer); this.load(true) },
    async load(reset) {
      if (this.disposed || (!reset && (this.loading || this.page >= this.totalPages))) return
      const generation = ++this.generation; const page = reset ? 1 : this.page + 1
      if (reset) { this.rows = []; this.page = 0; this.total = 0; this.totalPages = 0 }
      this.loading = true; this.error = ''
      try {
        if (reset) this.client = createBoardsClient()
        const result = await this.client.dashboards({ page, ...(this.keyword.trim() ? { keyword: this.keyword.trim() } : {}) })
        if (this.disposed || generation !== this.generation) return
        this.rows = [...new Map([...this.rows, ...result.data].map(board => [board.id, board])).values()]
        this.loadThumbnails(this.rows.filter(board => result.data.some(item => item.id === board.id)))
        this.page = page; this.total = Number(result.meta?.total ?? this.rows.length); this.totalPages = Number(result.meta?.totalPages ?? Math.ceil(this.total / 20))
      } catch (error) { if (!this.disposed && generation === this.generation) this.error = error.message || '加载失败，请重试' }
      finally { if (generation === this.generation) this.loading = false }
    },
    thumbnailUrl(raw) {
      if (typeof raw !== 'string' || !raw.trim()) return ''
      const value = raw.trim()
      if (/^(https?:\/\/|data:image\/)/i.test(value)) return value
      return /^[A-Za-z0-9+/=\s]+$/.test(value) ? `data:image/png;base64,${value}` : ''
    },
    async loadThumbnails(rows) {
      const client = this.client
      const queue = rows.filter(board => !this.thumbnailUrl(board.thumbnail))
      const worker = async () => {
        while (queue.length && !this.disposed) {
          const board = queue.shift()
          if (!this.rows.includes(board)) continue
          try { const thumbnail = await client.thumbnail(board.id); if (!this.disposed && this.rows.includes(board)) board.thumbnail = thumbnail } catch { /* Default cover remains available. */ }
        }
      }
      await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker))
    },
    date(value) { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` },
    openBoard(board) { uni.navigateTo({ url: '/pages/dashboard/detail?id=' + encodeURIComponent(board.id) + '&name=' + encodeURIComponent(board.name) }) }
  }
}
</script>
<style scoped>
.search-page { min-height:100vh; box-sizing:border-box; padding:0 28rpx calc(36rpx + env(safe-area-inset-bottom)); background:#f2f2f7; color:#1d1d1f; }
.search-header { position:sticky; top:0; z-index:1; padding:22rpx 0 18rpx; background:#f2f2f7; }
.results-label { display:block; padding:8rpx 0 18rpx; font-size:22rpx; color:#73737d; }
.search-page button { margin:0; border:0; border-radius:0; background:transparent; font-family:inherit; }
.search-page button::after { border:0; }
.results { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14rpx; }
.search-page .result-row { width:100%; min-width:0; padding:0; overflow:hidden; border-radius:12rpx; background:#fff; text-align:left; line-height:1.5; }
.result-cover { width:100%; height:208rpx; background:#f3f8fc; }
.result-cover image { width:100%; height:100%; }
.result-copy { display:flex; flex-direction:column; gap:8rpx; padding:18rpx 20rpx; }
.result-name { min-width:0; font-size:24rpx; font-weight:500; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.result-date { color:#73737d; font-size:20rpx; }
.result-row:active { opacity:.6; }
.search-state { display:block; text-align:center; color:#788496; padding:40px 12px; font-size:14px; }
.search-state button,.search-page .load-more { min-height:44px; color:#1677ff; font-size:14px; }
</style>
