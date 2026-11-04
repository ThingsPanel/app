import { h, render } from 'vue'
import Detail from '../../pages/devices/detail.vue'
import Overview from '../../features/devices/components/device-overview-tab.vue'
import Fallback from '../../features/devices/components/device-telemetry-fallback.vue'
import History from '../../features/devices/components/telemetry-history-sheet.vue'

// Dev-only layout fixture. Keep the real page, event chain, popup and chart;
// replace network data so this check never needs credentials or a live device.
export function mount() {
  const app = document.querySelector('#app').__vue_app__
  document.querySelector('#app').style.display = 'none'
  const root = document.createElement('div')
  document.body.append(root)
  const fallback = { ...Fallback, mounted() {
    this.items = [{ key: 'lux', name: 'lux', value: 14, ts: Date.now() }]
    this.loading = false
  } }
  const overview = { ...Overview, mounted() { this.phase = 'empty' },
    components: { ...Overview.components, DeviceTelemetryFallback: fallback } }
  const history = { ...History,
    mounted() { window.historyLayoutReview.sheet = this; History.mounted.call(this) },
    methods: { ...History.methods, async load() {
      window.historyLayoutReview.loads++
      const end = Date.now()
      this.rows = Array.from({ length: 30 }, (_, i) => ({ ts: end - (29-i)*60000, value: 14 + Math.sin(i/3)*2 }))
      this.total = this.rows.length
      this.loading = false
      this.error = ''
      this.$nextTick(() => this.draw())
    } }
  }
  const page = { ...Detail,
    data() { return { ...Detail.data.call(this), deviceId: 'layout-review', device: { id:'layout-review', name:'本地布局检查设备' }, detailLoaded:true, pageVisible:true } },
    methods: { ...Detail.methods, async loadDevice() {} },
    components: { ...Detail.components, DeviceOverviewTab: overview, TelemetryHistorySheet: history }
  }
  const vnode = h(page)
  vnode.appContext = app._context
  window.historyLayoutReview = { loads: 0, root, leave: () => Detail.onHide.call(vnode.component.proxy) }
  render(vnode, root)
}
