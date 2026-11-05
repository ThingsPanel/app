/** Read from the engine selected by the server; failures never switch engines. */
export async function loadAlarmDetail(request, alarmId, recordType = 'history') {
  const runtime = await request('/api/v1/automation/runtime', null, 'GET')
  if (runtime?.code !== 200 || !['native', 'legacy'].includes(runtime.data?.mode)) {
    throw new Error('无法确认告警服务，请稍后重试')
  }
  const id = encodeURIComponent(alarmId)
  if (runtime.data.mode === 'legacy') {
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
  // Optional metadata must not hide an episode the alarm API authorized.
  const rule = ruleLookup.status === 'fulfilled' ? ruleLookup.value : null
  const deviceResult = deviceLookup.status === 'fulfilled' ? deviceLookup.value : null
  const device = deviceResult?.code === 200 ? deviceResult.data : null
  let evidence
  try { evidence = JSON.parse(alarm.last_evidence || '{}') } catch { evidence = {} }
  const reasons = evidence.reasons || []
  const content = reasons.map(reason => [reason.key, reason.actual, reason.expected].filter(Boolean).join(' ')).join('；')
  return {
    id: alarm.id,
    name: rule?.name || alarm.policy_key,
    alarm_config_id: alarm.policy_id,
    alarm_config_name: rule?.name || alarm.policy_key,
    alarm_level: alarm.level,
    alarm_status: alarm.state === 'cleared' ? 'N' : alarm.state === 'active' ? alarm.level : '',
    create_at: alarm.opened_at,
    recovered_at: alarm.cleared_at,
    content: alarm.state === 'cleared' ? `告警已恢复：${rule?.name || alarm.policy_key}` : content || `告警已触发：${rule?.name || alarm.policy_key}`,
    alarm_device_list: alarm.subject_id ? [{ id: alarm.subject_id, name: device?.name || '' }] : []
  }
}
