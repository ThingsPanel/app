import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const clearSessionStorage = vm.runInNewContext(read('features/auth/session.js').replaceAll('export ', '') + '; clearSessionStorage')
const restoreSession = vm.runInNewContext(read('features/auth/restore-session.js').replace(/^import .*$/gm, '').replace('export async function', 'async function') + '; restoreSession', { clearSessionStorage })
let values
const storage = { getStorageSync: key => values[key], removeStorageSync: key => delete values[key] }
const reset = () => { values = { access_token: 'saved', email: 'test@example.test', password: 'remembered', serverAddress: 'https://example.test/api/v1/' } }
reset()
assert.equal(await restoreSession({ storage, request: async options => {
  assert.equal(options.url, 'https://example.test/api/v1/user/detail')
  assert.equal(options.header['x-token'], 'saved'); assert.equal(options.timeout, 10000)
  assert.equal(options.data, undefined, 'never resubmit password')
  return { statusCode: 200, data: { code: 200 } }
} }), 'valid')
for (const request of [async () => ({ data: { code: 401 } }), async () => { throw { statusCode: 401 } }]) {
  reset(); assert.equal(await restoreSession({ storage, request }), 'expired')
  assert.equal(values.access_token, undefined); assert.equal(values.password, 'remembered'); assert.equal(values.email, 'test@example.test')
}
for (const request of [async () => { throw new Error('offline') }, async () => { throw { statusCode: 500 } }, async () => ({ data: { code: 403 } })]) {
  reset(); assert.equal(await restoreSession({ storage, request }), 'unavailable'); assert.equal(values.access_token, 'saved')
}
reset()
assert.equal(await restoreSession({ storage, request: async () => { values.access_token = 'new'; return { data: { code: 401 } } } }), 'stale')
assert.equal(values.access_token, 'new')
reset()
assert.equal(await restoreSession({ storage, request: async () => { values.serverAddress = 'https://other.test'; return { data: { code: 200 } } } }), 'stale')
values = { password: 'remembered' }
assert.equal(await restoreSession({ storage, request: () => { throw new Error('must not request') } }), 'missing')
console.log('Session restore passed: saved token, expiry, network failure, credential preservation and stale sessions.')

let outcome = 'valid', jumps = 0, toasts = 0
const loginScript = read('pages/login/index.vue').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];?/g, '')
const login = vm.runInNewContext(loginScript.replace('export default', 'const page =') + '; page', {
  uniIcons: {}, BoardLoading: {}, restoreSession: async () => outcome,
  uni: { switchTab(options) { jumps++; assert.equal(options.url, '/pages/dashboard/index'); options.success() }, showToast() { toasts++ } }
})
for (const result of ['valid', 'unavailable', 'expired', 'missing', 'stale']) {
  outcome = result
  const before = jumps, page = { restoringSession: true, loginPageHidden: false }
  await login.onReady.call(page)
  assert.equal(jumps - before, ['valid', 'unavailable'].includes(result) ? 1 : 0)
  assert.equal(page.restoringSession, false)
}
outcome = 'valid'
const before = jumps
await login.onReady.call({ restoringSession: true, loginPageHidden: true })
await login.onReady.call({ restoringSession: false })
assert.equal(jumps, before, 'hidden or signed-out page cannot auto-navigate')
assert.equal(toasts, 0)
console.log('Login lifecycle passed: one-time ready restoration, no background redirects and no expired-session login loop.')
