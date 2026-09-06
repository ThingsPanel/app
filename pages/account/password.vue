<template>
    <view class="password-page">
        <view class="form-card">
            <view class="field" v-for="field in fields" :key="field.key">
                <text class="label">{{ $t('account.' + field.label) }}</text>
                <input v-model="form[field.key]" password :maxlength="-1" :disabled="submitting" :placeholder="$t('account.' + field.label)" />
            </view>
        </view>
        <text class="hint">{{ $t('account.passwordHint') }}</text>
        <text v-if="error" class="error" role="alert">{{ error }}</text>
        <button class="save" :loading="submitting" :disabled="submitting" @click="submit">{{ $t('common.save') }}</button>
    </view>
</template>
<script>
export default {
    data() {
        return {
            form: { old_password: '', password: '', confirmation: '' },
            fields: [{ key: 'old_password', label: 'oldPassword' }, { key: 'password', label: 'newPassword' }, { key: 'confirmation', label: 'confirmPassword' }],
            submitting: false, error: ''
        };
    },
    onLoad() { uni.setNavigationBarTitle({ title: this.$t('account.changePassword') }); },
    onUnload() { this.clearPasswords(); },
    methods: {
        clearPasswords() { this.form = { old_password: '', password: '', confirmation: '' }; },
        async submit() {
            if (this.submitting) return;
            this.error = '';
            if (!this.form.old_password || !this.form.password || !this.form.confirmation) {
                this.error = this.$t('account.passwordRequired'); return;
            }
            if (this.form.password !== this.form.confirmation) {
                this.error = this.$t('account.passwordMismatch'); return;
            }
            this.submitting = true;
            try {
                const res = await this.API.apiRequest('/api/v1/board/user/update/password', {
                    old_password: this.form.old_password, password: this.form.password
                }, 'post');
                if (res.code != 200) {
                    this.error = res.message || res.msg || this.$t('account.passwordFailed'); return;
                }
                this.clearPasswords();
                uni.removeStorageSync('password');
                uni.showToast({ title: this.$t('account.passwordSuccess'), icon: 'none' });
            } catch (error) {
                this.error = this.$t('account.passwordFailed');
            } finally { this.submitting = false; }
        }
    }
};
</script>
<style scoped>
.password-page { min-height:100%; padding:16px 18px calc(24px + env(safe-area-inset-bottom)); box-sizing:border-box; background:#f7f8fa; color:#1e293b; }
.form-card { padding:0 14px; border:1px solid #e5eaf2; border-radius:6px; background:#fff; }
.field { padding:14px 0; border-bottom:1px solid #f0f2f6; }
.field:last-child { border:0; }
.label { display:block; font-size:13px; margin-bottom:6px; }
input { height:44px; font-size:14px; }
.hint, .error { display:block; margin-top:12px; font-size:12px; line-height:20px; color:#718096; }
.error { color:#c24132; }
.save { margin-top:20px; height:44px; line-height:44px; border-radius:6px; background:#1677ff; color:#fff; font-size:14px; }
.save::after { border:0; }
.save[disabled] { opacity:.6; }
</style>
