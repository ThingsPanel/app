import assert from 'node:assert/strict'
import fs from 'node:fs'
const source = fs.readFileSync(new URL('../features/dashboard/home-preference.js', import.meta.url), 'utf8')
const { createHomePreferenceStore, HOME_PREFERENCE_KEY } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
const data = new Map()
let session = { server: 'server-a', boardsServer: 'boards-a', token: 'token-a' }
let user = { id: 'alice', tenantId: 'tenant-a' }
const store = createHomePreferenceStore({ storage: { getStorageSync: key => data.get(key), setStorageSync: (key, value) => data.set(key, structuredClone(value)) }, getSession: () => ({ ...session }), getProfile: async () => user })
let preference = await store.open()
assert.equal(preference.read(), null)
preference.save({ id: 'board-a', name: '环境' })
assert.equal(preference.read().id, 'board-a')
assert.equal(preference.guideSeen('swipe'), false)
preference.finishGuide('swipe')
assert.equal((await store.open()).guideSeen('swipe'), true)
assert.equal(preference.guideSeen('operate'), false)
preference.resetGuides()
assert.equal(preference.guideSeen('swipe'), false)
assert.equal(preference.read().id, 'board-a', 'replaying guide preserves homepage')
preference.finishGuide('swipe')
const previous = preference
session.token = 'token-b'; user = { id: 'bob', tenantId: 'tenant-a' }
preference = await store.open(); assert.equal(preference.read(), null)
assert.equal(preference.guideSeen('swipe'), false, 'guide is scoped by account')
assert.throws(() => previous.save({ id: 'wrong' }), /切换/)
preference.save({ id: 'board-b' })
session.token = 'refreshed-a'; user = { id: 'alice', tenantId: 'tenant-a' }
preference = await store.open(); assert.equal(preference.read().id, 'board-a', 'login token refresh retains account preference')
session = { ...session, server: 'server-b' }
preference = await store.open(); assert.equal(preference.read(), null)
session = { ...session, server: 'server-a', token: 'tenant-b-token' }; user.tenantId = 'tenant-b'
preference = await store.open(); assert.equal(preference.read(), null)
session.token = 'alice-again'; user.tenantId = 'tenant-a'
preference = await store.open(); preference.reset(); assert.equal(preference.read(), null)
session.token = 'bob-again'; user = { id: 'bob', tenantId: 'tenant-a' }
preference = await store.open(); assert.equal(preference.read().id, 'board-b', 'reset does not affect others')
assert.ok(!JSON.stringify(data.get(HOME_PREFERENCE_KEY)).includes('token-'), 'no credentials persisted')
let resolve
const pendingStore = createHomePreferenceStore({ storage: { getStorageSync() {}, setStorageSync() { throw new Error('must not write') } }, getSession: () => ({ ...session }), getProfile: () => new Promise(r => { resolve = r }) })
const pending = pendingStore.open(); session.token = 'changed'; resolve(user)
await assert.rejects(pending, /切换/)
console.log('Home preference: persistence, account/tenant/server isolation, session races and reset passed.')
