import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'

const source = fs.readFileSync(new URL('../components/app-picker/index.vue', import.meta.url), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
const component = vm.runInNewContext(script.replace('export default', 'globalThis.component =') + '; component')
const events = []
const context = {
  ...component.data(), range: ['折线图', '柱状图', '散点图'], value: 0, disabled: false,
  $emit: (...args) => events.push(args), $nextTick: fn => fn(),
  $refs: { popup: { open() {}, close() { context.popupChanged({ show: false }) } } }
}
for (const [key, fn] of Object.entries(component.methods)) context[key] = fn.bind(context)
context.open(); context.draft = 2; context.cancel()
assert.equal(events[0][0], 'cancel')
assert.equal(context.value, 0)
context.open(); assert.equal(context.draft, 0)
context.draft = 1; context.confirm()
assert.equal(events[1][0], 'change')
assert.equal(events[1][1].detail.value, 1)
assert.equal(events.length, 2)
context.disabled = true; context.open(); assert.equal(context.opened, false)
context.disabled = false; context.value = 500; context.open(); assert.equal(context.draft, 2)
context.cancel(); context.range = []; context.open(); context.confirm(); assert.equal(context.committed, false)
context.rangeKey = 'label'; assert.equal(context.label({ label: '严重' }), '严重')
console.log('App picker: draft, cancel, confirm, disabled, bounds, empty options and object labels passed.')
