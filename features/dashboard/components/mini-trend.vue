<template>
  <image v-if="source" class="mini-trend" :src="source" mode="scaleToFill" aria-label="近七天趋势" />
  <text v-else class="trend-empty">暂无趋势</text>
</template>

<script>
export default {
  props: { values: { type: Array, default: () => [] } },
  computed: {
    source() {
      if (this.values.length < 2) return ''
      const min = Math.min(...this.values)
      const max = Math.max(...this.values)
      const points = this.values.map((value, i) => `${i / (this.values.length - 1) * 96 + 2},${max === min ? 14 : 24 - (value - min) / (max - min) * 20}`).join(' ')
      return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 28"><polyline points="${points}" fill="none" stroke="#1677FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
    }
  }
}
</script>

<style scoped>
.mini-trend { width: 100%; height: 24px; display: block; }
.trend-empty { color: #8b96a6; font-size: 10px; line-height: 24px; }
</style>
