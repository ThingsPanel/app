<template>
	<view class="tp-box tp-box-sizing tp-flex tp-flex-col tp-pd-l-r-30">
		
		<view class="tp-panel tp-uinfo tp-flex tp-flex-col tp-flex-j-c tp-flex-a-c tp-mg-t-50">
			<image :src="uhead"></image>
		</view>
		
		<view class="tp-panel tp-flex tp-flex-col tp-box-sizing tp-pd-t-b-10 tp-pd-l-r-30 tp-mg-t-50">
			
			<view class="tp-uinfo-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-30" @tap="doChangeRealname">
				<view>名字</view>
				<view class="tp-flex-1 tp-mg-l-r-10 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">{{realname}}</view>
				<view class="iconfont iconjiantou1"></view>
			</view>
			
			<view class="tp-uinfo-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-30" @tap="doChangePhone">
				<view>电话</view>
				<view class="tp-flex-1 tp-mg-l-r-10 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">{{phone}}</view>
				<view class="iconfont iconjiantou1"></view>
			</view>
			
			<view class="tp-uinfo-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-30" @tap="doChangeEmail">
				<view>邮箱</view>
				<view class="tp-flex-1 tp-mg-l-r-10 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">{{email}}</view>
				<view class="iconfont iconjiantou1"></view>
			</view>
			
		</view>
		
		<view class="tp-panel tp-change-pwd tp-flex tp-flex-col tp-box-sizing tp-pd-t-b-10 tp-pd-l-r-30 tp-mg-t-30">			
			<view class="tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-20" @tap="doOpenChangePwd">
				<view>修改密码</view>
				<view class="iconfont iconjiantou1"></view>
			</view>
		</view>
		
		<view class="tp-bnt tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c tp-box-sizing tp-pd-t-b-10 tp-pd-l-r-30 tp-mg-t-50" @tap="doLogout"><text>退出当前账号</text></view>
		
	</view>
</template>

<script>
	//
	import { mapState } from "vuex";
	//
	export default {
		// 
		data() {
			return {
				uhead:'/static/image/uhead.png',
				realname:'李萌',
				phone:'18035274152',
				email:'102451452@qq.com'
			}
		},
		//
		computed:{
			...mapState({
				userInfo:state=>state.userInfo
			})
		},
		// 
		onShow() {
			//
			this.getAccount();
			//
		},
		// 
		methods: {
			// 
			doChangeRealname:function(){
				uni.navigateTo({
					url:'./realname'
				})
			},
			// 
			doChangePhone:function(){
				uni.navigateTo({
					url:'./phone'
				})
			},
			// 
			doChangeEmail:function(){
				uni.navigateTo({
					url:'./email'
				})
			},
			//
			doOpenChangePwd:function(){
				uni.navigateTo({
					url:'../change-pwd/change-pwd'
				})
			},
			//
			doLogout:function(){
				uni.showModal({
					content:'是否要退出登录',
					confirmText:'立即退出',
					success:(res)=>{
						if(res.confirm){
							uni.removeStorageSync('currentYw')
							uni.removeStorageSync('isAuth')
							uni.removeStorageSync('access_token')
							uni.removeStorageSync('ywId')
							uni.removeStorageSync('currentGroup')
							this.$store.commit('logout');
							// 
							uni.navigateTo({
								url:'../login/login'
							})
							// 
							uni.showToast({
								title:'退出登录成功',
								icon:'none'
							})
							// 
						}
					}
				});
			},
			//
			getAccount(){ 
				// 
				if(this.userInfo){
					this.realname	= this.userInfo.name;
					this.phone		= this.userInfo.mobile;
					this.email		= this.userInfo.email;
				}
				// 
			}
			//
		}
	}
</script>

<style>
.tp-box{
	width: 100%;
	min-height: 100vh;
	background: #F8F8F8;
}
.tp-panel{
	background: #FFFFFF;
	border-radius: 10px;
}
.tp-uinfo{
	background: none;
}
.tp-uinfo>image{
	width: 124rpx;
	height: 124rpx;
	background: #FFFFFF;
	border-radius: 100%;
}
.tp-uinfo-item{
	border-bottom: 1rpx solid #EDEDED;
}
.tp-uinfo-item>view:first-child{
	font-size: 30rpx;
	font-weight: bold;
	color: #1B1B1B;
}
.tp-uinfo-item>view:nth-child(2){
	font-size: 28rpx;
	color: #999999;
}
.tp-uinfo-item>view:last-child{
	color: #AAAAAA;
	font-size: 28rpx;
}
.tp-panel>view.tp-uinfo-item:last-child{
	border-bottom: none;
}

.tp-change-pwd{
	
}
.tp-change-pwd>view>view:first-child{
	font-size: 30rpx;
	font-weight: bold;
	color: #1B1B1B;
}
.tp-change-pwd>view>view:last-child{
	color: #AAAAAA;
	font-size: 28rpx;
}
.tp-bnt{
	height: 86rpx;
	background: #343436;
	border-radius: 10rpx;
}
.tp-bnt>text{
	font-size: 32rpx;
	font-weight: 500;
	color: #FFFFFF;
}
</style>
