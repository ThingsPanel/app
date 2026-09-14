<template>
  <view class="alarm-tab">
    <view class="segments"><button :class="{ selected: tab === 'history' }" @click="tab = 'history'">告警历史</button><button :class="{ selected: tab === 'rules' }" @click="tab = 'rules'">告警规则</button></view>
    <device-automation-tab v-if="tab === 'rules'" :device="device" :device-id="deviceId" alarm-only />
    <view v-else>
      <view class="filters">
        <picker mode="date" :value="startDate" @change="startDate = $event.detail.value"><view class="filter">{{ startDate }}</view></picker>
        <text>至</text><picker mode="date" :value="endDate" @change="endDate = $event.detail.value"><view class="filter">{{ endDate }}</view></picker>
      </view>
      <view class="filters"><picker :range="statuses" range-key="label" :value="statusIndex" @change="statusIndex = Number($event.detail.value)"><view class="filter">{{ statuses[statusIndex].label }}</view></picker><button class="link" @click="search">查询</button><button class="link" @click="reset">重置</button></view>
      <view v-if="!items.length && !loading && !error" class="state">暂无告警历史</view>
      <view v-for="item in items" :key="item.id" class="history-row" @click="open(item)">
        <view class="heading"><text class="name">{{ item.name || item.alarm_config_name || '告警' }}</text><text :class="['status', { normal: item.alarm_status === 'N' }]">{{ statusLabel(item.alarm_status) }}</text></view>
        <text class="description">{{ item.content || '暂无告警原因' }}</text><view class="foot"><text>{{ formatTime(item.create_at) }}</text><text class="detail">查看详情 ›</text></view>
      </view>
      <view v-if="error" class="state error" @click="load(!items.length)">{{ error }} · 点击重试</view>
      <view v-if="loading" class="state">加载中…</view>
      <button v-else-if="items.length < total" class="link more" @click="load()">加载更多</button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'
import dayjs from 'dayjs'
import DeviceAutomationTab from './device-automation-tab.vue'
import { requestDeviceApi } from '@/api/modules/device-overview'
import { useDeviceList } from '@/features/devices/utils/use-device-list'
const props = defineProps({ device: { type: Object, default: () => ({}) }, deviceId: { type: String, required: true } })
const tab = ref('history')
const startDate = ref(dayjs().subtract(7, 'day').format('YYYY-MM-DD'))
const endDate = ref(dayjs().format('YYYY-MM-DD'))
const statusIndex = ref(0)
const statuses = [{ label: '全部状态', value: '' }, { label: '高告警', value: 'H' }, { label: '中级告警', value: 'M' }, { label: '低告警', value: 'L' }, { label: '正常', value: 'N' }]
function filters() { return { start_time: dayjs(startDate.value).startOf('day').format(), end_time: dayjs(endDate.value).endOf('day').format(), alarm_status: statuses[statusIndex.value].value } }
let appliedFilters = filters()
const { items, loading, error, total, load } = useDeviceList(page => requestDeviceApi('alarm/info/history', { device_id: props.deviceId, page, page_size: 10, ...appliedFilters }))
watch(() => props.deviceId, () => { if (props.deviceId) load(true) }, { immediate: true })
function search() {
  if (startDate.value > endDate.value) { uni.showToast({ title: '开始日期不能晚于结束日期', icon: 'none' }); return }
  appliedFilters = filters()
  load(true)
}
function reset() { startDate.value = dayjs().subtract(7, 'day').format('YYYY-MM-DD'); endDate.value = dayjs().format('YYYY-MM-DD'); statusIndex.value = 0; search() }
function statusLabel(value) { return statuses.find(item => item.value === value)?.label || value || '未知状态' }
function formatTime(value) { return value && dayjs(value).isValid() ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '—' }
function open(item) { uni.navigateTo({ url: '/pages/alarms/detail', success: result => result.eventChannel.emit('acceptData', { item }), fail: () => uni.showToast({ title: '无法打开告警详情', icon: 'none' }) }) }
</script>

<style scoped>
.alarm-tab { padding:0 20px; background:#fff; color:#202938; font-family:inherit; }
.segments,.filters,.heading,.foot { display:flex; align-items:center; gap:10px; }.segments { border-bottom:1px solid #f0f2f6; padding:8px 0; }.segments button,.link { padding:0 12px; margin:0; border-radius:0; background:transparent; font-family:inherit; font-size:12px; line-height:40px; color:#7a8499; }.segments button::after,.link::after { border:0; }.segments button.selected,.link { color:#1677ff; }.selected { font-weight:500; }.filters { margin-top:12px; font-size:11px; color:#7a8499; flex-wrap:wrap; }.filter { padding:10px 12px; background:#fafbfe; border:1px solid #edf0f5; border-radius:4px; color:#66738a; }
.history-row { padding:18px 0; border-bottom:1px solid #f0f2f6; }.name { flex:1; font-size:14px; line-height:22px; font-weight:500; overflow-wrap:anywhere; }.status { color:#c07820; font-size:11px; }.normal { color:#169a67; }.description { display:block; font-size:12px; color:#7a8499; margin:10px 0; line-height:1.8; }.foot { justify-content:space-between; font-size:11px; color:#8b95a6; }.detail { color:#1677ff; }.state { padding:28px 8px; text-align:center; font-size:12px; color:#8b95a6; }.error { color:#c64b4b; }.more { margin:8px auto; }
</style>
