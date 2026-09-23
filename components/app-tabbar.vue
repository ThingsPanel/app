<template>
  <view class="app-tabbar" :class="{ 'app-tabbar--immersive': immersive, 'app-tabbar--dark': immersive && dark }" :style="barStyle">
    <button v-for="item in config.list" :key="item.pagePath" class="app-tabbar-item"
      :aria-label="label(item)" :aria-current="item.pagePath === activePath ? 'page' : undefined" :class="{ 'is-active': item.pagePath === activePath }" :style="{ color: itemColor(item) }"
      hover-class="app-tabbar-pressed" @click="open(item)">
      <view v-if="immersive && dark" class="app-tabbar-tinted-icon" aria-hidden="true" :style="iconStyle(item)" />
      <image v-else :src="'/' + (item.pagePath === activePath ? item.selectedIconPath : item.iconPath)"
        mode="aspectFit" :style="{ width: config.iconWidth, height: config.iconWidth }" />
      <text :style="{ fontSize: config.fontSize, marginTop: config.spacing }">{{ label(item) }}</text>
    </button>
  </view>
</template>

<script>
import pages from '@/pages.json'

// 非一级页面的底部导航复用原生 TabBar 的配置，不能另设菜单、图标或跳转地址。
export default {
  props: { activePath: { type: String, required: true }, immersive: { type: Boolean, default: false }, dark: { type: Boolean, default: false } },
  data() { return { config: pages.tabBar } },
  computed: {
    barStyle() {
      if (this.immersive) return { '--tabbar-height': this.config.height }
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
    iconStyle(item) {
      const source = `url(/${item.pagePath === this.activePath ? item.selectedIconPath : item.iconPath})`
      return { width: this.config.iconWidth, height: this.config.iconWidth, maskImage: source, WebkitMaskImage: source }
    },
    label(item) { return item.key ? this.$t(item.key) : item.text },
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
.app-tabbar--immersive { position:relative; z-index:2; background:rgba(248,250,253,.9); border-top-color:rgba(127,140,160,.18); }
.app-tabbar--dark { background:rgba(20,28,40,.88); border-top-color:rgba(255,255,255,.16); }
.app-tabbar-tinted-icon { flex-shrink:0; background-color:currentColor; -webkit-mask-size:contain; mask-size:contain; -webkit-mask-position:center; mask-position:center; -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat; }
.app-tabbar--immersive .is-active text { font-weight:600; }
/* Blur is progressive enhancement; the tint above remains legible without it. */
@supports (backdrop-filter:blur(12px)) or (-webkit-backdrop-filter:blur(12px)) {
  .app-tabbar--immersive { background:rgba(248,250,253,.8); -webkit-backdrop-filter:blur(12px); backdrop-filter:blur(12px); }
  .app-tabbar--dark { background:rgba(20,28,40,.76); }
}
@media (prefers-reduced-transparency:reduce) {
  .app-tabbar--immersive { background:#f8fafd; backdrop-filter:none; -webkit-backdrop-filter:none; }
  .app-tabbar--dark { background:#141c28; }
}
</style>
