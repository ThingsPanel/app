import assert from 'node:assert/strict'
import fs from 'node:fs'
import { ref, computed } from 'vue'

const utility = fs.readFileSync(new URL('../features/devices/utils/device-information.js', import.meta.url), 'utf8')
const { buildAdditionalInfo, validateCoordinates, parseExtensionDefinitions } = await import('data:text/javascript;base64,' + Buffer.from(utility).toString('base64'))
const source = fs.readFileSync(new URL('../features/devices/components/device-information-tab.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
const writes = []
let fail = false
const create = new Function('ref', 'computed', 'watch', 'onBeforeUnmount', 'defineProps', 'defineEmits', 'requestDeviceApi', 'buildAdditionalInfo', 'validateCoordinates', 'parseExtensionDefinitions', 'uni', script + '\nreturn { longitude, latitude, editing, beginEdit, cancelEdit, save }')
const form = create(ref, computed, (_, callback) => callback(), () => {},
  () => ({ deviceId: 'device-id', device: { location: '116.3,39.9', additional_info: '{"retained":1}' } }),
  () => () => {}, async (path, payload, method) => {
    if (fail) throw new Error('网络失败')
    writes.push({ path, payload, method })
  }, buildAdditionalInfo, validateCoordinates, parseExtensionDefinitions, { showToast() {} })
await form.save()
assert.equal(writes.length, 0, '只读状态不能保存')
form.beginEdit()
form.longitude.value = '120'
form.cancelEdit()
assert.equal(form.longitude.value, '116.3')
assert.equal(form.editing.value, false)
form.beginEdit()
form.latitude.value = '100'
await form.save()
assert.equal(writes.length, 0, '无效坐标不能提交')
form.latitude.value = '30'
fail = true
await form.save()
assert.equal(form.editing.value, true, '失败保留编辑草稿')
fail = false
await form.save()
assert.equal(form.editing.value, false)
assert.equal(writes[0].payload.location, '116.3,30')
assert.deepEqual(JSON.parse(writes[0].payload.additional_info), { retained: 1 })
console.log('Device information editing checks passed: read-only, cancel, validation, retry and data preservation')
