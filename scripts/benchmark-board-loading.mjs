// Controlled network benchmark; does not contact production or measure phone rendering.
import fs from 'node:fs'
import vm from 'node:vm'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
import * as helpers from '../utils/thingsvis-device-schema.js'

const root = new URL('../', import.meta.url)
const delay = () => new Promise(resolve => setTimeout(resolve, 25))
const source = (path, baseline) => baseline
  ? execFileSync('git', ['show', `HEAD:${path}`], { cwd: root, encoding: 'utf8' })
  : fs.readFileSync(new URL(path, root), 'utf8')
const load = (text, name, context) => vm.runInNewContext(
  text.replace(/^import .*$/gm, '').replace('export function', 'function') + `; ${name}`, context)

async function authBenchmark(baseline) {
  let sso = 0, profile = 0
  const factory = load(source('api/modules/boards.js', baseline), 'createBoardsClient', {
    resolveThingsVisAddresses: () => ({ thingsVisApiBase: 'https://test.invalid' }),
    requestDeviceApi: async () => { profile++; await delay(); return { id: 'test-user' } },
    uni: { getStorageSync: () => 'test-token', request: async options => {
      await delay()
      const isAuth = options.url.endsWith('/auth/sso')
      if (isAuth) sso++
      options.success({ statusCode: 200, data: isAuth ? { accessToken: 'sso' } : { data: [] } })
    } }
  })
  const started = performance.now()
  await factory().dashboards({ page: 1 })
  await factory().preview('board')
  await factory().preview('board')
  return { ms: Math.round(performance.now() - started), profile, sso }
}

async function historyBenchmark(baseline) {
  let active = 0, peak = 0, calls = 0
  const keys = Array.from({ length: 8 }, (_, i) => `field${i}`)
  const factory = load(source('services/thingsvis-device-runtime.js', baseline), 'createDeviceRuntime', {
    ...helpers, setTimeout, clearTimeout, setInterval, clearInterval,
    uni: { getStorageSync: () => 'test-token' },
    requestDeviceApi: async path => {
      if (path === 'telemetry/datas/statistic') { active++; peak = Math.max(peak, active); calls++ }
      await delay()
      if (path === 'telemetry/datas/statistic') { active--; return [{ ts: 1700000000, value: 1 }] }
      if (path === 'device/model/telemetry') return keys.map(key => ({ key, data_type: 'int' }))
      return []
    }
  })
  const runtime = factory({
    device: { device_config: { device_template_id: 'template' } }, deviceId: 'device',
    addresses: {}, onMessage() {}, onState() {},
    dataOnly: { schema: {
      nodes: keys.map(key => ({ props: { series: `{{ ds.source.data.${key}__history }}` } })),
      dataSources: [{ id: 'source', type: 'PLATFORM_FIELD', config: { deviceId: 'device' } }]
    } }
  })
  const started = performance.now()
  await runtime.start()
  runtime.stop()
  assert.equal(calls, 8, 'all history fields must load')
  assert.equal(peak, baseline ? 1 : 4, 'history concurrency is bounded')
  return { ms: Math.round(performance.now() - started), historyRequests: calls, peakConcurrency: peak }
}

for (const baseline of [true, false]) {
  const auth = await authBenchmark(baseline)
  assert.equal(auth.sso, baseline ? 3 : 1)
  console.log(JSON.stringify({ version: baseline ? 'HEAD before changes' : 'working tree', simulatedRequestLatencyMs: 25, listThenOpenTwice: auth, eightHistoryFields: await historyBenchmark(baseline) }))
}
