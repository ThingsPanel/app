<template>
  <view class="alarm-tab">
    <view class="segments"><button :class="{ selected: tab === 'history' }" @click="tab = 'history'">告警历史</button><button :class="{ selected: tab === 'rules' }" @click="tab = 'rules'">告警规则</button></view>
    <device-automation-tab v-if="tab === 'rules'" :device="device" :device-id="deviceId" alarm-only />
    <view v-else>
      <view class="query-area">
        <view class="filter-row">
          <button class="range-filter" :aria-label="`日期范围 ${startDate} 至 ${endDate}`" @click="openDateRange"><text>{{ rangeLabel }}</text><view class="chevron" aria-hidden="true" /></button>
<app-picker class="status-picker" :range="statuses" range-key="label" :value="statusIndex" @change="statusIndex = Number($event.detail.value)"><view class="status-filter">{{ statuses[statusIndex].label }}<view class="chevron" aria-hidden="true" /></view></app-picker>
        </view>
        <view class="query-actions">
          <view class="quick-ranges"><button :class="{ active: preset === '7d' }" @click="selectPreset('7d')">最近7天</button><button :class="{ active: preset === '24h' }" @click="selectPreset('24h')">最近24小时</button></view>
          <view class="submit-actions"><button class="reset-button" @click="reset">重置</button><button class="query-button" :disabled="loading" @click="search">{{ loading ? '查询中' : '查询' }}</button></view>
        </view>
      </view>
      <view v-if="!items.length && !loading && !error" class="state">暂无告警历史</view>
      <view v-for="item in items" :key="item.id" class="history-row" @click="open(item)">
        <view class="heading"><text class="name">{{ item.name || item.alarm_config_name || '告警' }}</text><text :class="['status', { normal: item.alarm_status === 'N' }]">{{ statusLabel(item.alarm_status) }}</text></view>
        <text class="description">{{ item.content || '暂无告警原因' }}</text><view class="foot"><text>{{ formatTime(item.create_at) }}</text><text class="detail">查看详情 ›</text></view>
      </view>
      <view v-if="error" class="state error" @click="load(!items.length)">{{ error }} · 点击重试</view>
      <view v-if="loading" class="state">加载中…</view>
      <button v-else-if="items.length < total" class="link more" @click="load()">加载更多</button>
    </view>
    <uni-popup ref="datePopup" type="bottom" background-color="#fff">
      <view class="date-sheet">
        <view class="date-sheet-header"><button @click="datePopup.close()">取消</button><text>选择日期范围</text><button class="confirm" @click="confirmDateRange">确定</button></view>
        <picker mode="date" :value="draftStart" :end="draftEnd" @change="draftStart = $event.detail.value"><view class="date-sheet-row"><text>开始日期</text><view>{{ draftStart }}<view class="chevron" /></view></view></picker>
        <picker mode="date" :value="draftEnd" :start="draftStart" @change="draftEnd = $event.detail.value"><view class="date-sheet-row"><text>结束日期</text><view>{{ draftEnd }}<view class="chevron" /></view></view></picker>
        <text class="date-sheet-hint">确定日期后，点击查询查看告警记录</text>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import DeviceAutomationTab from './device-automation-tab.vue'
import { requestDeviceApi } from '@/api/modules/device-overview'
import { useDeviceList } from '@/features/devices/utils/use-device-list'
const props = defineProps({ device: { type: Object, default: () => ({}) }, deviceId: { type: String, required: true } })
const tab = ref('history')
const startDate = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const endDate = ref(dayjs().format('YYYY-MM-DD'))
const preset = ref('7d')
const datePopup = ref(null)
const draftStart = ref('')
const draftEnd = ref('')
const rangeLabel = computed(() => {
  const format = startDate.value.slice(0, 4) === endDate.value.slice(0, 4) ? 'MM-DD' : 'YYYY-MM-DD'
  return `${dayjs(startDate.value).format(format)} → ${dayjs(endDate.value).format(format)}`
})
function openDateRange() { draftStart.value = startDate.value; draftEnd.value = endDate.value; datePopup.value.open() }
function confirmDateRange() {
  if (draftStart.value > draftEnd.value) { uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' }); return }
  startDate.value = draftStart.value; endDate.value = draftEnd.value; preset.value = ''; datePopup.value.close()
}
function selectPreset(value) { preset.value = value; startDate.value = dayjs().subtract(value === '24h' ? 1 : 7, 'day').format('YYYY-MM-DD'); endDate.value = dayjs().format('YYYY-MM-DD') }
const statusIndex = ref(0)
const statuses = [{ label: '全部状态', value: '' }, { label: '高告警', value: 'H' }, { label: '中级告警', value: 'M' }, { label: '低告警', value: 'L' }, { label: '正常', value: 'N' }]
function filters() {
  // 24 小时使用滚动时间范围，不能按两个自然日查询。
  const now = dayjs()
  return { start_time: preset.value === '24h' ? now.subtract(24, 'hour').format() : dayjs(startDate.value).startOf('day').format(), end_time: preset.value === '24h' ? now.format() : dayjs(endDate.value).endOf('day').format(), alarm_status: statuses[statusIndex.value].value }
}
let appliedFilters = filters()
const { items, loading, error, total, load } = useDeviceList(page => requestDeviceApi('alarm/info/history', { device_id: props.deviceId, page, page_size: 10, ...appliedFilters }))
watch(() => props.deviceId, () => { if (props.deviceId) load(true) }, { immediate: true })
function search() {
  if (startDate.value > endDate.value) { uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' }); return }
  appliedFilters = filters()
  load(true)
}
function reset() { selectPreset('7d'); statusIndex.value = 0; search() }
function statusLabel(value) { return statuses.find(item => item.value === value)?.label || value || '未知状态' }
function formatTime(value) { return value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—' }
function open(item) { uni.navigateTo({ url: '/pages/alarms/detail', success: result => result.eventChannel.emit('acceptData', { item }), fail: () => uni.showToast({ title: '无法打开告警详情', icon: 'none' }) }) }
</script>

<style scoped>
.alarm-tab { padding:0 20px; background:#fff; color:#202938; font-family:inherit; }
.query-area { padding:14px 0 0; }
.filter-row { display:flex; gap:8px; align-items:center; }
.range-filter,.status-filter { display:flex; align-items:center; justify-content:space-between; gap:8px; height:38px; box-sizing:border-box; padding:0 12px; border:1px solid #edf0f5; border-radius:4px; background:#fafbfe; color:#202938; font:inherit; font-size:12px; line-height:20px; }
.range-filter { flex:1; min-width:0; margin:0; text-align:left; }
.range-filter text { min-width:0; white-space:nowrap; font-variant-numeric:tabular-nums; }
.status-picker { flex:0 0 116px; }
.chevron { flex-shrink:0; width:6px; height:6px; margin:0 2px 3px; border-right:1.5px solid #8a929f; border-bottom:1.5px solid #8a929f; transform:rotate(45deg); }
.query-actions,.quick-ranges,.submit-actions { display:flex; align-items:center; }
.query-actions { justify-content:space-between; gap:8px; margin-top:8px; }
.quick-ranges { gap:8px; }
.submit-actions { gap:8px; }
.query-actions button,.date-sheet button { margin:0; padding:0; border-radius:4px; font-family:inherit; font-size:13px; background:transparent; line-height:40px; }
.quick-ranges button { color:#737d8c; white-space:nowrap; }
.query-actions button { font-size:12px; }
.quick-ranges button.active { color:var(--tp-color-primary, #1677ff); font-weight:500; }
.reset-button { color:#737d8c; min-width:36px; }
.query-actions .query-button { padding:0 10px; color:var(--tp-color-primary, #1677ff); background:transparent; font-size:12px; border-radius:0; }
.query-actions .query-button[disabled] { color:#98a2b3; background:transparent; }
.range-filter::after,.query-actions button::after,.date-sheet button::after { border:0; }
.date-sheet { padding:0 20px 24px; color:#303744; font-family:inherit; }
.date-sheet-header { display:flex; justify-content:space-between; align-items:center; height:56px; border-bottom:1px solid #f0f2f6; font-size:16px; font-weight:500; }
.date-sheet-header button { min-width:44px; color:#737d8c; font-size:14px; }
.date-sheet-header .confirm { color:var(--tp-color-primary, #1677ff); }
.date-sheet-row,.date-sheet-row>view { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.date-sheet-row { min-height:56px; font-size:14px; border-bottom:1px solid #f0f2f6; }
.date-sheet-hint { display:block; margin-top:16px; font-size:12px; color:#8a929f; }
@media (max-width:360px) { .alarm-tab { padding:0 16px; } .range-filter,.status-filter { padding:0 8px; font-size:12px; } .status-picker { flex-basis:100px; } .quick-ranges { gap:6px; } .query-actions button { font-size:12px; } }
.segments,.filters,.heading,.foot { display:flex; align-items:center; gap:10px; }.segments { border-bottom:1px solid #f0f2f6; padding:8px 0; }.segments button,.link { padding:0 12px; margin:0; border-radius:0; background:transparent; font-family:inherit; font-size:12px; line-height:40px; color:#7a8499; }.segments button::after,.link::after { border:0; }.segments button.selected,.link { color:var(--tp-color-primary, #1677ff); }.selected { font-weight:500; }.filters { margin-top:12px; font-size:11px; color:#7a8499; flex-wrap:wrap; }.filter { padding:10px 12px; background:#fafbfe; border:1px solid #edf0f5; border-radius:4px; color:#66738a; }
.history-row { padding:18px 0; border-bottom:1px solid #f0f2f6; }.name { flex:1; font-size:14px; line-height:22px; font-weight:500; overflow-wrap:anywhere; }.status { color:var(--tp-color-warning, #ff9500); font-size:11px; }.normal { color:var(--tp-color-success, #08bf63); }.description { display:block; font-size:12px; color:#7a8499; margin:10px 0; line-height:1.8; }.foot { justify-content:space-between; font-size:11px; color:#8b95a6; }.detail { color:var(--tp-color-primary, #1677ff); }.state { padding:28px 8px; text-align:center; font-size:12px; color:#8b95a6; }.error { color:var(--tp-color-danger, #ff4d35); }.more { margin:8px auto; }
</style>
