<template>
  <view class="location-map">
    <!-- H5 与 App 端：uni-app 的 <map> 组件在 H5 下 @tap 不返回经纬度，
         因此改用 renderjs 直接驱动腾讯地图 GL JS，与社区版实现保持一致。 -->
    <!-- #ifdef APP-PLUS || H5 -->
    <view
      v-if="hasMapKey"
      :id="canvasId"
      class="location-map__canvas"
      :map-options="mapOptions"
      :change:map-options="locationMapBridge.syncOptions"
    />
    <view v-else class="location-map__notice">{{ keyMissingHint }}</view>
    <!-- #endif -->

    <!-- 微信小程序等端：<map> 组件内置腾讯地图，无需密钥。 -->
    <!-- #ifndef APP-PLUS || H5 -->
    <map
      :id="canvasId"
      class="location-map__canvas"
      :longitude="centerCoordinate.longitude"
      :latitude="centerCoordinate.latitude"
      :scale="zoom"
      :markers="nativeMarkers"
      :enable-scroll="true"
      :enable-zoom="true"
      @tap="handleNativeTap"
    />
    <!-- #endif -->
  </view>
</template>

<script>
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  TENCENT_MAP_KEY,
  TENCENT_MAP_SDK_URL,
  parseMapCoordinate
} from '@/utils/map-config'

// 小程序端 <map> 的 marker 必须给出 iconPath，且只接受图片文件。
const MARKER_ICON_PATH = '/static/icon/map-marker.png'
let canvasSequence = 0

export default {
  name: 'DeviceLocationMap',
  props: {
    longitude: { type: [String, Number], default: '' },
    latitude: { type: [String, Number], default: '' },
    /** 是否允许在地图上点选。只读展示时传 false，地图仍可缩放与拖动。 */
    interactive: { type: Boolean, default: false },
    /**
     * 是否做逆地址解析，并通过 address 事件把结果上报给页面。
     * 默认关闭：只读小地图不需要地址，省掉一次解析请求。
     *
     * ⚠️ 这个名字不能改成 renderjs 里的方法名（见下方 resolveDeviceAddress 的注释）。
     */
    resolveAddress: { type: Boolean, default: false }
  },
  emits: ['pick', 'address'],
  data() {
    return {
      canvasId: `device-location-map-${++canvasSequence}`,
      // 首帧后再推送，确保 renderjs 的 change 回调一定被触发一次。
      mapOptions: null,
      coordinate: null,
      mapKey: TENCENT_MAP_KEY,
      zoom: DEFAULT_MAP_ZOOM
    }
  },
  computed: {
    hasMapKey() {
      return !!this.mapKey
    },
    keyMissingHint() {
      return '未配置地图密钥，请按 .env.example 配置 VITE_TENCENT_MAP_KEY'
    },
    centerCoordinate() {
      return this.coordinate || DEFAULT_MAP_CENTER
    },
    nativeMarkers() {
      if (!this.coordinate) return []
      return [{
        id: 1,
        longitude: this.coordinate.longitude,
        latitude: this.coordinate.latitude,
        iconPath: MARKER_ICON_PATH,
        width: 24,
        height: 32,
        anchor: { x: 0.5, y: 1 }
      }]
    }
  },
  watch: {
    longitude() { this.syncCoordinate() },
    latitude() { this.syncCoordinate() },
    interactive() { this.publishOptions() },
    resolveAddress() { this.publishOptions() }
  },
  created() {
    this.syncCoordinate()
  },
  mounted() {
    this.$nextTick(() => this.publishOptions())
  },
  methods: {
    syncCoordinate() {
      this.coordinate = parseMapCoordinate(this.longitude, this.latitude)
      this.publishOptions()
    },
    publishOptions() {
      if (!this.mapKey) return
      this.mapOptions = {
        canvasId: this.canvasId,
        sdkUrl: TENCENT_MAP_SDK_URL,
        key: this.mapKey,
        longitude: this.centerCoordinate.longitude,
        latitude: this.centerCoordinate.latitude,
        zoom: this.zoom,
        interactive: this.interactive,
        resolveAddress: this.resolveAddress
      }
    },
    /** 小程序端 <map> 的点选回调 */
    handleNativeTap(event) {
      const detail = event?.detail || {}
      this.applyPick(detail.longitude, detail.latitude)
    },
    /** renderjs 通过 $ownerInstance.callMethod 回调的点选结果 */
    handleMapPick(payload) {
      this.applyPick(payload?.longitude, payload?.latitude)
    },
    /** renderjs 上报的地图异常 */
    handleMapNotice(message) {
      if (message) uni.showToast({ title: message, icon: 'none' })
    },
    /** renderjs 上报的逆地址解析结果，交给全屏页的信息卡展示 */
    handleAddressResolved(payload) {
      if (!payload?.address) return
      this.$emit('address', payload)
    },
    applyPick(longitude, latitude) {
      if (!this.interactive) return
      const coordinate = parseMapCoordinate(longitude, latitude)
      if (!coordinate) return
      this.coordinate = coordinate
      this.$emit('pick', coordinate)
    }
  }
}
</script>

<!-- #ifdef APP-PLUS || H5 -->
<script module="locationMapBridge" lang="renderjs">
export default {
  data() {
    return {
      map: null,
      markerLayer: null,
      sdkPromise: null,
      ready: false,
      // 始终保存最新一次下发的配置：SDK 是异步加载的，加载期间可能又来了新配置。
      latestOptions: null,
      // 点选监听是否已绑定，避免重复注册。
      pickBound: false,
      // 逆地址解析：geocoder 实例复用，结果按坐标缓存，进行中的请求去重。
      geocoder: null,
      addressCache: null,
      addressPending: null
    }
  },
  methods: {
    syncOptions(options) {
      if (!options || !options.key) return
      this.latestOptions = options
      if (this.ready) {
        this.refresh(options)
        return
      }
      // 首次加载中就直接返回：SDK 就绪后会用最新的 latestOptions 初始化，
      // 否则组件 created + mounted 两次下发会让 createMap 跑两遍，
      // 在同一个容器上叠出两个地图实例，表现为瓦片错乱、标记不显示。
      if (this.sdkPromise) return
      this.setup()
    },
    setup() {
      this.loadSdk(this.latestOptions)
        .then(() => this.createMap())
        .catch(error => {
          // 这里只兜 SDK 加载失败。createMap 内部的异常由它自己处理——
          // 否则「地图其实已经画出来了」也会被报成加载失败（踩过这个坑，排查成本很高）。
          console.error('[DeviceLocationMap] 地图 SDK 加载失败', error)
          this.notify('地图服务加载失败，请检查网络后重试')
        })
    },
    loadSdk(options) {
      if (window.TMap) return Promise.resolve()
      if (this.sdkPromise) return this.sdkPromise
      this.sdkPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = `${options.sdkUrl}&key=${encodeURIComponent(options.key)}`
        script.onload = () => resolve()
        script.onerror = () => {
          this.sdkPromise = null
          reject(new Error('腾讯地图 SDK 加载失败'))
        }
        document.head.appendChild(script)
      })
      return this.sdkPromise
    },
    createMap() {
      // 双保险：万一还有别的路径重复触发，已建图就只刷新，不再新建。
      if (this.map) {
        this.refresh()
        return
      }
      const options = this.latestOptions
      const host = document.getElementById(options.canvasId)
      if (!host || !window.TMap) {
        this.notify('地图容器不可用，请重试')
        return
      }
      const TMap = window.TMap
      try {
        this.map = new TMap.Map(host, {
          center: new TMap.LatLng(options.latitude, options.longitude),
          zoom: options.zoom,
          minZoom: 3,
          maxZoom: 18,
          // 2D 模式不会出现罗盘与倾斜控件，小尺寸容器里更干净。
          viewMode: '2D',
          pitchable: false,
          rotatable: false,
          // 只读态隐藏缩放/比例尺等默认控件；编辑态保留，便于点按缩放。
          showControl: options.interactive,
          // 缩放与拖动始终可用：仅禁止「点选落点」这一项交互。
          draggable: true,
          scrollable: true,
          touchZoomable: true,
          doubleClickZoom: true
        })
        this.ready = true
        // 点选监听只绑一次，且无条件绑：地图常常是先以只读态创建、之后才进入编辑态，
        // 若按创建时的 interactive 决定绑不绑，编辑已有位置的设备时就永远点不动。
        // 是否采纳点选结果由 applyPick 里的 interactive 判断，不靠绑定时机。
        if (!this.pickBound) {
          this.pickBound = true
          this.bindPick()
        }
        this.refresh()
        this.resize()
      } catch (error) {
        // 初始化失败要和「SDK 加载失败」分开报，否则定位不到真正的原因。
        console.error('[DeviceLocationMap] 地图初始化失败', error)
        this.map = null
        this.ready = false
        this.notify('地图初始化失败，请重试')
      }
    },
    bindPick() {
      this.map.on('click', event => {
        const lat = event?.latLng?.getLat?.()
        const lng = event?.latLng?.getLng?.()
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
        this.$ownerInstance.callMethod('handleMapPick', { longitude: lng, latitude: lat })
      })
    },
    refresh(options) {
      const current = options || this.latestOptions
      if (!this.map || !window.TMap || !current) return
      const TMap = window.TMap
      const position = new TMap.LatLng(current.latitude, current.longitude)
      this.map.setCenter(position)
      if (this.markerLayer) {
        this.markerLayer.setMap(null)
        this.markerLayer = null
      }
      this.markerLayer = new TMap.MultiMarker({
        map: this.map,
        styles: {
          device: new TMap.MarkerStyle({
            width: 24,
            height: 32,
            anchor: { x: 12, y: 32 },
            src: this.markerIcon()
          })
        },
        geometries: [{ id: 'device-location', styleId: 'device', position }]
      })
      // 不 await：解析慢不能挡住地图渲染。但必须挂 catch，
      // 否则这里一旦抛错就变成无人处理的 promise 异常，只会在控制台一闪而过。
      this.resolveDeviceAddress(current, position).catch(error => {
        console.error('[DeviceLocationMap] 地址解析异常', error)
      })
    },
    /**
     * 逆地址解析。结果不在地图上画气泡，而是通过 handleAddressResolved
     * 上报给页面，由页面自行展示。
     *
     * ⚠️ 方法名不能叫 resolveAddress：uni-app 会把本 renderjs 模块当作 mixin
     * 合并进主组件（构建产物里是 `mixins.push(...)`），实例代理上 props 优先于
     * methods，于是 this.resolveAddress 取到的是同名 prop（布尔值），
     * 调用时抛 "this.resolveAddress is not a function"。
     *
     * 未开启 resolveAddress 时直接返回：小地图不需要地址，省掉一次请求。
     */
    async resolveDeviceAddress(current, position) {
      if (!current.resolveAddress) return
      const cacheKey = `${current.latitude},${current.longitude}`
      const cached = this.addressCache?.[cacheKey]
      if (cached) {
        this.reportAddress(current, cached)
        return
      }
      if (this.addressPending?.has(cacheKey)) return
      if (!this.addressPending) this.addressPending = new Set()
      this.addressPending.add(cacheKey)
      let address = '暂时无法获取地址'
      let timer
      try {
        if (!window.TMap.service?.Geocoder) throw new Error('地址解析服务未加载')
        if (!this.geocoder) this.geocoder = new window.TMap.service.Geocoder()
        const response = await Promise.race([
          this.geocoder.getAddress({ location: position }),
          new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('地址解析超时')), 10000) })
        ])
        if (response.status !== 0 || !response.result?.address) throw new Error('地址解析未返回有效地址')
        address = response.result.address
      } catch (error) {
        // 只记录诊断状态，避免 SDK 错误对象携带密钥或请求 URL。
        console.warn('[DeviceLocationMap] 地址解析失败', error?.status || error?.message || '网络异常')
      } finally {
        clearTimeout(timer)
        this.addressPending.delete(cacheKey)
      }
      if (!this.addressCache) this.addressCache = {}
      this.addressCache[cacheKey] = address
      this.reportAddress(current, address)
    },
    /** 上报前比对坐标：解析是异步的，回包可能已经属于上一个位置。 */
    reportAddress(current, address) {
      const latest = this.latestOptions
      if (`${latest?.latitude},${latest?.longitude}` !== `${current.latitude},${current.longitude}`) return
      this.$ownerInstance.callMethod('handleAddressResolved', {
        longitude: current.longitude,
        latitude: current.latitude,
        address
      })
    },
    /** 容器尺寸变化后让地图重新测量，否则画布尺寸与容器不一致。 */
    resize() {
      if (!this.map) return
      setTimeout(() => {
        if (!this.map) return
        if (typeof this.map.resize === 'function') {
          this.map.resize()
          return
        }
        window.dispatchEvent(new Event('resize'))
      }, 60)
    },
    /** 内联 SVG 图标，避免依赖官方 demo 的图片路径与部署子路径。 */
    markerIcon() {
      const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 48 64">'
        + '<path d="M24 2C12.4 2 3 11.4 3 23c0 15.6 21 39 21 39s21-23.4 21-39C45 11.4 35.6 2 24 2z" fill="#1677ff" stroke="#ffffff" stroke-width="3"/>'
        + '<circle cx="24" cy="23" r="7.5" fill="#ffffff"/></svg>'
      return `data:image/svg+xml;base64,${window.btoa(svg)}`
    },
    notify(message) {
      this.$ownerInstance.callMethod('handleMapNotice', message)
    }
  }
}
</script>
<!-- #endif -->

<style scoped>
.location-map { position: relative; width: 100%; height: 180px; border-radius: 4px; overflow: hidden; background: #fafbfe; }
.location-map__canvas { width: 100%; height: 100%; }
.location-map__notice { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; padding: 0 16px; box-sizing: border-box; color: #8b95a6; font-size: 12px; text-align: center; }
</style>
