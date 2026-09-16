import fs from 'node:fs'
import vm from 'node:vm'
import assert from 'node:assert/strict'
const source = fs.readFileSync(new URL('../features/devices/components/telemetry-history-sheet.vue', import.meta.url), 'utf8')
const script = source.match(/<script module="plot" lang="renderjs">([\s\S]*?)<\/script>/)[1]
let options, settings
class Observer { observe() {} disconnect() {} }
const component = vm.runInNewContext(script.replace(/import .* from 'echarts'/, '').replace('export default', 'globalThis.component =') + '; component', {
  echarts: { init: () => ({ setOption(o, s) { options = o; settings = s } }) },
  document: { getElementById: () => ({ isConnected: true }), body: {} },
  ResizeObserver: Observer, MutationObserver: Observer
})
for (const type of ['line', 'bar', 'scatter']) {
  const start = Date.now()
  component.methods.update.call({}, { id: 'chart', type, points: Array.from({ length: 60 }, (_, i) => [start + i * 1000, 24 + i / 10]), unit: '' })
  assert.equal(options.dataZoom.length, 0)
  assert.equal(settings.notMerge, true)
  assert.equal(options.xAxis.splitNumber, 3)
  assert.equal(options.xAxis.axisLabel.hideOverlap, true)
  assert.match(options.xAxis.axisLabel.formatter(start), /^\d{2}:\d{2}:\d{2}$/)
  assert.equal(options.grid.containLabel, true)
}
console.log('Telemetry chart: sparse time labels, overlap hiding and no zoom slider passed for all chart types.')
