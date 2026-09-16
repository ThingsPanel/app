import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
// tmp / output 都是 .gitignore 里的临时产物目录（草稿、预览、构建中间物），
// 不属于项目源码，不该参与结构校验。
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'unpackage',
  'uni_modules',
  'uniCloud-aliyun',
  'tmp',
  'output'
])
const sourceExtensions = new Set(['.js', '.vue', '.scss', '.css'])
const errors = []

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (ignoredDirectories.has(entry.name)) return []
    const absolutePath = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(absolutePath) : [absolutePath]
  })
}

function stripJsonComments(value) {
  return value.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
}

function resolveSourceImport(importer, request) {
  const basePath = request.startsWith('@/')
    ? path.join(root, request.slice(2))
    : path.resolve(path.dirname(importer), request)
  const candidates = [basePath]
  for (const extension of sourceExtensions) {
    candidates.push(`${basePath}${extension}`, path.join(basePath, `index${extension}`))
  }
  return candidates.some((candidate) => fs.existsSync(candidate))
}

/**
 * 收集对象字面量第一层的键名（含简写方法名），会跳过字符串与注释。
 *
 * 用途见 findRenderjsCollisions：需要精确拿到 props / data / methods 的顶层键，
 * 用「按缩进猜」的正则会混进 if、for、setTimeout 之类的噪音。
 */
function collectTopLevelKeys(source, openBraceIndex) {
  const keys = new Set()
  let depth = 0
  let quote = ''
  for (let i = openBraceIndex; i < source.length; i += 1) {
    const char = source[i]
    if (quote) {
      if (char === '\\') i += 1
      else if (char === quote) quote = ''
      continue
    }
    if (char === '"' || char === "'" || char === '`') { quote = char; continue }
    if (char === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i)
      i = end === -1 ? source.length : end
      continue
    }
    if (char === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i)
      i = end === -1 ? source.length : end + 1
      continue
    }
    if (char === '{') { depth += 1; continue }
    if (char === '}') {
      depth -= 1
      if (depth === 0) return keys
      continue
    }
    if (depth !== 1) continue
    if (i > openBraceIndex + 1 && !/[\s,{[(]/.test(source[i - 1])) continue
    const match = /^(?:async\s+)?([A-Za-z_$][\w$]*)\s*(?=[:(])/.exec(source.slice(i))
    if (!match) continue
    keys.add(match[1])
    i += match[0].length - 1
  }
  return keys
}

/** 从 source 里第一个匹配 pattern 的对象字面量开始收集顶层键；不是对象字面量就返回 null。 */
function keysAfter(source, pattern) {
  const match = pattern.exec(source)
  if (!match) return null
  let index = match.index + match[0].length
  while (index < source.length && /\s/.test(source[index])) index += 1
  if (source[index] !== '{') return null
  return collectTopLevelKeys(source, index)
}

/**
 * uni-app 会把 renderjs 模块当 mixin 合并进主组件（构建产物里是 mixins.push(...)）。
 * 实例代理上 props 的优先级高于 methods/data，所以 renderjs 成员一旦和 prop 重名，
 * this.成员 拿到的是 prop 的值，调用时抛 "<name> is not a function"。
 *
 * 这个错误极难发现：只在有数据渲染到那一处时才触发，而且常被 promise 的 catch 吞掉，
 * 表现成「地图已经画出来了却提示加载失败」。所以在这里静态拦一道。
 */
function findRenderjsCollisions(source) {
  const collisions = []
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/g
  const renderjsMembers = new Set()
  const propNames = new Set()
  for (const match of source.matchAll(scriptPattern)) {
    const body = match[2]
    if (!/lang="renderjs"/.test(match[1])) {
      const props = keysAfter(body, /\bprops\s*:\s*/) ?? keysAfter(body, /\bdefineProps\s*\(?/)
      if (props) for (const key of props) propNames.add(key)
      continue
    }
    const methods = keysAfter(body, /\bmethods\s*:\s*/)
    if (methods) for (const key of methods) renderjsMembers.add(key)
    const dataMatch = /data\s*\(\s*\)\s*\{\s*return\s*\{/.exec(body)
    if (dataMatch) {
      const braceIndex = body.indexOf('{', dataMatch.index + dataMatch[0].length - 1)
      for (const key of collectTopLevelKeys(body, braceIndex)) renderjsMembers.add(key)
    }
  }
  for (const name of renderjsMembers) {
    if (propNames.has(name)) collisions.push(name)
  }
  return collisions
}

const pagesConfig = JSON.parse(stripJsonComments(fs.readFileSync(path.join(root, 'pages.json'), 'utf8')))
const registeredRoutes = new Set((pagesConfig.pages ?? []).map((page) => page.path))
for (const page of pagesConfig.pages ?? []) {
  if (!fs.existsSync(path.join(root, `${page.path}.vue`))) {
    errors.push(`Missing route component: ${page.path}.vue`)
  }
}

for (const file of walk(root)) {
  if (!sourceExtensions.has(path.extname(file))) continue
  const relativePath = path.relative(root, file).replaceAll('\\', '/')
  for (const segment of relativePath.split('/')) {
    const isLocaleFile = /^[a-z]{2}-[A-Z]{2}\.js$/.test(segment)
    if (/[A-Z]/.test(segment) && segment !== 'App.vue' && !isLocaleFile) {
      errors.push(`Non-kebab-case path: ${relativePath}`)
      break
    }
  }

  const source = fs.readFileSync(file, 'utf8')

  const collisions = findRenderjsCollisions(source)
  if (collisions.length) {
    errors.push(`Renderjs member collides with prop in ${relativePath}: ${collisions.join(', ')}（uni-app 把 renderjs 当 mixin 合并，实例代理上 props 会遮蔽同名 methods/data）`)
  }
  const importPattern = /(?:from\s+|import\s*)['"]([^'"]+)['"]/g
  for (const match of source.matchAll(importPattern)) {
    const request = match[1]
    if ((request.startsWith('@/') || request.startsWith('.')) && !resolveSourceImport(file, request)) {
      errors.push(`Unresolved import in ${relativePath}: ${request}`)
    }
  }

  const staticAssetPattern = /["'](\/?static\/[^"'?]+)(?:\?[^"']*)?["']/g
  for (const match of source.matchAll(staticAssetPattern)) {
    const assetPath = match[1].replace(/^\//, '')
    if (!fs.existsSync(path.join(root, assetPath))) {
      errors.push(`Missing static asset in ${relativePath}: ${assetPath}`)
    }
  }

  const absoluteRoutePattern = /["'](\/pages\/[^"'?]+)(?:\?[^"']*)?["']/g
  for (const match of source.matchAll(absoluteRoutePattern)) {
    const route = match[1].replace(/^\//, '')
    if (!registeredRoutes.has(route)) {
      errors.push(`Unregistered route in ${relativePath}: ${route}`)
    }
  }

  if (relativePath.startsWith('pages/') || relativePath.startsWith('components/')) {
    const relativeRoutePattern = /url\s*:\s*["'](\.\.?\/[^"'?]+)(?:\?[^"']*)?["']/g
    for (const match of source.matchAll(relativeRoutePattern)) {
      const target = path.resolve(path.dirname(file), match[1])
      const routeFile = `${target}.vue`
      if (!fs.existsSync(routeFile)) {
        errors.push(`Missing relative route in ${relativePath}: ${match[1]}`)
      }
    }
  }
}

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Project structure check passed (${pagesConfig.pages.length} routes).`)
