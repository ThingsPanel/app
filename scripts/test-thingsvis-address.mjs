import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../utils/thingsvis-address.js', import.meta.url), 'utf8')
const { resolveThingsVisAddresses: resolve, getThingsVisSettings: get, saveThingsVisSettings: save } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
const memory = new Map()
const storage = { getStorageSync: key => memory.get(key), setStorageSync: (key, value) => memory.set(key, value) }

assert.deepEqual(resolve({ serverAddress: 'http://192.168.1.20:8080/api/v1///', settings: {} }), {
  platformWebBase: 'http://192.168.1.20:8080',
  thingsVisPageUrl: 'http://192.168.1.20:8080/main/',
  thingsVisApiBase: 'http://192.168.1.20:8080/thingsvis-api',
  thingsPanelApiBase: 'http://192.168.1.20:8080/api/v1'
})
assert.equal(resolve({ serverAddress: 'http://localhost:9999', settings: {} }).platformWebBase, 'http://localhost:9999')
assert.equal(resolve({ serverAddress: 'https://api.example', webViewBase: 'https://web.example/panel/', settings: {} }).thingsVisPageUrl, 'https://web.example/panel/main/')
const settings = { platformWebBase: 'https://panel.example/', thingsVisPageUrl: 'https://vis.example/main.html', thingsVisApiBase: 'https://vis-api.example/api/' }
const addresses = save(settings, { serverAddress: 'https://one.example/api/v1', storage })
assert.equal(addresses.thingsVisPageUrl, settings.thingsVisPageUrl)
assert.equal(addresses.thingsPanelApiBase, 'https://one.example/api/v1')
assert.equal(get('https://one.example/', storage).thingsVisApiBase, 'https://vis-api.example/api')
assert.equal(get('https://two.example', storage).thingsVisApiBase, '')
assert.equal(resolve({ serverAddress: 'http://[::1]:8080/', settings: {} }).thingsVisPageUrl, 'http://[::1]:8080/main/')
for (const invalid of ['javascript:alert(1)', 'ftp://example.com', 'https://user:pass@example.com', 'https://example.com/?token=secret', 'https://example.com/#/embed', 'https://example.com:99999', 'https://', 'https://example.com\\evil']) {
  assert.throws(() => save({ thingsVisPageUrl: invalid }, { serverAddress: 'https://one.example', storage }))
}
assert.equal(get('https://one.example', storage).thingsVisPageUrl, settings.thingsVisPageUrl, 'invalid settings must not overwrite stored values')
save({}, { serverAddress: 'https://one.example', storage })
assert.equal(get('https://one.example', storage).thingsVisPageUrl, '', 'blank values reset overrides')
console.log('ThingsVis address tests passed')
