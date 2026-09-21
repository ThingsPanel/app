import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
const source = fs.readFileSync(new URL('../pages/dashboard/boards.vue', import.meta.url), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1].replace(/^import .*$/gm, '')
const component = vm.runInNewContext(script.replace('export default', 'globalThis.component =') + '; component', { clearTimeout, setTimeout, AppSearch: {} })
const context = { ...component.data() }
for (const [key, fn] of Object.entries(component.methods)) context[key] = fn.bind(context)
// An empty search must list every dashboard, even when entered through an old project link.
context.keyword = ''
context.projectId = 'legacy-project'
const pending = []
context.client = { dashboards: params => new Promise((resolve, reject) => pending.push({ params, resolve, reject })) }
const old = context.loadBoards(true)
assert.equal(pending[0].params.projectId, undefined)
assert.equal(pending[0].params.keyword, undefined)
context.keyword = '环境'
const current = context.loadBoards(true)
pending[1].resolve({ data: [{ id: 'new' }], meta: { total: 42, totalPages: 3 } }); await current
pending[0].resolve({ data: [{ id: 'old' }], meta: { total: 1 } }); await old
assert.equal(context.boards[0].id, 'new')
assert.equal(context.total, 42)
const next = context.loadBoards(false)
assert.equal(pending[2].params.page, 2)
pending[2].reject(new Error('network')); await next
assert.equal(context.boards[0].id, 'new'); assert.equal(context.page, 1)
const retry = context.retry()
assert.equal(pending[3].params.page, 2)
pending[3].resolve({ data: [{ id: 'next' }], meta: { total: 42, totalPages: 3 } }); await retry
assert.equal(context.boards.length, 2)
context.keyword = ''
const unscoped = context.loadBoards(true)
assert.equal(pending[4].params.projectId, undefined)
context.disposed = true
pending[4].resolve({ data: [{ id: 'late' }], meta: { total: 1 } }); await unscoped
assert.equal(context.boards.length, 0)
assert.equal(context.thumbnailUrl('abc='), 'data:image/png;base64,abc=')
assert.equal(context.thumbnailUrl('https://example.test/preview.png'), 'https://example.test/preview.png')
assert.equal(context.thumbnailUrl('javascript:alert(1)'), '')
context.disposed = false
context.boards = [{ id: 'preview' }]
context.client.thumbnail = async () => 'abc='
await context.loadThumbnails(context.boards)
assert.equal(context.boards[0].thumbnail, 'abc=')

const api = fs.readFileSync(new URL('../api/modules/boards.js', import.meta.url), 'utf8').replace(/^import .*$/gm, '').replace('export function', 'function')
let identity = 'session-a', ssoCalls = 0, getCalls = 0
const factory = vm.runInNewContext(api + '; createBoardsClient', {
  resolveThingsVisAddresses: () => ({ thingsVisApiBase: 'https://example.test/thingsvis-api' }),
  requestDeviceApi: async () => ({ id: 'user', tenantId: 'tenant', authority: 'TENANT_ADMIN' }),
  uni: {
    getStorageSync: () => identity,
    request(options) {
      if (options.url.endsWith('/auth/sso')) { ssoCalls++; options.success({ statusCode: 200, data: { accessToken: 'mock-token' } }); return }
      getCalls++
      if (getCalls === 1) { options.success({ statusCode: 401 }); return }
      options.success({ statusCode: 200, data: { data: [{ id: 'p' + options.data.page }], meta: { totalPages: 2 } } })
    }
  }
})
const client = factory()
assert.equal((await client.projects()).length, 2)
assert.equal(ssoCalls, 2)
identity = 'session-b'
await assert.rejects(() => client.dashboards({}), /登录或服务器已切换/)
console.log('Boards: all-dashboard queries, legacy links, stale responses, pagination retry, unload, SSO retry and account isolation passed.')
