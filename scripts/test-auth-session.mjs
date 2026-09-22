import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../features/auth/session.js', import.meta.url), 'utf8')
const { clearSessionStorage, isSessionExpiredCode } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

assert.equal(isSessionExpiredCode(401), true)
assert.equal(isSessionExpiredCode('401'), true)
assert.equal(isSessionExpiredCode(402), false)
assert.equal(isSessionExpiredCode(403), false)

const removed = []
clearSessionStorage({ removeStorageSync: key => removed.push(key) })
assert.deepEqual(removed, ['access_token', 'userWxInfo', 'isAuth', 'wx_code', 'push_id'])
assert.equal(removed.includes('email'), false)
assert.equal(removed.includes('serverAddress'), false)
assert.equal(removed.includes('language'), false)

console.log('Auth session redirect tests passed')
