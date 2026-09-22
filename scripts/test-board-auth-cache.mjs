import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const source = fs.readFileSync(new URL('../api/modules/boards.js', import.meta.url), 'utf8')
  .replace(/^import .*$/gm, '').replace('export function', 'function')
let identity = 'account-a', server = 'https://platform-a.test', now = 1000
let users = 0, sso = 0, rejectToken = '', failSso = false, pauseUser
const factory = vm.runInNewContext(source + '; createBoardsClient', {
  Date: { now: () => now },
  resolveThingsVisAddresses: () => ({ thingsPanelApiBase: server, thingsVisApiBase: 'https://vis.test' }),
  requestDeviceApi: async () => { users++; if (pauseUser) await pauseUser; return { id: identity } },
  uni: {
    getStorageSync: () => identity,
    request(options) {
      if (options.url.endsWith('/auth/sso')) {
        sso++
        options.success({ statusCode: failSso ? 500 : 200, data: { accessToken: `token-${sso}` } })
      } else {
        options.success({ statusCode: options.header.Authorization === rejectToken ? 401 : 200, data: { data: { id: 'board' } } })
      }
    }
  }
})

await Promise.all([factory().preview('a'), factory().preview('b')])
assert.equal(users, 1, 'concurrent clients share profile request')
assert.equal(sso, 1, 'concurrent clients share SSO')
await factory().preview('a')
assert.equal(sso, 1, 'reopening reuses authentication')
rejectToken = 'Bearer token-1'
await Promise.all([factory().preview('a'), factory().preview('b')])
assert.equal(sso, 2, 'concurrent 401s trigger one refresh')
now += 5 * 60 * 1000
await factory().preview('a')
assert.equal(sso, 3, 'expired cache refreshes')
const oldClient = factory()
identity = 'account-b'
await assert.rejects(oldClient.preview('a'), /登录或服务器已切换/)
await factory().preview('a')
assert.equal(sso, 4, 'new account cannot reuse token')
const oldServerClient = factory()
server = 'https://platform-b.test'
await assert.rejects(oldServerClient.preview('a'), /登录或服务器已切换/)
await factory().preview('a')
assert.equal(sso, 5, 'platform server changes invalidate authentication')
now += 5 * 60 * 1000
failSso = true
await assert.rejects(factory().preview('a'), /看板认证失败/)
failSso = false
await factory().preview('a')
assert.equal(sso, 7, 'failed authentication can retry')
now += 5 * 60 * 1000
let resume
pauseUser = new Promise(resolve => { resume = resolve })
const inFlight = factory().preview('a')
identity = 'account-c'
resume()
await assert.rejects(inFlight, /登录或服务器已切换/)
pauseUser = null
assert.equal(sso, 7, 'account change during authentication cannot submit stale credentials')
console.log('Board auth cache passed: concurrent/repeated opens, concurrent 401, expiry, account/server isolation, failure recovery and in-flight switch.')
