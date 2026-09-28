<template>
  <view class="board-tab-shell" :class="{ 'board-tab-shell--custom': customTabs }" :style="backdrop">
    <view class="board-tab-content">
      <BoardDeck ref="deck" :initial-id="initialId" :home-mode="homeMode" :managed-tabbar="customTabs"
        @fullscreen-change="fullscreen = $event" @appearance="appearance = $event" @change="$emit('change', $event)"
        @system-home="$emit('system-home')" @unavailable="$emit('unavailable', $event)" />
    </view>
    <AppTabbar v-if="customTabs && !fullscreen" immersive :dark="appearance.dark || Boolean(appearance.image)" :active-path="activePath" />
  </view>
</template>
<script>
import BoardDeck from '@/components/board-deck/index.vue'
import AppTabbar from '@/components/app-tabbar.vue'
import { acquireBoardTabbar } from '@/services/board-tabbar'
export default {
  components: { BoardDeck, AppTabbar },
  props: { initialId: { type: String, default: '' }, homeMode: { type: Boolean, default: false }, activePath: { type: String, required: true } },
  emits: ['change', 'system-home', 'unavailable'],
  data() { return { customTabs: false, fullscreen: false, appearance: { color: '#f2f2f7', dark: false, image: '' } } },
  computed: {
    backdrop() {
      const image = this.appearance.image
      // Same canvas image, cropped at the bottom behind navigation; never modify the canvas schema.
      return { backgroundColor: this.appearance.color, backgroundImage: image ? `url(${JSON.stringify(image)})` : 'none' }
    }
  },
  mounted() { this.releaseTabs = acquireBoardTabbar(visible => { this.customTabs = visible }) },
  beforeUnmount() { this.releaseTabs?.() },
  methods: { handleBack() { return this.$refs.deck?.handleBack() || false } }
}
</script>
<style scoped>
.board-tab-shell { height:calc(100vh - var(--window-bottom, 0px)); display:flex; flex-direction:column; overflow:hidden; background-size:cover; background-position:center bottom; background-repeat:no-repeat; }
.board-tab-shell--custom { height:100vh; }
.board-tab-content { position:relative; flex:1; min-height:0; }
</style>
