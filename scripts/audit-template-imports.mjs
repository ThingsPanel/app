/**
 * 静态检查：模板里调用了 import 进来的函数，但没有注册到组件实例。
 *
 * 背景：选项式 API 的模板只能访问 data / computed / methods / props 上的成员，
 * 直接 import 的函数不会自动暴露。漏注册时渲染期才报
 * `_ctx.xxx is not a function`，且只在有数据渲染到那一行时才触发，很难发现。
 *
 * 用法：node scripts/audit-template-imports.mjs
 */
import fs from 'fs'
import path from 'path'

const ROOT = process.cwd()
const SKIP = new Set(['node_modules', 'unpackage', 'uni_modules', 'tmp', '.git', 'output'])

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else if (entry.name.endsWith('.vue')) out.push(full)
  }
  return out
}

/** 从 openIdx 处的 '{' 开始做花括号配对，返回块内文本 */
function braceBlock(src, openIdx) {
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) return src.slice(openIdx + 1, i)
    }
  }
  return ''
}

/** 模板里被调用的标识符，如 {{ fn( }}、@click="fn(" */
function templateCalls(tpl) {
  const names = new Set()
  const re = /(?:^|[\s{("'\[:=?!&|+*\/,>])([a-zA-Z_$][\w$]*)\s*\(/g
  let m
  while ((m = re.exec(tpl))) names.add(m[1])
  return names
}

const GLOBALS = new Set(['$t', '$emit', '$set', '$nextTick', 'String', 'Number', 'Boolean',
  'Array', 'Object', 'JSON', 'Math', 'Date', 'parseInt', 'parseFloat', 'isNaN',
  'if', 'for', 'return', 'function', 'typeof', 'new', 'catch', 'switch', 'while'])

const problems = []

for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8')
  const tplMatch = src.match(/<template>([\s\S]*?)<\/template>/)
  const scriptMatch = src.match(/<script[^>]*>([\s\S]*?)<\/script>/)
  if (!tplMatch || !scriptMatch) continue

  const tpl = tplMatch[1]
  const script = scriptMatch[1]

  const imported = new Set()
  for (const m of script.matchAll(/import\s+([\s\S]*?)\s+from\s+['"]/g)) {
    const clause = m[1]
    const named = clause.match(/\{([\s\S]*?)\}/)
    if (named) {
      for (const part of named[1].split(',')) {
        const name = part.split(':').pop().split(/\s+as\s+/).pop().trim()
        if (name) imported.add(name)
      }
    }
    const def = clause.replace(/\{[\s\S]*?\}/, '').replace(/,/g, '').trim()
    if (def && !def.startsWith('*')) imported.add(def)
  }

  const registered = new Set()
  for (const key of ['methods', 'computed', 'props', 'data']) {
    const re = new RegExp(`\\b${key}\\s*[:(]\\s*`, 'g')
    let m
    while ((m = re.exec(script))) {
      const open = script.indexOf('{', m.index + m[0].length - 1)
      if (open === -1) continue
      const body = braceBlock(script, open)
      for (const k of body.matchAll(/(?:^|\n)\s*([a-zA-Z_$][\w$]*)\s*(?:[:(]|,|$)/g)) registered.add(k[1])
    }
  }
  for (const m of script.matchAll(/\bconst\s+([a-zA-Z_$][\w$]*)\s*=/g)) registered.add(m[1])

  for (const name of templateCalls(tpl)) {
    if (GLOBALS.has(name) || registered.has(name)) continue
    if (imported.has(name)) problems.push({ file: path.relative(ROOT, file), name })
  }
}

if (!problems.length) {
  console.log('模板 import 注册检查通过。')
} else {
  console.log(`发现 ${problems.length} 处「模板调用 import 但未注册到实例」：`)
  for (const p of problems) console.log(`  ${p.file} -> ${p.name}`)
  process.exitCode = 1
}
