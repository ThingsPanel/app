import assert from 'node:assert/strict'
import fs from 'node:fs'
import vm from 'node:vm'
import { reactive } from 'vue'

// Execute the actual renderjs methods: this catches regressions in the H5 bridge,
// including Vue Proxy values that a browser cannot structured-clone directly.
const source = fs.readFileSync(new URL('../features/devices/components/device-overview-tab.vue', import.meta.url), 'utf8')
const script = source.match(/<script\s+module="thingsvisBridge"\s+lang="renderjs">([\s\S]*?)<\/script>/)?.[1]
assert.ok(script, 'ThingsVis renderjs bridge must exist')
const listeners = new Set()
const frames = []
const callbacks = []
const resizeObservers = []
const removalObservers = []
const host = { clientWidth: 360, isConnected: true, appendChild(frame) { frames.push(frame) } }
class Observer {
  constructor(callback, collection) { this.callback = callback; this.disconnected = false; collection.push(this) }
  observe(target) { this.target = target }
  disconnect() { this.disconnected = true }
}
const sandbox = {
  URL,
  window: {
    addEventListener(type, listener) { assert.equal(type, 'message'); listeners.add(listener) },
    removeEventListener(type, listener) { assert.equal(type, 'message'); listeners.delete(listener) }
  },
  document: {
    body: {},
    getElementById(id) { return id === 'frame-host' ? host : null },
    createElement(tag) {
      assert.equal(tag, 'iframe')
      return {
        style: {}, attributes: {}, sent: [], removed: false,
        setAttribute(name, value) { this.attributes[name] = value },
        remove() { this.removed = true },
        get contentWindow() {
          if (!this.frameWindow) this.frameWindow = { postMessage: (message, origin) => this.sent.push({ message: structuredClone(message), origin }) }
          return this.frameWindow
        }
      }
    }
  },
  ResizeObserver: class extends Observer { constructor(callback) { super(callback, resizeObservers) } },
  MutationObserver: class extends Observer { constructor(callback) { super(callback, removalObservers) } }
}
const definition = vm.runInNewContext(script.replace('export default', 'bridge ='), sandbox)
const bridge = { $ownerInstance: { callMethod(name, value) { callbacks.push({ name, value }) } } }
for (const [name, method] of Object.entries(definition.methods)) bridge[name] = method.bind(bridge)
const state = { id: 'frame-host', session: 7, url: 'https://vis.example/main/#/embed', canvas: { width: 720, height: 960 } }
bridge.syncFrame(state)
const frame = frames[0]
assert.equal(frame.style.height, '480px')
assert.equal(frame.src, state.url)
assert.equal(listeners.size, 1)
const dispatch = (message, origin = 'https://vis.example', sender = frame.contentWindow) => {
  for (const listener of [...listeners]) listener({ data: message, origin, source: sender })
}

const message = reactive({ type: 'INIT', payload: { nodes: [{ id: 'device-temperature', value: 26 }] } })
assert.throws(() => structuredClone(message), { name: 'DataCloneError' }, 'fixture must reproduce the browser Proxy failure')
assert.doesNotThrow(() => bridge.sendMessages(reactive({ session: 7, messages: [message] })))
assert.deepEqual(frame.sent[0], { message: JSON.parse(JSON.stringify(message)), origin: 'https://vis.example' })
bridge.sendMessages({ session: 6, messages: [{ type: 'OLD_SESSION' }] })
assert.equal(frame.sent.length, 1, 'stale session must not send')

dispatch({ type: 'READY' }, 'https://attacker.example')
dispatch({ type: 'READY' }, 'https://vis.example', {})
dispatch({ type: 'unrecognized' })
dispatch(null)
assert.equal(callbacks.length, 0, 'untrusted or unsupported messages must be ignored')
for (const type of ['READY', 'LOADED', 'tv:ready', 'tv:loaded']) dispatch({ type })
assert.equal(callbacks.length, 4)
assert.ok(callbacks.every(entry => entry.name === 'onFrameEvent' && entry.value.session === 7))
assert.deepEqual(callbacks.map(entry => entry.value.message.type), ['READY', 'LOADED', 'tv:ready', 'tv:loaded'])

dispatch({ type: 'tv:content-height', payload: { height: 900 } })
assert.equal(frame.style.height, '900px')
dispatch({ type: 'tv:content-height', payload: { height: 1 } })
assert.equal(frame.style.height, '160px')
dispatch({ type: 'tv:content-height', payload: { height: 50000 } })
assert.equal(frame.style.height, '20000px')
for (const height of [-1, 0, 'invalid', Infinity]) dispatch({ type: 'tv:content-height', payload: { height } })
assert.equal(frame.style.height, '20000px', 'invalid height must not alter layout')
host.clientWidth = 300
resizeObservers[0].callback()
assert.equal(frame.style.height, '400px')
assert.equal(callbacks.length, 4, 'layout messages remain in render layer')

bridge.syncFrame({ ...state, session: 8 })
assert.equal(frame.removed, true)
assert.equal(resizeObservers[0].disconnected, true)
assert.equal(removalObservers[0].disconnected, true)
assert.equal(listeners.size, 1, 'reloading must replace the listener')
bridge.sendMessages({ session: 7, messages: [{ type: 'STALE' }] })
assert.equal(frames[1].sent.length, 0)
dispatch({ type: 'READY' }, 'https://vis.example', frame.contentWindow)
assert.equal(callbacks.length, 4, 'previous iframe must not reach current session')
host.isConnected = false
removalObservers[1].callback()
assert.equal(listeners.size, 0)
assert.equal(resizeObservers[1].disconnected, true)
assert.equal(removalObservers[1].disconnected, true)
assert.equal(frames[1].removed, true)
assert.equal(bridge.deviceFrame, null)
assert.doesNotThrow(() => bridge.sendMessages({ session: 8, messages: [message] }))
assert.doesNotThrow(() => bridge.cleanupFrame(), 'cleanup must be repeatable')
console.log('ThingsVis renderjs bridge tests passed')
