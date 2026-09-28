<template>
	<view class="service-config-page">
		<service-config-settings @saved="onSaved" />
	</view>
</template>

<script>
import ServiceConfigSettings from '@/features/devices/components/service-config-settings.vue'

export default {
	components: { ServiceConfigSettings },
	methods: {
		onSaved() { uni.showToast({ title: '服务配置已保存', icon: 'success' }) }
	}
}
</script>

<style scoped>
.service-config-page { min-height:100vh; max-width:430px; margin:0 auto; box-sizing:border-box; background:#f2f2f7; font-family: inherit; }
</style>
