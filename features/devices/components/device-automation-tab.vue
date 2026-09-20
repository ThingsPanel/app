<template>
  <view class="business-tab" :class="{ embedded: alarmOnly }">
    <view class="toolbar">
      <AppSearch v-model="name" placeholder="搜索场景联动" action-label="搜索" @search="search" @action="search" @clear="search">
        <button class="text-button" @click="edit()">{{ alarmOnly ? '新增联动' : '新增' }}</button>
      </AppSearch>
    </view>
    <view v-if="!items.length && !loading && !error" class="state">暂无关联{{ alarmOnly ? '告警规则' : '场景联动' }}</view>
    <view v-for="item in items" :key="item.id" class="rule-row">
      <view class="row-heading"><text class="title">{{ item.name }}</text><text class="status">{{ enabled(item.enabled) ? '已启用' : '已停用' }}</text></view>
      <text class="description">{{ item.description || '暂无描述' }}</text>
      <view class="actions"><button class="text-button" :disabled="!!editingId" @click="edit(item)">{{ editingId === item.id ? '加载中' : '编辑' }}</button><button class="text-button" :disabled="!!pendingId" @click="toggle(item)">{{ pendingId === item.id ? '处理中' : enabled(item.enabled) ? '停用' : '启用' }}</button></view>
      <view v-if="choiceSceneId === item.id" class="alarm-choices">
        <text class="description">请选择要编辑的告警配置</text>
        <button v-for="rule in alarmChoices" :key="rule.id" class="text-button" @click="openAlarmRule(rule.id)">{{ rule.name || rule.id }} ›</button>
      </view>
    </view>
    <view v-if="error" class="state error" @click="load(!items.length)">{{ error }} · 点击重试</view>
    <view v-if="loading" class="state">加载中…</view>
    <button v-else-if="items.length < total" class="text-button more" @click="load()">加载更多</button>
  </view>
</template>

<script setup>
import AppSearch from '@/components/app-search/index.vue'
import { onBeforeUnmount, ref, watch } from 'vue'
import { requestDeviceApi } from '@/api/modules/device-overview'
import { useDeviceList } from '@/features/devices/utils/use-device-list'
import { loadLinkedAlarmRules } from '@/features/devices/utils/device-alarm-navigation'
const props = defineProps({ device: { type: Object, default: () => ({}) }, deviceId: { type: String, required: true }, alarmOnly: Boolean })
const name = ref('')
let appliedName = ''
const pendingId = ref('')
const editingId = ref('')
const choiceSceneId = ref('')
const alarmChoices = ref([])
let navigationVersion = 0
onBeforeUnmount(() => { navigationVersion++ })
watch(() => [props.deviceId, props.alarmOnly], () => { navigationVersion++; editingId.value = ''; choiceSceneId.value = ''; alarmChoices.value = [] })
const { items, loading, error, total, load } = useDeviceList(page => requestDeviceApi(
  props.alarmOnly ? 'scene_automations/alarm' : 'scene_automations/list',
  { device_id: props.deviceId, name: appliedName, page, page_size: 10 }
))
watch(() => [props.deviceId, props.alarmOnly], () => { if (props.deviceId) load(true) }, { immediate: true })
function enabled(value) { return value === 'Y' || value === '1' || value === 1 || value === true }
function search() { appliedName = name.value.trim(); load(true) }
async function edit(item) {
  if (props.alarmOnly && item?.id) {
    if (editingId.value) return
    const version = ++navigationVersion
    editingId.value = item.id
    choiceSceneId.value = ''
    try {
      const rules = await loadLinkedAlarmRules(item.id, requestDeviceApi)
      if (version !== navigationVersion) return
      if (rules.length === 1) openAlarmRule(rules[0].id)
      else { alarmChoices.value = rules; choiceSceneId.value = item.id }
    } catch (cause) {
      if (version === navigationVersion) uni.showToast({ title: cause.message || '无法加载关联告警', icon: 'none' })
    } finally { if (version === navigationVersion) editingId.value = '' }
    return
  }
  // 现有编辑器按规则 ID 加载；新增规则由用户在编辑器中选择设备条件。
  uni.navigateTo({ url: '/pages/automation/rule' + (item?.id ? '?id=' + encodeURIComponent(item.id) : ''), fail: () => uni.showToast({ title: '无法打开规则编辑页', icon: 'none' }) })
}
function openAlarmRule(id) {
  uni.navigateTo({ url: '/pages/alarm-rules/editor?id=' + encodeURIComponent(id), fail: () => uni.showToast({ title: '无法打开告警配置', icon: 'none' }) })
}
async function toggle(item) {
  if (pendingId.value) return
  pendingId.value = item.id
  const deviceId = props.deviceId
  try {
    await requestDeviceApi('scene_automations/switch/' + encodeURIComponent(item.id), null, 'POST')
    if (deviceId === props.deviceId) await load(true)
  } catch (cause) { uni.showToast({ title: cause.message || '操作失败', icon: 'none' }) }
  finally { pendingId.value = '' }
}
</script>

<style scoped>
.business-tab { padding:0 20px; background:#fff; color:#202938; font-family:inherit; }
.business-tab.embedded { padding:0; }
.toolbar,.row-heading,.actions { display:flex; align-items:center; gap:10px; }
.toolbar { padding:14px 0; border-bottom:1px solid #f0f2f6; }
.search { flex:1; min-width:0; font-size:12px; height:36px; background:#fafbfe; border:1px solid #edf0f5; border-radius:4px; padding:0 12px; }
.text-button { background:transparent; color:var(--tp-color-primary, #1677ff); font-size:12px; font-family:inherit; margin:0; padding:0 10px; line-height:40px; border-radius:0; }
.text-button::after { border:0; }.text-button[disabled] { color:#98a2b3; }
.rule-row { padding:18px 0 10px; border-bottom:1px solid #f0f2f6; }.title { flex:1; font-size:14px; line-height:22px; font-weight:500; overflow-wrap:anywhere; }
.status { font-size:11px; color:#8b95a6; }.description { display:block; margin-top:8px; font-size:12px; color:#7a8499; line-height:1.8; }.actions { justify-content:flex-end; margin-top:6px; }
.state { text-align:center; padding:28px 8px; font-size:12px; color:#8b95a6; }.error { color:var(--tp-color-danger, #ff4d35); }.more { margin:8px auto; }
</style>
