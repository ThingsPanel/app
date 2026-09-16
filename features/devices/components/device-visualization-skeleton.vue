<template>
	<view class="visualization-skeleton" role="status" aria-label="正在加载设备可视化" aria-busy="true">
		<view class="skeleton-values" aria-hidden="true">
			<view v-for="n in 2" :key="n" class="skeleton-block skeleton-value"><view class="skeleton-line" /><view class="skeleton-number" /></view>
		</view>
		<view v-for="n in 2" :key="n" class="skeleton-block skeleton-chart" aria-hidden="true"><view class="skeleton-line" /><view class="skeleton-plot" /></view>
	</view>
</template>

<style scoped>
.visualization-skeleton { padding: 8px; background: #fff; }
.skeleton-values { display: flex; gap: 8px; }
.skeleton-block { position: relative; overflow: hidden; box-sizing: border-box; padding: 16px; border: 1px solid #edf0f5; }
.skeleton-block::after { content: ''; position: absolute; inset: 0; background: linear-gradient(100deg, transparent 20%, rgba(255,255,255,.7) 50%, transparent 80%); animation: visualization-shimmer 1.6s ease-in-out infinite; }
.skeleton-value { flex: 1; min-width: 0; height: 110px; }
.skeleton-chart { height: 190px; margin-top: 8px; }
.skeleton-line { width: 38%; height: 10px; background: #edf0f5; border-radius: 2px; }
.skeleton-number { width: 65%; height: 26px; margin-top: 18px; background: #f1f3f7; border-radius: 2px; }
.skeleton-plot { height: 120px; margin-top: 18px; background: #f5f6f9; border-bottom: 1px solid #e8edf3; }
@keyframes visualization-shimmer { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .skeleton-block::after { animation: none; display: none; } }
</style>
