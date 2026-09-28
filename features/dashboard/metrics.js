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

/**
 * 「常用设备」取最近有上报的设备：ts 越大越靠前，没有 ts 的按接口原顺序排在后面。
 *
 * 列表接口不支持按活跃度排序，所以调用方先多取一批，再在这里截断成一行。
 * 排序是稳定的（时间相同回到接口顺序），设备状态实时变化也不会让卡片来回跳。
 */
export function recentDevices(list, limit = 6) {
  if (!Array.isArray(list)) return []
  return list
    .map((device, index) => ({ device, index, time: toTimestamp(device?.ts) }))
    .sort((a, b) => (b.time === a.time ? a.index - b.index : b.time - a.time))
    .slice(0, Math.max(0, limit))
    .map(entry => entry.device)
}

function toTimestamp(value) {
  if (value === null || value === undefined || value === '') return -Infinity
  const numeric = Number(value)
  if (Number.isFinite(numeric)) return numeric
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : -Infinity
}

export function trendSeries(points) {
  if (!Array.isArray(points)) throw new Error('缺少趋势数据')
  return points.map(point => ({
    time: Date.parse(point.timestamp),
    total: count(point.device_total),
    rate: Number(onlineRate(point.device_total, point.device_online))
  })).filter(point => Number.isFinite(point.time)).sort((a, b) => a.time - b.time)
}
