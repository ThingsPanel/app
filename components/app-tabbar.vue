<template>
  <view class="app-tabbar" :class="{ 'app-tabbar--immersive': immersive, 'app-tabbar--dark': immersive && dark }" :style="barStyle">
    <button v-for="item in config.list" :key="item.pagePath" class="app-tabbar-item"
      :aria-label="label(item)" :aria-current="item.pagePath === activePath ? 'page' : undefined" :class="{ 'is-active': item.pagePath === activePath }" :style="{ color: itemColor(item) }"
      hover-class="app-tabbar-pressed" @click="open(item)">
      <image :src="iconSource(item)" aria-hidden="true"
        mode="aspectFit" :style="{ width: config.iconWidth, height: config.iconWidth }" />
      <text :style="{ fontSize: config.fontSize, marginTop: config.spacing }">{{ label(item) }}</text>
    </button>
  </view>
</template>

<script>
import pages from '@/pages.json'
import { TAB_BAR_ITEMS } from '@/utils/tab-bar-items'
import { BOARD_TABBAR_COLORS } from '@/utils/tabbar-appearance'

// 非一级页面的底部导航复用原生 TabBar 的配置，不能另设菜单、图标或跳转地址。
export default {
  props: { activePath: { type: String, required: true }, immersive: { type: Boolean, default: false }, dark: { type: Boolean, default: false } },
  data() { return { config: pages.tabBar } },
  computed: {
    barStyle() {
      if (this.immersive) return { '--tabbar-height': this.config.height,
        backgroundColor: BOARD_TABBAR_COLORS[this.dark ? 'dark' : 'light'] }
      return { '--tabbar-height': this.config.height, backgroundColor: this.config.backgroundColor,
        borderTopColor: this.config.borderStyle === 'black' ? '#000' : '#fff' }
    }
  },
  methods: {
    itemColor(item) {
      if (this.immersive && this.dark) return item.pagePath === this.activePath ? '#67dff0' : '#e1e6ed'
      if (this.immersive) return item.pagePath === this.activePath ? '#1468db' : '#536176'
      return item.pagePath === this.activePath ? this.config.selectedColor : this.config.color
    },
    iconSource(item) {
      const selected = item.pagePath === this.activePath
      // App 本地资源交给 image 解析，避免 WKWebView 中 CSS mask 的资源路径兼容问题。
      if (this.immersive && this.dark) {
        const name = item.iconPath.split('/').pop().replace(/\.png$/, selected ? '-selected.png' : '.png')
        return '/static/tabbar/dark/' + name
      }
      return '/' + (selected ? item.selectedIconPath : item.iconPath)
    },
    label(item) {
      const key = TAB_BAR_ITEMS.find(tab => tab.pagePath === item.pagePath)?.key
      return key ? this.$t(key) : item.text
    },
    open(item) {
      if (this.immersive && item.pagePath === this.activePath) return
      uni.switchTab({ url: '/' + item.pagePath, fail: () => uni.showToast({ title: '无法打开页面，请重试', icon: 'none' }) })
    }
  }
}
</script>

<style scoped>
.app-tabbar { flex-shrink: 0; display: flex; height: calc(var(--tabbar-height) + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); box-sizing: border-box; border-top: 1px solid; font-family: inherit; }
.app-tabbar-item { flex: 1; min-width: 0; min-height:48px; margin:0; padding:0; border:0; border-radius:0; background:transparent; font-family:inherit; line-height:inherit; display: flex; align-items: center; justify-content: center; flex-direction: column; cursor:pointer; }
.app-tabbar-item::after { border:0; }
.app-tabbar-item:focus-visible { outline:2px solid currentColor; outline-offset:-3px; }
.app-tabbar-item text { line-height: 1.4; }
.app-tabbar-pressed { opacity: .6; }
.app-tabbar--immersive { position:relative; z-index:2; border-top-color:rgba(127,140,160,.18); }
.app-tabbar--dark { border-top-color:rgba(255,255,255,.16); }
.app-tabbar-item image { flex-shrink:0; }
.app-tabbar--immersive .is-active text { font-weight:600; }
</style>
