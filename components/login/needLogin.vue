<template>
	<view>
		<view class="tp-login-box tp-flex tp-flex-col tp-box-sizing tp-pd-l-r-50 tp-pd-t-50">

			<view class="tp-pd-t-b-30"></view>

			<view class="tp-flex tp-login-welcome tp-flex-col tp-mg-t-b-50">
				<view>登录</view>
				<view class="tp-mg-t-05">欢迎登录</view>
			</view>

			<view
				class="tp-ipt tp-box-sizing tp-mg-t-b-20 tp-pd-t-b-15 tp-pd-l-r-30 tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
				<view class="iconfont iconwode tp-mg-r-15"></view>
				<input type="text" placeholder-class="tp-plc" placeholder="请输入账号!" v-model="email" />
			</view>
			<view
				class="tp-ipt tp-box-sizing tp-mg-t-b-20 tp-pd-t-b-15 tp-pd-l-r-30 tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
				<view class="iconfont iconmima tp-mg-r-15"></view>
				<input type="text" placeholder-class="tp-plc" placeholder="请输入密码!" v-model="password" password=true />
			</view>

			<view class="tp-remember-password tp-mg-b-20">
				<label class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-mg-l-25">
					<checkbox value="cb" checked="true" color="#000000" /> 记住密码
				</label>
			</view>

			<button class="tp-btn tp-mg-t-50" :loading="loading" :class="{'vc-btn-disabled':disabled}"
				@tap="doLoginSubmit">登 录</button>

			<view class="tp-getpwd tp-mg-t-40 tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">忘记密码</view>

		</view>
		<uni-popup ref="authPopup" type="bottom">
			<authorize @getuserinfo="getAuth" @cancel="toCloseLogin"></authorize>
		</uni-popup>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" :direction="row" location="top"></cys-toast>
	</view>

</template>

<script>
	// 
	import {
		mapState,
		mapMutations
	} from "vuex";
	// 
	export default {
		data() {
			return {
				disabled: true,
				loading: false,
				email: '1234567@qq.com',
				password: '12345678',
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
		onLoad() {
			
		},
		methods: {
			// 改变按钮状态
			onBtnChange() {
				// 
				if (this.email && this.password) {
					this.disabled = false;
					return;
				}
				this.disabled = true;
			},
			doLoginSubmit: function() {
				//判断是否授权
				let userDeatail = this.$login.isLoginType();
				this.isAuth = userDeatail.isAuth
				if (!this.isAuth) { //未授权
					this.$refs.authPopup.open()
				}else{
					let url = "/auth/login";
					let data = {};
					data = {
						email: this.email,
						password: this.password
					};
					this.loading = true;
					this.$H.post(url, data).then(res => {
						this.loading = false;
						// 修改vuex的state，持久化存储
						this.$store.commit('login', res);
						this.$store.dispatch('getUserInfo');
						uni.switchTab({
							url: '../fishery-monitor/fishery-monitor'
						});
						uni.showToast({
							title: '登录成功',
							icon: 'none'
						});
						//
					}).catch(err => {
						this.loading = false;
					});
				}
			}
	},
	}
</script>

<style>
	.tp-login-box {
		width: 100%;
	}

	.tp-login-welcome {}

	.tp-login-welcome>view:first-child {
		font-size: 42rpx;
		font-weight: bold;
		color: #0F0F0F;
	}

	.tp-login-welcome>view:last-child {
		font-size: 26rpx;
		font-weight: 500;
		color: #999999;
	}

	.tp-login-box>.tp-ipt {
		width: 100%;
		height: 84rpx;
		background: #F1F3F5;
		border-radius: 42rpx;
	}

	.tp-login-box>.tp-ipt>view.iconfont {
		font-size: 36rpx;
		color: #999999;
		font-weight: bold;
	}

	.tp-login-box>.tp-ipt>input {
		width: 100%;
		color: #666666;
	}

	.tp-remember-password {}

	.tp-remember-password>label {
		font-size: 28rpx;
		font-weight: 500;
		color: #666666;
	}

	.tp-remember-password>label>checkbox {
		transform: scale(0.6);
	}

	.tp-btn {
		width: 100%;
		height: 88rpx;
		line-height: 88rpx;
		background: #343436;
		box-shadow: 0rpx 8rpx 31rpx 1rpx rgba(147, 147, 147, 0.35);
		border-radius: 44rpx;
		font-size: 36rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.vc-btn-disabled {
		background: #888888;
	}

	.tp-getpwd {
		font-size: 28rpx;
		font-weight: 500;
		color: #666666;
	}

	.tp-plc {
		font-size: 30rpx;
		font-weight: 500;
		color: #999999;
	}
</style>
