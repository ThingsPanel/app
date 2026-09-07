<template>
  <view class="home-page">
    <view class="home-header">
      <view><text class="page-title">{{ $t('dashboard.title') }}</text><text class="page-subtitle">{{ $t('dashboard.tenantOverview') }} · {{ loading ? $t('dashboard.updating') : $t('dashboard.overviewSubtitle') }}</text></view>
      <view class="header-actions">
        <button class="icon-button" :aria-label="$t('scanActivation.scan')" @click="scanDevice"><image src="/static/icon/home/scan.svg" /></button>
        <button class="icon-button" :aria-label="$t('dashboard.notifications')" @click="navigate('/pages/alarms/index')"><image src="/static/icon/notify.svg" /></button>
      </view>
    </view>

    <view class="top-stats">
      <button class="stat-card stat-device" @click="openDevices">
        <view class="stat-heading"><view class="stat-icon"><image src="/static/icon/home/device.svg" /></view><text class="stat-value">{{ device.total ?? '—' }}</text></view>
        <text class="stat-label">{{ $t('dashboard.deviceTotal') }}</text><text class="stat-note">{{ formatMessage('dashboard.onlineCount', { count: device.online ?? '—' }) }}</text>
      </button>
      <button class="stat-card stat-online" @click="openDevices">
        <view class="stat-heading"><view class="stat-icon"><image src="/static/icon/home/check.svg" /></view><text class="stat-value">{{ device.rate ?? '—' }}<text class="unit">%</text></text></view>
        <text class="stat-label">{{ $t('dashboard.onlineRate') }}</text><view class="stat-rate-track" aria-hidden="true"><view :style="{ width: (device.rate ?? 0) + '%' }" /></view>
      </button>
      <button class="stat-card stat-alarm" @click="navigate('/pages/alarms/index')">
        <view class="stat-heading"><view class="stat-icon"><image src="/static/icon/home/bell.svg" /></view><text class="stat-value">{{ alarmDevices ?? '—' }}</text></view>
        <text class="stat-label">{{ $t('dashboard.alarmDevices') }}</text><text class="stat-note alarm-note">{{ $t('dashboard.viewActivity') }} <text>›</text></text>
      </button>
    </view>
    <button v-if="errors.length" class="error-notice" @click="refresh">{{ formatMessage('dashboard.loadFailed', { sections: errors.map(key => $t('dashboard.' + key)).join(', ') }) }}</button>

    <view class="panel">
      <view class="section-heading"><text class="section-title">{{ $t('dashboard.operations') }}</text><button class="more" :disabled="loading" @click="refresh">{{ loading ? $t('dashboard.updating') : updatedAt ? formatMessage('dashboard.updatedAt', { time: updatedAt }) : $t('dashboard.refresh') }}</button></view>
      <view class="operation-grid">
        <view class="operation-item operation-alarm"><view class="operation-icon-wrap"><image class="operation-icon" src="/static/icon/home/bell.svg" /></view><text class="operation-value">{{ todayAlarms ?? '—' }}</text><text class="operation-label">{{ $t('dashboard.todayAlarms') }}</text></view>
        <view class="operation-item operation-automation"><view class="operation-icon-wrap"><image class="operation-icon" src="/static/icon/home/bolt.svg" /></view><text class="operation-value">{{ automationTotal ?? '—' }}</text><text class="operation-label">{{ $t('dashboard.automationRules') }}</text></view>
      </view>
    </view>

    <view class="panel">
      <view class="section-heading"><text class="section-title">{{ $t('dashboard.shortcuts') }}</text></view>
      <view class="shortcut-grid">
        <button v-for="entry in shortcuts" :key="entry.key" class="shortcut" @click="openShortcut(entry.key)"><image :src="entry.icon" /><text>{{ $t('dashboard.' + entry.key) }}</text></button>
      </view>
    </view>

    <view class="panel">
      <view class="section-heading"><text class="section-title">{{ $t('dashboard.alarmActivity') }}</text><button class="more" @click="navigate('/pages/alarms/index')">{{ $t('dashboard.viewAll') }} <text>›</text></button></view>
      <view v-if="!alarms.length" class="empty-message">{{ loading ? $t('common.loading') : errors.includes('alarmActivity') ? $t('dashboard.alarmsUnavailable') : $t('dashboard.noAlarms') }}</view>
      <button v-for="item in alarms" :key="item.id" class="alarm-row" @click="openAlarm(item)">
        <view class="alarm-dot" :class="{ recovered: item.alarm_status === 'N' }" />
        <view class="alarm-copy"><text class="alarm-name">{{ item.name || item.alarm_config_name || $t('dashboard.alarmRecord') }}</text><text class="alarm-description">{{ item.content || item.description || $t('dashboard.viewDetails') }}</text></view>
        <text class="alarm-level" :class="{ recovered: item.alarm_status === 'N' }">{{ alarmLevel(item.alarm_status) }}</text><text class="alarm-time">{{ timeLabel(item.create_at) }}</text>
      </button>
    </view>

    <view class="panel">
      <view class="section-heading"><text class="section-title">{{ $t('dashboard.groupStatus') }}</text><button class="more" @click="openGroupPicker">{{ $t('dashboard.viewAll') }} <text>›</text></button></view>
      <view v-if="!groups.length" class="empty-message">{{ loading ? $t('common.loading') : errors.includes('groupStatus') ? $t('dashboard.groupsUnavailable') : $t('dashboard.noGroups') }}</view>
      <view v-else class="group-grid">
        <button v-for="group in groups" :key="group.id" class="group-card" @click="openGroup(group)">
          <view class="group-heading"><image src="/static/icon/home/building.svg" /><text class="group-name">{{ group.name }}</text></view>
          <text class="group-status" :class="{ warning: group.statistics && group.statistics.alarm_total > 0 }">{{ !group.statistics ? $t('dashboard.statisticsUnavailable') : group.statistics.alarm_total > 0 ? formatMessage('dashboard.groupAlarmCount', { count: group.statistics.alarm_total }) : $t('dashboard.noAlarmDevices') }}</text>
          <text class="group-counts">{{ formatMessage('dashboard.groupCounts', { total: group.statistics?.device_total ?? '—', online: group.statistics?.online_total ?? '—' }) }}</text>
          <view class="group-rate" :class="{ warning: group.statistics && group.statistics.alarm_total > 0 }"><view class="rate-track"><view :style="{ width: (group.rate || 0) + '%' }" /></view><text>{{ group.rate ?? '—' }}%</text></view>
        </button>
      </view>
    </view>
  </view>
</template>

<script>
import { getDeviceOverview, getAlarmDeviceCount, getDeviceGroup } from '@/api/modules/device'
import { alarmHistory } from '@/api/modules/alarm'
import { sceneAutomationsGet } from '@/api/modules/automation'
import { getGroupStatistics } from '@/api/modules/dashboard'
import { count, responseData, onlineRate, todayRange } from '@/features/dashboard/metrics'

export default {
  data() {
    return {
      loading: false, updatedAt: '', errors: [], device: {}, alarmDevices: null, todayAlarms: null, automationTotal: null, alarms: [], groups: [],
      shortcuts: [
        { key: 'devices', icon: '/static/icon/home/device.svg' },
        { key: 'alarms', icon: '/static/icon/home/bell.svg' },
        { key: 'automation', icon: '/static/icon/home/bolt.svg' },
        { key: 'boards', icon: '/static/icon/home/grid.svg' },
        { key: 'groups', icon: '/static/icon/home/folder.svg' },
        { key: 'rules', icon: '/static/icon/home/ticket.svg' },
        { key: 'scenes', icon: '/static/icon/home/scene.svg' },
        { key: 'account', icon: '/static/icon/home/person.svg' }
      ]
    }
  },
  onShow() { this.refresh() },
  methods: {
    formatMessage(key, values) {
      return Object.entries(values).reduce(
        (message, [name, value]) => message.replace(new RegExp(`\\{${name}\\}`, 'g'), String(value)),
        this.$t(key)
      )
    },
    async refresh() {
      if (this.loading) return
      this.loading = true
      this.errors = []
      const now = new Date()
      const tasks = [
        ['deviceStatistics', async () => { this.device = {}; const d = responseData(await getDeviceOverview()); this.device = { total: count(d.device_total), online: count(d.device_on), rate: onlineRate(d.device_total, d.device_on) } }],
        ['alarmDevices', async () => { this.alarmDevices = null; this.alarmDevices = count(responseData(await getAlarmDeviceCount()).alarm_device_total) }],
        ['todayAlarms', async () => {
          this.todayAlarms = null
          // 历史表还包含恢复记录（N）；仅累计 H/M/L，避免将恢复算作新告警。
          const results = await Promise.all(['H', 'M', 'L'].map(alarm_status => alarmHistory({ page: 1, page_size: 1, ...todayRange(now), alarm_status })))
          this.todayAlarms = results.reduce((sum, result) => sum + count(responseData(result).total), 0)
        }],
        ['automationRules', async () => { this.automationTotal = null; this.automationTotal = count(responseData(await sceneAutomationsGet({ page: 1, page_size: 1 })).total) }],
        ['alarmActivity', async () => { this.alarms = []; const d = responseData(await alarmHistory({ page: 1, page_size: 3 })); if (!Array.isArray(d.list)) throw new Error('告警列表无效'); this.alarms = d.list }],
        ['groupStatus', async () => {
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
              if (!this.errors.includes('groupStatistics')) this.errors.push('groupStatistics')
              return { ...group, statistics: null, rate: null }
            }
          }))
        }]
      ]
      await Promise.all(tasks.map(async ([label, task]) => {
        try { await task() } catch (error) { this.errors.push(label); console.warn(this.$t('dashboard.title') + label + '加载失败', error.message) }
      }))
      this.updatedAt = this.errors.length ? '' : now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
      this.loading = false
    },
    navigate(url) { uni.navigateTo({ url, fail: () => uni.showToast({ title: this.$t('dashboard.openFailed'), icon: 'none' }) }) },
    openDevices() { uni.switchTab({ url: '/pages/devices/index' }) },
    openGroup(group) { uni.setStorageSync('device_list_selected_group', { id: group.id, name: group.name }); this.openDevices() },
    openGroupPicker() { uni.setStorageSync('dashboard_open_groups', true); this.openDevices() },
    openShortcut(key) {
      if (key === 'devices') return this.openDevices()
      if (key === 'groups') return this.openGroupPicker()
      if (key === 'account') return uni.switchTab({ url: '/pages/account/index' })
      if (key === 'automation' || key === 'scenes') {
        uni.setStorageSync('dashboard_automation_tab', key === 'scenes' ? '场景管理' : '场景联动')
        return uni.switchTab({ url: '/pages/automation/index' })
      }
      const routes = { alarms: '/pages/alarms/index', boards: '/pages/dashboard/boards', rules: '/pages/alarm-rules/index', add: '/pages/devices/create' }
      if (routes[key]) this.navigate(routes[key])
    },
    scanDevice() {
      // #ifdef H5
      uni.showToast({ title: this.$t('scanActivation.appOnly'), icon: 'none' })
      // #endif
      // #ifndef H5
      uni.scanCode({
        success: ({ result }) => {
          if (!result || !String(result).trim()) {
            uni.showToast({ title: this.$t('scanActivation.empty'), icon: 'none' })
            return
          }
          this.navigate('/pages/devices/create?code=' + encodeURIComponent(result))
        },
        fail: error => {
          if (!/cancel/i.test(error.errMsg || '')) uni.showToast({ title: this.$t('dashboard.scanFailed'), icon: 'none' })
        }
      })
      // #endif
    },
    alarmLevel(status) { return { H: this.$t('dashboard.high'), M: this.$t('dashboard.medium'), L: this.$t('dashboard.low'), N: this.$t('dashboard.recovered') }[status] || this.$t('dashboard.unknown') },
    timeLabel(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }) },
    openAlarm(item) { uni.navigateTo({ url: '/pages/alarms/detail', success: ({ eventChannel }) => eventChannel.emit('acceptData', { item }), fail: () => uni.showToast({ title: this.$t('dashboard.alarmOpenFailed'), icon: 'none' }) }) }
  }
}
</script>

<style scoped>
.home-page { --home-blue:#1677ff; --home-surface:#ffffff; --home-radius:12rpx; box-sizing:border-box; min-height:100vh; padding:0 28rpx calc(36rpx + env(safe-area-inset-bottom)); color:#1d1d1f; background:#F2F2F7; font-size:24rpx; }
.home-page button { margin:0; padding:0; border:0; border-radius:0; background:transparent; font:inherit; color:inherit; line-height:normal; }
.home-page button::after { border:0; }
.home-page button:focus-visible { outline:2rpx solid #1677ff; outline-offset:4rpx; }
.home-header { display:flex; justify-content:space-between; align-items:center; gap:12rpx; padding:calc(30rpx + env(safe-area-inset-top)) 0 30rpx; }
.page-title { display:block; font-size:44rpx; font-weight:650; line-height:60rpx; }
.page-subtitle { display:block; color:#73737d; font-size:22rpx; line-height:32rpx; margin-top:6rpx; }
.header-actions { display:flex; gap:8rpx; flex-shrink:0; }
.home-page .icon-button { display:flex; align-items:center; justify-content:center; width:72rpx; height:72rpx; }
.icon-button image { width:44rpx; height:44rpx; }
.add-circle { display:flex; align-items:center; justify-content:center; width:58rpx; height:58rpx; border-radius:50%; color:#fff; background:#1677ff; font-size:44rpx; font-weight:300; }
.top-stats { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14rpx; }
.home-page .stat-card { padding:26rpx 14rpx 22rpx; background:var(--home-surface); border:0; border-radius:var(--home-radius); box-shadow:none; min-width:0; text-align:center; }
.stat-heading { display:flex; align-items:center; justify-content:center; gap:10rpx; min-height:62rpx; }
.stat-icon { width:54rpx; height:54rpx; display:flex; align-items:center; justify-content:center; flex-shrink:0; border-radius:50%; background:#edf5ff; }
.stat-online .stat-icon { background:#ebf8f2; }
.stat-alarm .stat-icon { background:#fff2ec; }
.stat-icon image { width:32rpx; height:32rpx; }
.stat-value { font-size:40rpx; font-weight:650; letter-spacing:-1rpx; font-variant-numeric:tabular-nums; white-space:nowrap; }
.unit { font-size:19rpx; font-weight:500; letter-spacing:0; }
.stat-label { display:block; color:#51515c; font-size:22rpx; margin-top:12rpx; line-height:32rpx; }
.stat-note { display:block; color:#73737d; font-size:20rpx; margin-top:20rpx; line-height:28rpx; white-space:nowrap; }
.alarm-note { color:#c65c32; }
.stat-rate-track { height:6rpx; margin:31rpx 14rpx 11rpx; background:#eef2ef; border-radius:4rpx; overflow:hidden; }
.stat-rate-track view { height:100%; background:#37bd8c; border-radius:4rpx; }
.home-page .error-notice { display:block; text-align:left; width:100%; padding:16rpx; margin-top:16rpx; border-radius:12rpx; background:#fff4ed; color:#a25532; font-size:22rpx; line-height:32rpx; }
.panel { margin-top:22rpx; padding:14rpx 24rpx 22rpx; background:var(--home-surface); border:0; border-radius:var(--home-radius); box-shadow:none; }
.section-heading { display:flex; justify-content:space-between; align-items:center; gap:12rpx; min-height:64rpx; }
.section-title { font-size:28rpx; font-weight:600; }
.home-page .more { color:#73737d; font-size:20rpx; min-height:64rpx; }
.more text { font-size:30rpx; margin-left:4rpx; }
.operation-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); margin-top:8rpx; }
.operation-item { display:grid; grid-template-columns:58rpx minmax(0,1fr) auto; align-items:center; gap:12rpx; min-width:0; padding:14rpx 18rpx; border-left:1rpx solid #eeeef2; }
.operation-item:first-child { border:0; padding-left:0; }
.operation-item:last-child { padding-right:0; }
.operation-icon-wrap { width:58rpx; height:58rpx; border-radius:50%; background:#fff4e8; display:flex; align-items:center; justify-content:center; }
.operation-automation .operation-icon-wrap { background:#f2effb; }
.operation-icon { width:34rpx; height:34rpx; }
.operation-value { grid-column:3; grid-row:1; font-size:36rpx; font-weight:600; font-variant-numeric:tabular-nums; }
.operation-label { grid-column:2; grid-row:1; color:#51515c; font-size:21rpx; line-height:28rpx; }
.shortcut-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14rpx; margin-top:10rpx; }
.home-page .shortcut { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12rpx; height:132rpx; background:transparent; border:0; border-radius:var(--home-radius); color:#5f5f6b; font-size:22rpx; }
.shortcut image { width:44rpx; height:44rpx; }
.home-page .alarm-row { display:flex; align-items:center; gap:12rpx; width:100%; min-height:92rpx; padding:14rpx 0; box-sizing:border-box; text-align:left; border-top:1rpx solid #eeeef2; }
.alarm-dot { width:12rpx; height:12rpx; border-radius:50%; background:#fa7943; flex-shrink:0; }
.alarm-dot.recovered { background:#35b88a; }
.alarm-copy { flex:1; min-width:0; }
.alarm-name { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:23rpx; line-height:32rpx; }
.alarm-description { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:20rpx; color:#73737d; margin-top:4rpx; }
.alarm-level { font-size:20rpx; padding:4rpx 8rpx; background:#fff1e9; color:#b85b2d; border-radius:6rpx; flex-shrink:0; }
.alarm-level.recovered { color:#338668; background:#edf8f3; }
.alarm-time { font-size:20rpx; color:#73737d; flex-shrink:0; font-variant-numeric:tabular-nums; }
.empty-message { padding:28rpx 4rpx; color:#73737d; font-size:23rpx; }
.group-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12rpx; margin-top:10rpx; }
.home-page .group-card { min-width:0; padding:18rpx 12rpx; text-align:left; border:0; border-radius:var(--home-radius); background:transparent; }
.group-heading { display:flex; align-items:center; gap:8rpx; }
.group-heading image { width:36rpx; height:36rpx; flex-shrink:0; }
.group-name { white-space:nowrap; text-overflow:ellipsis; overflow:hidden; font-size:22rpx; }
.group-status { display:block; color:#278463; font-size:18rpx; margin-top:10rpx; line-height:26rpx; }
.group-status.warning { color:#b96b22; }
.group-counts { display:block; color:#73737d; font-size:18rpx; margin-top:12rpx; line-height:28rpx; }
.group-rate { display:flex; align-items:center; gap:6rpx; margin-top:12rpx; font-size:18rpx; color:#51515c; }
.rate-track { flex:1; height:8rpx; background:#eeeef2; overflow:hidden; border-radius:6rpx; }
.rate-track view { height:100%; background:#35bd8d; border-radius:6rpx; }
.group-rate.warning .rate-track view { background:#f3a243; }
@media (max-width:360px) { .stat-heading { gap:6rpx; } .stat-value { font-size:36rpx; } .stat-icon { width:46rpx; height:46rpx; } .operation-item { gap:8rpx; padding-left:12rpx; } }
</style>
