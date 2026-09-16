<template>
  <view class="information-tab">
    <view v-if="loading" class="state">加载中…</view>
    <view v-else-if="error" class="state error" @click="initialize">{{ error }} · 点击重试</view>
    <view v-else>
      <view class="information-heading">
        <text class="section-title">设备位置</text>
        <button v-if="!editing" class="save" :disabled="!deviceId" @click="beginEdit">编辑</button>
        <view v-else class="edit-actions"><button class="save" :disabled="saving" @click="cancelEdit">取消</button><button class="save" :disabled="saving || !deviceId" :loading="saving" @click="save">保存</button></view>
      </view>
      <device-location-map
        v-if="editing || hasCoordinate"
        :longitude="longitude"
        :latitude="latitude"
        :interactive="editing"
        :resolve-address="!editing"
        @pick="applyPickedCoordinate"
        @address="handleAddress"
      />
      <view v-else class="state">未设置位置</view>
      <!-- 只读态把解析出的地址用文字给出：小地图上不挂气泡，也就不会挤占图面。 -->
      <view v-if="!editing && address" class="location-address">
        <text class="label">位置地址</text>
        <text class="coordinate-value">{{ address }}</text>
      </view>
      <view v-if="editing" class="location-fields">
        <view class="field"><text class="label">经度</text><input v-model.trim="longitude" :disabled="saving" class="input" placeholder="-180 至 180" /></view>
        <view class="field"><text class="label">纬度</text><input v-model.trim="latitude" :disabled="saving" class="input" placeholder="-90 至 90" /></view>
        <text class="hint">可以在地图上点选，也可以直接输入经纬度；保存后生效</text>
      </view>
      <text class="section-title extension-title">扩展信息</text>
      <view v-if="!visibleFields.length" class="state">暂无扩展信息</view>
      <view v-for="field in visibleFields" :key="field.name" class="extension-field">
        <text class="label">{{ field.name }}</text><text v-if="field.desc" class="hint">{{ field.desc }}</text>
        <text v-if="!editing" class="coordinate-value">{{ displayField(field) }}</text>
        <switch v-else-if="field.type === 'Boolean'" :checked="field.value === true" :disabled="saving" color="#1677ff" @change="field.value = $event.detail.value" />
<app-picker v-else-if="field.type === 'Enum'" :disabled="saving" :range="field.options || []" range-key="label" :value="Math.max(0, (field.options || []).findIndex(option => option.value === field.value))" @change="field.value = field.options[Number($event.detail.value)].value"><view class="input picker">{{ (field.options || []).find(option => option.value === field.value)?.label || field.value || '请选择' }}</view></app-picker>
        <input v-else v-model="field.value" :disabled="saving" class="input" :placeholder="field.type === 'Number' ? '请输入数字' : '请输入'" />
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { requestDeviceApi } from '@/api/modules/device-overview'
import DeviceLocationMap from '@/features/devices/components/device-location-map.vue'
import { buildAdditionalInfo, validateCoordinates, parseExtensionDefinitions } from '@/features/devices/utils/device-information'
import { parseMapCoordinate } from '@/utils/map-config'
const props = defineProps({ device: { type: Object, default: () => ({}) }, deviceId: { type: String, required: true } })
const emit = defineEmits(['saved'])
const latitude = ref('')
const longitude = ref('')
const fields = ref([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const editing = ref(false)
let snapshot = null
function beginEdit() {
  snapshot = { longitude: longitude.value, latitude: latitude.value, fields: JSON.parse(JSON.stringify(fields.value)) }
  editing.value = true
}
function cancelEdit() {
  if (saving.value || !snapshot) return
  longitude.value = snapshot.longitude
  latitude.value = snapshot.latitude
  fields.value = snapshot.fields
  editing.value = false
}
function displayField(field) {
  if (field.type === 'Boolean') return field.value ? '是' : '否'
  if (field.type === 'Enum') return field.options?.find(option => option.value === field.value)?.label || field.value || '未设置'
  return field.value === '' ? '未设置' : field.value
}
/** 地图点选结果回填到表单，与手动输入共用同一份状态。 */
function applyPickedCoordinate(coordinate) {
  longitude.value = String(coordinate.longitude)
  latitude.value = String(coordinate.latitude)
}
const hasCoordinate = computed(() => parseMapCoordinate(longitude.value, latitude.value) !== null)
const visibleFields = computed(() => fields.value.filter(field => field.enable === true))
let additionalInfo = {}
let version = 0
onBeforeUnmount(() => { version += 1 })
function parse(value, fallback) { return typeof value === 'string' ? (value.trim() ? JSON.parse(value) : fallback) : value ?? fallback }
function fieldValue(value, type) {
  if (value === undefined || value === null || value === '') return type === 'Boolean' ? false : ''
  if (type === 'Boolean') return value === true || value === 'true' || value === 1
  return String(value)
}
async function initialize() {
  const current = ++version
  if (!props.deviceId) return
  loading.value = true
  editing.value = false
  error.value = ''
  try {
    const location = String(props.device.location || '').split(',')
    longitude.value = location[0] || ''
    latitude.value = location[1] || ''
    additionalInfo = parse(props.device.additional_info, {})
    if (!additionalInfo || typeof additionalInfo !== 'object') throw new Error('设备扩展信息格式异常，无法安全编辑')
    const config = props.device.device_config_id ? await requestDeviceApi('device_config/' + encodeURIComponent(props.device.device_config_id)) : null
    if (current !== version) return
    const definitions = parseExtensionDefinitions(config?.additional_info)
    const stored = additionalInfo.extendedInfo ?? additionalInfo
    const values = Array.isArray(stored) ? Object.fromEntries(stored.map(item => [item.name, item.value])) : stored
    fields.value = definitions.map(field => ({ ...field, value: fieldValue(Object.prototype.hasOwnProperty.call(values, field.name) ? values[field.name] : field.default_value, field.type) }))
  } catch (cause) { if (current === version) error.value = cause.message || '加载设备信息失败' }
  finally { if (current === version) loading.value = false }
}
watch(() => [props.deviceId, props.device], initialize, { immediate: true })
async function save() {
  if (!editing.value || saving.value || loading.value || error.value || !props.deviceId) return
  const current = version
  try {
    const lng = longitude.value
    const lat = latitude.value
    const location = validateCoordinates(lng, lat)
    const updated = buildAdditionalInfo(additionalInfo, fields.value)
    saving.value = true
    await requestDeviceApi('device', { id: props.deviceId, location, additional_info: JSON.stringify(updated) }, 'PUT')
    if (current === version) { editing.value = false; additionalInfo = updated; uni.showToast({ title: '保存成功', icon: 'success' }); emit('saved') }
  } catch (cause) { if (current === version) uni.showToast({ title: cause.message || '保存失败', icon: 'none' }) }
  finally { saving.value = false }
}
</script>

<style scoped>
.information-tab { padding: 14px 20px 24px; background: #fff; color: #202938; font-family: inherit; }
.information-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.edit-actions { display: flex; gap: 10px; }
.coordinate-value { display: block; min-width: 0; overflow-wrap: anywhere; color: #39465d; font-size: 12px; line-height: 22px; }
.section-title { display: block; font-size: 14px; line-height: 22px; font-weight: 600; }
.location-fields { margin-top: 14px; }
.extension-title { border-top: 1px solid #f0f2f6; margin-top: 24px; padding-top: 22px; }
.field { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; }
.label { font-size: 12px; line-height: 20px; color: #6d7890; }
.field .label { width: 42px; flex-shrink: 0; }
.input { background: #fafbfe; border: 1px solid #edf0f5; border-radius: 4px; color: #39465d; height: 40px; padding: 0 12px; font-size: 13px; font-weight: 400; font-family: inherit; flex: 1; min-width: 0; }
.hint { display: block; color: #8b95a6; font-size: 11px; line-height: 1.7; margin: 10px 0; }
.extension-field { margin-top: 18px; }
.extension-field .input { margin-top: 8px; }
.picker { line-height: 40px; }
/* 与 device-automation-tab 的 .text-button / device-alarm-tab 的 .link 保持同一规格：透明底、蓝字、无圆角。 */
.save { margin: 0; padding: 0 10px; background: transparent; color: #1677ff; border-radius: 0; font-size: 12px; font-weight: 400; line-height: 40px; font-family: inherit; }
.save::after { border: 0; }
.save[disabled] { color: #98a2b3; }
.state { padding: 28px 0; text-align: center; color: #8b95a6; font-size: 12px; }
.error { color: #c64b4b; }
</style>
