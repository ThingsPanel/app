import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

// 语言包是纯数据 ESM 文件，直接 import 会触发 MODULE_TYPELESS_PACKAGE_JSON 重解析告警，
// 与本脚本的结论无关，这里只保留其它告警。
process.removeAllListeners('warning')
process.on('warning', (warning) => {
  if (warning.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.warn(warning.message)
})

const root = process.cwd()
// tmp / output 都是 .gitignore 里的临时产物目录（草稿、预览、构建中间物），
// 不属于项目源码，不该参与结构校验。
const ignoredDirectories = new Set([
  '.git',
  'node_modules',
  'unpackage',
  'uni_modules',
  'unused-modules',
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

/**
 * 微信 WXSS 的词法器不接受「组合符后直接跟裸伪类」（`.a > :first-child`），
 * 编译时报 `./app.wxss(line:col): error at token` 并让**整个 wxss 文件作废**，
 * 全局样式一起丢失。带简单选择器的写法不受影响（`.a > view:first-child`、`.a > .b:first-child`），
 * 现成产物里就有编译通过的先例。所以这里静态拦一道：只扫选择器位置，不碰声明。
 */
function findWxssUnsafeSelectors(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
  const offenders = []
  for (const block of css.matchAll(/([^{};]*)\{/g)) {
    for (const bad of block[1].matchAll(/[>+~][ \t\n]*:[a-z-]+/gi)) {
      offenders.push(bad[0].replace(/\s+/g, ' ').trim())
    }
  }
  return offenders
}

const pagesConfig = JSON.parse(stripJsonComments(fs.readFileSync(path.join(root, 'pages.json'), 'utf8')))
const registeredRoutes = new Set((pagesConfig.pages ?? []).map((page) => page.path))
for (const group of pagesConfig.subPackages ?? []) {
  for (const page of group.pages ?? []) registeredRoutes.add(`${group.root}/${page.path}`)
}
for (const page of pagesConfig.pages ?? []) {
  if (!fs.existsSync(path.join(root, `${page.path}.vue`))) {
    errors.push(`Missing route component: ${page.path}.vue`)
  }
}

// tabBar 的语言包 key 只存在 utils/tab-bar-items.js 里：pages.json 的 tabBar.list 一旦带自定义字段，
// uni-app 会原样透传进小程序 app.json，而微信的 schema 只认 4 个字段，启动时就会刷
// 「无效的 app.json tabBar.list[0]["key"]、…」。镜像的 pagePath 顺序又直接决定 uni.setTabBarItem
// 按 index 定位的结果，所以两头都要锁死。
const tabBarList = pagesConfig.tabBar?.list ?? []
const mpTabBarFields = new Set(['pagePath', 'text', 'iconPath', 'selectedIconPath'])
const tabBarStrayFields = [...new Set(tabBarList
  .flatMap((tab) => Object.keys(tab))
  .filter((field) => !mpTabBarFields.has(field)))]
if (tabBarStrayFields.length) {
  errors.push(`pages.json tabBar.list 含小程序 app.json 不认的字段: ${tabBarStrayFields.join(', ')}（会被透传进 app.json 报错，语言包 key 请写进 utils/tab-bar-items.js）`)
}
const mirrorSource = fs.readFileSync(path.join(root, 'utils/tab-bar-items.js'), 'utf8')
const tabBarMirror = [...mirrorSource.matchAll(/pagePath:\s*'([^']+)',\s*key:\s*'([^']+)'/g)]
  .map((match) => ({ pagePath: match[1], key: match[2] }))
if (JSON.stringify(tabBarMirror.map((tab) => tab.pagePath)) !== JSON.stringify(tabBarList.map((tab) => tab.pagePath))) {
  errors.push('tabBar mirror drifted: utils/tab-bar-items.js 与 pages.json 的 tabBar.list 顺序或 pagePath 不一致')
}
for (const locale of ['zh-CN', 'en-US']) {
  const messages = (await import(pathToFileURL(path.join(root, 'lang', `${locale}.js`)).href)).default
  for (const tab of tabBarMirror) {
    const translated = tab.key.split('.').reduce((carrier, segment) => carrier?.[segment], messages)
    if (typeof translated !== 'string' || !translated) {
      errors.push(`tabBar key 在 ${locale} 里取不到: ${tab.key}（小程序 tabBar 会直接显示 key 字面量）`)
    }
  }
}

// walk() 刻意跳过 uni_modules（第三方组件不参与项目结构校验），但 HBuilderX 会重写这些目录。
// 树形选择面板借用了全局的 .app-sheet-header 三栏头，挂点类打在了 gq-tree 的模板上：
// 一旦被还原成上游版本，样式会静默失效（不报错），所以这里单独钉住这一处。
const gqTreePath = path.join(root, 'uni_modules/gq-tree/components/gq-tree/gq-tree.vue')
if (fs.existsSync(gqTreePath)) {
  const gqTreeSource = fs.readFileSync(gqTreePath, 'utf8')
  for (const hook of ['app-sheet-start', 'app-sheet-center', 'app-sheet-end']) {
    if (!gqTreeSource.includes(hook)) {
      errors.push(`uni_modules/gq-tree 丢了挂点类 ${hook}（HBuilderX 覆盖回上游版本了？树形面板三栏头样式会失效）`)
    }
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

  // 只校验会进 wxss 的样式：.css/.scss 整份，.vue 只取 <style> 块（.js 不参与，避免把代码里的 > 当成选择器）。
  const fileExtension = path.extname(file)
  const styleBlocks = fileExtension === '.vue'
    ? [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1])
    : ['.css', '.scss'].includes(fileExtension) ? [source] : []
  for (const block of styleBlocks) {
    for (const offender of findWxssUnsafeSelectors(block)) {
      errors.push(`Bare pseudo-class after combinator in ${relativePath}: ${offender}（WXSS 会整份 wxss 编译失败、全局样式丢失，请给选择器补上类名或标签）`)
    }
  }

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
