<template>
  <view class="boards-page">
    <app-tab-header inset :title="$t('pages.boardsTitle')" />
    <view class="board-search"><AppSearch v-model="keyword" placeholder="搜索看板名称" @input="scheduleSearch" @search="searchNow" @clear="clearSearch" /></view>
    <view class="section-heading"><text>{{ keyword.trim() ? '搜索结果' : '全部看板' }}</text><text class="count">{{ total }}</text></view>
    <view v-if="error" class="state error">{{ error }}<button @click="retry">重试</button></view>
    <text v-if="searching" class="state">加载看板中…</text>
    <template v-else>
      <view class="card-grid">
        <button v-for="board in boards" :key="board.id" class="board-card" :aria-label="board.name" @click="openBoard(board)">
          <view class="board-thumbnail">
            <image v-if="thumbnailUrl(board.thumbnail) && !board.thumbnailFailed" :src="thumbnailUrl(board.thumbnail)" mode="aspectFit" lazy-load @error="board.thumbnailFailed = true" />
            <image v-else src="/static/icon/dashboard-default-cover.png" mode="aspectFill" aria-label="默认看板封面" />
          </view>
          <view class="board-copy"><text class="name">{{ board.name }}</text><text class="meta">{{ date(board.updatedAt) }}</text></view>
        </button>
      </view>
      <text v-if="!boards.length && !error" class="state">{{ keyword.trim() ? '没有匹配的看板' : '暂无看板' }}</text>
      <button v-if="page < totalPages && !error" class="more" :disabled="loadingMore" @click="loadBoards(false)">{{ loadingMore ? '加载中…' : '加载更多' }}</button>
    </template>
  </view>
</template>

<script>
import AppSearch from '@/components/app-search/index.vue'
import dayjs from 'dayjs'
import { createBoardsClient } from '@/api/modules/boards'
export default {
  components: { AppSearch },
  data() { return { keyword: '', boards: [], total: 0, totalPages: 0, page: 0, searching: false, loadingMore: false, error: '', requestId: 0, disposed: false } },
  // Ignore legacy projectId/projectName options; old links still open the full list.
  onLoad() {
    uni.setNavigationBarTitle({ title: '看板' })
    this.initialize()
  },
  onUnload() { this.disposed = true; this.requestId++; clearTimeout(this.searchTimer) },
  onReachBottom() { if (!this.error && !this.searching && !this.loadingMore && this.page < this.totalPages) this.loadBoards(false) },
  methods: {
    async initialize() {
      this.error = ''
      try {
        this.client = createBoardsClient()
        await this.loadBoards(true)
      } catch (error) { if (!this.disposed) this.error = error.message || '看板加载失败' }
    },
    scheduleSearch() {
      clearTimeout(this.searchTimer); this.requestId++; this.boards = []; this.total = 0; this.totalPages = 0; this.page = 0; this.error = ''; this.loadingMore = false
      this.searching = true
      this.searchTimer = setTimeout(() => this.loadBoards(true), 300)
    },
    searchNow() { clearTimeout(this.searchTimer); this.loadBoards(true) },
    clearSearch() { this.keyword = ''; this.searchNow() },
    async loadBoards(reset) {
      if (!reset && (this.loadingMore || this.searching || this.page >= this.totalPages)) return
      const id = ++this.requestId; const query = this.keyword.trim()
      if (reset) { this.boards = []; this.page = 0; this.total = 0; this.totalPages = 0 }
      this.error = ''; this.loadingMore = false
      this.searching = reset; this.loadingMore = !reset
      try {
        const page = reset ? 1 : this.page + 1
        const result = await this.client.dashboards({ page, ...(query ? { keyword: query } : {}) })
        if (this.disposed || id !== this.requestId) return
        this.boards = [...new Map([...(reset ? [] : this.boards), ...result.data].map(item => [item.id, item])).values()]
        this.total = Number(result.meta?.total ?? this.boards.length); this.page = page
        this.totalPages = Number(result.meta?.totalPages ?? Math.ceil(this.total / 20))
        this.loadThumbnails(this.boards.filter(board => result.data.some(item => item.id === board.id)))
      } catch (error) { if (!this.disposed && id === this.requestId) this.error = error.message || '看板加载失败' }
      finally { if (!this.disposed && id === this.requestId) { this.searching = false; this.loadingMore = false } }
    },
    async retry() {
      if (!this.client) { await this.initialize(); return }
      await this.loadBoards(this.page === 0)
    },
    thumbnailUrl(raw) {
      if (typeof raw !== 'string' || !raw.trim()) return ''
      const value = raw.trim()
      if (/^(https?:\/\/|data:image\/)/i.test(value)) return value
      return /^[A-Za-z0-9+/=\s]+$/.test(value) ? `data:image/png;base64,${value}` : ''
    },
    async loadThumbnails(rows) {
      const queue = rows.filter(board => !this.thumbnailUrl(board.thumbnail))
      const worker = async () => {
        while (queue.length && !this.disposed) {
          const board = queue.shift()
          if (!this.boards.includes(board)) continue
          try {
            const thumbnail = await this.client.thumbnail(board.id)
            if (!this.disposed && this.boards.includes(board)) board.thumbnail = thumbnail
          } catch { /* A missing preview must not block opening the dashboard. */ }
        }
      }
      await Promise.all(Array.from({ length: Math.min(4, queue.length) }, worker))
    },
    date(value) { return value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD') + ' ' : '' },
    openBoard(board) {
      uni.navigateTo({ url: '/pages/dashboard/detail?id=' + encodeURIComponent(board.id) + '&name=' + encodeURIComponent(board.name) })
    }
  }
}
</script>

<style scoped lang="scss">
.board-search { margin-bottom:24rpx; }
.boards-page { min-height:100vh; box-sizing:border-box; padding:24rpx 28rpx calc(32rpx + env(safe-area-inset-bottom)); background:#f2f2f7; color:#202938; font-family: inherit; }
.boards-page button { margin:0; border:0; border-radius:0; background:transparent; font-family:inherit; font-weight:400; }
.boards-page button::after { border:0; }
.search { display:flex; align-items:center; gap:16rpx; min-height:72rpx; margin-bottom:24rpx; padding:0 20rpx; background:#fff; border-radius:12rpx; }
.search input { flex:1; min-width:0; font-family:inherit; font-size:26rpx; }
.search .clear { color:#667085; font-size:36rpx; padding:0 12rpx; line-height:72rpx; }
.section-heading { display:flex; align-items:center; gap:12rpx; padding:24rpx 0 8rpx; color:#667085; font-size:24rpx; font-weight:400; }
.count,.meta { color:#8b95a6; font-size:22rpx; font-weight:400; }
.card-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20rpx; }
.boards-page .board-card { display:block; min-width:0; width:100%; margin:0; padding:0; text-align:left; border-radius:16rpx; background:#fff; overflow:hidden; line-height:1.5; color:inherit; }
.name { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; height:76rpx; overflow:hidden; font-size:26rpx; line-height:38rpx; font-weight:500; overflow-wrap:anywhere; }
.board-copy { padding:20rpx; }
.badge { flex-shrink:0; color:var(--tp-color-primary, #1677ff); font-size:20rpx; }
.description { display:block; font-size:22rpx; line-height:32rpx; height:32rpx; color:#667085; margin-top:8rpx; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.meta { display:block; margin-top:8rpx; }
.board-thumbnail { position:relative; display:flex; align-items:center; justify-content:center; width:100%; height:0; padding-bottom:56.25%; background:#e9edf3; overflow:hidden; }
.board-thumbnail image { position:absolute; inset:0; width:100%; height:100%; }
.state { display:block; padding:48rpx 0; text-align:center; color:#8b95a6; font-size:24rpx; }
.error { color:var(--tp-color-danger, #ff4d35); }
.state button,.boards-page .more { color:var(--tp-color-primary, #1677ff); font-size:24rpx; line-height:88rpx; }
@import '@/styles/tab-page-header.scss';
</style>
