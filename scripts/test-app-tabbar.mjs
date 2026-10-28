import assert from 'node:assert/strict'
import fs from 'node:fs'

const pages = JSON.parse(fs.readFileSync(new URL('../pages.json', import.meta.url), 'utf8').replace(/^\s*\/\/.*$/gm, ''))
const tabBarItems = new Function(fs.readFileSync(new URL('../utils/tab-bar-items.js', import.meta.url), 'utf8').replace('export const TAB_BAR_ITEMS =', 'return'))()
const source = fs.readFileSync(new URL('../components/app-tabbar.vue', import.meta.url), 'utf8')
const script = source.match(/<script>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*$/gm, '').replace('export default', 'return')
const calls = []
const component = new Function('pages', 'uni', 'TAB_BAR_ITEMS', script)(pages, {
  switchTab: options => calls.push(options), showToast: () => {}
}, tabBarItems)
assert.equal(component.data().config, pages.tabBar)
for (const item of pages.tabBar.list) {
  component.methods.open(item)
  assert.equal(calls.at(-1).url, '/' + item.pagePath)
  const key = tabBarItems.find(tab => tab.pagePath === item.pagePath).key
  assert.equal(component.methods.label.call({ $t: key => 'translated:' + key }, item), 'translated:' + key)
}
const detail = fs.readFileSync(new URL('../pages/devices/detail.vue', import.meta.url), 'utf8')
assert.ok(detail.includes('<app-tabbar active-path="pages/devices/index" />'))
assert.ok(!detail.includes('navigationItems'))
assert.ok(!detail.includes('bottom-navigation'))
console.log('Shared TabBar checks passed: global config, tab routes, translations and detail integration')
