<template>
	<view class="tp-login-box tp-flex tp-flex-col tp-box-sizing">

		<view class="tp-pd-t-b-30"></view>

		<view class="tp-flex tp-login-welcome tp-flex-col tp-mg-t-b-50">
			<view class="fishTitle">{{$t('pages.login.title')}}</view>
		</view>

		<view
			class="tp-ipt tp-box-sizing tp-mg-t-b-20 tp-pd-t-b-15 tp-pd-l-r-30 tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
			<view class="inputicon">
				<image src="/static/image/username.png" alt="" />
			</view>
			<input type="text" placeholder-class="tp-plc" :placeholder="$t('pages.login.emailPlaceholder')" v-model="email" />
		</view>
		<view
			class="tp-ipt tp-box-sizing tp-mg-t-b-20 tp-pd-t-b-15 tp-pd-l-r-30 tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
			<view class="inputicon">
				<image src="/static/image/password.png" alt="" />
			</view>
			<input type="text" placeholder-class="tp-plc" :placeholder="$t('pages.login.passwordPlaceholder')" password=true v-model="password" />
			<!-- <view class="inputcode">
				获取验证码
			</view> -->
		</view>
		<view
			class="tp-ipt tp-box-sizing tp-mg-t-b-20 tp-pd-t-b-15 tp-pd-l-r-30 tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
			<view class="inputicon">
				<image src="/static/image/server.png" alt="" />
			</view>
			<input type="text" placeholder-class="tp-plc" placeholder="http://demo.thingspanel.cn" v-model="server" @input="serverChange"/>
		</view>
		<view class="btn">
			<!-- <button class="tp-btn-cancle tp-mg-t-50 cancel_btn">取消登录</button> -->
			<button class="tp-btn tp-mg-t-50" :loading="loading" @tap="doLoginSubmit">{{$t('pages.login.loginButton')}}</button>
			<button class="tp-btn tp-mg-t-50" @tap="goToRegister">{{$t('pages.login.registerButton')}}</button>
		</view>
		<view class="tp-getpwd tp-mg-t-40 tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @tap="doLoginCancel">{{$t('pages.login.cancelLogin')}}</view>
		<!-- 授权登录 -->
		<uni-popup ref="authPopup" type="bottom">
			<authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
		</uni-popup>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" direction="row" location="top"></cys-toast>

	</view>
</template>

<script>
	// 
	import {
		mapState,
		mapMutations
	} from "vuex";
import login from "../../store/login";
	// 
	export default {
		data() {
			return {
				disabled: true,
				loading: false,
				email: '',
				password: '',
				server: '',
				toast: {
					msg: ''
				},
			}
		},
		// 
		watch: {
			email() {
				this.onBtnChange();
			},
			password() {
				this.onBtnChange();
			}
		},
		onShow(){
			uni.setNavigationBarTitle({
				title: this.$t('pages.loginTitle')
			})
			this.server  = uni.getStorageSync('serverAddress') || ''
			if(uni.getStorageSync('email') && uni.getStorageSync('password')) {
				this.email = uni.getStorageSync('email')
				this.password = uni.getStorageSync('password')
				this.toLogin()
			}
		},
		methods: {
			serverChange(v) {
				console.log("serverChange", v.detail.value)
				// uni.setStorageSync('serverAddress', v.detail.value)
			},
			// 取消授权
			toCloseLogin() {
				this.$refs.authPopup.close()
			},
			//取消登录
			doLoginCancel() {
				uni.navigateBack(-1)
			},
			// 改变按钮状态
			onBtnChange() {
				if (this.email && this.password) {
					this.disabled = false;
					return;
				}
				this.disabled = true;
			},
			//登录
			doLoginSubmit: function() {
				// #ifdef MP-WEIXIN
				if(uni.getStorageSync('isAuth') == '1'){
					this.toLogin()
				} else {
					this.$refs.authPopup.open()
				}
				// #endif
				// #ifdef APP-PLUS
				this.toLogin()
				// #endif
				// #ifdef H5
				this.toLogin()
				// #endif
			},
			// 
			toLogin(){
				if(this.server) {
					uni.setStorageSync('serverAddress', this.server)
				} else {
					uni.setStorageSync('serverAddress', 'http://demo.thingspanel.cn')
				}
				uni.showLoading({
					title: this.$t('pages.login.loading')
				});
				let data = {
					email:this.email,
					password:this.password
				};
				this.API.apiRequest('/api/v1/login', {
					email:this.email,
					password:this.password
				}, 'post').then(res => {
					if (res.code == 200) {
						uni.setStorageSync('email', this.email)
						uni.setStorageSync('password', this.password)
						uni.setStorageSync('access_token',res.data.token)
						uni.switchTab({
							url: '../fishery-monitor/fishery-monitor'
						});
						uni.showToast({
							title: this.$t('pages.login.loginSuccess'),
							icon: 'none'
						});
					} else {
						this.handleError(res.message);
					}
				}).catch(err => {
					this.handleError(this.$t('pages.login.networkError')); // 处理网络错误
				}).finally(() => {
					uni.hideLoading()
				})
			},
			handleError(message) {
				this.toast.msg = message;
				//this.$refs.toast.show();
				uni.showToast({
					title: message,
					icon: 'none'
				});
			},
			//获取授权
			getAuth() {
				var that = this;
				//判断是否授权
				uni.getUserProfile({
					desc: this.$t('pages.login.authDescription'),
					success(infoRes) {
						const userInfo = infoRes.userInfo;
						uni.setStorageSync('isAuth', '1')
						that.$refs.authPopup.close()
						that.toLogin()
					},
					fail: err => {
						console.log('未授权err==', err);
					}
				});
			},
			goToRegister() {
				if(this.server) {
					uni.setStorageSync('serverAddress', this.server)
				} else {
					uni.setStorageSync('serverAddress', 'http://demo.thingspanel.cn')
				}
				uni.navigateTo({
					url: './register'
				});
			},
		}
	}
</script>

<style>
	@import url("@/common/login.css");
</style>
