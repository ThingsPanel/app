<template>
  <view class="detail-deck"><BoardDeck v-if="visible" ref="viewer" :initial-id="boardId" show-back @back="goBack" @change="boardId = $event.id" /></view>
</template>
<script>
import BoardDeck from '@/components/board-deck/index.vue'
export default {
  components: { BoardDeck },
  data() { return { boardId: '', name: '看板', visible: false } },
  onLoad(options) { this.boardId = options.id || ''; this.name = options.name || '看板' },
  onShow() { this.visible = true },
  onHide() { this.visible = false },
  onBackPress(event) { return event.from !== 'navigateBack' && Boolean(this.$refs.viewer?.handleBack()) },
  methods: { goBack() { uni.navigateBack({ fail: () => uni.switchTab({ url: '/pages/dashboard/boards' }) }) } }
}
</script>

<style scoped>
.detail-deck { height:100vh; }
</style>
