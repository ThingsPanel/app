<template>
	<view>
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col tp-pd-l-r-30">
			<view>
				<view class="tp-panel tp-uinfo tp-flex tp-flex-col tp-flex-j-c tp-flex-a-c tp-mg-t-50">
					<image :src="uhead" class="tp-mg-t-20" v-if="!$login.isLoginType().isLogin" @click="isLogin=true">
					</image>
					<image :src="uhead" class="tp-mg-t-20" v-else></image>
					<view class="tp-flex tp-flex-row tp-felx-j-l tp-flex-a-c tp-mg-t-b-15"><text class="tp-mg-r-10"
							v-if="!$login.isLoginType().isLogin">{{ $t('ucenter.notLoggedIn') }}</text>
						<!-- <view class="iconfont iconbianji2" v-if="$login.isLoginType().isLogin"></view> -->
					</view>
					<view class="tp-box-sizing tp-mg-t-b-10" v-if="!$login.isLoginType().isLogin">{{ $t('ucenter.clickToLogin') }}</view>
					<!-- <view class="tp-box-sizing tp-mg-t-b-10" v-else>账户有效期：{{validdate}}</view> -->
				</view>

				<view class="tp-panel tp-flex tp-flex-col tp-mg-t-50">
					<view
						class="tp-panel-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20 tp-pd-l-r-10"
						hover-class="tp-panel-item-hover"
						@click="showLanguagePopup">
						<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-mg-l-15">
							<view>{{ $t('ucenter.language') }}</view>
							<view style="display: flex;">
								<view>{{ currentLanguage }}</view>
								<view class="iconfont iconjiantou1"></view>
							</view>
						</view>
					</view>
					<view
						class="tp-panel-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20 tp-pd-l-r-10"
						hover-class="tp-panel-item-hover">
						<!-- <view class="iconfont iconequipment"></view> -->
						<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-mg-l-15">
							<view>{{ $t('ucenter.name') }}</view>
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
							<view>{{ $t('ucenter.phone') }}</view>
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
							<view>{{ $t('ucenter.email') }}</view>
							<view style="display: flex;">
								<view class="" v-if="userWxInfo.email">{{userWxInfo.email}}</view>
								<view class="iconfont iconjiantou1"></view>
							</view>
						</view>
					</view>
					<!-- <view
						class="tp-panel-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20 tp-pd-l-r-10"
						hover-class="tp-panel-item-hover">
						<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-mg-l-15" @click="showAddressPopup">
							<view>服务器地址</view>
							<view style="display: flex;">
								<view class="" v-if="address">{{address}}</view>
								<view class="iconfont iconjiantou1"></view>
							</view>
						</view>
					</view> -->
				</view>
				<view class="quitLogin" @click="toQuitLogin" v-if="$login.isLoginType().isLogin">
					{{ $t('ucenter.logout') }}
				</view>
				<view class="deleteAccount" @click="toDelete" v-if="$login.isLoginType().isLogin">
					{{ $t('ucenter.deleteAccount') }}
				</view>
			</view>
		</view>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
		<!-- 服务器地址 -->
		<uni-popup ref="serverPopup" :mask="true" :maskClick="true">
			<view class="server">
				<view class="server-title">
					{{ $t('ucenter.serverAddress') }}
					<image src="../../static/icon/close.png" class="close-icon" alt="" @click="closeAddressPopup" />
					</view>
				<view class="server-input">
					<input type="text" placeholder-class="tp-plc" :placeholder="$t('ucenter.enterServerAddress')" v-model="address" />
				</view>
				<button class="tp-btn tp-mg-t-50" @tap="serverConfirm">{{ $t('ucenter.confirm') }}</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	//
	import {
		mapState
	} from "vuex";
	import { AVAILABLE_LANGUAGES, changeLanguage } from '@/lang/index.js'
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
				userInfo:{},
				address: '',
				currentLanguage: AVAILABLE_LANGUAGES.find(
					lang => lang.code === (uni.getStorageSync('language') || 'zh-CN')
				)?.label || '中文',
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
	onLoad() {
	},
	onShow() {
		this.getUserInfo()
		uni.setNavigationBarTitle({
			title: this.$t('pages.userCenter')
		})
	},
		methods: {
			//退出登录
			toQuitLogin() {
				uni.showLoading({
					title: this.$t('ucenter.loading')
				});
				this.API.apiRequest('/api/v1/user/logout', {}, 'get').then(res => {
					if (res.code == 200) {
							uni.removeStorageSync('access_token')
							uni.removeStorageSync('wx_code')
							uni.removeStorageSync('ywId')
							uni.removeStorageSync('email')
							uni.removeStorageSync('password')
							uni.reLaunch({
								url: '../login/login'
							})
					}
					uni.hideLoading()
				})
			},
			//获取用户信息
			getUserInfo() {
				uni.showLoading({
					title: this.$t('ucenter.loading')
				});
				this.API.apiRequest('/api/v1/board/user/info', {}, 'get').then(res => {
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
								title: this.$t('ucenter.loading')
							});
							that.API.apiRequest(url, data, 'post').then(res => {
								if (res.code == 200) {
									uni.showToast({
										title: this.$t('pages.loging.loginSuccess'),
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
					desc: this.$t('ucenter.authDescription'),
					success(infoRes) {
						const userInfo = infoRes.userInfo;
						uni.setStorageSync('isAuth', '1')
						that.$refs.authPopup.close()
					},
					fail: err => {
						console.log('未授权err==', err);
					}
				});
			},
			serverConfirm() {
				if(!this.address){
					uni.showToast({
						title: this.$t('ucenter.enterServerAddress'),
						icon: 'none'
					});
				}
				uni.setStorageSync('serverAddress', this.address);
				this.$refs.serverPopup.close()
				// uni.redirectTo({url: '../login/login' });
			},
			showAddressPopup() {
				this.$refs.serverPopup.open();
			},
			closeAddressPopup() {
				this.$refs.serverPopup.close()
			},
			toDelete() {
				uni.showModal({
					title: this.$t('ucenter.warning'),
					content: this.$t('ucenter.deleteConfirmation'),
					cancelText: this.$t('common.cancel'),
					confirmText: this.$t('common.confirm'),
					success: (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: this.$t('ucenter.loading')
							});
							// Call delete API
							this.API.apiRequest(`/api/v1/user/${this.userWxInfo.id}`, {}, 'delete')
								.then(res => {
									if (res.code == 200) {
										uni.showModal({
											title: this.$t('common.confirm'),
											content: this.$t('ucenter.deleteSuccess'),
											showCancel: false,
											success: () => {
												// Clear storage and redirect to login
												uni.removeStorageSync('access_token');
												uni.removeStorageSync('wx_code');
												uni.removeStorageSync('ywId');
												uni.removeStorageSync('email');
												uni.removeStorageSync('password');
												uni.reLaunch({
													url: '../login/login'
												});
											}
										});
									} else {
										console.log(res);
										uni.showModal({
											title: this.$t('ucenter.tip'),
											content: res.message || this.$t('ucenter.deleteFailed'),
											showCancel: false,
											success: () => {
												// Stay on current page
											}
										});
									}
								})
								.finally(() => {
									uni.hideLoading();
								});
						}
					}
				});
			},
			showLanguagePopup() {
				uni.showActionSheet({
					itemList: AVAILABLE_LANGUAGES.map(lang => lang.label),
					success: (res) => {
						const selectedLang = AVAILABLE_LANGUAGES[res.tapIndex];
						changeLanguage(selectedLang.code);
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/ucenter/ucenter'
							});
						}, 100);
					}
				});
			}
		}
	}
</script>

<style>
	@import '@/common/ucenter.css';
</style>
