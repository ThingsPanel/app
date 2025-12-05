<template>
	<view class="tp-login-box plain-layout">
		<view class="plain-header tp-flex tp-flex-row tp-flex-a-c">
			<image class="brand-logo" src="/static/icon/logo.png" mode="heightFix" />
			<view class="lang-switch tp-flex tp-flex-row tp-flex-a-c" @tap="showLanguagePopup">
				<text class="lang-label">{{ currentLanguage }}</text>
				<text class="lang-arrow">›</text>
			</view>
		</view>
		<view class="plain-container">
			<view class="card-title plain-title">{{ $t('pages.register.title') }}</view>
			<view class="card-subtitle plain-subtitle">{{ $t('pages.register.subtitle') || $t('pages.register.messages.codeSent') }}</view>
			<view class="form-area" @submit.prevent="handleSubmit">
				<!-- 邮箱输入 -->
				<view class="form-item">
					<view class="tp-ipt">
						<input class="uni-input" type="text" v-model="formData.email"
							:placeholder="$t('pages.register.emailPlaceholder')" @blur="validateEmail" />
					</view>
					<text class="error-tip" v-if="errors.email">{{errors.email}}</text>
				</view>

				<!-- 验证码输入 -->
				<view class="form-item">
					<view class="tp-ipt has-code-btn" style="padding: 0 12px;padding-right: 0;">
						<input class="uni-input" type="text" v-model="formData.code"
							:placeholder="$t('pages.register.codePlaceholder')" @blur="validateCode" />
						<button class="code-btn" type="button" @click="handleSmsCode" :disabled="loading">
							{{ loading ? $t('pages.register.messages.codeSending') || '...' : $t('pages.register.getCode') }}
						</button>
					</view>
					<text class="error-tip" v-if="errors.code">{{errors.code}}</text>
				</view>

				<!-- 手机号输入 -->
				<view class="form-item">
					<view class="tp-ipt phone-input-wrapper">
						<picker mode="selector" :range="phonePrefixList" range-key="label" 
							:value="phonePrefixIndex" @change="onPhonePrefixChange">
							<view class="phone-prefix-selector">
								<text class="prefix-text">{{ selectedPhonePrefix }}</text>
								<text class="prefix-arrow">▼</text>
							</view>
						</picker>
						<input class="uni-input phone-input" type="number" v-model="formData.phone"
							:placeholder="$t('pages.register.phonePlaceholder')" @blur="validatePhone" />
					</view>
					<text class="error-tip" v-if="errors.phone">{{errors.phone}}</text>
				</view>

				<!-- 密码输入 -->
				<view class="form-item">
					<view class="tp-ipt">
						<input class="uni-input" type="password" v-model="formData.pwd"
							:placeholder="$t('pages.register.passwordPlaceholder')" @blur="validatePassword" />
					</view>
					<text class="error-tip" v-if="errors.pwd">{{errors.pwd}}</text>
				</view>

				<!-- 确认密码 -->
				<view class="form-item">
					<view class="tp-ipt">
						<input class="uni-input" type="password" v-model="formData.confirmPwd"
							:placeholder="$t('pages.register.confirmPasswordPlaceholder')"
							@blur="validateConfirmPassword" />
					</view>
					<text class="error-tip" v-if="errors.confirmPwd">{{errors.confirmPwd}}</text>
				</view>
				<view class="btn-group">
					<button class="tp-btn primary" type="primary" @tap="handleSubmit" :disabled="!isFormValid || loading"
						:loading="loading">
						{{ $t('pages.register.registerButton') }}
					</button>
				</view>
			</view>

			<view class="foot-tip center">
				<text>{{ $t('pages.register.hasAccount') || 'Already have an account?' }}</text>
				<text class="link-text" @tap="handleBack">{{ $t('pages.register.backToLogin') }}</text>
			</view>
		</view>
	</view>
</template>
  
<script>
import {
	fetchEmailCode,
	registerByEmail
} from '@/service/auth'
import { AVAILABLE_LANGUAGES, changeLanguage } from '@/lang/index.js'

export default {
	onShow() {
		this.$nextTick(() => {
			setTimeout(() => {
				try {
					uni.setNavigationBarTitle({
						title: this.$t('pages.register')
					});
				} catch (e) {
					console.warn('设置导航栏标题失败:', e);
				}
			}, 100)
		})
		
		// 同步语言标签
		this.syncLanguageLabel();
	},
	data() {
		return {
			formData: {
				email: '',
				code: '',
				phone: '',
				phone_prefix: '+86',
				pwd: '',
				confirmPwd: '',
				agreement: true
			},
			errors: {
				email: '',
				code: '',
				phone: '',
				pwd: '',
				confirmPwd: ''
			},
			loading: false,
			currentLanguage: AVAILABLE_LANGUAGES.find(
				lang => lang.code === (uni.getStorageSync('language') || 'zh-CN')
			)?.label || '中文',
			// 当前选中的区号索引
			phonePrefixIndex: 0,
			// 国际电话区号列表
			phonePrefixList: [
				{ code: '+86', label: '+86 中国', country: '中国' },
				{ code: '+1', label: '+1 美国/加拿大', country: '美国' },
				{ code: '+44', label: '+44 英国', country: '英国' },
				{ code: '+81', label: '+81 日本', country: '日本' },
				{ code: '+82', label: '+82 韩国', country: '韩国' },
				{ code: '+65', label: '+65 新加坡', country: '新加坡' },
				{ code: '+852', label: '+852 香港', country: '香港' },
				{ code: '+853', label: '+853 澳门', country: '澳门' },
				{ code: '+886', label: '+886 台湾', country: '台湾' },
				{ code: '+61', label: '+61 澳大利亚', country: '澳大利亚' },
				{ code: '+64', label: '+64 新西兰', country: '新西兰' },
				{ code: '+33', label: '+33 法国', country: '法国' },
				{ code: '+49', label: '+49 德国', country: '德国' },
				{ code: '+39', label: '+39 意大利', country: '意大利' },
				{ code: '+34', label: '+34 西班牙', country: '西班牙' },
				{ code: '+7', label: '+7 俄罗斯', country: '俄罗斯' },
				{ code: '+91', label: '+91 印度', country: '印度' },
				{ code: '+55', label: '+55 巴西', country: '巴西' },
				{ code: '+52', label: '+52 墨西哥', country: '墨西哥' },
				{ code: '+27', label: '+27 南非', country: '南非' }
			]
		}
	},

	computed: {
		isFormValid() {
			const hasAllFields = Object.values(this.formData).every(value => value !== '')
			return hasAllFields
		},
		// 当前选中的区号显示文本
		selectedPhonePrefix() {
			if (this.phonePrefixList && this.phonePrefixList.length > 0 && this.phonePrefixIndex >= 0) {
				return this.phonePrefixList[this.phonePrefixIndex].code
			}
			return '+86'
		}
	},

	methods: {
		showLanguagePopup() {
			uni.showActionSheet({
				itemList: AVAILABLE_LANGUAGES.map(lang => lang.label),
				success: (res) => {
					const selectedLang = AVAILABLE_LANGUAGES[res.tapIndex];
					changeLanguage(selectedLang.code);
					this.currentLanguage = selectedLang.label;
					// 更新导航栏标题
					this.$nextTick(() => {
						setTimeout(() => {
							try {
								uni.setNavigationBarTitle({
									title: this.$t('pages.register')
								});
							} catch (e) {
								console.warn('设置导航栏标题失败:', e);
							}
						}, 100)
					})
				}
			});
		},
		syncLanguageLabel() {
			const locale = this.$i18n ? this.$i18n.locale : 'zh-CN';
			this.currentLanguage = AVAILABLE_LANGUAGES.find(
				lang => lang.code === locale
			)?.label || '中文';
		},
		// 验证邮箱
		validateEmail() {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			if (!this.formData.email) {
				this.errors.email = this.$t('pages.register.errors.emailRequired')
				return false
			}
			if (!emailRegex.test(this.formData.email)) {
				this.errors.email = this.$t('pages.register.errors.invalidEmail')
				return false
			}
			this.errors.email = ''
			return true
		},

		// 验证手机号
		validatePhone() {
			if (!this.formData.phone) {
				this.errors.phone = this.$t('pages.register.errors.phoneRequired')
				return false
			}
			// 根据区号进行不同的验证
			if (this.formData.phone_prefix === '+86') {
				// 中国手机号验证
				if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
					this.errors.phone = this.$t('pages.register.errors.invalidPhone')
					return false
				}
			} else {
				// 其他国家手机号：至少6位数字，最多15位
				if (!/^\d{6,15}$/.test(this.formData.phone)) {
					this.errors.phone = this.$t('pages.register.errors.invalidPhone')
					return false
				}
			}
			this.errors.phone = ''
			return true
		},

		// 验证密码
		validatePassword() {
			if (!this.formData.pwd) {
				this.errors.pwd = this.$t('pages.register.errors.passwordRequired')
				return false
			}
			if (this.formData.pwd.length < 8 || this.formData.pwd.length > 18) {
				this.errors.pwd = this.$t('pages.register.errors.passwordLength')
				return false
			}
			if (!this.validPasswordByExp(this.formData.pwd)) {
				this.errors.pwd = this.$t('pages.register.errors.passwordComplexity')
				return false
			}

			this.errors.pwd = ''
			return true
		},

		// 验证确认密码
		validateConfirmPassword() {
			if (!this.formData.confirmPwd) {
				this.errors.confirmPwd = this.$t('pages.register.errors.confirmPasswordRequired')
				return false
			}
			if (this.formData.confirmPwd !== this.formData.pwd) {
				this.errors.confirmPwd = this.$t('pages.register.errors.passwordMismatch')
				return false
			}
			this.errors.confirmPwd = ''
			return true
		},

		// 验证码
		validateCode() {
			if (!this.formData.code) {
				this.errors.code = this.$t('pages.register.errors.codeRequired')
				return false
			}
			this.errors.code = ''
			return true
		},

		// 密码格式验证
		validPasswordByExp(str) {
			if (!/^[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]+$/.test(str)) { // eslint-disable-line
				return false;
			}
			return true;
		},

		// 验证整个表单
		validateForm() {
			return this.validateEmail() &&
				this.validatePhone() &&
				this.validatePassword() &&
				this.validateConfirmPassword() &&
				this.validateCode()
		},

		// 获取验证码
		async handleSmsCode() {
			if (!this.validateEmail()) return

			this.loading = true
			try {
				const resp = await fetchEmailCode(this.formData.email)
				if (resp.code > 200000) {
					uni.showToast({
						title: this.$t('pages.register.messages.codeFailed') + ': ' + resp.message,
						icon: 'none'
					})
				} else {
					uni.showToast({
						title: this.$t('pages.register.messages.codeSent'),
						icon: 'none'
					})
				}
			} catch (error) {
				uni.showToast({
					title: error.message || this.$t('pages.register.messages.codeFailed'),
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},

		// 提交表单
		async handleSubmit() {
			if (!this.validateForm() || this.loading) return
			this.loading = true
			try {
				const resp = await registerByEmail({
					email: this.formData.email,
					verify_code: this.formData.code,
					password: this.formData.pwd,
					confirm_password: this.formData.confirmPwd,
					phone_prefix: this.formData.phone_prefix,
					phone_number: this.formData.phone
				})
				if (resp.code > 200000) {
					uni.showToast({
						title: this.$t('pages.register.messages.registerFailed') + ': ' + resp.message,
						icon: 'none'
					})
				} else {
					uni.showToast({
						title: this.$t('pages.register.messages.registerSuccess'),
						icon: 'success'
					})
					setTimeout(() => {
						this.handleBack()
					}, 1500)
				}
			} catch (error) {
				uni.showToast({
					title: error.message || this.$t('pages.register.messages.registerFailed'),
					icon: 'none'
				})
			} finally {
				this.loading = false
			}
		},

		// 返回登录页
		handleBack() {
			uni.navigateTo({
				url: '/pages/login/login'
			})
		},
		
		// 区号选择器变化事件
		onPhonePrefixChange(e) {
			const index = e.detail.value
			this.phonePrefixIndex = index
			if (this.phonePrefixList && this.phonePrefixList[index]) {
				this.formData.phone_prefix = this.phonePrefixList[index].code
			}
		}
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
	gap: 40rpx;
	min-height: 100vh;
  background-image: url('/static/image/bg.png');
	background-size: cover;
	background-position: top center;
	background-repeat: no-repeat;
}

.plain-header {
	width: 100%;
  margin-top: 30rpx;
	max-width: 640rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.brand-logo {
	height: 60rpx;
}

.lang-switch {
	padding: 8rpx 20rpx;
	border-radius: 8rpx;
	border: 1rpx solid rgba(100, 108, 255, 0.3);
	background: rgba(100, 108, 255, 0.1);
	color: #646cff;
	font-size: 26rpx;
	cursor: pointer;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
}

.lang-switch:active {
	background: rgba(100, 108, 255, 0.2);
	transform: scale(0.98);
}

.lang-label {
	font-weight: 500;
}

.lang-arrow {
	font-size: 36rpx;
	margin-top: -4rpx;
	color: #646cff;
	opacity: 0.6;
	font-weight: 300;
}

.plain-container {
	flex: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	max-width: 640rpx;
}

.plain-title {
	text-align: left;
	margin-bottom: 12rpx;
	align-self: flex-start;
	width: 100%;
}

.plain-subtitle {
	text-align: left;
	color: #6b7280;
	margin-bottom: 12rpx;
	font-size: 28rpx;
	align-self: flex-start;
	width: 100%;
}

.form-area {
	gap: 24rpx;
}

.plain-container .form-area,
.plain-container .btn-group,
.plain-container .foot-tip {
	width: 100%;
	max-width: 640rpx;
	align-self: center;
}

.form-item {
	width: 100%;
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.uni-input {
	flex: 1;
	height: 52rpx;
	border: none;
	background: transparent;
	padding: 0;
	font-size: 28rpx;
	color: #111826;
	box-sizing: border-box;
}

.tp-ipt.has-code-btn {
	gap: 16rpx;
}

.form-area .tp-ipt {
	border: 0.5px solid #e2e8f0;
	background: #f8fafc;
}

.code-btn {
	font-size: 24rpx;
	background: #4f46e5;
	color: #fff;
	border-radius: 16rpx;
	padding: 12rpx 26rpx;
	border: none;
	flex-shrink: 0;
}

.code-btn[disabled] {
	opacity: 0.5;
}

.error-tip {
	font-size: 24rpx;
	color: #ef4444;
	margin-top: 8rpx;
	padding-left: 8rpx;
}

button[disabled] {
	opacity: 0.45;
}

.phone-input-wrapper {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 20rpx 24rpx;
	gap: 24rpx;
}

.phone-prefix-selector {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 0 16rpx;
	border-right: 1rpx solid #e2e8f0;
	flex-shrink: 0;
	cursor: pointer;
}

.prefix-text {
	font-size: 28rpx;
	color: #111826;
	font-weight: 500;
}

.prefix-arrow {
	font-size: 20rpx;
	color: #6b7280;
}

.phone-input {
	flex: 1;
}
</style>
