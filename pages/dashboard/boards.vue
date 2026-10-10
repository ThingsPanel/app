<template>
  <!-- #ifdef MP-WEIXIN -->
  <view class="mp-boards-page"><app-tab-header :title="$t('pages.boardsTitle')" /><MpBoardList ref="list" /></view>
  <!-- #endif -->
  <!-- #ifndef MP-WEIXIN -->
  <view class="boards-page"><BoardTabDeck v-if="visible" ref="deck" active-path="pages/dashboard/boards" :initial-id="selectedId" @change="selectedId = $event.id" /></view>
  <!-- #endif -->
</template>
<script>
// #ifdef MP-WEIXIN
import MpBoardList from '@/components/mp-board-list/index.vue'
// #endif
// #ifndef MP-WEIXIN
import BoardTabDeck from '@/components/board-tab-deck/index.vue'
// #endif
export default {
  components: {
    // #ifdef MP-WEIXIN
    MpBoardList,
    // #endif
    // #ifndef MP-WEIXIN
    BoardTabDeck,
    // #endif
  },
  data() { return { visible: false, selectedId: '' } },
  onShow() {
    this.visible = true
    // #ifdef MP-WEIXIN
    uni.showTabBar({ animation: false })
    // #endif
  },
  onReachBottom() { this.$refs.list?.load(false) },
  onHide() { this.visible = false },
  onUnload() { this.visible = false },
  onBackPress() { return this.$refs.deck?.handleBack() || false }
}
</script>
<style scoped>
.mp-boards-page { min-height:100%; background:#f2f2f7; }
.boards-page { overflow:hidden; }
</style>
