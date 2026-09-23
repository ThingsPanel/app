<template>
  <view class="boards-page"><BoardTabDeck v-if="visible" ref="deck" active-path="pages/dashboard/boards" :initial-id="selectedId" @change="selectedId = $event.id" /></view>
</template>
<script>
import BoardTabDeck from '@/components/board-tab-deck/index.vue'
export default {
  components: { BoardTabDeck },
  data() { return { visible: false, selectedId: '' } },
  onShow() { this.visible = true },
  onHide() { this.visible = false },
  onUnload() { this.visible = false },
  onBackPress() { return this.$refs.deck?.handleBack() || false }
}
</script>
<style scoped>
.boards-page { overflow:hidden; }
</style>
