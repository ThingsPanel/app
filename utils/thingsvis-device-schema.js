export const rowsOf = value => Array.isArray(value) ? value : Array.isArray(value?.list) ? value.list : Array.isArray(value?.data) ? value.data : []

export function normalizeHistoryRange(value) {
  const presets = { '1h': 'last_1h', '6h': 'last_6h', '24h': 'last_24h', '7d': 'last_7d', '30d': 'last_30d', all: 'last_30d' }
  return typeof value === 'string' && value.startsWith('last_') ? value : presets[value] || 'last_30d'
}

export function collectDeviceHistory(schema, payload = {}) {
  const requests = new Map()
  const weights = { last_1h: 1, last_6h: 6, last_24h: 24, last_7d: 168, last_30d: 720 }
  const add = (id, range) => {
    if (!id) return
    if (!range && requests.has(id)) return
    const next = normalizeHistoryRange(range)
    if (!requests.has(id) || (weights[next] || 0) > (weights[requests.get(id)] || 0)) requests.set(id, next)
  }
  const scan = (value, range) => {
    if (typeof value === 'string') {
      for (const match of value.matchAll(/\{\{\s*ds\.([^.\s]+)\.data\.(.+?)\s*\}\}/g)) {
        if (payload.dataSourceId && payload.dataSourceId !== match[1]) continue
        const root = match[2].split(/[.\[\]]/)[0]
        if (root.endsWith('__history')) add(root.slice(0, -9), range)
      }
    } else if (value && typeof value === 'object') Object.values(value).forEach(item => scan(item, range))
  }
  for (const node of schema.nodes || []) {
    for (const binding of node.data || []) {
      scan(binding.expression, binding.historyConfig?.timeRange || node.props?.timeRangePreset)
    }
    scan(node.props, node.props?.timeRangePreset)
  }
  const requested = (payload.fieldIds || []).filter(id => typeof id === 'string')
  requested.filter(id => id.endsWith('__history')).forEach(id => {
    const field = id.slice(0, -9)
    if (payload.historyConfig?.timeRange) requests.set(field, normalizeHistoryRange(payload.historyConfig.timeRange))
    else if (!requests.has(field)) add(field)
  })
  const source = schema.dataSources.find(item => item.id === payload.dataSourceId)
  if (source?.config?.bufferSize > 0 && requests.size === 0) requested.forEach(id => add(id, payload.historyConfig?.timeRange))
  return requests
}

export function normalizeHistoryRows(value) {
  return rowsOf(value).map(item => {
    const timestamp = item.timestamp ?? item.time ?? item.ts ?? item.x
    const numeric = typeof timestamp === 'number' || /^\d+(\.\d+)?$/.test(String(timestamp)) ? Number(timestamp) : Date.parse(timestamp)
    return { ts: numeric > 0 && numeric < 1e11 ? numeric * 1000 : numeric, value: Number(item.value ?? item.y ?? item.avg) }
  }).filter(item => Number.isFinite(item.ts) && Number.isFinite(item.value))
}

export function extractDeviceFields(models) {
  const kinds = { telemetry: 'telemetry', attributes: 'attribute', events: 'event', commands: 'command' }
  return Object.entries(kinds).flatMap(([key, dataType]) => rowsOf(models[key]).map(item => {
    const id = item.key || item.data_identifier || item.identifier || item.id
    const rawType = String(item.data_type || item.type || '').toLowerCase()
    const type = /int|float|double|number/.test(rawType) ? 'number' : /bool/.test(rawType) ? 'boolean' : /json|object|array/.test(rawType) ? 'json' : 'string'
    return { id, name: item.name || item.data_name || item.label || id, type, dataType, unit: item.unit, description: item.description || item.define }
  }).filter(field => typeof field.id === 'string' && field.id))
}

export function parseDeviceSchema(raw, deviceId, fields) {
  if (!raw) return null
  const schema = typeof raw === 'string' ? JSON.parse(raw) : JSON.parse(JSON.stringify(raw))
  if (!schema || !Array.isArray(schema.nodes) || !schema.canvas) throw new Error('设备移动端可视化配置格式无效')
  schema.canvas.responsive = false
  schema.dataSources = (schema.dataSources || []).map(source => ['PLATFORM_FIELD', 'PLATFORM'].includes(String(source.type).toUpperCase())
    ? { ...source, config: { ...source.config, deviceId } } : source)
  // 只有明确绑定历史的来源才开启历史缓冲，供专用 history 消息回填。
  schema.dataSources.forEach(source => {
    if (['PLATFORM_FIELD', 'PLATFORM'].includes(String(source.type).toUpperCase()) && collectDeviceHistory(schema, { dataSourceId: source.id }).size > 0) {
      source.config.bufferSize = Math.max(1, Number(source.config.bufferSize) || 0)
    }
  })
  // 兼容模板编辑器保存的字段绑定，保留用户配置的手动动作。
  const events = { 'interaction/basic-switch': 'change', 'interaction/basic-slider': 'change', 'interaction/basic-select': 'change', 'interaction/basic-input': 'submit' }
  schema.nodes.forEach(node => {
    const event = events[node.type]
    const expression = node.data?.find(binding => binding.targetProp === 'value')?.expression || node.props?.value
    const match = typeof expression === 'string' && /^\{\{\s*ds\.([^.\s]+)\.data\.(.+?)\s*\}\}$/.exec(expression)
    if (!event || !match) return
    const fieldId = match[2].split(/[.[]/)[0]
    const field = fields.find(item => item.id === fieldId)
    if (!field) return
    const value = node.type === 'interaction/basic-switch' && field.type === 'number' ? 'payload ? 1 : 0' : 'payload'
    const action = { type: 'callWrite', dataSourceId: match[1], payload: `({ ${JSON.stringify(fieldId)}: ${value} })`, __thingsvisAutoWrite: 'field-binding' }
    node.events = node.events || []
    let handler = node.events.find(item => item.event === event)
    if (!handler) { handler = { event, actions: [] }; node.events.push(handler) }
    const manual = (handler.actions || []).filter(item => item.__thingsvisAutoWrite !== 'field-binding')
    // 已显式配置同数据源写入时，以模板动作负责下发，避免一次交互重复控制。
    handler.actions = manual.some(item => item.type === 'callWrite' && item.dataSourceId === match[1]) ? manual : [...manual, action]
  })
  return schema
}

export function normalizeDeviceValues(value) {
  if (Array.isArray(value)) return Object.fromEntries(value.filter(item => item && (item.key || item.label)).map(item => [item.key || item.label, item.value]))
  if (!value || typeof value !== 'object') return {}
  if (value.data !== undefined) return normalizeDeviceValues(value.data)
  if (value.payload !== undefined) return normalizeDeviceValues(value.payload)
  return Object.fromEntries(Object.entries(value.fields || value).filter(([key]) => key !== 'systime'))
}

export function normalizeDeviceWrite(data, fields) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('控制参数必须包含明确的物模型字段')
  const entries = Object.entries(data)
  if (!entries.length) throw new Error('控制参数为空')
  let kind
  const normalized = {}
  for (const [key, raw] of entries) {
    const field = fields.find(item => item.id === key)
    if (!field || field.dataType === 'event') throw new Error('控制字段不属于当前设备可写物模型')
    if (kind && kind !== field.dataType) throw new Error('不同类型的控制字段需要分别下发')
    kind = field.dataType
    let value = raw
    if (field.type === 'number') {
      if (raw === '' || raw === null || typeof raw === 'object') throw new Error('数值控制参数无效')
      value = Number(raw)
      if (!Number.isFinite(value)) throw new Error('数值控制参数无效')
    } else if (field.type === 'boolean') {
      if ([true, 1, 'true', '1'].includes(raw)) value = true
      else if ([false, 0, 'false', '0'].includes(raw)) value = false
      else throw new Error('布尔控制参数无效')
    }
    normalized[key] = value
  }
  if (kind === 'command' && entries.length !== 1) throw new Error('每次只能下发一个命令')
  return { kind, data: normalized }
}
