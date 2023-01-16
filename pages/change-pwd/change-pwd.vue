<template>
	<view class="tp-box tp-flex tp-flex-col">
		
		<view class="tp-panel tb-flex tp-box-sizing tp-pd-l-r-30">			
			<view class="tp-box-sizing tp-pd-t-b-25"><input type="text" value="" password="true" v-model="upwd" placeholder="请输入登录密码!" placeholder-class="tp-plc" /></view>
			<view class="tp-box-sizing tp-pd-t-b-25"><input type="text" value="" password="true" v-model="rpwd" placeholder="请确认登录密码!" placeholder-class="tp-plc" /></view>
		</view>
		<view class="tp-panel tp-tips tp-box-sizing tp-pd-l-r-30 tp-mg-t-10">
			请设置6位及以上包含数字、字母和特殊符号中至少两种组合的密码！
		</view>
		
		<view class="tp-box-sizing tp-pd-l-r-30">
			<button class="tp-btn tp-mg-t-50" :loading="loading":class="{'vc-btn-disabled':disabled}" @tap="doUpdateSubmit">确认修改</button>
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
				loading:false,
				disabled:true,
				upwd:'',
				rpwd:''
			}
		},
		//
		computed:{
			...mapState({
				userInfo:state=>state.userInfo
			})
		},
		//
		watch:{
			upwd(){
				this.onBtnChange();
			},
			rpwd(){
				this.onBtnChange();
			}
		},
		//
		onShow() {
			//
			this.getAccount();
			//
		},
		methods: {
			// 改变按钮状态
			onBtnChange(){ 
				// 
				if( this.upwd && this.rpwd && (this.upwd === this.rpwd) ){ 
					this.disabled = false; 
					return;
				}
				// 
				this.disabled = true;
				// 
			},
			//
			getAccount(){ 
				// 
				if(this.userInfo){
					this.id				= this.userInfo.id;
				}
				// 
			},
			//
			doUpdateSubmit(){
				//
				this.handleUpdate();
				//
			},
			//
			handleUpdate(){	
				//
				this.loading = true;
				//
				this.$H.post('/user/update',{id:this.id,password:this.upwd,password_confirmation:this.rpwd},{toke:true}).then(res=>{
					// 
					this.loading = this.disabled = false;
					// 
					return uni.showToast({
						title:"设置成功！",
						success:()=>{
							uni.navigateBack({ delta:1 })
						}
					})
					//
				}).catch(err=>{
					// 
					this.loading = this.disabled = false;
					// 
				})
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
.tp-btn{
	width: 100%;
	height: 86rpx;
	line-height: 86rpx;
	background: #343436;
	box-shadow: 0rpx 8rpx 31rpx 1rpx rgba(147, 147, 147, 0.35);
	border-radius: 20rpx;
	font-size: 30rpx;
	font-weight: bold;
	color: #FFFFFF;
}
.vc-btn-disabled{
	background: #888888;
}
.tp-plc{
	font-size: 30rpx;
	font-weight: 500;
	color: #999999;
}
</style>
