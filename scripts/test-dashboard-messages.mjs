import assert from 'node:assert/strict'
import fs from 'node:fs'
import { createI18n } from 'vue-i18n'

const source = fs.readFileSync(new URL('../pages/dashboard/index.vue', import.meta.url), 'utf8')
const body = source.match(/formatMessage\(key, values\) \{([\s\S]*?)\n    \},/)[1]
const formatMessage = new Function('key', 'values', body)
const messages = {}
for (const locale of ['zh-CN', 'en-US']) {
  const source = fs.readFileSync(new URL(`../lang/${locale}.js`, import.meta.url), 'utf8')
  messages[locale] = (await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))).default
}
const i18n = createI18n({ legacy: true, locale: 'zh-CN', messages })
for (const locale of Object.keys(messages)) {
  i18n.global.locale = locale
  // Exercise both the real message compiler and the App runtime's literal-message behavior.
  for (const $t of [i18n.global.t.bind(i18n.global), key => messages[locale].dashboard[key.split('.')[1]]]) {
    for (const count of [0, 85, '—']) {
      assert.equal(formatMessage.call({ $t }, 'dashboard.onlineCount', { count }), locale === 'zh-CN' ? `在线 ${count} 台` : `${count} online`)
    }
    assert.equal(formatMessage.call({ $t }, 'dashboard.updatedAt', { time: '14:35' }), locale === 'zh-CN' ? '更新于 14:35' : 'Updated 14:35')
    assert.ok(formatMessage.call({ $t }, 'dashboard.groupCounts', { total: 100, online: 85 }).includes('85'))
  }
}
console.log('Dashboard message checks passed: compiled/runtime translations, both locales, zero and missing counts, time and group values.')
