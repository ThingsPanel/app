import assert from 'node:assert/strict'
import fs from 'node:fs'

const source = fs.readFileSync(new URL('../features/devices/utils/device-list.js', import.meta.url), 'utf8')
const { mergeUniqueDevices } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))

assert.deepEqual(
  mergeUniqueDevices([{ id: 'a', online: 0 }], [{ id: 'b' }, { id: 'a', online: 1 }]),
  [{ id: 'a', online: 1 }, { id: 'b' }]
)
assert.deepEqual(
  mergeUniqueDevices([], [{ id: 'pm25' }, { id: 'pm25', name: 'PM2.5' }]),
  [{ id: 'pm25', name: 'PM2.5' }]
)
assert.deepEqual(mergeUniqueDevices(null, null), [])

console.log('Device list checks passed: duplicate IDs are merged')
