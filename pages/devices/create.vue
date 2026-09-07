<template>
  <view class="create-page">
    <view class="create-intro">
      <text class="intro-text">{{ $t('pages.deviceCreate.nameHint') }}</text>
    </view>
    <view class="name-card">
      <label class="field-label" for="device-name">{{ $t('pages.deviceCreate.deviceName') }}</label>
      <input id="device-name" class="name-input" v-model="name" :disabled="submitting" :placeholder="$t('pages.deviceCreate.deviceNamePlaceholder')" placeholder-class="name-placeholder" confirm-type="done" @confirm="onCommit" />
    </view>
    <button class="submit-button" :loading="submitting" :disabled="submitting" @click="onCommit">{{ $t('pages.deviceCreate.completeButton') }}</button>
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
				groupId: '',
				name: '',
                submitting: false
			}
		},
		onLoad(option) {
			this.code = option.code || ''
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
		},
		methods: {
			async onCommit() {
                if (this.submitting) return;
                if (!this.code || !String(this.code).trim()) {
                    uni.showToast({ title: this.$t('scanActivation.missing'), icon: 'none' });
                    return;
                }
                const name = this.name.trim();
                if (!name) {
                    uni.showToast({ title: this.$t('pages.deviceCreate.deviceNameRequired'), icon: 'none' });
                    return;
                }
                this.submitting = true;

                try {
                    const res = await this.API.apiRequest('/api/v1/device/active', { device_number: this.code, name }, 'put');
                    if (res?.code === 200) {
                        uni.switchTab({ url: '/pages/devices/index', fail: () => uni.showToast({ title: this.$t('dashboard.openFailed'), icon: 'none' }) });
                    } else {
                        uni.showToast({ title: res?.message || this.$t('scanActivation.failed'), icon: 'none' });
                    }
                } catch (error) {
                    uni.showToast({ title: this.$t('scanActivation.failed'), icon: 'none' });
                } finally {
                    this.submitting = false;

                }
            }
		}
	}
</script>
<style scoped>
.create-page { min-height:calc(100vh - var(--window-top, 0px)); box-sizing:border-box; padding:40rpx 32rpx calc(48rpx + env(safe-area-inset-bottom)); background:#F2F2F7; color:#1d1d1f; }
.create-intro { padding:0 4rpx 28rpx; }
.intro-text { display:block; font-size:26rpx; line-height:40rpx; color:#73737d; }
.name-card { padding:30rpx 28rpx; background:#fff; border-radius:16rpx; }
.field-label { display:block; font-size:26rpx; line-height:38rpx; font-weight:500; }
.name-input { box-sizing:border-box; width:100%; height:88rpx; margin-top:20rpx; padding:0 22rpx; border-radius:10rpx; background:#f6f7f9; font-size:30rpx; color:#1d1d1f; }
.name-placeholder { color:#91919b; }
.submit-button { margin:28rpx 0 0; min-height:88rpx; line-height:88rpx; padding:0 24rpx; background:#1677ff; color:#fff; border-radius:12rpx; font-size:28rpx; font-weight:500; }
.submit-button::after { border:0; }
.submit-button[disabled] { color:#fff; background:#8bbaff; }
</style>
