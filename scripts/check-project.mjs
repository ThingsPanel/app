import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const ignoredDirectories = new Set(['.git', 'node_modules', 'unpackage', 'uni_modules', 'uniCloud-aliyun'])
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
