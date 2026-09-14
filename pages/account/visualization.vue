<template>
	<view class="visualization-settings-page">
		<thingsvis-settings @saved="onSaved" />
	</view>
</template>

<script>
import ThingsvisSettings from '@/features/devices/components/thingsvis-settings.vue'

export default {
	components: { ThingsvisSettings },
	methods: {
		onSaved() { uni.showToast({ title: '连接设置已保存', icon: 'success' }) }
	}
}
</script>

<style scoped>
.visualization-settings-page { min-height: 100vh; max-width: 430px; margin: 0 auto; padding: 16px 0; box-sizing: border-box; background: #f7f8fb; font-family: 'PingFang SC', 'Microsoft YaHei', 'Noto Sans CJK SC', -apple-system, BlinkMacSystemFont, sans-serif; }
</style>
