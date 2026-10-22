import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
const source = fs.readFileSync(new URL('../services/mp-update.js', import.meta.url), 'utf8').replaceAll('export ', '')
function setup() {
  let ready, failed, modal, registrations = 0, prompts = 0, applied = 0
  const api = vm.runInNewContext(source + ';({initMpUpdate,setMpUpdateForeground})', {
    console: { warn() {} },
    uni: {
      getUpdateManager() { registrations++; return {
        onUpdateReady(fn) { ready = fn }, onUpdateFailed(fn) { failed = fn }, applyUpdate() { applied++ }
      } },
      showModal(options) { prompts++; modal = options }
    }
  })
  return { api, ready: () => ready(), failed: () => failed(), answer: confirm => modal.success({confirm}), stats: () => ({registrations,prompts,applied}) }
}
const later = setup()
later.api.initMpUpdate(); later.api.initMpUpdate()
later.api.setMpUpdateForeground(true)
assert.equal(later.stats().prompts, 0, 'do not prompt before download finishes')
later.api.setMpUpdateForeground(false); later.ready()
assert.equal(later.stats().prompts, 0, 'wait while backgrounded')
later.api.setMpUpdateForeground(true); later.answer(false)
later.api.setMpUpdateForeground(false); later.api.setMpUpdateForeground(true); later.ready()
assert.deepEqual(later.stats(), {registrations:1,prompts:1,applied:0})
const accept = setup()
accept.api.initMpUpdate(); accept.api.setMpUpdateForeground(true); accept.ready(); accept.answer(true)
assert.equal(accept.stats().applied, 1)
const failure = setup()
failure.api.initMpUpdate(); failure.api.setMpUpdateForeground(true); failure.failed()
assert.equal(failure.stats().prompts, 0)
assert.equal(failure.stats().applied, 0)
console.log('MP update passed: ready-only, foreground, once per launch, defer, confirm and failed download.')
