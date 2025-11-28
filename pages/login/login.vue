<template>
	<view class="tp-login-box plain-layout">
		<view class="plain-header tp-flex tp-flex-row tp-flex-a-c">
			<image class="brand-logo" src="/static/icon/logo.png" mode="heightFix" />
			<view class="lang-switch tp-flex tp-flex-row tp-flex-a-c" @tap="showLanguagePopup">
				<text class="lang-label">{{ currentLanguage }}</text>
			</view>
		</view>
		<view class="plain-container">
			<view class="card-title plain-title">{{ $t('pages.login.title') }}</view>

			<view class="form-area">
				<view class="tp-ipt">
					<view class="inputicon">
						<uni-icons type="person-filled" size="28" color="#4f46e5" />
					</view>
					<input type="text" placeholder-class="tp-plc" :placeholder="$t('pages.login.emailPlaceholder')"
						v-model="email" />
				</view>
				<view class="tp-ipt">
					<view class="inputicon">
						<uni-icons type="locked-filled" size="28" color="#4f46e5" />
					</view>
					<input type="text" placeholder-class="tp-plc" :placeholder="$t('pages.login.passwordPlaceholder')"
						password=true v-model="password" />
				</view>
				<view class="tp-ipt">
					<view class="inputicon">
						<uni-icons type="cloud-upload-filled" size="28" color="#4f46e5" />
					</view>
					<input type="text" placeholder-class="tp-plc" placeholder="http://demo.thingspanel.cn"
						v-model="server" @input="serverChange" />
				</view>
			</view>

			<view class="btn-group">
				<button class="tp-btn primary" :loading="loading"
					@tap="doLoginSubmit">{{ $t('pages.login.loginButton') }}</button>
			</view>

			<view class="foot-tip center" style="margin-top: 0;">
				<!-- <text>{{ $t('pages.login.noAccount') || 'No account?' }}</text> -->
				<text class="link-text" @tap="goToRegister">{{ $t('pages.login.registerButton') }}</text>
			</view>
		</view>
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
import uniIcons from "@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import login from "../../store/login";
// 
export default {
	components: {
		uniIcons
	},
	data() {
		return {
			disabled: true,
			loading: false,
			email: '',
			password: '',
			server: '',
			currentLanguage: '',
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
	onShow() {
		uni.setNavigationBarTitle({
			title: this.$t('pages.loginTitle')
		})
		const savedLang = uni.getStorageSync('LANG');
		if (savedLang) {
			this.applyLanguage(savedLang);
		} else {
			this.syncLanguageLabel();
		}
		this.server = uni.getStorageSync('serverAddress') || ''
		if (uni.getStorageSync('email') && uni.getStorageSync('password')) {
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
		showLanguagePopup() {
			const nextLocale = this.$i18n && this.$i18n.locale === 'zh-CN' ? 'en-US' : 'zh-CN';
			this.applyLanguage(nextLocale);
		},
		applyLanguage(locale) {
			if (this.$i18n) {
				this.$i18n.locale = locale;
			}
			if (uni.setLocale) {
				uni.setLocale(locale);
			}
			uni.setStorageSync('LANG', locale);
			this.syncLanguageLabel();
			uni.setNavigationBarTitle({
				title: this.$t('pages.loginTitle')
			})
		},
		syncLanguageLabel() {
			const locale = this.$i18n ? this.$i18n.locale : 'zh-CN';
			this.currentLanguage = locale === 'zh-CN' ? '中文' : 'English';
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
		// 验证邮箱格式
		validateEmail() {
			if (!this.email || !this.email.trim()) {
				this.handleError(this.$t('pages.login.errors.emailRequired'));
				return false;
			}
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(this.email.trim())) {
				this.handleError(this.$t('pages.login.errors.invalidEmail'));
				return false;
			}
			return true;
		},
		// 验证密码
		validatePassword() {
			if (!this.password || !this.password.trim()) {
				this.handleError(this.$t('pages.login.errors.passwordRequired'));
				return false;
			}
			return true;
		},
		// 翻译服务器错误消息
		translateErrorMessage(message) {
			if (!message) {
				return this.$t('pages.login.errors.loginFailed');
			}
			// 常见错误消息映射
			const errorMap = {
				'邮箱或密码错误': 'pages.login.errors.emailOrPasswordError',
				'用户不存在': 'pages.login.errors.userNotFound',
				'账号已被禁用': 'pages.login.errors.accountDisabled',
				'未授权': 'pages.login.errors.unauthorized',
				'Email or password is incorrect': 'pages.login.errors.emailOrPasswordError',
				'User not found': 'pages.login.errors.userNotFound',
				'Account has been disabled': 'pages.login.errors.accountDisabled',
				'Unauthorized': 'pages.login.errors.unauthorized',
			};
			// 检查密码长度验证错误（支持多种格式）
			if (message.includes('Password') && (message.includes('failed validation') || message.includes('At least') || message.includes('至少'))) {
				return this.$t('pages.login.errors.passwordTooShort');
			}
			// 检查是否有对应的翻译键
			if (errorMap[message]) {
				return this.$t(errorMap[message]);
			}
			// 如果没有匹配，返回原始消息（可能是已经翻译过的）
			return message;
		},
		//登录
		doLoginSubmit: function () {
			// 前端校验
			if (!this.validateEmail() || !this.validatePassword()) {
				return;
			}
			// #ifdef MP-WEIXIN
			if (uni.getStorageSync('isAuth') == '1') {
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
		toLogin() {
			if (this.server) {
				uni.setStorageSync('serverAddress', this.server)
			} else {
				uni.setStorageSync('serverAddress', 'http://demo.thingspanel.cn')
			}
			uni.showLoading({
				title: this.$t('pages.login.loading')
			});
			let data = {
				email: this.email,
				password: this.password
			};
			let cid = '';
			this.API.apiRequest('/api/v1/login', {
				email: this.email,
				password: this.password
			}, 'post').then(res => {
				if (res.code == 200) {
					// Get push ID
					uni.getPushClientId({
						success: (res) => {
							cid = res.cid;
							console.log("Client Id for push notification: " + cid);
						},
						fail(err) {
							console.log(err)
						}
					});
					this.API.apiRequest('/api/v1/push-id', {
						// according to design spec, user id and device tyep is also required param, 
						// user_id: this.email
						// device_type: ???
						push_id: cid
					}, 'post').then(res => {
						if (res.statusCode === 200) {
							uni.setStorageSync('push_id', cid);
							console.log("Register client push ID in server successfully");
						}
					}).catch(err => {
						uni.setStorageSync('push_id', cid);
						console.log("Failed to register client push ID in server");
					})
					uni.setStorageSync('email', this.email)
					uni.setStorageSync('password', this.password)
					uni.setStorageSync('access_token', res.data.token)
					uni.switchTab({
						url: '../fishery-monitor/fishery-monitor'
					});
					uni.showToast({
						title: this.$t('pages.login.loginSuccess'),
						icon: 'none'
					});
				} else {
					// 翻译服务器返回的错误消息
					const translatedMessage = this.translateErrorMessage(res.message);
					this.handleError(translatedMessage);
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
					console.log('Authorization failed:', err);
				}
			});
		},
		goToRegister() {
			if (this.server) {
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

.plain-layout {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	background-image: url('/static/image/bg.png');
	background-size: cover;
	background-position: top center;
	background-repeat: no-repeat;
	gap: 40rpx;
	min-height: 100vh;
}

.plain-header {
	margin-top: 30rpx;
	width: 100%;
	max-width: 640rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.brand-logo {
	height: 60rpx;
}

.lang-switch {
	padding: 6rpx 18rpx;
	border-radius: 8rpx;
	border: 1rpx solid rgba(100, 108, 255, 0.3);
	background: rgba(100, 108, 255, 0.08);
	color: #646cff;
	font-size: 24rpx;
}

.plain-container {
	flex: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: left;
	justify-content: center;
	gap: 24rpx;
}

.plain-title {
	text-align: left;
	margin-bottom: 12rpx;
}

.plain-container .form-area,
.plain-container .btn-group,
.plain-container .foot-tip {
	width: 100%;
	max-width: 640rpx;
	align-self: center;
}
</style>
