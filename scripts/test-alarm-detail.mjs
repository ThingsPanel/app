import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
const source = await readFile(new URL('../services/alarm-detail.js', import.meta.url), 'utf8')
const { loadAlarmDetail } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const calls = []
const responses = {
  '/api/v1/automation/runtime': { code: 200, data: { mode: 'native' } },
  '/automation-core/v1/alarms/episode': { id: 'episode', policy_id: 'policy', subject_id: 'device', state: 'active', level: 'H', opened_at: '2026-11-05T10:00:00Z' },
  '/automation-core/v1/rules/policy': { name: '温度告警' },
  '/api/v1/device/detail/device': { code: 200, data: { name: '温度计' } }
}
const request = async path => { calls.push(path); return responses[path] }
const active = await loadAlarmDetail(request, 'episode')
assert.equal(active.alarm_level, 'H')
assert.equal(active.alarm_status, 'H')
assert.equal(active.alarm_device_list[0].name, '温度计')
assert.equal(active.name, '温度告警')
assert.ok(!calls.some(path => path.includes('/alarm/info/')))
responses['/automation-core/v1/alarms/episode'].state = 'cleared'
assert.equal((await loadAlarmDetail(request, 'episode')).alarm_status, 'N')
responses['/automation-core/v1/alarms/episode'].last_evidence = JSON.stringify({ reasons: [{ key: 'temperature', actual: '38', expected: '> 35' }] })
assert.ok(!(await loadAlarmDetail(request, 'episode')).content.includes('38'))
const unavailableMetadata = await loadAlarmDetail(async path => {
  if (path.includes('/rules/') || path.includes('/device/detail/')) throw new Error('not found')
  return request(path)
}, 'episode')
assert.equal(unavailableMetadata.id, 'episode')
await assert.rejects(loadAlarmDetail(async path => {
  if (path === '/api/v1/automation/runtime') return responses[path]
  throw new Error('Forbidden')
}, 'episode'), /Forbidden/)
responses['/api/v1/automation/runtime'].data.mode = 'legacy'
responses['/api/v1/alarm/info/history/episode?recordType=info'] = { code: 200, data: { id: 'episode' } }
assert.equal((await loadAlarmDetail(request, 'episode', 'info')).id, 'episode')
await assert.rejects(loadAlarmDetail(request, 'missing'), /告警不存在/)
responses['/api/v1/automation/runtime'].data.mode = 'unknown'
await assert.rejects(loadAlarmDetail(request, 'episode'), /无法确认/)
console.log('Alarm detail: native, legacy, recovery, missing data and permission failure passed')
