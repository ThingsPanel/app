<template>
  <view class="home-page">
    <view class="home-header">
      <view><text class="page-title">首页</text><text class="page-subtitle">租户总览 · {{ loading ? '正在更新' : '设备与告警概览' }}</text></view>
      <view class="header-actions">
        <button class="icon-button" aria-label="扫一扫添加设备" @click="scanDevice"><image src="/static/icon/home/scan.svg" /></button>
        <button class="icon-button" aria-label="添加设备" @click="navigate('/pages/devices/create')"><view class="add-circle">＋</view></button>
      </view>
    </view>

    <view class="top-stats">
      <button class="stat-card" @click="openDevices">
        <view class="stat-heading"><image src="/static/icon/home/device.svg" /><text class="stat-value">{{ device.total ?? '—' }}</text></view>
        <text class="stat-label">设备总数</text><text class="stat-note">在线 {{ device.online ?? '—' }} 台</text>
      </button>
      <button class="stat-card" @click="openDevices">
        <view class="stat-heading"><image src="/static/icon/home/activity.svg" /><text class="stat-value">{{ device.rate ?? '—' }}<text class="unit">%</text></text></view>
        <text class="stat-label">设备在线率</text><text class="stat-note">当前在线比例</text>
      </button>
      <button class="stat-card" @click="navigate('/pages/alarms/index')">
        <view class="stat-heading"><image src="/static/icon/home/bell.svg" /><text class="stat-value alarm-value">{{ alarmDevices ?? '—' }}</text></view>
        <text class="stat-label">告警设备</text><text class="stat-note">查看告警动态</text>
      </button>
    </view>
    <button v-if="errors.length" class="error-notice" @click="refresh">{{ errors.join('、') }}加载失败，点击重试</button>

    <view class="panel">
      <view class="section-heading"><text class="section-title">运营概览</text><button class="more" :disabled="loading" @click="refresh">{{ loading ? '更新中…' : updatedAt ? '更新于 ' + updatedAt : '刷新' }}</button></view>
      <view class="operation-grid">
        <view class="operation-item"><image class="operation-icon" src="/static/icon/home/scene.svg" /><text class="operation-value">{{ device.total ?? '—' }}</text><text class="operation-label">设备总数</text><mini-trend :values="trends.map(p => p.total)" /></view>
        <view class="operation-item"><image class="operation-icon" src="/static/icon/home/device.svg" /><text class="operation-value">{{ device.rate ?? '—' }}<text class="unit">%</text></text><text class="operation-label">在线率</text><mini-trend :values="trends.map(p => p.rate)" /></view>
        <view class="operation-item"><image class="operation-icon" src="/static/icon/home/bell.svg" /><text class="operation-value">{{ todayAlarms ?? '—' }}</text><text class="operation-label">今日告警</text><text class="operation-foot">今日累计</text></view>
        <view class="operation-item"><image class="operation-icon" src="/static/icon/home/bolt.svg" /><text class="operation-value">{{ automationTotal ?? '—' }}</text><text class="operation-label">联动规则</text><text class="operation-foot">已配置</text></view>
      </view>
      <text v-if="trends.length > 1" class="trend-caption">设备趋势 · 近七天</text>
    </view>

    <view class="panel">
      <view class="section-heading"><text class="section-title">快捷入口</text></view>
      <view class="shortcut-grid">
        <button v-for="entry in shortcuts" :key="entry.key" class="shortcut" @click="openShortcut(entry.key)"><image :src="entry.icon" /><text>{{ entry.label }}</text></button>
      </view>
    </view>

    <view class="panel">
      <view class="section-heading"><text class="section-title">告警动态</text><button class="more" @click="navigate('/pages/alarms/index')">查看全部 <text>›</text></button></view>
      <view v-if="!alarms.length" class="empty-message">{{ loading ? '正在加载…' : errors.includes('告警动态') ? '告警动态暂不可用' : '暂无告警记录' }}</view>
      <button v-for="item in alarms" :key="item.id" class="alarm-row" @click="openAlarm(item)">
        <view class="alarm-copy"><text class="alarm-name">{{ item.name || item.alarm_config_name || '告警记录' }}</text><text class="alarm-description">{{ item.content || item.description || '查看详情' }}</text></view>
        <text class="alarm-level" :class="{ recovered: item.alarm_status === 'N' }">{{ alarmLevel(item.alarm_status) }}</text><text class="alarm-time">{{ timeLabel(item.create_at) }}</text>
      </button>
    </view>

    <view class="panel">
      <view class="section-heading"><text class="section-title">分组状态</text><button class="more" @click="openGroupPicker">查看全部 <text>›</text></button></view>
      <view v-if="!groups.length" class="empty-message">{{ loading ? '正在加载…' : errors.includes('分组状态') ? '分组状态暂不可用' : '暂无设备分组' }}</view>
      <view v-else class="group-grid">
        <button v-for="group in groups" :key="group.id" class="group-card" @click="openGroup(group)">
          <view class="group-heading"><image src="/static/icon/home/building.svg" /><text class="group-name">{{ group.name }}</text></view>
          <text class="group-status" :class="{ warning: group.statistics && group.statistics.alarm_total > 0 }">{{ !group.statistics ? '统计暂不可用' : group.statistics.alarm_total > 0 ? '告警设备 ' + group.statistics.alarm_total : '无告警设备' }}</text>
          <text class="group-counts">设备 {{ group.statistics?.device_total ?? '—' }} · 在线 {{ group.statistics?.online_total ?? '—' }}</text>
          <view class="group-rate"><view class="rate-track"><view :style="{ width: (group.rate || 0) + '%' }" /></view><text>{{ group.rate ?? '—' }}%</text></view>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getDeviceOverview, getAlarmDeviceCount, getDeviceGroup } from '@/api/modules/device'
import { alarmHistory } from '@/api/modules/alarm'
import { sceneAutomationsGet } from '@/api/modules/automation'
import { getDeviceTrend, getGroupStatistics } from '@/api/modules/dashboard'
import { count, responseData, onlineRate, todayRange, trendSeries } from '@/features/dashboard/metrics'
import MiniTrend from '@/features/dashboard/components/mini-trend.vue'

export default {
  components: { MiniTrend },
  data() {
    return {
      loading: false, updatedAt: '', errors: [], device: {}, alarmDevices: null, todayAlarms: null, automationTotal: null, trends: [], alarms: [], groups: [],
      shortcuts: [
        { key: 'devices', label: '设备', icon: '/static/icon/home/device.svg' },
        { key: 'alarms', label: '告警', icon: '/static/icon/home/bell.svg' },
        { key: 'automation', label: '自动化', icon: '/static/icon/home/bolt.svg' },
        { key: 'boards', label: '看板', icon: '/static/icon/home/grid.svg' },
        { key: 'groups', label: '分组', icon: '/static/icon/home/folder.svg' },
        { key: 'rules', label: '告警规则', icon: '/static/icon/home/ticket.svg' },
        { key: 'scenes', label: '场景', icon: '/static/icon/home/scene.svg' },
        { key: 'add', label: '添加设备', icon: '/static/icon/home/plus.svg' }
      ]
    }
  },
  onShow() { this.refresh() },
  methods: {
    async refresh() {
      if (this.loading) return
      this.loading = true
      this.errors = []
      const now = new Date()
      const tasks = [
        ['设备统计', async () => { this.device = {}; const d = responseData(await getDeviceOverview()); this.device = { total: count(d.device_total), online: count(d.device_on), rate: onlineRate(d.device_total, d.device_on) } }],
        ['告警设备', async () => { this.alarmDevices = null; this.alarmDevices = count(responseData(await getAlarmDeviceCount()).alarm_device_total) }],
        ['今日告警', async () => {
          this.todayAlarms = null
          // 历史表还包含恢复记录（N）；仅累计 H/M/L，避免将恢复算作新告警。
          const results = await Promise.all(['H', 'M', 'L'].map(alarm_status => alarmHistory({ page: 1, page_size: 1, ...todayRange(now), alarm_status })))
          this.todayAlarms = results.reduce((sum, result) => sum + count(responseData(result).total), 0)
        }],
        ['联动规则', async () => { this.automationTotal = null; this.automationTotal = count(responseData(await sceneAutomationsGet({ page: 1, page_size: 1 })).total) }],
        ['设备趋势', async () => { this.trends = []; this.trends = trendSeries(responseData(await getDeviceTrend({ start_time: Math.floor(now.getTime() / 1000) - 7 * 86400, end_time: Math.floor(now.getTime() / 1000) })).points) }],
        ['告警动态', async () => { this.alarms = []; const d = responseData(await alarmHistory({ page: 1, page_size: 3 })); if (!Array.isArray(d.list)) throw new Error('告警列表无效'); this.alarms = d.list }],
        ['分组状态', async () => {
          this.groups = []
          const d = responseData(await getDeviceGroup({ page: 1, page_size: 3 }))
          if (!Array.isArray(d.list)) throw new Error('分组列表无效')
          this.groups = await Promise.all(d.list.map(async group => {
            try {
              const statistics = responseData(await getGroupStatistics(group.id)).statistics
              const rate = onlineRate(statistics.device_total, statistics.online_total)
              count(statistics.alarm_total)
              return { ...group, statistics, rate }
            } catch (error) {
              console.warn('首页分组统计加载失败', group.id, error.message)
              if (!this.errors.includes('分组统计')) this.errors.push('分组统计')
              return { ...group, statistics: null, rate: null }
            }
          }))
        }]
      ]
      await Promise.all(tasks.map(async ([label, task]) => {
        try { await task() } catch (error) { this.errors.push(label); console.warn('首页' + label + '加载失败', error.message) }
      }))
      this.updatedAt = this.errors.length ? '' : now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
      this.loading = false
    },
    navigate(url) { uni.navigateTo({ url, fail: () => uni.showToast({ title: '页面打开失败，请重试', icon: 'none' }) }) },
    openDevices() { uni.switchTab({ url: '/pages/devices/index' }) },
    openGroup(group) { uni.setStorageSync('device_list_selected_group', { id: group.id, name: group.name }); this.openDevices() },
    openGroupPicker() { uni.setStorageSync('dashboard_open_groups', true); this.openDevices() },
    openShortcut(key) {
      if (key === 'devices') return this.openDevices()
      if (key === 'groups') return this.openGroupPicker()
      if (key === 'automation' || key === 'scenes') {
        uni.setStorageSync('dashboard_automation_tab', key === 'scenes' ? '场景管理' : '场景联动')
        return uni.switchTab({ url: '/pages/automation/index' })
      }
      const routes = { alarms: '/pages/alarms/index', boards: '/pages/dashboard/boards', rules: '/pages/alarm-rules/index', add: '/pages/devices/create' }
      if (routes[key]) this.navigate(routes[key])
    },
    scanDevice() {
      // #ifdef H5
      uni.showToast({ title: '请在 App 中扫码，或使用添加设备', icon: 'none' })
      // #endif
      // #ifndef H5
      uni.scanCode({ success: ({ result }) => this.navigate('/pages/devices/create?code=' + encodeURIComponent(result)), fail: (error) => { if (!/cancel/i.test(error.errMsg || '')) uni.showToast({ title: '扫码失败，请重试', icon: 'none' }) } })
      // #endif
    },
    alarmLevel(status) { return { H: '高', M: '中', L: '低', N: '已恢复' }[status] || '未知' },
    timeLabel(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) },
    openAlarm(item) { uni.navigateTo({ url: '/pages/alarms/detail', success: ({ eventChannel }) => eventChannel.emit('acceptData', { item }), fail: () => uni.showToast({ title: '告警详情打开失败', icon: 'none' }) }) }
  }
}
</script>

<style scoped>
.home-page { --home-blue: #1677ff; --home-border: #e5eaf2; --home-radius: 6px; box-sizing: border-box; min-height: 100vh; padding: 0 18px calc(24px + env(safe-area-inset-bottom)); color: #23344c; background: linear-gradient(160deg,#fff 0,#f3f7fd 180px,#f7f8fa 360px); font-size: 12px; }
.home-page button { margin: 0; padding: 0; border: 0; border-radius: 0; background: transparent; font: inherit; color: inherit; line-height: normal; }
.home-page button::after { border: 0; }
.home-page button:focus-visible { outline: 2px solid #1677ff; outline-offset: 2px; }
.home-header { display: flex; justify-content: space-between; align-items: center; gap: 8px; padding: calc(22px + env(safe-area-inset-top)) 0 20px; }
.page-title { display: block; font-size: 22px; font-weight: 600; line-height: 30px; }
.page-subtitle { display: block; color: #7c879a; font-size: 12px; line-height: 18px; margin-top: 4px; }
.header-actions { display: flex; }
.home-page .icon-button { display: flex; align-items: center; justify-content: center; width: 40px; height: 44px; }
.icon-button image { width: 21px; height: 21px; }
.add-circle { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 50%; color: #fff; background: #1677ff; font-size: 20px; }
.top-stats { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; }
.home-page .stat-card { padding: 14px 6px 12px; background: #fff; border: 1px solid var(--home-border); border-radius: var(--home-radius); min-width: 0; text-align: center; }
.stat-heading { display: flex; align-items: center; justify-content: center; gap: 6px; min-height: 34px; }
.stat-heading image { width: 18px; height: 18px; flex-shrink: 0; }
.stat-value { font-size: 23px; font-weight: 600; letter-spacing: -.6px; font-variant-numeric: tabular-nums; }
.unit { font-size: 11px; font-weight: 400; }
.stat-label { display: block; color: #5f6e82; font-size: 11px; margin-top: 7px; }
.stat-note { display: block; color: #8390a2; font-size: 10px; margin-top: 13px; }
.alarm-value { color: #c46a48; }
.home-page .error-notice { display: block; text-align: left; width: 100%; padding: 10px; margin-top: 10px; border-radius: 6px; background: #fff4ed; color: #a25532; font-size: 11px; line-height: 18px; }
.panel { margin-top: 12px; padding: 10px 12px 12px; background: #ffffffed; border: 1px solid var(--home-border); border-radius: var(--home-radius); }
.section-heading { display: flex; justify-content: space-between; align-items: center; gap: 8px; min-height: 34px; }
.section-title { font-size: 14px; font-weight: 600; }
.home-page .more { color: #7b889c; font-size: 10px; min-height: 34px; }
.more text { font-size: 16px; margin-left: 3px; }
.operation-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); margin-top: 12px; }
.operation-item { display: flex; align-items: center; flex-direction: column; gap: 8px; min-width: 0; padding: 0 6px; border-left: 1px solid #edf0f5; }
.operation-item:first-child { border: 0; }
.operation-icon { width: 20px; height: 20px; }
.operation-value { font-size: 19px; font-weight: 500; font-variant-numeric: tabular-nums; }
.operation-label { color: #748197; font-size: 10px; }
.operation-foot { color: #8b96a6; font-size: 10px; line-height: 24px; }
.trend-caption { display: block; color: #8b96a6; font-size: 9px; margin-top: 8px; }
.shortcut-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 8px; margin-top: 6px; }
.home-page .shortcut { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; height: 67px; background: #fcfdff; border: 1px solid #edf0f6; border-radius: var(--home-radius); color: #63748c; font-size: 11px; }
.shortcut image { width: 21px; height: 21px; }
.home-page .alarm-row { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 58px; padding: 9px 0; text-align: left; border-top: 1px solid #edf0f5; }
.alarm-copy { flex: 1; min-width: 0; }
.alarm-name { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; }
.alarm-description { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 10px; color: #8290a3; margin-top: 5px; }
.alarm-level { font-size: 10px; padding: 3px 5px; background: #fff2ea; color: #bd653d; border-radius: 3px; flex-shrink: 0; }
.alarm-level.recovered { color: #338668; background: #edf8f3; }
.alarm-time { font-size: 10px; color: #8592a5; flex-shrink: 0; }
.empty-message { padding: 18px 4px; color: #8290a3; font-size: 12px; }
.group-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 7px; margin-top: 6px; }
.home-page .group-card { min-width: 0; padding: 10px 6px; text-align: left; border: 1px solid #edf0f6; border-radius: var(--home-radius); background: #fcfdff; }
.group-heading { display: flex; align-items: center; gap: 4px; }
.group-heading image { width: 17px; height: 17px; flex-shrink: 0; }
.group-name { white-space: nowrap; text-overflow: ellipsis; overflow: hidden; font-size: 11px; }
.group-status { display: block; color: #38886b; font-size: 9px; margin-top: 6px; }
.group-status.warning { color: #bd653d; }
.group-counts { display: block; color: #8290a3; font-size: 9px; margin-top: 10px; white-space: normal; line-height: 15px; }
.group-rate { display: flex; align-items: center; gap: 4px; margin-top: 8px; font-size: 9px; color: #6e7f97; }
.rate-track { flex: 1; height: 3px; background: #eaf0f8; overflow: hidden; border-radius: 3px; }
.rate-track view { height: 100%; background: #65a6ff; }
@media (max-width: 360px) { .home-page { padding-left: 12px; padding-right: 12px; } .stat-heading { gap: 3px; } .stat-heading image { width: 15px; height: 15px; } .stat-value { font-size: 20px; } }
</style>
