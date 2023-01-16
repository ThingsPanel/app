<template>
	<view>
		<!-- <view class="topNav" :style="{ height: topHeight, lineHeight: topHeight, background:background }"> -->
		<view class="topNav" :style="{ background:background }">
			<view class="navIcon" @click="clickLeftBtn" :style="{ marginTop: imgTop }">
				<uni-icons type="back" size="30" :color="iconColor"></uni-icons>
			</view>
			<view class="title" :style="{ paddingTop: paddingTop, color:fontColor}">{{ pageTitle }}</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				toast: {
					msg: ''
				},
				topHeight: 0,
				paddingTop: 0,
				imgTop: 0
			};
		},
		props: {
			iconColor:{
				type: String,
				default: '#fff'
			},
			pageTitle: {
				type: String,
				default: ''
			},
			background:{
				type: String,
				default: '#FFFFFF'
			},
			fontColor: {
				type: String,
				default: '#1B1B1B'
			}
		},
		onLoad() {
			let userDeatail = this.$login.isLoginType();
		},
		onReady() {
			const {
				statusBarHeight,
				platform
			} = uni.getSystemInfoSync();
			//页面的高度
			uni.setStorageSync('pageHeight', uni.getSystemInfoSync().windowHeight + 'px');
			// 状态栏高度
			uni.setStorageSync('statusBarHeight', statusBarHeight);
			// #ifdef MP-WEIXIN
			const {
				top,
				height
			} = uni.getMenuButtonBoundingClientRect();
			// 胶囊按钮高度 一般是32 如果获取不到就使用32
			uni.setStorageSync('menuButtonHeight', height ? height : 32);
			// 判断胶囊按钮信息是否成功获取
			if (top && top !== 0 && height && height !== 0) {
				const navigationBarHeight = (top - statusBarHeight) * 2 + height;
				// 导航栏高度
				uni.setStorageSync('navigationBarHeight', navigationBarHeight);
			} else {
				uni.setStorageSync('navigationBarHeight', platform === 'android' ? 48 : 40);
			}
			// 导航栏和状态栏高度
			var navigationBarAndStatusBarHeight = uni.getStorageSync('statusBarHeight') + uni.getStorageSync(
				'navigationBarHeight') + 'px';
			this.topHeight = navigationBarAndStatusBarHeight;
			this.paddingTop = uni.getStorageSync('statusBarHeight') / 2 + 'px';
			this.imgTop = uni.getStorageSync('statusBarHeight') + uni.getStorageSync('navigationBarHeight') -40 + 'rpx';
			uni.setStorageSync('contentPaddingTop', navigationBarAndStatusBarHeight);
			// #endif
		},
		mounted() {
			uni.getSystemInfo({
				success: res => {
					this.height = res.screenHeight;
				}
			});
		},
		methods: {
			clickLeftBtn(){
				uni.navigateBack()
			},
		}
	};
</script>

<style scoped lang="scss">
	@import '@/common/topNav.scss';
</style>
