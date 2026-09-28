import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

function load(file, globals = {}) {
  const source = fs.readFileSync(new URL('../' + file, import.meta.url), 'utf8')
  return vm.runInNewContext(source.match(/<script>([\s\S]*?)<\/script>/)[1].replace('export default', 'globalThis.component =') + '; component', globals)
}
const component = load('components/confirmation-modal/index.vue')
const events = []
const context = { modelValue: false, loading: false, autoClose: true, prevent: true, title: '提示', danger: false, $emit: (...args) => events.push(args) }
Object.assign(context, component.data.call(context))
for (const [name, fn] of Object.entries(component.methods)) context[name] = fn.bind(context)
let deleted = 0
let completed = 0
const options = { title: '删除告警', content: '确认删除？', danger: true, success: result => { if (result.confirm) deleted++ }, complete: () => completed++ }
context.open(options)
assert.equal(component.computed.settings.call(context).danger, true)
context.cancel(2)
assert.equal(context.showValue, true, 'mask must not dismiss a destructive confirmation')
context.cancel(1)
assert.equal(deleted, 0, 'cancel must never trigger deletion')
assert.equal(completed, 1)
context.open(options)
context.confirm()
assert.equal(deleted, 1)
assert.equal(completed, 2)
assert.equal(context.showValue, false)
assert.equal(context.request, null, 'callbacks must not leak to the next opening')
context.autoClose = false
context.showValue = true
context.loading = true
const count = events.length
context.confirm(); context.cancel(1)
assert.equal(events.length, count, 'saving blocks double submit and cancellation')
context.loading = false
context.confirm()
assert.equal(context.showValue, true, 'input dialog stays open until the save succeeds')
component.watch.modelValue.call(context, false)
assert.equal(context.showValue, false)

const calls = []
let timer
const toast = load('components/toast/index.vue', { uni: { showToast: options => calls.push(options) }, setTimeout: fn => { timer = fn; return 1 }, clearTimeout() {} })
const feedback = { msg: '保存失败', icon: '', duration: 2000 }
for (const [name, fn] of Object.entries(toast.methods)) feedback[name] = fn.bind(feedback)
const first = feedback.show()
feedback.msg = '请重试'
const second = feedback.show()
await first
timer()
await second
assert.equal(calls.length, 2)
assert.equal(calls[1].title, '请重试')
assert.equal(calls[1].icon, 'none')
console.log('Dialog feedback passed: cancel safety, callback isolation, loading, input retry and shared toast.')
