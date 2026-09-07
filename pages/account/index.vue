<template>
    <view class="account-page">
        <view class="account-header"><text class="account-title">{{ $t('pages.accountTitle') }}</text></view>
        <view v-if="loadError" class="load-error" @click="getUserInfo">{{ $t('account.retryLoad') }}</view>
        <view class="identity-card">
            <image class="avatar" :src="userWxInfo.avatarUrl || uhead" mode="aspectFill" @error="userWxInfo.avatarUrl = uhead" />
            <view class="identity-copy">
                <text class="identity-name">{{ userWxInfo.name || $t('account.notLoggedIn') }}</text>
                <text class="identity-role" v-if="$login.isLoginType().isLogin">{{ accountType }}</text>
            </view>
            <button class="edit-link" v-if="$login.isLoginType().isLogin" @click="toEditProfile">{{ $t('common.edit') }}</button>
        </view>
        <view class="section-title">{{ $t('account.basicInfo') }}</view>
        <view class="info-card">
            <view v-for="row in profileRows" :key="row.label" class="info-row" @click="row.edit && toEditProfile()">
                <text class="row-label">{{ row.label }}</text>
                <text class="row-value" :class="{ 'is-empty': !row.value }">{{ row.value || $t('account.notSet') }}</text>
                <view v-if="row.edit" class="chevron" />
            </view>
        </view>
        <view class="section-title">{{ $t('account.preferences') }}</view>
        <view class="info-card">
            <view class="info-row"><text class="row-label">{{ $t('account.edit.timezone') }}</text><text class="row-value">{{ userWxInfo.timezone || $t('account.notSet') }}</text></view>
            <view class="info-row"><text class="row-label">{{ $t('account.edit.defaultLanguage') }}</text><text class="row-value">{{ userWxInfo.default_language || $t('account.notSet') }}</text></view>
            <view class="info-row" @click="showLanguagePopup"><text class="row-label">{{ $t('account.appLanguage') }}</text><text class="row-value">{{ currentLanguage }}</text><view class="chevron" /></view>
        </view>
        <template v-if="$login.isLoginType().isLogin">
            <view class="section-title">{{ $t('account.securitySettings') }}</view>
            <view class="info-card">
                <view class="security-row" @click="openPassword">
                    <text class="password-label">{{ $t('account.changePassword') }}</text>
                    <view class="chevron" />
                </view>
            </view>
        </template>
        <button class="logout-button" @click="showLogoutConfirm" v-if="$login.isLoginType().isLogin">{{ $t('account.logout') }}</button>
        <app-toast ref="toast" :msg="toast.msg" location="top" />
        <ConfirmationModal
            v-model="logoutConfirmVisible"
            :title="$t('account.logout')"
            :text="$t('account.logoutConfirm')"
            :cancel-text="$t('common.cancel')"
            :confirm-text="$t('account.logout')"
            @confirm="toQuitLogin"
        />
    </view>
</template>
<script>
	//
	import {
		mapState
	} from "vuex";
	import { AVAILABLE_LANGUAGES, changeLanguage } from '@/lang/index.js'
	import ConfirmationModal from '@/components/confirmation-modal/index.vue'
	// 
	export default {
		components: { ConfirmationModal },
		// 
		data() {
			return {
				isLogin: false,
                loadError: false,
				isGetPhone: false,
				uhead: '/static/image/uhead.png',
				displayName: '李萌',
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
				logoutConfirmVisible: false,
			}
		},
		//
		computed: {
            accountType() {
                const roles = { TENANT_ADMIN: 'tenantAdmin', TENANT_USER: 'tenantUser', SYS_ADMIN: 'systemAdmin' };
                return roles[this.userWxInfo.authority] ? this.$t('account.' + roles[this.userWxInfo.authority]) : (this.userWxInfo.authority || this.$t('account.notSet'));
            },
            profileRows() {
                const u = this.userWxInfo;
                const phone = u.phone_number ? (String(u.phone_number).startsWith('+') ? u.phone_number : [u.phone_prefix, u.phone_number].filter(Boolean).join(' ')) : u.mobile;
                return [
                    { label: this.$t('account.name'), value: u.name, edit: true },
                    { label: this.$t('account.accountType'), value: this.accountType },
                    { label: this.$t('account.email'), value: u.email, edit: true },
                    { label: this.$t('account.phone'), value: phone, edit: true },
                    { label: this.$t('account.edit.organization'), value: u.organization },
                    { label: this.$t('account.region'), value: [u.address?.province, u.address?.city, u.address?.district].filter(Boolean).join(' ') },
                    { label: this.$t('account.detailAddress'), value: u.address?.detailed_address }
                ];
            },
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
		this.$nextTick(() => {
			setTimeout(() => {
				uni.setNavigationBarTitle({
					title: this.$t('pages.accountTitle')
				})
			}, 100)
		})
	},
		methods: {
            openPassword() { uni.navigateTo({ url: '/pages/account/password' }); },
			showLogoutConfirm() {
				this.logoutConfirmVisible = true
			},
			//退出登录
			toQuitLogin() {
				this.API.apiRequest('/api/v1/user/logout', {}, 'get').then(res => {
					if (res.code != 200) {
						uni.showToast({ title: this.$t('account.logoutFailed'), icon: 'none' })
						return
					}
					const push_id = uni.getStorageSync('push_id');
					console.log('get push id from storage: ', push_id);
					uni.removeStorageSync('access_token')
					uni.removeStorageSync('wx_code')
					uni.removeStorageSync('ywId')
					uni.removeStorageSync('email')
					uni.removeStorageSync('password')
					this.API.apiRequest('/api/v1/push-id/logout', {
						push_id: push_id
					}, 'post').then(res => {
						uni.removeStorageSync('push_id');
						console.log(res.code == 200 ? 'unregister push id success' : 'unregister push id failed');
					}).catch(error => {
						console.warn('unregister push id failed', error)
					})
					uni.reLaunch({
						url: '../login/index'
					})
				}).catch(() => {
					uni.showToast({ title: this.$t('account.logoutFailed'), icon: 'none' })
				})
			},
			//获取用户信息
            async getUserInfo() {
                this.loadError = false;

                try {
                    const res = await this.API.apiRequest('/api/v1/board/user/info', {}, 'get');
                    if (res.code != 200 || !res.data) throw new Error('Profile unavailable');
                    const avatar = res.data.avatar_url;
                    const base = (uni.getStorageSync('serverAddress') || '').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
                    this.userWxInfo = { ...res.data, avatarUrl: avatar ? (/^https?:\/\//i.test(avatar) ? avatar : base + '/' + avatar.replace(/^\//, '')) : this.uhead };
                } catch (error) {
                    this.loadError = true;
                } finally {

                }
            },
			//
			doOpenDevice: function() {
				if (!this.$login.isLoginType().isLogin) {
					this.$refs.authPopup.open()
				} else {
					uni.switchTab({
						url: '/pages/devices/index'
					})
				}

			},
			//
			//
			initAccount: function() {
				// 
				if (this.userInfo) {
					this.displayName = this.userInfo.name;
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

							that.API.apiRequest(url, data, 'post').then(res => {
								if (res.code == 200) {

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
					desc: this.$t('account.authDescription'),
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
						title: this.$t('account.enterServerAddress'),
						icon: 'none'
					});
				}
				uni.setStorageSync('serverAddress', this.address);
				this.$refs.serverPopup.close()
				// uni.redirectTo({url: '../login/index' });
			},
			showAddressPopup() {
				this.$refs.serverPopup.open();
			},
			closeAddressPopup() {
				this.$refs.serverPopup.close()
			},
			showLanguagePopup() {
				uni.showActionSheet({
					itemList: AVAILABLE_LANGUAGES.map(lang => lang.label),
					success: (res) => {
						const selectedLang = AVAILABLE_LANGUAGES[res.tapIndex];
						changeLanguage(selectedLang.code);
						setTimeout(() => {
							uni.reLaunch({
								url: '/pages/account/index'
							});
						}, 100);
					}
				});
			},
			// 跳转到编辑页面
			toEditProfile() {
				if (!this.$login.isLoginType().isLogin) {
					return;
				}
				uni.navigateTo({
					url: '/pages/account/edit'
				});
			}
		}
	}
</script>
<style scoped>
.account-page { --account-surface:#ffffff; --account-radius:12rpx; padding:0 28rpx calc(100rpx + env(safe-area-inset-bottom)); min-height:100vh; box-sizing:border-box; background:#F2F2F7; color:#1d1d1f; }
.account-header { padding:calc(30rpx + env(safe-area-inset-top)) 0 30rpx; }
.account-title { display:block; font-size:44rpx; line-height:60rpx; font-weight:650; }
.identity-card { display:flex; align-items:center; gap:24rpx; padding:32rpx 24rpx; border:0; border-radius:var(--account-radius); background:var(--account-surface); box-shadow:none; }
.avatar { width:88rpx; height:88rpx; border-radius:50%; flex-shrink:0; }
.identity-copy { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.identity-name { font-size:30rpx; line-height:42rpx; font-weight:600; overflow-wrap:anywhere; }
.identity-role { font-size:22rpx; line-height:32rpx; color:#73737d; }
.edit-link { display:flex; align-items:center; justify-content:center; margin:0; padding:0 20rpx; min-width:72rpx; min-height:64rpx; line-height:32rpx; box-sizing:border-box; border-radius:10rpx; font-size:22rpx; color:#1677ff; background:#edf4ff; flex-shrink:0; }
.edit-link::after, .logout-button::after { border:0; }
.section-title { font-size:28rpx; line-height:40rpx; font-weight:600; margin:26rpx 2rpx 12rpx; }
.info-card { background:var(--account-surface); border:0; border-radius:var(--account-radius); padding:0 24rpx; box-shadow:none; }
.info-row { display:flex; align-items:center; gap:16rpx; min-height:84rpx; padding:18rpx 0; box-sizing:border-box; border-bottom:1rpx solid #edf1f6; font-size:24rpx; line-height:36rpx; }
.info-row:last-child { border-bottom:0; }
.row-label { color:#5f5f6b; flex-shrink:0; }
.row-value { flex:1; min-width:0; text-align:right; overflow-wrap:anywhere; }
.is-empty { color:#9aa5b5; }
.chevron { width:5px; height:5px; border-top:1.5px solid #9ba8ba; border-right:1.5px solid #9ba8ba; transform:rotate(45deg); margin-right:2px; flex-shrink:0; }
.security-row { display:flex; align-items:center; min-height:84rpx; padding:18rpx 0; box-sizing:border-box; }
.password-label { flex:1; min-width:0; font-size:24rpx; line-height:36rpx; }
.logout-button { margin-top:24rpx; height:84rpx; line-height:84rpx; border:0; border-radius:var(--account-radius); background:var(--account-surface); color:#5f5f6b; font-size:24rpx; font-weight:400; box-shadow:none; }
.load-error { color:#b45309; background:#fff7ed; padding:12px; margin-bottom:12px; font-size:13px; border-radius:6px; }

.account-page { background: #F2F2F7; }
</style>
