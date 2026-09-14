<template>
  <view class="app-tabbar" :style="barStyle">
    <view v-for="item in config.list" :key="item.pagePath" class="app-tabbar-item" role="button"
      :aria-label="label(item)" :style="{ color: item.pagePath === activePath ? config.selectedColor : config.color }"
      hover-class="app-tabbar-pressed" @click="open(item)">
      <image :src="'/' + (item.pagePath === activePath ? item.selectedIconPath : item.iconPath)"
        mode="aspectFit" :style="{ width: config.iconWidth, height: config.iconWidth }" />
      <text :style="{ fontSize: config.fontSize, marginTop: config.spacing }">{{ label(item) }}</text>
    </view>
  </view>
</template>

<script>
import pages from '@/pages.json'

// 非一级页面的底部导航复用原生 TabBar 的配置，不能另设菜单、图标或跳转地址。
export default {
  props: { activePath: { type: String, required: true } },
  data() { return { config: pages.tabBar } },
  computed: {
    barStyle() {
      return { '--tabbar-height': this.config.height, backgroundColor: this.config.backgroundColor,
        borderTopColor: this.config.borderStyle === 'black' ? '#000' : '#fff' }
    }
  },
  methods: {
    label(item) { return item.key ? this.$t(item.key) : item.text },
    open(item) {
      uni.switchTab({ url: '/' + item.pagePath, fail: () => uni.showToast({ title: '无法打开页面，请重试', icon: 'none' }) })
    }
  }
}
</script>

<style scoped>
.app-tabbar { flex-shrink: 0; display: flex; height: calc(var(--tabbar-height) + env(safe-area-inset-bottom)); padding-bottom: env(safe-area-inset-bottom); box-sizing: border-box; border-top: 1px solid; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
.app-tabbar-item { flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center; flex-direction: column; }
.app-tabbar-item text { line-height: 1.4; }
.app-tabbar-pressed { opacity: .6; }
</style>
