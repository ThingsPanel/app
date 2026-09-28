import dayjs from 'dayjs'

/**
 * 告警时间的显示规则（列表场景统一使用）：
 *   当天    -> HH:mm       例如 15:41
 *   非当天  -> YYYY-MM-DD  例如 2026-09-13
 *   无效值  -> '—'
 *
 * 列表里只显示时分会让跨天的告警无法判断是哪一天，所以非当天一律补上年月日。
 * 详情页需要完整时间戳，请直接用 dayjs().format('YYYY-MM-DD HH:mm')，不要用本函数。
 */
export function formatAlarmTime(value) {
  const date = parseDate(value)
  if (!date) return '—'
  return date.isSame(dayjs(), 'day') ? date.format('HH:mm') : date.format('YYYY-MM-DD')
}

/** 兼容秒级 / 毫秒级时间戳与日期字符串 */
function parseDate(value) {
  if (value === null || value === undefined || value === '') return null

  if (typeof value === 'number' || /^\d+$/.test(String(value))) {
    const num = Number(value)
    const date = dayjs(num < 1e12 ? num * 1000 : num)
    return date.isValid() ? date : null
  }

  const date = dayjs(value)
  return date.isValid() ? date : null
}
