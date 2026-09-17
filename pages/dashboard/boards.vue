<template>
  <view class="boards-page">
    <view class="search">
      <uni-icons type="search" size="18" color="#8b95a6" />
      <input v-model="keyword" :placeholder="projectId ? '搜索看板' : '搜索项目或看板'" confirm-type="search" @input="scheduleSearch" @confirm="searchNow" />
      <button v-if="keyword" class="clear" aria-label="清空搜索" @click="clearSearch">×</button>
    </view>
    <view v-if="error" class="state error"><text>{{ error }}</text><button @click="retry">重新加载</button></view>
    <template v-if="!projectId">
      <view v-if="keyword.trim()" class="section-heading"><text>项目</text><text class="count">{{ filteredProjects.length }}</text></view>
      <text v-if="projectsLoading" class="state">加载项目中…</text>
      <text v-else-if="!filteredProjects.length && !error" class="state">{{ keyword.trim() ? '没有匹配的项目' : '暂无项目' }}</text>
      <view class="card-grid">
      <button v-for="project in filteredProjects" :key="project.id" class="project-card" :aria-label="project.name" @click="openProject(project)">
        <view class="project-card-top"><view class="project-symbol"><image src="/static/icon/home/folder.svg" mode="aspectFit" /></view><text v-if="project.isDefault" class="badge">默认</text></view>
        <text class="name">{{ project.name }}</text>
        <text v-if="project.description && project.description.trim()" class="description">{{ project.description }}</text>
        <text class="meta">{{ project._count?.dashboards ?? 0 }} 个看板</text>
      </button>
      </view>
    </template>
    <template v-if="projectId || keyword.trim()">
      <view v-if="!projectId" class="section-heading"><text>看板</text><text class="count">{{ total }}</text></view>
      <text v-if="searching" class="state">搜索中…</text>
      <template v-else>
        <view class="card-grid">
        <button v-for="board in boards" :key="board.id" class="board-card" :aria-label="board.name" @click="openBoard(board)">
          <view class="board-thumbnail">
            <image v-if="thumbnailUrl(board.thumbnail) && !board.thumbnailFailed" :src="thumbnailUrl(board.thumbnail)" mode="aspectFit" lazy-load @error="board.thumbnailFailed = true" />
            <image v-else src="/static/icon/dashboard-default-cover.png" mode="aspectFill" aria-label="默认看板封面" />
          </view>
          <view class="board-copy"><text class="name">{{ board.name }}</text><text v-if="!projectId" class="description">{{ board.project?.name || projectLabel(board.projectId) }}</text><text class="meta">{{ date(board.updatedAt) }}</text></view>
        </button>
        </view>
        <text v-if="!boards.length && !error" class="state">{{ keyword.trim() ? '没有匹配的看板' : '该项目暂无看板' }}</text>
        <button v-if="boards.length < total" class="more" :disabled="loadingMore" @click="loadBoards(false)">{{ loadingMore ? '加载中…' : '加载更多' }}</button>
      </template>
    </template>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { createBoardsClient } from '@/api/modules/boards'
export default {
  data() { return { projectId: '', projectName: '', keyword: '', projects: [], boards: [], total: 0, page: 0, projectsLoading: false, searching: false, loadingMore: false, error: '', requestId: 0, disposed: false } },
  computed: {
    filteredProjects() { const query = this.keyword.trim().toLowerCase(); return this.projects.filter(item => String(item.name || '').toLowerCase().includes(query)) }
  },
  onLoad(options) {
    this.projectId = options.projectId || ''; this.projectName = options.projectName || ''
    uni.setNavigationBarTitle({ title: this.projectName || '看板' })
    this.initialize()
  },
  onUnload() { this.disposed = true; this.requestId++; clearTimeout(this.searchTimer) },
  onReachBottom() { if (!this.searching && !this.loadingMore && this.boards.length < this.total) this.loadBoards(false) },
  methods: {
    async initialize() {
      this.error = ''; this.projectsLoading = !this.projectId
      try {
        this.client = createBoardsClient()
        if (this.projectId) await this.loadBoards(true)
        else { const rows = await this.client.projects(); if (!this.disposed) this.projects = rows }
      } catch (error) { if (!this.disposed) this.error = error.message || '项目加载失败' }
      finally { if (!this.disposed) this.projectsLoading = false }
    },
    scheduleSearch() {
      clearTimeout(this.searchTimer); this.requestId++; this.boards = []; this.total = 0; this.error = ''; this.loadingMore = false
      this.searching = Boolean(this.projectId || this.keyword.trim())
      this.searchTimer = setTimeout(() => this.loadBoards(true), 300)
    },
    searchNow() { clearTimeout(this.searchTimer); this.loadBoards(true) },
    clearSearch() { this.keyword = ''; this.searchNow() },
    async loadBoards(reset) {
      if (!reset && (this.loadingMore || this.searching)) return
      const id = ++this.requestId; const query = this.keyword.trim()
      if (reset) { this.boards = []; this.page = 0; this.total = 0 }
      this.error = ''; this.loadingMore = false
      if (!this.projectId && !query) { this.searching = false; return }
      this.searching = reset; this.loadingMore = !reset
      try {
        const page = reset ? 1 : this.page + 1
        const result = await this.client.dashboards({ page, ...(this.projectId ? { projectId: this.projectId } : {}), ...(query ? { keyword: query } : {}) })
        if (this.disposed || id !== this.requestId) return
        this.boards = [...new Map([...(reset ? [] : this.boards), ...result.data].map(item => [item.id, item])).values()]
        this.total = Number(result.meta?.total ?? this.boards.length); this.page = page
        this.loadThumbnails(this.boards.filter(board => result.data.some(item => item.id === board.id)))
      } catch (error) { if (!this.disposed && id === this.requestId) this.error = error.message || '看板加载失败' }
      finally { if (!this.disposed && id === this.requestId) { this.searching = false; this.loadingMore = false } }
    },
    async retry() {
      if (!this.client) { await this.initialize(); return }
      if (!this.projectId && !this.projects.length) await this.initialize()
      if (this.projectId || this.keyword.trim()) this.loadBoards(true)
    },
    projectLabel(id) { return this.projects.find(item => item.id === id)?.name || '项目看板' },
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
    openProject(project) { uni.navigateTo({ url: '/pages/dashboard/boards?projectId=' + encodeURIComponent(project.id) + '&projectName=' + encodeURIComponent(project.name) }) },
    openBoard(board) {
      uni.navigateTo({ url: '/pages/dashboard/detail?id=' + encodeURIComponent(board.id) + '&name=' + encodeURIComponent(board.name) })
    }
  }
}
</script>

<style scoped>
.boards-page { min-height:100vh; box-sizing:border-box; padding:24rpx 28rpx calc(32rpx + env(safe-area-inset-bottom)); background:#f2f2f7; color:#202938; font-family:'PingFang SC','Microsoft YaHei','Noto Sans CJK SC',-apple-system,BlinkMacSystemFont,sans-serif; }
.boards-page button { margin:0; border:0; border-radius:0; background:transparent; font-family:inherit; font-weight:400; }
.boards-page button::after { border:0; }
.search { display:flex; align-items:center; gap:16rpx; min-height:72rpx; margin-bottom:24rpx; padding:0 20rpx; background:#fff; border-radius:12rpx; }
.search input { flex:1; min-width:0; font-family:inherit; font-size:26rpx; }
.search .clear { color:#667085; font-size:36rpx; padding:0 12rpx; line-height:72rpx; }
.section-heading { display:flex; align-items:center; gap:12rpx; padding:24rpx 0 8rpx; color:#667085; font-size:24rpx; font-weight:400; }
.count,.meta { color:#8b95a6; font-size:22rpx; font-weight:400; }
.card-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:20rpx; }
.boards-page .project-card,.boards-page .board-card { display:block; min-width:0; width:100%; margin:0; padding:0; text-align:left; border-radius:16rpx; background:#fff; overflow:hidden; line-height:1.5; color:inherit; }
.boards-page .project-card { padding:20rpx; }
.project-card-top { display:flex; align-items:center; justify-content:space-between; gap:12rpx; margin-bottom:12rpx; }
.project-symbol { display:flex; align-items:center; justify-content:center; width:60rpx; height:60rpx; border-radius:16rpx; background:#ebf8f3; flex-shrink:0; }
.project-symbol image { width:40rpx; height:40rpx; }
.name { display:-webkit-box; -webkit-box-orient:vertical; -webkit-line-clamp:2; height:76rpx; overflow:hidden; font-size:26rpx; line-height:38rpx; font-weight:500; overflow-wrap:anywhere; }
.project-card .name { height:auto; min-height:38rpx; }
.board-copy { padding:20rpx; }
.badge { flex-shrink:0; color:#1677ff; font-size:20rpx; }
.description { display:block; font-size:22rpx; line-height:32rpx; height:32rpx; color:#667085; margin-top:8rpx; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.meta { display:block; margin-top:8rpx; }
.board-thumbnail { position:relative; display:flex; align-items:center; justify-content:center; width:100%; height:0; padding-bottom:56.25%; background:#e9edf3; overflow:hidden; }
.board-thumbnail image { position:absolute; inset:0; width:100%; height:100%; }
.state { display:block; padding:48rpx 0; text-align:center; color:#8b95a6; font-size:24rpx; }
.error { color:#c64b4b; }
.state button,.boards-page .more { color:#1677ff; font-size:24rpx; line-height:88rpx; }
</style>
