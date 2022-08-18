<template>
	<view class="tp-box tp-flex tp-flex-col tp-box-sizing tp-pd-l-r-30">
		<view class="tp-panel tb-flex tp-box-sizing">
			<view class="tp-box-sizing tp-pd-t-b-25"><input type="text" value="" v-model="email" placeholder="请输入电子邮箱!" placeholder-class="tp-plc" /></view>
		</view>
		<view class="tp-panel tp-tips tp-box-sizing tp-mg-t-15">
			请输入您的电子邮箱！
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
				email:'',
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
		// 
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
		// 
		methods: {
			//
			getAccount(){ 
				// 
				if(this.userInfo){
					this.id				= this.userInfo.id;
					this.email			= this.userInfo.email;
					this.is_admin		= this.userInfo.is_admin;
					this.business_id	= this.userInfo.business_id;
				}
				// 
			},
			// 验证层
			check(){ 
				// 验证手机合法性
				if(!this.isEmail()){
					uni.showToast({	title:"请输入正确的邮箱地址！",icon:"none"	});
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
				this.$H.post('/user/edit',{id:this.id,email:this.email,is_admin:this.is_admin,business_id:this.business_id},{toke:true}).then(res=>{
					// 
					this.loading = this.disabled = false;
					// 修本地存储
					this.$store.commit('editUserInfoField',{
						key:'email',
						value:this.email
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
			isEmail(){ 
				let mPattern = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
				return mPattern.test(this.email);
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
