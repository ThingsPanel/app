<template>
    <view class="account-page">
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
        <button class="logout-button" @click="toQuitLogin" v-if="$login.isLoginType().isLogin">{{ $t('account.logout') }}</button>
        <app-toast ref="toast" :msg="toast.msg" location="top" />
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
			//退出登录
			toQuitLogin() {
				uni.showLoading({
					title: this.$t('common.loading'),
					mask: true
				});
				this.API.apiRequest('/api/v1/user/logout', {}, 'get').then(res => {
					const push_id = uni.getStorageSync('push_id');
					console.log('get push id from storage: ', push_id);
					if (res.code == 200) {
							uni.removeStorageSync('access_token')
							uni.removeStorageSync('wx_code')
							uni.removeStorageSync('ywId')
							uni.removeStorageSync('email')
							uni.removeStorageSync('password')
							this.API.apiRequest('/api/v1/push-id/logout', {
								push_id: push_id
							}, 'post').then(res => {
								uni.removeStorageSync('push_id');
								if (res.code == 200) {
									console.log('unregister push id success');
								} else {
									console.log('unregister push id failed');
								}
							})
							uni.reLaunch({
								url: '../login/index'
							})
					}
					uni.hideLoading()
				})
			},
			//获取用户信息
            async getUserInfo() {
                this.loadError = false;
                uni.showLoading({ title: this.$t('common.loading'), mask: true });
                try {
                    const res = await this.API.apiRequest('/api/v1/board/user/info', {}, 'get');
                    if (res.code != 200 || !res.data) throw new Error('Profile unavailable');
                    const avatar = res.data.avatar_url;
                    const base = (uni.getStorageSync('serverAddress') || '').replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
                    this.userWxInfo = { ...res.data, avatarUrl: avatar ? (/^https?:\/\//i.test(avatar) ? avatar : base + '/' + avatar.replace(/^\//, '')) : this.uhead };
                } catch (error) {
                    this.loadError = true;
                } finally {
                    uni.hideLoading();
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
							uni.showLoading({
								title: this.$t('account.loading')
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
.account-page { padding: 12px 18px calc(76px + env(safe-area-inset-bottom)); min-height: calc(100vh - 96px); box-sizing: border-box; background: linear-gradient(180deg, #fff 0, #f4f7fb 180px, #f7f8fa 420px); color: #1e293b; }
.identity-card { display:flex; align-items:center; gap:12px; padding:14px; border:1px solid #e1eaf6; border-radius:6px; background:linear-gradient(115deg,#edf5ff,#fbfdff 85%); }
.avatar { width:44px; height:44px; border-radius:50%; flex-shrink:0; border:2px solid #fff; }
.identity-copy { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.identity-name { font-size:16px; line-height:22px; font-weight:600; overflow-wrap:anywhere; }
.identity-role { font-size:12px; line-height:18px; color:#6b7c94; }
.edit-link { margin:0; padding:0 4px; min-width:40px; height:44px; line-height:44px; font-size:12px; color:#1677ff; background:transparent; flex-shrink:0; }
.edit-link::after, .logout-button::after { border:0; }
.section-title { font-size:13px; font-weight:600; margin:16px 2px 8px; }
.info-card { background:#fff; border:1px solid #e5eaf2; border-radius:6px; padding:0 14px; }
.info-row { display:flex; align-items:center; gap:10px; min-height:44px; padding:10px 0; box-sizing:border-box; border-bottom:1px solid #f0f2f6; font-size:13px; line-height:20px; }
.info-row:last-child { border-bottom:0; }
.row-label { color:#718096; flex-shrink:0; }
.row-value { flex:1; min-width:0; text-align:right; overflow-wrap:anywhere; }
.is-empty { color:#9aa5b5; }
.chevron { width:5px; height:5px; border-top:1.5px solid #9ba8ba; border-right:1.5px solid #9ba8ba; transform:rotate(45deg); margin-right:2px; flex-shrink:0; }
.security-row { display:flex; align-items:center; min-height:44px; padding:10px 0; box-sizing:border-box; }
.password-label { flex:1; min-width:0; font-size:13px; line-height:20px; }
.logout-button { margin-top:8px; height:44px; line-height:44px; border:0; border-radius:6px; background:transparent; color:#718096; font-size:13px; font-weight:400; }
.load-error { color:#b45309; background:#fff7ed; padding:12px; margin-bottom:12px; font-size:13px; border-radius:6px; }
</style>
