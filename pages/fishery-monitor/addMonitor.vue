<template>
	<view :style="{ height: pageHeight, background: '#f5f5f5' }">
		<customNav pageTitle="添加设备" iconColor='#fff' background='#246FDD' fontColor="#fff"></customNav>
		<view class="addpage" :style="{ marginTop: marginTopHeight, display: 'inline-block', width: '100%' }">
			<image src="../../static/image/search_icon.png" class="image"></image>
			<view class="addform">
				<view class="add_name">
					<label for="">设备名称：</label>
					<input type="text" placeholder="智能控制器" v-model="name">
				</view>
				<view class="add_btn" @click="onCommit">
					完成
				</view>
			</view>
		</view>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" direction="row" location="top"></cys-toast>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				toast: {
					msg: ''
				},
				code: '',
				pageHeight: 0,
				marginTopHeight: 0,
				groupId: '',
				name: ''
			}
		},
		onLoad(option) {
			this.code = option.code
			this.groupId = option.groupId
		},
		onShow() {
			this.marginTopHeight = uni.getStorageSync('contentPaddingTop');
			this.pageHeight = uni.getStorageSync('pageHeight');
		},
		methods: {
			onCommit() {
				if (this.name) {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/v1/device/active', {
						device_number: this.code,
						name: this.name
					}, 'put').then(res => {
						if (res.code === 200) {
							uni.switchTab({
								url: '../fishery-monitor/fishery-monitor'
							});
						} else {
							this.toast.msg = res.message
							this.$refs.toast.show();
						}
						uni.hideLoading()
					})
				} else {
					this.toast.msg = '请输入设备名称';
					this.$refs.toast.show();
				}
			}
		}
	}
</script>

<style>
	.addpage {
		background-color: #246FDD;
		text-align: center;
	}

	.image {
		width: 548rpx;
		height: 548rpx;
		margin: 0 auto;
		margin-top: 156rpx;
		margin-bottom: 215rpx;
	}

	.addform {
		height: 558rpx;
		background: #F7F7F7;
		border-radius: 10rpx;
		padding-top: 46rpx;
	}

	.add_name {
		width: 690rpx;
		height: 65rpx;
		background: #FFFFFF;
		border-radius: 10rpx;
		margin: 0 auto;
		display: flex;
		padding-top: 36rpx;
	}

	.add_name label {
		font-size: 30rpx;
		font-family: Source Han Sans CN;
		font-weight: 400;
		color: #434343;
		padding-left: 32rpx;
	}

	.add_name input {
		flex: 1;
		text-align: left;
		padding-left: 10rpx;
	}

	.add_btn {
		width: 690rpx;
		height: 80rpx;
		line-height: 80rpx;
		text-align: center;
		background: #246FDD;
		border-radius: 4rpx;
		margin: 0 auto;
		margin-top: 53rpx;
		font-size: 32rpx;
		font-family: Source Han Sans CN;
		font-weight: 500;
		color: #FFFFFF;
	}
</style>
