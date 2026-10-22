import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const read = path => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
let saved, requests = 0, toasts = 0
const uni = { getStorageSync: () => saved, setStorageSync: (key, value) => { saved = value }, showToast: () => { toasts++ } }
const consent = vm.runInNewContext(read('features/auth/mp-consent.js').replaceAll('export ', '') + '; ({hasMpConsent, requireMpConsent})', { uni })
assert.equal(consent.hasMpConsent(), false)
assert.equal(consent.requireMpConsent(false), false)
assert.equal(saved, undefined)
assert.equal(consent.requireMpConsent(true), true)
assert.equal(consent.hasMpConsent(), true)
saved = { version: 'old' }
assert.equal(consent.hasMpConsent(), false)
const script = read('pages/login/register.vue').match(/<script>([\s\S]*?)<\/script>/)[1].replace(/import\s+[\s\S]*?\sfrom\s+['"][^'"]+['"];?/g, '')
const register = vm.runInNewContext(script.replace('export default', 'const page =') + '; page', {
  AuthAgreement: {}, requireMpConsent: consent.requireMpConsent,
  fetchEmailCode: () => { requests++ }, registerByEmail: () => { requests++ }
})
const page = { agreementAccepted: false, validateEmail() { throw Error('must stop before validation') }, validateForm() { throw Error('must stop before validation') } }
await register.methods.handleSmsCode.call(page)
await register.methods.handleSubmit.call(page)
assert.equal(requests, 0)
assert.equal(toasts, 3)
console.log('MP consent passed: explicit consent, policy version, code and registration request guards.')
