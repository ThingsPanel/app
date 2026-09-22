// Local, bounded diagnostics only. Never persist raw errors, props, URLs or credentials.
const records = []
let reporting = false
export function reportAppError(error, source = 'runtime') {
  if (reporting) return
  reporting = true
  try {
    const name = ['TypeError', 'ReferenceError', 'RangeError', 'SyntaxError', 'Error'].includes(error?.name) ? error.name : 'Error'
    const route = typeof getCurrentPages === 'function' ? getCurrentPages().slice(-1)[0]?.route : ''
    const page = /^pages\/[\w/-]+$/.test(route || '') ? route : 'unknown'
    const category = ['vue', 'runtime', 'promise', 'board', 'chart'].includes(source) ? source : 'runtime'
    const now = Date.now()
    const previous = records.find(row => row.page === page && row.source === category && row.name === name && now - row.time < 10000)
    if (previous) { previous.count++; return }
    records.push({ time: now, page, source: category, name, count: 1 })
    if (records.length > 30) records.shift()
    console.warn('[AppError]', category, page, name)
  } catch { /* Error reporting must never become another application error. */ }
  finally { reporting = false }
}
export function getAppErrors() { return records.map(row => ({ ...row })) }
