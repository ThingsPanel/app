<template>
	<view class="edit-container">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col tp-pd-l-r-30">
			<!-- 背景氛围元素 -->
			<view class="bg-glow-2"></view>
			
			<!-- 头像上传区域 -->
			<view class="avatar-section tp-flex tp-flex-col tp-flex-a-c tp-mg-t-50">
				<view class="avatar-wrapper" @click="chooseAvatar">
					<image :src="formData.avatarUrl || '/static/image/uhead.png'" class="avatar-image" mode="aspectFill"></image>
					<view class="avatar-mask">
						<text class="avatar-text">{{ $t('ucenter.edit.changeAvatar') }}</text>
					</view>
				</view>
			</view>

			<!-- 表单区域 -->
			<view class="form-section tp-panel tp-mg-t-50">
				<view class="form-item">
					<view class="form-label">{{ $t('ucenter.name') }}</view>
					<view class="tp-ipt">
						<input class="uni-input" v-model="formData.name" :placeholder="$t('ucenter.edit.namePlaceholder')" />
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">{{ $t('ucenter.phone') }}</view>
					<view class="tp-ipt">
						<view class="phone-input-wrapper">
							<picker mode="selector" :range="phonePrefixList" range-key="label" 
								:value="phonePrefixIndex" @change="onPhonePrefixChange">
								<view class="phone-prefix-selector">
									<text class="prefix-text">{{ selectedPhonePrefix }}</text>
									<text class="prefix-arrow">▼</text>
								</view>
							</picker>
							<input 
								class="uni-input phone-number" 
								v-model="formData.phone_number" 
								:placeholder="$t('ucenter.edit.phonePlaceholder')"
								type="number"
							/>
						</view>
					</view>
				</view>
				
				<view class="form-item">
					<view class="form-label">{{ $t('ucenter.email') }}</view>
					<view class="tp-ipt">
						<input class="uni-input" v-model="formData.email" :placeholder="$t('ucenter.edit.emailPlaceholder')" type="email" />
					</view>
				</view>

				<!-- 提交按钮 -->
				<view class="submit-section tp-mg-t-50">
					<button class="submit-btn" type="primary" @click="submitForm" :loading="submitting">
						{{ $t('common.save') }}
					</button>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			submitting: false,
			formData: {
				name: '',
				phone_number: '',
				phone_prefix: '+86',
				email: '',
				organization: '',
				timezone: '',
				default_language: '',
				avatar_url: '',
				avatarUrl: '' // 用于显示的完整URL
			},
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
		// 当前选中的区号显示文本
		selectedPhonePrefix() {
			if (this.phonePrefixList && this.phonePrefixList.length > 0 && this.phonePrefixIndex >= 0) {
				return this.phonePrefixList[this.phonePrefixIndex].code
			}
			return '+86'
		}
	},
	onLoad() {
		this.loadUserInfo();
	},
	onShow() {
		this.$nextTick(() => {
			setTimeout(() => {
				uni.setNavigationBarTitle({
					title: this.$t('ucenter.edit.title')
				})
			}, 100)
		})
	},
	methods: {
		// 加载用户信息
		loadUserInfo() {
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
			});
			
			const serverUrl = uni.getStorageSync('serverAddress');
			const baseUrl = serverUrl ? serverUrl.replace('/api/v1', '') : '';
			
			this.API.apiRequest('/api/v1/board/user/info', {}, 'get').then(res => {
				if (res.code == 200 && res.data) {
					const data = res.data;
					
					// 处理手机号：拆分前缀和号码
					let phoneNumber = '';
					let phonePrefix = '+86';
					
					// 优先使用 phone_prefix 和 phone_number
					if (data.phone_prefix) {
						phonePrefix = data.phone_prefix;
					}
					if (data.phone_number) {
						phoneNumber = String(data.phone_number);
					}
					
					// 如果 phone_number 包含前缀（以 + 开头），需要拆分
					if (phoneNumber && phoneNumber.startsWith('+')) {
						// 尝试匹配已知的前缀
						for (let i = 0; i < this.phonePrefixList.length; i++) {
							const prefix = this.phonePrefixList[i].code;
							if (phoneNumber.startsWith(prefix)) {
								phonePrefix = prefix;
								phoneNumber = phoneNumber.substring(prefix.length).trim();
								break;
							}
						}
					}
					
					// 如果没有 phone_number，尝试从 mobile 中提取
					if (!phoneNumber && data.mobile) {
						const mobileStr = String(data.mobile);
						if (mobileStr.includes('-')) {
							const parts = mobileStr.split('-');
							phonePrefix = parts[0] || '+86';
							phoneNumber = parts[1] || '';
						} else if (mobileStr.startsWith('+')) {
							// mobile 包含前缀
							for (let i = 0; i < this.phonePrefixList.length; i++) {
								const prefix = this.phonePrefixList[i].code;
								if (mobileStr.startsWith(prefix)) {
									phonePrefix = prefix;
									phoneNumber = mobileStr.substring(prefix.length).trim();
									break;
								}
							}
							if (!phoneNumber) {
								phoneNumber = mobileStr;
							}
						} else {
							phoneNumber = mobileStr;
						}
					}
					
					// 查找对应的前缀索引
					const prefixIndex = this.phonePrefixList.findIndex(item => item.code === phonePrefix);
					if (prefixIndex >= 0) {
						this.phonePrefixIndex = prefixIndex;
					}
					
					this.formData = {
						name: data.name || '',
						phone_number: phoneNumber,
						phone_prefix: phonePrefix,
						email: data.email || '',
						organization: data.organization || '',
						timezone: data.timezone || '',
						default_language: data.default_language || '',
						avatar_url: data.avatar_url || '',
						avatarUrl: data.avatar_url ? (baseUrl + '/' + data.avatar_url) : ''
					};
				}
				uni.hideLoading();
			}).catch(err => {
				console.error('加载用户信息失败:', err);
				uni.hideLoading();
				uni.showToast({
					title: this.$t('ucenter.edit.loadFailed'),
					icon: 'none'
				});
			});
		},
		
		// 区号选择器变化事件
		onPhonePrefixChange(e) {
			const index = e.detail.value
			this.phonePrefixIndex = index
			if (this.phonePrefixList && this.phonePrefixList[index]) {
				this.formData.phone_prefix = this.phonePrefixList[index].code
			}
		},
		
		// 选择头像
		chooseAvatar() {
			uni.chooseImage({
				count: 1,
				sizeType: ['compressed'],
				sourceType: ['album', 'camera'],
				success: (res) => {
					const tempFilePath = res.tempFilePaths[0];
					this.uploadAvatar(tempFilePath);
				},
				fail: (err) => {
					console.error('选择图片失败:', err);
				}
			});
		},
		
		// 上传头像
		uploadAvatar(filePath) {
			uni.showLoading({
				title: this.$t('ucenter.edit.uploading'),
				mask: true
			});
			
			const serverUrl = uni.getStorageSync('serverAddress');
			const baseUrl = serverUrl || 'http://demo.thingspanel.cn';
			const token = uni.getStorageSync('access_token');
			
			uni.uploadFile({
				url: baseUrl + '/api/v1/file/up',
				filePath: filePath,
				name: 'file',
				formData: {
					type: 'user_icon'
				},
				header: {
					'x-token': token
				},
				success: (uploadRes) => {
					try {
						const res = JSON.parse(uploadRes.data);
						if (res.code == 200 && res.data && res.data.path) {
							this.formData.avatar_url = res.data.path;
							this.formData.avatarUrl = baseUrl.replace('/api/v1', '') + '/' + res.data.path;
							uni.showToast({
								title: this.$t('ucenter.edit.uploadSuccess'),
								icon: 'success'
							});
						} else {
							uni.showToast({
								title: res.message || this.$t('ucenter.edit.uploadFailed'),
								icon: 'none'
							});
						}
					} catch (e) {
						console.error('解析上传结果失败:', e);
						uni.showToast({
							title: this.$t('ucenter.edit.uploadFailed'),
							icon: 'none'
						});
					}
					uni.hideLoading();
				},
				fail: (err) => {
					console.error('上传失败:', err);
					uni.hideLoading();
					uni.showToast({
						title: this.$t('ucenter.edit.uploadFailed'),
						icon: 'none'
					});
				}
			});
		},
		
		// 提交表单
		submitForm() {
			// 简单验证
			if (this.formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
				uni.showToast({
					title: this.$t('ucenter.edit.emailInvalid'),
					icon: 'none'
				});
				return;
			}
			if (this.formData.phone_number && !/^[0-9]+$/.test(this.formData.phone_number)) {
				uni.showToast({
					title: this.$t('ucenter.edit.phoneInvalid'),
					icon: 'none'
				});
				return;
			}
			this.submitUserInfo();
		},
		
		// 提交用户信息
		submitUserInfo() {
			if (this.submitting) return;
			
			this.submitting = true;
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
			});
			
			// 构建请求数据
			const updateData = {};
			if (this.formData.name) updateData.name = this.formData.name;
			if (this.formData.phone_number) updateData.phone_number = this.formData.phone_number;
			if (this.formData.phone_prefix) updateData.phone_prefix = this.formData.phone_prefix;
			if (this.formData.email) updateData.email = this.formData.email;
			if (this.formData.organization) updateData.organization = this.formData.organization;
			if (this.formData.timezone) updateData.timezone = this.formData.timezone;
			if (this.formData.default_language) updateData.default_language = this.formData.default_language;
			if (this.formData.avatar_url) updateData.avatar_url = this.formData.avatar_url;
			
			this.API.apiRequest('/api/v1/board/user/update', updateData, 'post').then(res => {
				uni.hideLoading();
				if (res.code == 200) {
					uni.showToast({
						title: this.$t('ucenter.edit.saveSuccess'),
						icon: 'none'
					});
					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} else {
					uni.showToast({
						title: res.message || this.$t('ucenter.edit.saveFailed'),
						icon: 'none'
					});
				}
				this.submitting = false;
			}).catch(err => {
				console.error('更新用户信息失败:', err);
				uni.hideLoading();
				uni.showToast({
					title: this.$t('ucenter.edit.updateFailed'),
					icon: 'none'
				});
				this.submitting = false;
			});
		}
	}
}
</script>

<style scoped>
@import '@/common/ucenter.css';

.edit-container {
	width: 100%;
	min-height: 100vh;
}

.avatar-section {
	margin-bottom: 40rpx;
	position: relative;
	z-index: 1;
}

.avatar-wrapper {
	position: relative;
	width: 200rpx;
	height: 200rpx;
	border-radius: 50%;
	overflow: hidden;
	border: 6rpx solid rgba(255, 255, 255, 0.9);
	box-shadow: 0 12rpx 35rpx rgba(100, 108, 255, 0.25);
}

.avatar-image {
	width: 100%;
	height: 100%;
}

.avatar-mask {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s;
}

.avatar-wrapper:active .avatar-mask {
	opacity: 1;
}

.avatar-text {
	color: #fff;
	font-size: 24rpx;
	text-align: center;
}

.form-section {
	position: relative;
	z-index: 1;
}

.form-item {
	margin-bottom: 40rpx;
}

.form-item:last-of-type {
	margin-bottom: 0;
}

.form-label {
	font-size: 28rpx;
	color: #1e293b;
	margin-bottom: 20rpx;
	font-weight: 600;
}

.tp-ipt {
	background-color: rgba(248, 250, 252, 0.8);
	border: 1rpx solid rgba(226, 232, 240, 0.8);
	border-radius: 16rpx;
	padding: 24rpx;
	transition: all 0.3s ease;
}

.tp-ipt:active {
	border-color: rgba(100, 108, 255, 0.4);
	background-color: rgba(248, 250, 252, 1);
}

.tp-ipt .uni-input {
	font-size: 28rpx;
	color: #1e293b;
	width: 100%;
}

.phone-input-wrapper {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 0;
	width: 100%;
}

.phone-prefix-selector {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	padding: 0 20rpx 0 0;
	border-right: 1rpx solid rgba(226, 232, 240, 0.8);
	flex-shrink: 0;
	cursor: pointer;
	min-width: 140rpx;
}

.prefix-text {
	font-size: 28rpx;
	color: #1e293b;
	font-weight: 500;
}

.prefix-arrow {
	font-size: 20rpx;
	color: #94a3b8;
	margin-left: 4rpx;
}

.phone-number {
	flex: 1;
	padding-left: 20rpx;
}

.submit-section {
	margin-top: 60rpx;
}

.submit-btn {
	width: 100%;
	height: 100rpx;
	line-height: 100rpx;
	border-radius: 16rpx;
	font-size: 30rpx;
	font-weight: 600;
	color: #fff;
	background: #646cff;
	border: none;
}

.submit-btn:active {
	opacity: 0.9;
	transform: scale(0.98);
}

.tp-ipt {
	padding: 0;
}

.tp-ipt .uni-input {
	background-color: transparent !important;
}
</style>

