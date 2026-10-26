import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../features/auth/mini-auth.js', import.meta.url), 'utf8')
const { createMiniAuth } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
let server = 'https://platform.example'
let codeNumber = 0
const calls = []; const saved = new Map()
let response = { data: { code: 200, data: { status: 'binding_required' } } }
const api = createMiniAuth({ getServer: () => server,
  login: async () => ({ code: `one-use-code-${++codeNumber}` }),
  storage: { setStorageSync: (k, v) => saved.set(k, v), removeStorageSync: k => saved.delete(k) },
  request: async options => { calls.push(options); return response }
})
assert.equal((await api.signIn('mini')).status, 'binding_required')
assert.equal(saved.size, 0, 'an unbound identity must not create a local session')
await api.bind('mini', 'platform-token', 'password')
assert.notEqual(calls[0].data.code, calls[1].data.code, 'binding must obtain a fresh code')
assert.equal(calls[1].header.Authorization, 'Bearer platform-token')
assert.equal(saved.has('wx_code'), false)
response = { data: { code: 200, data: { password: { enabled: true }, external: { enabled: false, providers: [] } } } }
assert.deepEqual(await api.providers(), [], 'disabled external auth must expose no mini-program buttons')
assert.match(calls.at(-1).url, /\/auth\/login-options\?channel=mp-weixin$/)
response.data.data.external = { enabled: true, providers: [{ id: 'mini', kind: 'wechat-mini' }, { id: 'web', kind: 'oidc' }] }
assert.deepEqual(await api.providers(), [{ id: 'mini', kind: 'wechat-mini' }], 'only mini-program methods can be displayed')
response = { data: { code: 503 } }
await assert.rejects(api.accept({ token: 'new-token', expires_in: 3600 }))
assert.equal(saved.has('access_token'), false, 'detail failure must not persist a token')
response = { data: { code: 200, data: { id: 'existing-user' } } }
await api.accept({ token: 'new-token', expires_in: 3600 })
assert.equal(saved.get('access_token'), 'new-token')
server = 'http://insecure.example'
await assert.rejects(api.signIn('mini'))

let resolveLogin
server = 'https://first.example'
const switching = createMiniAuth({ getServer: () => server,
  login: () => new Promise(resolve => { resolveLogin = resolve }),
  request: async () => { throw new Error('must not send old proof to another server') }, storage: {} })
const pending = switching.signIn('mini')
server = 'https://second.example'
resolveLogin({ code: 'fresh-code' })
await assert.rejects(pending, /服务器已切换/)
console.log('Mini authentication boundary tests passed')
