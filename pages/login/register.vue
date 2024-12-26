<template>
    <view class="container">
      <view class="tp-flex tp-login-welcome tp-flex-col tp-mg-t-b-50">
        <text class="fishTitle">注册</text>
      </view>
      <form @submit.prevent="handleSubmit">
        <!-- 邮箱输入 -->
        <view class="form-item">
          <input
            class="uni-input"
            type="text"
            v-model="formData.email"
            placeholder="请输入邮箱"
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
            placeholder="请输入验证码"
            @blur="validateCode"
          />
          <button 
            class="code-btn" 
            @click="handleSmsCode"
            :disabled="loading"
          >获取验证码</button>
          <text class="error-tip" v-if="errors.code">{{errors.code}}</text>
        </view>
  
        <!-- 手机号输入 -->
        <view class="form-item">
          <input
            class="uni-input"
            type="number"
            v-model="formData.phone"
            placeholder="请输入手机号"
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
            placeholder="请输入密码"
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
            placeholder="请确认密码"
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
          >确认注册</button>
          <button 
            class="back-btn" 
            @click="handleBack"
          >返回登录</button>
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
          this.errors.email = '请输入邮箱'
          return false
        }
        if (!emailRegex.test(this.formData.email)) {
          this.errors.email = '请输入正确的邮箱格式'
          return false
        }
        this.errors.email = ''
        return true
      },
  
      // 验证手机号
      validatePhone() {
        if (!this.formData.phone) {
          this.errors.phone = '请输入手机号'
          return false
        }
        if (!/^1[3-9]\d{9}$/.test(this.formData.phone)) {
          this.errors.phone = '请输入正确的手机号'
          return false
        }
        this.errors.phone = ''
        return true
      },
  
      // 验证密码
      validatePassword() {
        if (!this.formData.pwd) {
          this.errors.pwd = '请输入密码'
          return false
        }
        if (this.formData.pwd.length < 8 || this.formData.pwd.length > 18) {
          this.errors.pwd = '密码长度需在8-18位之间'
          return false
        }
        if (!this.validPasswordByExp(this.formData.pwd)) {
          this.errors.pwd = '密码格式不正确'
          return false
        }
        this.errors.pwd = ''
        return true
      },
  
      // 验证确认密码
      validateConfirmPassword() {
        if (!this.formData.confirmPwd) {
          this.errors.confirmPwd = '请确认密码'
          return false
        }
        if (this.formData.confirmPwd !== this.formData.pwd) {
          this.errors.confirmPwd = '两次输入的密码不一致'
          return false
        }
        this.errors.confirmPwd = ''
        return true
      },
  
      // 验���码
      validateCode() {
        if (!this.formData.code) {
          this.errors.code = '请输入验证码'
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
                title: '验证码发送失败: ' + resp.message,
                icon: 'none'
            })
          } else {
            uni.showToast({
                title: '验证码已发送',
                icon: 'none'
            })
          }
        } catch (error) {
          uni.showToast({
            title: error.message || '验证码发送失败',
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
                    title: '注册失败: ' + resp.message,
                    icon: 'none'
                })
            } else {
                uni.showToast({
                    title: '注册成功',
                    icon: 'success'
                })
                setTimeout(() => {
                    this.handleBack()
                }, 1500)
            }
        } catch (error) {
          uni.showToast({
            title: error.message || '注册失败',
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