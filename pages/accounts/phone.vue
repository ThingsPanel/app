<template>
	<view class="tp-box tp-flex tp-flex-col tp-box-sizing tp-pd-l-r-30">
		<view class="tp-panel tb-flex tp-box-sizing">
			<view class="tp-box-sizing tp-pd-t-b-25"><input type="text" value="" v-model="phone" placeholder="请输入手机号码!" placeholder-class="tp-plc" /></view>
		</view>
		<view class="tp-panel tp-tips tp-box-sizing tp-mg-t-15">
			请输入您的手机号码，确保手机号码正确无误！
		</view>
	</view>
</template>

<script>
	//
	import { mapState } from "vuex";
	//
	export default {
		data() {
			return {
				id:'',
				phone:'',
				is_admin:0,
				business_id:''
			}
		},
		//
		computed:{
			...mapState({
				userInfo:state=>state.userInfo
			})
		},
		onNavigationBarButtonTap(e){
			// 设置
			if( e.index ===0 ){
				//
				this.handleUpdate();
				//
			}
			// 
		},
		//
		onShow() {
			//
			this.getAccount();
			//
		},
		methods: {
			//
			getAccount(){ 
				// 
				if(this.userInfo){
					this.id				= this.userInfo.id;
					this.phone			= this.userInfo.mobile;
					this.is_admin		= this.userInfo.is_admin;
					this.business_id	= this.userInfo.business_id;
				}
				// 
			},
			// 验证层
			check(){ 
				// 验证手机合法性
				if(!this.isPhone()){
					uni.showToast({	title:"请输入正确的手机号码",icon:"none"	});
					return ;
				}
				// 
				return true;
				// 
			},
			//
			handleUpdate(){
				// 
				if(!this.check()) return; 
				//
				this.$H.post('/user/edit',{id:this.id,mobile:this.phone,is_admin:this.is_admin,business_id:this.business_id},{toke:true}).then(res=>{
					// 
					this.loading = this.disabled = false;
					// 修本地存储
					this.$store.commit('editUserInfoField',{
						key:'mobile',
						value:this.phone
					})
					// 
					return uni.showToast({
						title:"设置成功！",
						success:()=>{
							uni.navigateBack({ delta:1 })
						}
					})
					// 
					//
				}).catch(err=>{
					console.log(err);
				})
				//
			},
			// 手机号验证
			isPhone(){ 
				let mPattern = /^1[34578]\d{9}$/;
				return mPattern.test(this.phone);
			}
			//
		}
	}
</script>

<style>
.tp-box{
	width: 100%;
	min-height: 100vh;
	background: #FFFFFF;
}
.tp-panel{

}
.tp-panel>view{
	border-bottom: 1rpx solid #E1E1E1;
}
.tp-panel>view>input{
	color: #666666;
	font-size: 30rpx;
}
.tp-tips{
	font-size: 26rpx;
	line-height: 44rpx;
	color: #999999;
}
.tp-plc{
	font-size: 30rpx;
	font-weight: 500;
	color: #999999;
}
</style>
