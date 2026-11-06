import { alarmRuntime, mapAlarmEpisode } from './alarm-reading.js'
/** Read from the engine selected by the server; failures never switch engines. */
export async function loadAlarmDetail(request, alarmId, recordType = 'history') {
  const mode = await alarmRuntime(request)
  const id = encodeURIComponent(alarmId)
  if (mode === 'legacy') {
    const result = await request(`/api/v1/alarm/info/history/${id}?recordType=${recordType}`, null, 'GET')
    if (result?.code !== 200 || !result.data?.id) throw new Error('告警不存在或无权查看')
    return result.data
  }
  const alarm = await request(`/automation-core/v1/alarms/${id}`, null, 'GET')
  if (!alarm?.id || !alarm.policy_id) throw new Error('告警不存在或无权查看')
  const [ruleLookup, deviceLookup] = await Promise.allSettled([
    request(`/automation-core/v1/rules/${encodeURIComponent(alarm.policy_id)}`, null, 'GET'),
    alarm.subject_id ? request(`/api/v1/device/detail/${encodeURIComponent(alarm.subject_id)}`, null, 'GET') : null
  ])
  for (const result of [ruleLookup, deviceLookup]) {
    if (result.status === 'rejected' && result.reason?.code === 'ALARM_SESSION_CHANGED') throw result.reason
  }
  // Optional metadata must not hide an episode the alarm API authorized.
  const rule = ruleLookup.status === 'fulfilled' ? ruleLookup.value : null
  const deviceResult = deviceLookup.status === 'fulfilled' ? deviceLookup.value : null
  const device = deviceResult?.code === 200 ? deviceResult.data : null
  return mapAlarmEpisode(alarm, rule, device)
}
