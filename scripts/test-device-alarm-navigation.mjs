import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../features/devices/utils/device-alarm-navigation.js', import.meta.url), 'utf8')
const { getAlarmTargetIds, loadLinkedAlarmRules } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
const scene = { actions: [
  { action_type: '10', action_target: 'device-id' },
  { action_type: '30', action_target: 'alarm-a' },
  { action_type: '30', action_target: 'alarm-a' },
  { action_type: '30', action_target: 'alarm-b' }
] }
assert.deepEqual(getAlarmTargetIds(scene), ['alarm-a', 'alarm-b'])
assert.deepEqual(getAlarmTargetIds({}), [])
const calls = []
const rules = await loadLinkedAlarmRules('scene-id', async (path, params) => {
  calls.push([path, params])
  if (path === 'scene_automations/detail/scene-id') return scene
  assert.equal(path, 'alarm/config')
  return { total: 101, list: [{ id: params.page === 1 ? 'alarm-b' : 'alarm-a', name: '真实配置' }] }
})
assert.deepEqual(rules.map(rule => rule.id), ['alarm-a', 'alarm-b'])
assert.equal(calls.length, 3)
await assert.rejects(loadLinkedAlarmRules('scene-id', async () => ({})), /未关联/)
await assert.rejects(loadLinkedAlarmRules('scene-id', async path => path.startsWith('scene_') ? scene : { total: 0, list: [] }), /不存在或无权/)
await assert.rejects(loadLinkedAlarmRules('scene-id', async () => { throw new Error('网络失败') }), /网络失败/)
console.log('Device alarm navigation checks passed: target IDs, deduplication, pagination, missing rules and request errors')
