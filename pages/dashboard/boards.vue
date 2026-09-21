<template>
  <view class="boards-page"><BoardDeck v-if="visible" ref="deck" :initial-id="selectedId" @change="selectedId = $event.id" /></view>
</template>
<script>
import BoardDeck from '@/components/board-deck/index.vue'
export default {
  components: { BoardDeck },
  data() { return { visible: false, selectedId: '' } },
  onShow() { this.visible = true },
  onHide() { this.visible = false },
  onBackPress() { return this.$refs.deck?.handleBack() || false }
}
</script>
<style scoped>
.boards-page { height:calc(100vh - var(--window-bottom, 0px)); overflow:hidden; }
</style>
