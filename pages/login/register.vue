<template>
    <view class="container">
      <view class="tp-flex tp-login-welcome tp-flex-col tp-mg-t-b-50">
        <text class="fishTitle">{{ $t('pages.register.title') }}</text>
      </view>
      <form @submit.prevent="handleSubmit">
        <!-- 邮箱输入 -->
        <view class="form-item">
          <input
            class="uni-input"
            type="text"
            v-model="formData.email"
            :placeholder="$t('pages.register.emailPlaceholder')"
            @blur="validateEmail"
          />
          <text class="error-tip" v-if="errors.email">{{errors.email}}</text>
        </view>
  
        <!-- 验证码输入 -->
        <view class="form-item code-input">
          <input
            class="uni-input"
            type="text"
            v-model="formData.code"
            :placeholder="$t('pages.register.codePlaceholder')"
            @blur="validateCode"
          />
          <button 
            class="code-btn" 
            @click="handleSmsCode"
            :disabled="loading"
          >{{ $t('pages.register.getCode') }}</button>
          <text class="error-tip" v-if="errors.code">{{errors.code}}</text>
        </view>
  
        <!-- 手机号输入 -->
        <view class="form-item">
          <input
            class="uni-input"
            type="number"
            v-model="formData.phone"
            :placeholder="$t('pages.register.phonePlaceholder')"
            @blur="validatePhone"
          />
          <text class="error-tip" v-if="errors.phone">{{errors.phone}}</text>
        </view>
  
        <!-- 密码输入 -->
        <view class="form-item">
          <input
            class="uni-input"
            type="password"
            v-model="formData.pwd"
            :placeholder="$t('pages.register.passwordPlaceholder')"
            @blur="validatePassword"
          />
          <text class="error-tip" v-if="errors.pwd">{{errors.pwd}}</text>
        </view>
  
        <!-- 确认密码 -->
        <view class="form-item">
          <input
            class="uni-input"
            type="password"
            v-model="formData.confirmPwd"
            :placeholder="$t('pages.register.confirmPasswordPlaceholder')"
            @blur="validateConfirmPassword"
          />
          <text class="error-tip" v-if="errors.confirmPwd">{{errors.confirmPwd}}</text>
        </view>
  
        <!-- 同意协议 
        <view class="agreement">
          <checkbox v-model="formData.agreement" color="#007AFF" />
          <text class="agreement-text">同意用户协议和隐私政策</text>
        </view> -->
  
        <!-- 按钮区域 -->
        <view class="btn-group">
          <button 
            class="submit-btn" 
            type="primary" 
            @click="handleSubmit"
            :disabled="!isFormValid"
          >{{ $t('pages.register.registerButton') }}</button>
          <button 
            class="back-btn" 
            @click="handleBack"
          >{{ $t('pages.register.backToLogin') }}</button>
        </view>
      </form>
    </view>
  </template>
  
  <script>
  import { fetchEmailCode, registerByEmail } from '@/service/auth'
  
  export default {
    data() {
      return {
        formData: {
          email: '',
          code: '',
          phone: '',
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
        loading: false
      }
    },
  
    computed: {
      isFormValid() {
        const hasAllFields = Object.values(this.formData).every(value => value !== '')
        return hasAllFields
      }
    },
  
    methods: {
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
        if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
          this.errors.phone = this.$t('pages.register.errors.invalidPhone')
          return false
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
  
      // 验���码
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
          if(resp.code > 200000) {
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
        if (!this.validateForm()) return
        /*if (!this.formData.agreement) {
          uni.showToast({
            title: '请同意用户协议和隐私政策',
            icon: 'none'
          })
          return
        }*/
  
        this.loading = true
        try {
            const resp = await registerByEmail({
                email: this.formData.email,
                verify_code: this.formData.code,
                password: this.formData.pwd,
                confirm_password: this.formData.confirmPwd,
                phone_prefix: '+86',
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
      }
    }
  }
  </script>
  
  <style>
  @import url("@/common/login.css");

  .container {
    padding: 30rpx;
  }
  
  .form-item {
    margin-bottom: 30rpx;
  }
  
  .uni-input {
    height: 88rpx;
    background-color: #F8F8F8;
    border-radius: 44rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
  }
  
  .code-input {
    position: relative;
  }
  
  .code-btn {
    position: absolute;
    right: 20rpx;
    top: 50%;
    transform: translateY(-50%);
    font-size: 24rpx;
    background: #007AFF;
    color: #fff;
    border-radius: 30rpx;
    padding: 10rpx 20rpx;
    border: none;
  }
  
  .error-tip {
    font-size: 24rpx;
    color: #FF0000;
    margin-top: 10rpx;
    padding-left: 30rpx;
  }
  
  .agreement {
    display: flex;
    align-items: center;
    margin: 30rpx 0;
    padding-left: 30rpx;
  }
  
  .agreement-text {
    font-size: 24rpx;
    color: #666;
    margin-left: 10rpx;
  }
  
  .btn-group {
    margin-top: 50rpx;
  }
  
  .submit-btn {
    width: 100%;
    height: 88rpx;
    background: #007AFF;
    color: #fff;
    border-radius: 44rpx;
    font-size: 32rpx;
    margin-bottom: 30rpx;
  }
  
  .back-btn {
    width: 100%;
    height: 88rpx;
    background: #F8F8F8;
    color: #333;
    border-radius: 44rpx;
    font-size: 32rpx;
  }
  
  button[disabled] {
    background: #ccc !important;
    color: #fff !important;
  }

  </style>
