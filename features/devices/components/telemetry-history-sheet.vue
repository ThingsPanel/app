<template>
  <!-- App renderjs needs a persistent element root, even while uni-popup is closed. -->
  <view class="telemetry-history-host">
  <uni-popup ref="popup" type="bottom" background-color="#fff" @change="onPopupChange">
    <view class="sheet">
      <view class="heading"><text>{{ field.name }} · {{ mode === 'trend' ? '趋势' : '历史列表' }}</text><button @click="$refs.popup.close()">关闭</button></view>
      <scroll-view scroll-y :show-scrollbar="false" class="body app-sheet-scroll">
        <view class="filters">
<app-picker :range="ranges" range-key="label" :value="rangeIndex" @change="rangeIndex = Number($event.detail.value)"><view class="filter">{{ ranges[rangeIndex].label }} ▾</view></app-picker>
          <template v-if="mode === 'trend'">
            <app-picker :range="windows" range-key="label" :value="windowIndex" @change="windowIndex = Number($event.detail.value)"><view class="filter">{{ windows[windowIndex].label }} ▾</view></app-picker>
            <app-picker v-if="windowIndex" :range="aggregates" :value="aggregateIndex" @change="aggregateIndex = Number($event.detail.value)"><view class="filter">{{ aggregates[aggregateIndex] }} ▾</view></app-picker>
            <app-picker :range="['折线图', '柱状图', '散点图']" :value="chartIndex" @change="chartIndex = Number($event.detail.value); draw()"><view class="filter">{{ ['折线图', '柱状图', '散点图'][chartIndex] }} ▾</view></app-picker>
          </template>
          <button :disabled="loading" @click="load(true)">查询</button>
          <button v-if="mode === 'history'" :disabled="exporting" @click="exportData">{{ exporting ? '导出中' : '导出' }}</button>
        </view>
        <view v-if="rangeIndex === 0" class="dates">
          <view v-for="side in ['start', 'end']" :key="side" class="date-row">
            <text>{{ side === 'start' ? '开始' : '结束' }}</text>
            <picker mode="date" :value="dates[side]" @change="dates[side] = $event.detail.value"><view>{{ dates[side] }} ▾</view></picker>
            <picker mode="time" :value="times[side]" @change="times[side] = $event.detail.value"><view>{{ times[side] }} ▾</view></picker>
          </view>
        </view>
        <text v-if="error" class="state error">{{ error }}</text>
        <text v-if="loading" class="state">加载中…</text>
        <template v-else-if="!error">
          <text v-if="!rows.length" class="state">所选时间范围内暂无数据</text>
          <template v-else>
            <view v-if="mode === 'trend'">
              <!-- #ifdef APP-PLUS || H5 -->
              <view :id="chartId" class="chart" :chart-data="chartData" :change:chart-data="plot.update" />
              <!-- #endif -->
              <view class="stats"><text>最小 {{ stats.min }}</text><text>最大 {{ stats.max }}</text><text>平均 {{ stats.avg }}</text></view>
            </view>
            <view class="record header"><text>时间</text><text>值{{ field.unit ? ` (${field.unit})` : '' }}</text></view>
            <view v-for="(row, index) in rows" :key="index" class="record"><text>{{ time(row.ts ?? row.x ?? row.time ?? row.timestamp) }}</text><text selectable>{{ value(row.value ?? row.y) }}</text></view>
            <button v-if="mode === 'history' && rows.length < total" :disabled="loading" @click="load(false)">加载更多（{{ rows.length }}/{{ total }}）</button>
          </template>
        </template>
      </scroll-view>
    </view>
  </uni-popup>
  </view>
</template>

<script>
import dayjs from 'dayjs'
import { requestDeviceApi } from '@/api/modules/device-overview'
import { rowsOf, normalizeHistoryRows } from '@/utils/thingsvis-device-schema'
let sequence = 0
export default {
  props: { deviceId: String, field: Object, mode: String },
  emits: ['close'],
  data() {
    return {
      chartId: `telemetry-trend-${++sequence}`, chartData: null, chartIndex: 0,
      rows: [], total: 0, page: 0, loading: false, exporting: false, error: '', requestId: 0,
      rangeIndex: this.mode === 'trend' ? 1 : 2,
      ranges: [{ label: '自定义时间', hours: 0 }, { label: '最近1小时', hours: 1 }, { label: '最近24小时', hours: 24 }, { label: '最近7天', hours: 168 }, { label: '最近30天', hours: 720 }],
      dates: { start: dayjs().subtract(1, 'day').format('YYYY-MM-DD'), end: dayjs().format('YYYY-MM-DD') },
      times: { start: '00:00', end: '23:59' },
      windows: [{ label: '不聚合', value: 'no_aggregate' }, { label: '每分钟', value: '1m' }, { label: '每小时', value: '1h' }, { label: '每天', value: '1d' }],
      windowIndex: 0, aggregates: ['平均值', '最大值', '最小值', '总和', '差值'], aggregateIndex: 0,
      applied: null
    }
  },
  computed: {
    stats() {
      const values = normalizeHistoryRows(this.rows).map(row => row.value)
      if (!values.length) return { min: '--', max: '--', avg: '--' }
      return { min: Math.min(...values), max: Math.max(...values), avg: Number((values.reduce((a,b) => a+b,0) / values.length).toFixed(3)) }
    }
  },
  mounted() { this.$refs.popup.open(); this.load(true) },
  beforeUnmount() { this.requestId++ },
  methods: {
    onPopupChange(event) { if (!event.show) this.$emit('close') },
    filters() {
      const hours = this.ranges[this.rangeIndex].hours
      const end = hours ? Date.now() : dayjs(`${this.dates.end}T${this.times.end}:59`).valueOf()
      const start = hours ? end - hours * 3600000 : dayjs(`${this.dates.start}T${this.times.start}:00`).valueOf()
      if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) throw new Error('请选择有效的开始和结束时间')
      if (dayjs(start).add(1, 'month').valueOf() < end) throw new Error('时间范围不能超过一个月')
      return { device_id: this.deviceId, key: this.field.key, start_time: start, end_time: end }
    },
    async load(reset) {
      const id = ++this.requestId
      this.loading = true; this.error = ''
      try {
        if (reset) { this.applied = this.filters(); this.rows = []; this.page = 0 }
        const page = this.page + 1
        const trend = this.mode === 'trend'
        const result = await requestDeviceApi(trend ? 'telemetry/datas/statistic' : 'telemetry/datas/history/pagination', {
          ...this.applied,
          ...(trend ? { time_range: 'custom', aggregate_window: this.windows[this.windowIndex].value, ...(this.windowIndex ? { aggregate_function: ['avg', 'max', 'min', 'sum', 'diff'][this.aggregateIndex] } : {}) } : { page, page_size: 20, export_excel: false })
        })
        if (id !== this.requestId) return
        this.rows = reset ? rowsOf(result) : [...this.rows, ...rowsOf(result)]
        this.total = Number(result?.total || this.rows.length); this.page = page
      } catch (error) { if (id === this.requestId) this.error = error.message || '查询失败' }
      finally { if (id === this.requestId) { this.loading = false; this.$nextTick(() => this.draw()) } }
    },
    draw() {
      this.chartData = { id: this.chartId, type: ['line', 'bar', 'scatter'][this.chartIndex], points: normalizeHistoryRows(this.rows).sort((a,b) => a.ts-b.ts).map(row => [row.ts,row.value]), unit: this.field.unit || '' }
    },
    async exportData() {
      this.exporting = true
      try {
        const result = await requestDeviceApi('telemetry/datas/history/pagination', { ...this.filters(), page: 1, page_size: 20, export_excel: true })
        if (!result?.filePath) throw new Error('未返回导出文件')
        const server = String(uni.getStorageSync('serverAddress') || 'https://demo.thingspanel.cn').replace(/\/+$/, '').replace(/\/api\/v1$/i, '')
        const url = /^https?:\/\//.test(result.filePath) ? result.filePath : `${server}/${result.filePath.replace(/^\/+/, '')}`
        // #ifdef H5
        const link = document.createElement('a'); link.href = url; link.download = ''; link.click()
        // #endif
        // #ifndef H5
        uni.downloadFile({ url, success: res => { if (res.statusCode === 200) uni.openDocument({ filePath: res.tempFilePath, showMenu: true }); else uni.showToast({ title: '下载失败', icon: 'none' }) }, fail: () => uni.showToast({ title: '下载失败', icon: 'none' }) })
        // #endif
      } catch (error) { uni.showToast({ title: error.message || '导出失败', icon: 'none' }) }
      finally { this.exporting = false }
    },
    time(raw) { const n = Number(raw); const t = raw && Number.isFinite(n) ? (n < 1e11 ? n*1000 : n) : raw; return t && dayjs(t).isValid() ? dayjs(t).format('MM-DD HH:mm:ss') : '--' },
    value(raw) { return raw === null || raw === undefined ? '--' : typeof raw === 'object' ? JSON.stringify(raw) : String(raw) }
  }
}
</script>

<!-- #ifdef APP-PLUS || H5 -->
<script module="plot" lang="renderjs">
import * as echarts from 'echarts'
export default {
  methods: {
    update(data) {
      this.observer?.disconnect(); this.chart?.dispose(); this.chart = null
      const element = data && document.getElementById(data.id)
      if (!element || !data.points.length) return
      this.chart = echarts.init(element)
      const span = data.points[data.points.length - 1][0] - data.points[0][0]
      const pad = value => String(value).padStart(2, '0')
      this.chart.setOption({
        color: ['#1677ff'],
        grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
        tooltip: { trigger: 'axis', confine: true },
        xAxis: {
          type: 'time', splitNumber: 3,
          axisLabel: {
            hideOverlap: true, showMinLabel: false, showMaxLabel: false,
            fontSize: 11, margin: 12,
            formatter(value) {
              const date = new Date(value)
              const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`
              if (span < 60000) return `${time}:${pad(date.getSeconds())}`
              if (span < 86400000) return time
              return `${pad(date.getMonth() + 1)}-${pad(date.getDate())}\n${time}`
            }
          }
        },
        yAxis: { type: 'value', scale: true, name: data.unit, axisLabel: { fontSize: 11 } },
        // Use the time filters above the chart; no miniature timeline or gesture trap.
        dataZoom: [],
        series: [{ type: data.type, data: data.points, symbolSize: 5, connectNulls: false }]
      }, { notMerge: true })
      this.observer = new ResizeObserver(() => this.chart?.resize()); this.observer.observe(element)
      this.removal?.disconnect()
      this.removal = new MutationObserver(() => { if (!element.isConnected) { this.observer?.disconnect(); this.chart?.dispose(); this.chart=null; this.removal.disconnect() } })
      this.removal.observe(document.body,{childList:true,subtree:true})
    }
  }
}
</script>
<!-- #endif -->

<style scoped>
.sheet { padding:0 20px calc(20px + env(safe-area-inset-bottom)); font-family:inherit; color:#202938; }
.heading { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:56px; border-bottom:1px solid #f0f2f6; font-size:15px; }
.heading text { overflow-wrap:anywhere; }
.body { height:65vh; }
button { margin:0; padding:0 8px; background:transparent; color:var(--tp-color-primary, #1677ff); font-family:inherit; font-size:12px; line-height:44px; border-radius:0; }
button::after { border:0; }
.filters,.date-row,.stats { display:flex; align-items:center; flex-wrap:wrap; gap:10px; }
.filters { padding:16rpx 0; flex-wrap:nowrap; gap:8rpx; }
.filters > .app-picker { flex:0 1 auto; }
.filters button { flex-shrink:0; padding:0 8rpx; font-size:22rpx; white-space:nowrap; }
.filter { padding:20rpx 10rpx; background:#fafbfe; font-size:22rpx; white-space:nowrap; }
.date-row { justify-content:space-between; min-height:44px; font-size:12px; }
.record { display:flex; justify-content:space-between; gap:16px; padding:14px 0; border-bottom:1px solid #f0f2f6; font-size:12px; line-height:20px; }
.record text:last-child { text-align:right; overflow-wrap:anywhere; min-width:0; flex:1; }
.record text:first-child { flex-shrink:0; color:#7a8499; }
.header { color:#7a8499; }
.state { display:block; padding:28px 0; text-align:center; color:#8b95a6; font-size:12px; }
.error { color:var(--tp-color-danger, #ff4d35); }
.chart { height:240px; width:100%; }
.stats { justify-content:space-between; color:#7a8499; font-size:11px; padding:12px 0; }
</style>
