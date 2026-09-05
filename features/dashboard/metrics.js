export function count(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') throw new Error('缺少统计数值')
  const result = Number(value)
  if (!Number.isFinite(result) || result < 0) throw new Error('统计数值无效')
  return result
}

export function responseData(response) {
  if (response?.code !== 200 || !response.data) throw new Error('首页数据请求失败')
  return response.data
}

export function onlineRate(total, online) {
  const all = count(total)
  const on = count(online)
  if (on > all) throw new Error('在线设备数超过设备总数')
  return all ? (on / all * 100).toFixed(1) : '0.0'
}

export function todayRange(now = new Date()) {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  return { start_time: start.toISOString(), end_time: now.toISOString() }
}

export function trendSeries(points) {
  if (!Array.isArray(points)) throw new Error('缺少趋势数据')
  return points.map(point => ({
    time: Date.parse(point.timestamp),
    total: count(point.device_total),
    rate: Number(onlineRate(point.device_total, point.device_online))
  })).filter(point => Number.isFinite(point.time)).sort((a, b) => a.time - b.time)
}
