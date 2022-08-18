<template>
	<view>
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col tp-pd-l-r-30">
<<<<<<< HEAD
			<view>
=======

			<view class="tp-mg-t-b-20"></view>
			<!-- 未登录 -->
			<view class="noLogin" v-if="isLogin">
				<view class="fishlogo"><img src="/static/icon/fisheryLogo.png"></view>
				<view class="authLogin">
					<!-- 获取微信绑定的手机号 -->
					<button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber"
						v-if="isGetPhone">获取手机号并登录</button>
					<button @click="toLogin" v-else>点击登录</button>
				</view>
			</view>
			<view v-else>
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
				<view class="tp-panel tp-uinfo tp-flex tp-flex-col tp-flex-j-c tp-flex-a-c tp-mg-t-50">
					<image :src="uhead" class="tp-mg-t-20" v-if="!$login.isLoginType().isLogin" @click="isLogin=true">
					</image>
					<image :src="uhead" class="tp-mg-t-20" v-else></image>
					<view class="tp-flex tp-flex-row tp-felx-j-l tp-flex-a-c tp-mg-t-b-15"><text class="tp-mg-r-10"
							v-if="!$login.isLoginType().isLogin">未登录/注册</text>
						<!-- <view class="iconfont iconbianji2" v-if="$login.isLoginType().isLogin"></view> -->
					</view>
					<view class="tp-box-sizing tp-mg-t-b-10" v-if="!$login.isLoginType().isLogin">点击头像可登录/注册</view>
					<!-- <view class="tp-box-sizing tp-mg-t-b-10" v-else>账户有效期：{{validdate}}</view> -->
				</view>

				<view class="tp-panel tp-flex tp-flex-col tp-mg-t-50">

					<view
						class="tp-panel-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20 tp-pd-l-r-10"
						hover-class="tp-panel-item-hover">
						<!-- <view class="iconfont iconequipment"></view> -->
						<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-mg-l-15">
							<view>名字</view>
							<view style="display: flex;">
								<view class="" v-if="userWxInfo.name">{{userWxInfo.name}}</view>
								<view class="iconfont iconjiantou1"></view>
							</view>
						</view>
					</view>
					<view
						class="tp-panel-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20 tp-pd-l-r-10"
						hover-class="tp-panel-item-hover">
						<!-- <view class="iconfont iconlishi"></view> -->
						<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-mg-l-15">
							<view>电话</view>
							<view style="display: flex;">
								<view class="" v-if="userWxInfo.mobile">{{userWxInfo.mobile}}</view>
								<view class="iconfont iconjiantou1"></view>
							</view>
						</view>
					</view>
					<view
						class="tp-panel-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20 tp-pd-l-r-10"
						hover-class="tp-panel-item-hover">
						<!-- <view class="iconfont iconlishi"></view> -->
						<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-mg-l-15">
							<view>邮箱</view>
							<view style="display: flex;">
								<view class="" v-if="userWxInfo.email">{{userWxInfo.email}}</view>
								<view class="iconfont iconjiantou1"></view>
							</view>
						</view>
					</view>
				</view>
				<view class="quitLogin" @click="toQuitLogin" v-if="$login.isLoginType().isLogin">
					退出登录
				</view>
			</view>
		</view>
<<<<<<< HEAD
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
=======
		<!-- 授权登录 -->
		<uni-popup ref="authPopup" type="bottom">
			<authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
		</uni-popup>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" :direction="row" location="top"></cys-toast>
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
	</view>
</template>

<script>
	//
	import {
		mapState
	} from "vuex";
	// 
	export default {
		// 
		data() {
			return {
				isLogin: false,
				isGetPhone: false,
				uhead: '/static/image/uhead.png',
				realname: '李萌',
				validdate: '2021-03-26',
				userWxInfo: {},
				toast: {
					msg: ''
				},
				userInfo:{}
			}
		},
		//
		computed: {
			...mapState({
				loginStatus: state => state.loginStatus,
				token: state => state.token,
				// userInfo: state => state.userInfo
			})
		},
		onShow() {
<<<<<<< HEAD
			this.getUserInfo()
=======
			if (this.$login.isLoginType().isLogin) {
				this.uhead = JSON.parse(uni.getStorageSync('userWxInfo')).avatarUrl
				this.getUserInfo()
			}
			if (this.$login.isLoginType().isAuth) {
				this.isGetPhone = true
			}
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
		},
		onLoad() {
			
		},
		methods: {
			//退出登录
			toQuitLogin() {
				uni.showLoading({
					title: '加载中'
				});
<<<<<<< HEAD
				this.API.apiRequest('/api/auth/logout', {}, 'post').then(res => {
					if (res.code == 200) {
						uni.removeStorageSync('access_token')
						uni.removeStorageSync('wx_code')
						uni.removeStorageSync('ywId')
						uni.reLaunch({
							url: '../login/login'
=======
				this.API.apiRequest('/auth/logout', {}, 'post').then(res => {
					if (res.code == 200) {
						uni.removeStorageSync('access_token')
						uni.removeStorageSync('wx_code')
						uni.reLaunch({
							url: '../fishery-monitor/fishery-monitor'
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
						})
					}
					uni.hideLoading()
				})
			},
			//获取用户信息
			getUserInfo() {
				uni.showLoading({
					title: '加载中'
				});
<<<<<<< HEAD
				this.API.apiRequest('/api/auth/me', {}, 'post').then(res => {
=======
				this.API.apiRequest('/auth/me', {}, 'post').then(res => {
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					if (res.code == 200) {
						this.userWxInfo = res.data
					}
					uni.hideLoading()
				})
			},
			//
			doOpenAccounts: function() {
				if (!this.$login.isLoginType().isLogin) {
					this.$refs.authPopup.open()
				} else {
					uni.navigateTo({
						url: '../accounts/accounts'
					})
				}
			},
			//
			doOpenDevice: function() {
				if (!this.$login.isLoginType().isLogin) {
					this.$refs.authPopup.open()
				} else {
					uni.navigateTo({
						url: '../device/device'
					})
				}

			},
			//
			doOpenHistoryOperate: function() {
				if (!this.$login.isLoginType().isLogin) {
					this.$refs.authPopup.open()
				} else {
					uni.navigateTo({
						url: '../history-operate/history-operate'
					})
				}
			},
			//
			initAccount: function() {
				// 
				if (this.userInfo) {
					this.realname = this.userInfo.name;
				}
				// 
			},

			//获取绑定的手机号
			getPhoneNumber(e) {
				this.wxData = e.detail
				this.isGetPhone = false
				this.toLogin()
			},
			//登录
			toLogin() {
				let that = this
				if (!that.$login.isLoginType().isAuth) {
					that.$refs.authPopup.open()
				} else {
					// 获取用户信息
					uni.login({
						success(res) {
							uni.setStorageSync('wx_code', res.code)
							let url = "/auth/login";
							let data = {
								login_type: 'wechatmini',
								business_id: '92a00bb5-f28e-4849-baa5-f1edd85649e6',
								wx_code: uni.getStorageSync('wx_code'),
								iv: that.wxData.iv,
								encryptedData: that.wxData.encryptedData,
								name: JSON.parse(uni.getStorageSync('userWxInfo')).nickName,
							};
							uni.showLoading({
								title: '加载中'
							});
							that.API.apiRequest(url, data, 'post').then(res => {
								if (res.code == 200) {
									uni.showToast({
										title: '登录成功',
										icon: 'none'
									});
									uni.setStorageSync('access_token', res.data.access_token)
									that.userInfo = that.$login.isLoginType()
									that.isLogin = false
									that.uhead = JSON.parse(uni.getStorageSync('userWxInfo')).avatarUrl
									that.$forceUpdate()
									that.getUserInfo()
								} else {
									that.toast.msg = res.msg;
									that.$refs.toast.show();
								}
								uni.hideLoading()
							});
						}
					});
				}
			},
			//关闭
			toCloseLogin() {
				this.$refs.authPopup.close()
			},
			//获取授权
			getAuth() {
				var that = this;
				//判断是否授权
				uni.getUserProfile({
					desc: '登录',
					success(infoRes) {
						const userInfo = infoRes.userInfo;
<<<<<<< HEAD
						uni.setStorageSync('isAuth', '1')
						that.$refs.authPopup.close()
=======
						uni.setStorageSync('userWxInfo', JSON.stringify(userInfo))
						uni.setStorageSync('isAuth', '1')
						that.isGetPhone = true
						that.$refs.authPopup.close()
						
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					},
					fail: err => {
						console.log('未授权err==', err);
					}
				});
			},
		}
	}
</script>

<style>
<<<<<<< HEAD
	@import '@/common/ucenter.css';
=======
	.quitLogin {
		width: 690rpx;
		height: 86rpx;
		line-height: 86rpx;
		background: #343436;
		border-radius: 10rpx;
		margin: 0 auto;
		margin-top: 56rpx;
		font-size: 32rpx;
		font-family: Source Han Sans CN;
		font-weight: 500;
		color: #FFFFFF;
		text-align: center;
	}

	.tp-box {
		width: 100%;
		min-height: 100vh;
		background: #FFFFFF;
	}

	.tp-panel {
		background: #FFFFFF;
	}

	.tp-uinfo {}

	.tp-uinfo>image {
		width: 124rpx;
		height: 124rpx;
		border: 100%;
	}

	.tp-uinfo>view:nth-child(2) {
		font-size: 32rpx;
		font-weight: bold;
		color: #1D1D1D;
	}

	.tp-uinfo>view:nth-child(2)>view {
		font-size: 36rpx;
	}

	.tp-uinfo>view:last-child {
		font-size: 28rpx;
		font-weight: 500;
		color: #7C7C7C;
	}

	.tp-panel-item {
		height: 94rpx;
	}

	.tp-panel-item-hover {
		background: #FAFAFA;
	}

	.tp-panel-item>view:first-child {
		font-size: 38rpx;
		color: #343436;
	}

	.tp-panel-item>view:last-child {
		height: 94rpx;
		border-bottom: 1rpx solid #EDEDED;
	}

	.tp-panel-item>view:last-child>view:first-child {
		font-size: 30rpx;
		font-weight: 500;
		color: #666666;
	}

	.tp-panel-item>view:last-child>view:last-child {
		color: #999999;
		font-size: 30rpx;
	}
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
</style>
