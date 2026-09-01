<template>
	<view :style="{ height: pageHeight, background: '#f5f5f5' }">
		<app-navbar :pageTitle="$t('pages.deviceCreate.pageTitle')" iconColor='#fff' background='#246FDD' fontColor="#fff"></app-navbar>
		<view class="addpage" :style="{ marginTop: marginTopHeight, display: 'inline-block', width: '100%' }">
			<image src="../../static/image/search.png" class="image"></image>
			<view class="addform">
				<view class="add_name">
					<label for="">{{ $t('pages.deviceCreate.deviceName') }}</label>
					<input type="text" :placeholder="$t('pages.deviceCreate.deviceNamePlaceholder')" v-model="name">
				</view>
				<view class="add_btn" @click="onCommit">
					{{ $t('pages.deviceCreate.completeButton') }}
				</view>
			</view>
		</view>
		<!-- 消息提示框 -->
		<app-toast ref="toast" :msg="toast.msg" direction="row" location="top"></app-toast>
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
      this.$nextTick(() => {
        setTimeout(() => {
          uni.setNavigationBarTitle({
            title: this.$t('pages.addDevice')
          })
        }, 100)
      })
			this.marginTopHeight = uni.getStorageSync('contentPaddingTop');
			this.pageHeight = uni.getStorageSync('pageHeight');
		},
		methods: {
			onCommit() {
				if (this.name) {
					uni.showLoading({
						title: this.$t('common.loading')
					});
					this.API.apiRequest('/api/v1/device/active', {
						device_number: this.code,
						name: this.name
					}, 'put').then(res => {
						if (res.code === 200) {
							uni.switchTab({
								url: './index'
							});
						} else {
							this.toast.msg = res.message
							this.$refs.toast.show();
						}
						uni.hideLoading()
					})
				} else {
					this.toast.msg = this.$t('pages.deviceCreate.deviceNameRequired');
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
