// The runtime is authoritative. An unavailable native engine must never appear
// as an empty legacy list. Do not cache this choice across servers or accounts.
export async function alarmRuntime(request) {
  const result = await request('/api/v1/automation/runtime', null, 'GET')
  if (result?.code !== 200 || !['native', 'legacy'].includes(result.data?.mode)) {
    throw new Error('无法确认告警服务，请稍后重试')
  }
  return result.data.mode
}

export function mapAlarmEpisode(alarm, rule, device) {
  let evidence
  try { evidence = JSON.parse(alarm.last_evidence || '{}') } catch { evidence = {} }
  const reasons = Array.isArray(evidence?.reasons) ? evidence.reasons : []
  const content = reasons.map(reason => [reason.key, reason.actual, reason.expected].filter(v => v !== null && v !== undefined && v !== '').join(' ')).join('；')
  const name = rule?.name || alarm.policy_key || '告警'
  return {
    id: alarm.id, name, alarm_config_id: alarm.policy_id, alarm_config_name: name,
    alarm_level: alarm.level,
    alarm_status: alarm.state === 'cleared' ? 'N' : alarm.state === 'active' ? alarm.level : '',
    create_at: alarm.opened_at, recovered_at: alarm.cleared_at,
    content: alarm.state === 'cleared' ? `告警已恢复：${name}` : content || `告警已触发：${name}`,
    alarm_device_list: alarm.subject_id ? [{ id: alarm.subject_id, name: device?.name || '' }] : []
  }
}

export async function readAlarmHistory(request, params = {}) {
  if (await alarmRuntime(request) === 'legacy') {
    const result = await request('/api/v1/alarm/info/history', params, 'GET')
    if (result?.code !== 200 || !result.data) throw new Error('告警历史查询失败')
    return result
  }
  const query = {
    page: params.page || 1, page_size: params.page_size || 10,
    subject_id: params.device_id || '', start_time: params.start_time || '', end_time: params.end_time || '',
    state: params.alarm_status === 'N' ? 'cleared' : params.alarm_status ? 'active' : '',
    level: params.alarm_status === 'N' ? '' : params.alarm_status || ''
  }
  const result = await request('/automation-core/v1/alarm-history', query, 'GET')
  if (!Array.isArray(result?.alarms) || !Number.isInteger(result.total) || result.total < 0) throw new Error('告警历史查询失败')
  // Request-local metadata only: never retain names or records across tenants.
  const names = new Map()
  await Promise.all([...new Set(result.alarms.map(item => item.policy_id))].map(async id => {
    try { names.set(id, await request(`/automation-core/v1/rules/${encodeURIComponent(id)}`, null, 'GET')) } catch (error) {
      if (error.code === 'ALARM_SESSION_CHANGED') throw error
      // Authorized history survives deleted/inaccessible rule metadata.
    }
  }))
  return { code: 200, data: { total: result.total, list: result.alarms.map(item => mapAlarmEpisode(item, names.get(item.policy_id))) } }
}

export async function readAlarmOccurrenceCount(request, range) {
  if (await alarmRuntime(request) === 'legacy') {
    // Legacy history appends recovery rows; native history updates one episode.
    const results = await Promise.all(['H', 'M', 'L'].map(alarm_status => request('/api/v1/alarm/info/history', { ...range, page: 1, page_size: 1, alarm_status }, 'GET')))
    if (results.some(r => r?.code !== 200 || !Number.isInteger(r.data?.total) || r.data.total < 0)) throw new Error('告警统计查询失败')
    return results.reduce((total, r) => total + r.data.total, 0)
  }
  const result = await request('/automation-core/v1/alarm-history', { ...range, page: 1, page_size: 1 }, 'GET')
  if (!Number.isInteger(result?.total) || result.total < 0) throw new Error('告警统计查询失败')
  return result.total
}

export async function readAlarmDeviceCount(request) {
  if (await alarmRuntime(request) === 'legacy') {
    const result = await request('/api/v1/alarm/device/counts', null, 'GET')
    if (result?.code !== 200) throw new Error('告警设备统计失败')
    return result
  }
  const result = await request('/automation-core/v1/alarm-history', { page: 1, page_size: 1, state: 'active' }, 'GET')
  if (!Number.isInteger(result?.active_devices) || result.active_devices < 0) throw new Error('告警设备统计失败')
  return { code: 200, data: { alarm_device_total: result.active_devices } }
}

// Check before every request, not just at the end: a multi-request read must not
// continue under an account or server selected while it was in flight.
export function scopedAlarmRequest(request, scope) {
  const initial = scope()
  const check = () => {
    if (scope() !== initial) {
      const error = new Error('登录账号或服务器已切换，请重新查询')
      error.code = 'ALARM_SESSION_CHANGED'
      throw error
    }
  }
  return async (...args) => {
    check()
    const result = await request(...args)
    check()
    return result
  }
}
