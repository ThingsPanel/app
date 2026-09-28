/**
 * 合并设备分页结果，并按设备 ID 去重。
 *
 * 已存在的设备保留原位置，新响应中的同 ID 设备会更新其内容；没有 ID 的异常数据
 * 使用对象引用作为键，避免把多条异常记录误合并成一条。
 */
export function mergeUniqueDevices(current, incoming) {
  const merged = new Map()
  const keyOf = item => item?.id == null || item.id === '' ? item : String(item.id)
  for (const item of Array.isArray(current) ? current : []) merged.set(keyOf(item), item)
  for (const item of Array.isArray(incoming) ? incoming : []) {
    const key = keyOf(item)
    merged.set(key, merged.has(key) ? { ...merged.get(key), ...item } : item)
  }
  return [...merged.values()]
}
