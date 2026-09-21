import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
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
console.log('Boards API: SSO retry and account isolation passed.')
