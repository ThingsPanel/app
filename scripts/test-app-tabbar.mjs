import assert from 'node:assert/strict'
import fs from 'node:fs'

const pages = JSON.parse(fs.readFileSync(new URL('../pages.json', import.meta.url), 'utf8'))
const source = fs.readFileSync(new URL('../components/app-tabbar.vue', import.meta.url), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace("import pages from '@/pages.json'", '').replace('export default', 'return')
const calls = []
const component = new Function('pages', 'uni', script)(pages, {
  switchTab: options => calls.push(options), showToast: () => {}
})
assert.equal(component.data().config, pages.tabBar)
for (const item of pages.tabBar.list) {
  component.methods.open(item)
  assert.equal(calls.at(-1).url, '/' + item.pagePath)
  assert.equal(component.methods.label.call({ $t: key => 'translated:' + key }, item), 'translated:' + item.key)
}
const detail = fs.readFileSync(new URL('../pages/devices/detail.vue', import.meta.url), 'utf8')
assert.ok(detail.includes('<app-tabbar active-path="pages/devices/index" />'))
assert.ok(!detail.includes('navigationItems'))
assert.ok(!detail.includes('bottom-navigation'))
console.log('Shared TabBar checks passed: global config, tab routes, translations and detail integration')
