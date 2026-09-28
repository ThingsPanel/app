<template>
	<view v-if="restoringSession" style="position:fixed;inset:0;z-index:10"><BoardLoading background="#f7f8fc" /></view>
	<view v-show="!restoringSession" class="tp-login-box login-layout">
		<view class="login-header">
			<view class="lang-switch tp-flex tp-flex-row tp-flex-a-c" @tap="showLanguagePopup">
				<text class="lang-label">{{ currentLanguage }}</text>
				<view class="lang-arrow" aria-hidden="true"></view>
			</view>
		</view>

		<view class="brand-block">
			<image class="brand-logo" src="/static/icon/app-mark.png" mode="aspectFit" />
			<text class="brand-name">ThingsPanel</text>
		</view>

		<view class="login-container">
			<view class="login-title">{{ $t('pages.login.heading') }}</view>

			<view class="form-area">
				<view class="tp-ipt">
					<input type="text" placeholder-class="tp-plc" :placeholder="$t('pages.login.emailPlaceholder')"
						v-model="email" />
				</view>
				<view class="tp-ipt password-field">
					<input type="text" placeholder-class="tp-plc" :placeholder="$t('pages.login.passwordPlaceholder')"
						:password="!passwordVisible" v-model="password" />
					<view class="password-toggle" @tap="passwordVisible = !passwordVisible">
						<uni-icons :type="passwordVisible ? 'eye-slash' : 'eye'" size="22" color="#8e97ad" />
					</view>
				</view>
			</view>

			<view class="server-row">
				<view class="server-copy">
					<text class="server-label">{{ $t('pages.login.currentServer') }}</text>
					<input v-if="serverEditing" class="server-input" type="text" v-model="server"
						focus confirm-type="done" @input="serverChange" @confirm="finishServerEdit" @blur="finishServerEdit" />
					<text v-else class="server-value">{{ displayServer }}</text>
				</view>
				<text class="server-change" @tap="startServerEdit">{{ $t('pages.login.changeServer') }}</text>
			</view>

			<view class="btn-group">
				<button class="tp-btn primary" :loading="loading"
					@tap="doLoginSubmit">{{ $t('pages.login.loginButton') }}</button>
			</view>

			<view class="foot-tip center">
				<text>{{ $t('pages.login.noAccount') }}</text>
				<text class="link-text" @tap="goToRegister">{{ $t('pages.login.registerButton') }}</text>
			</view>
		</view>
		<!-- 授权登录 -->
		<uni-popup ref="authPopup" type="bottom">
			<authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
		</uni-popup>
		<!-- 消息提示框 -->
		<app-toast ref="toast" :msg="toast.msg" direction="row" location="top"></app-toast>
	</view>
  <app-action-sheet ref="appActionSheet" />
</template>

<script>
// 
import {
	mapState,
	mapMutations
} from "vuex";
import uniIcons from "@/uni_modules/uni-icons/components/uni-icons/uni-icons.vue";
import login from "../../store/login";
import { AVAILABLE_LANGUAGES, changeLanguage } from '@/lang/index.js'
import BoardLoading from '@/components/board-loading/index.vue'
import { restoreSession } from '@/features/auth/restore-session'
// 
export default {
	components: {
		BoardLoading,
		uniIcons
	},
	data() {
		return {
			restoringSession: Boolean(uni.getStorageSync('access_token')),
			disabled: true,
			loading: false,
			email: '',
			password: '',
			server: '',
			serverEditing: false,
			passwordVisible: false,
			currentLanguage: AVAILABLE_LANGUAGES.find(
				lang => lang.code === (uni.getStorageSync('language') || 'zh-CN')
			)?.label || '中文',
			toast: {
				msg: ''
			},
		}
	},
	computed: {
		displayServer() {
			return String(this.server || 'https://demo.thingspanel.cn')
				.replace(/^https?:\/\//i, '')
				.replace(/\/+$/, '');
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
	async onReady() {
		if (!this.restoringSession) return;
		try {
			const result = await restoreSession();
			if (this.loginPageHidden) return;
			if (result === 'valid' || result === 'unavailable') {
				await new Promise((resolve, reject) => uni.switchTab({ url: '/pages/dashboard/index', success: resolve, fail: reject }));
			}
		} catch {
			uni.showToast({ title: '进入首页失败，请重试登录', icon: 'none' });
		} finally { this.restoringSession = false; }
	},
	onHide() { this.loginPageHidden = true; },
	onUnload() { this.loginPageHidden = true; },
	onShow() {
		this.loginPageHidden = false;
		try {
			uni.setNavigationBarTitle({
				title: this.$t('pages.loginTitle')
			});
		} catch (e) {
			console.warn('设置导航栏标题失败:', e);
		}

		// 同步语言标签
		this.syncLanguageLabel();

		this.server = uni.getStorageSync('serverAddress') || '';
		// 回填上次成功登录的账号密码，但不自动提交，避免会话过期后闪回首页。
		this.email = uni.getStorageSync('email') || '';
		this.password = uni.getStorageSync('password') || '';
		this.passwordVisible = false;
	},
	methods: {
		startServerEdit() {
			this.server = this.server || 'https://demo.thingspanel.cn';
			this.serverEditing = true;
		},
		finishServerEdit() {
			this.server = String(this.server || '').trim();
			this.serverEditing = false;
		},
		serverChange(v) {
			console.log("serverChange", v.detail.value)
			// uni.setStorageSync('serverAddress', v.detail.value)
		},
		showLanguagePopup() {
			this.$refs.appActionSheet.open({
				itemList: AVAILABLE_LANGUAGES.map(lang => lang.label),
				success: (res) => {
					const selectedLang = AVAILABLE_LANGUAGES[res.tapIndex];
					changeLanguage(selectedLang.code);
					this.currentLanguage = selectedLang.label;
					// 更新导航栏标题
					try {
						uni.setNavigationBarTitle({
							title: this.$t('pages.loginTitle')
						});
					} catch (e) {
						console.warn('设置导航栏标题失败:', e);
					}
				}
			});
		},
		syncLanguageLabel() {
			const locale = this.$i18n ? this.$i18n.locale : 'zh-CN';
			this.currentLanguage = AVAILABLE_LANGUAGES.find(
				lang => lang.code === locale
			)?.label || '中文';
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
            if (this.loading) return;
            this.loading = true;
			if (this.server) {
				uni.setStorageSync('serverAddress', this.server)
			} else {
				uni.setStorageSync('serverAddress', 'https://demo.thingspanel.cn')
			}

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
					uni.setStorageSync('email', this.email)
					uni.setStorageSync('password', this.password)
					uni.setStorageSync('access_token', res.data.token)
					// Get push ID
					uni.getPushClientId({
						success: (res) => {
							cid = res.cid;
							this.API.apiRequest('/api/v1/message_push', {
								deviceType: "" + uni.getSystemInfoSync().platform,
								pushId: cid
							}, 'post').then(res => {
								if (res.statusCode === 200) {
									uni.setStorageSync('push_id', cid);
								}
							}).catch(err => {
								uni.setStorageSync('push_id', cid);
							})
						},
						fail(err) {
							console.log(err)
						},
					});
					uni.switchTab({
						url: '../dashboard/index'
					});

				} else {
					// 翻译服务器返回的错误消息
					const translatedMessage = this.translateErrorMessage(res.message);
					this.handleError(translatedMessage);
				}
			}).catch(err => {
				this.handleError(this.$t('pages.login.networkError')); // 处理网络错误
			}).finally(() => {
                this.loading = false;

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
				uni.setStorageSync('serverAddress', 'https://demo.thingspanel.cn')
			}
			uni.navigateTo({
				url: './register'
			});
		},
	}
}
</script>

<style>
.login-layout {
	--login-primary: #1677ff;
	--login-ink: #111a2c;
	--login-muted: #8b93aa;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: flex-start;
	width: 100%;
	min-height: 100vh;
	padding: 0 50rpx 100rpx;
	box-sizing: border-box;
	background: radial-gradient(circle at 18% 42%, rgba(73, 105, 255, 0.035), transparent 36%), radial-gradient(circle at 82% 68%, rgba(109, 131, 255, 0.03), transparent 32%), #f7f8fc;
	color: var(--login-ink);
}

.login-header {
	position: absolute;
	top: calc(var(--status-bar-height, 0px) + 44rpx);
	right: 50rpx;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.lang-switch {
	min-height: 44rpx;
	padding: 6rpx 0 6rpx 18rpx;
	color: #727b92;
	font-size: 28rpx;
	cursor: pointer;
	display: flex;
	align-items: center;
	gap: 16rpx;
}

.lang-switch:active {
	opacity: 0.62;
}

.lang-label {
	font-weight: 500;
	line-height: 1;
}

.lang-arrow {
	width: 14rpx;
	height: 14rpx;
	border-right: 4rpx solid #7c8499;
	border-bottom: 4rpx solid #7c8499;
	transform: rotate(45deg) translateY(-4rpx);
}

.brand-block {
	margin-top: calc(var(--status-bar-height, 0px) + 200rpx);
	display: flex;
	flex-direction: column;
	align-items: center;
}

.brand-logo {
	width: 96rpx;
	height: 96rpx;
	border-radius: 16rpx;
	box-shadow: 0 10rpx 26rpx rgba(22, 119, 255, 0.13);
}

.brand-name {
	margin-top: 18rpx;
	font-size: 36rpx;
	font-weight: 600;
	line-height: 1.2;
	letter-spacing: -1rpx;
	color: #101828;
}

.login-container {
	width: 100%;
	max-width: 650rpx;
	margin-top: 92rpx;
	display: flex;
	flex-direction: column;
}

.login-title {
	font-size: 42rpx;
	font-weight: 700;
	line-height: 1.2;
	letter-spacing: 1rpx;
	color: var(--login-ink);
}

.form-area {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	margin-top: 42rpx;
}

.tp-ipt { width: 100%; height: 96rpx; padding: 0 28rpx; border: 0; border-radius: 14rpx; background: rgba(255,255,255,.94); box-sizing: border-box; display: flex; align-items: center; box-shadow: 0 2rpx 7rpx rgba(26,39,75,.018); }
.tp-ipt input { flex: 1; min-width: 0; height: 96rpx; font-size: 28rpx; font-weight: 400; color: var(--login-ink); text-align: left; }
.tp-plc { font-size: 27rpx; font-weight: 400; color: #929ab0; }
.password-field { padding-right: 8px; min-height: 44px; }
.password-toggle { flex: 0 0 44px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; cursor: pointer; }
.password-toggle:active { background: rgba(22,119,255,.06); }
.server-row { width: 100%; min-height: 72rpx; margin-top: 42rpx; padding-right: 8px; box-sizing: border-box; display: flex; align-items: center; justify-content: space-between; gap: 24rpx; }
.server-copy { min-width: 0; flex: 1; display: flex; flex-direction: column; gap: 8rpx; }
.server-label { font-size: 23rpx; font-weight: 400; line-height: 1.2; color: #8a92a8; }
.server-value, .server-input { font-size: 27rpx; font-weight: 400; line-height: 1.25; color: #13203a; }
.server-input { width: 100%; height: 40rpx; padding: 0; border-bottom: 2rpx solid var(--login-primary); }
.server-change { flex-shrink: 0; min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center; border-radius: 8px; font-size: 26rpx; font-weight: 500; color: var(--login-primary); cursor: pointer; }
.server-change:active { background: rgba(22,119,255,.06); }
.btn-group { width: 100%; margin-top: 46rpx; }
.tp-btn { width: 100%; height: 92rpx; line-height: 92rpx; border: 0; border-radius: 14rpx; font-size: 29rpx; font-weight: 500; }
.tp-btn::after { border: 0; }
.tp-btn.primary { background: linear-gradient(90deg, #1877ff 0%, #2586ff 52%, #1675f7 100%); color: #fff; box-shadow: 0 16rpx 30rpx rgba(22,119,255,.16); }
.tp-btn.primary:active { opacity: .88; }
.foot-tip { margin-top: 54rpx; display: flex; align-items: center; justify-content: center; gap: 10rpx; font-size: 24rpx; color: #9299ad; }
.link-text { font-size: 24rpx; font-weight: 500; color: var(--login-primary); }

@media screen and (max-height: 680px) {
	.brand-block { margin-top: calc(var(--status-bar-height, 0px) + 170rpx); }
	.login-container { margin-top: 56rpx; }
	.form-area { margin-top: 30rpx; }
}
</style>
