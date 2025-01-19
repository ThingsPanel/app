<template>
	<view class="tp-box tp-flex tp-flex-col tp-box-sizing tp-pd-l-r-30">
		<view class="tp-panel tb-flex tp-box-sizing">
			<view class="tp-box-sizing tp-pd-t-b-25">
				<input type="text" v-model="realname" :placeholder="$t('pages.realname.inputPlaceholder')" placeholder-class="tp-plc" />
			</view>
		</view>
		<view class="tp-panel tp-tips tp-box-sizing tp-mg-t-15">
			{{ $t('pages.realname.tips') }}
		</view>
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
				id:'',
				realname:'',
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
      uni.setNavigationBarTitle({
        title: this.$t('pages.modifyName')
      })
			this.getAccount();
		},
		methods: {
			//
			getAccount(){ 
				// 
				if(this.userInfo){
					this.id				= this.userInfo.id;
					this.realname		= this.userInfo.name;
					this.is_admin		= this.userInfo.is_admin;
					this.business_id	= this.userInfo.business_id;
				}
				// 
			},
			// 验证层
			check(){ 
				// 
				if(!this.realname || this.realname==""){
					uni.showToast({	
						title: this.$t('pages.realname.emptyError'),
						icon: "none" 
					});
					return false;
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
				this.$H.post('/user/edit',{id:this.id,name:this.realname,is_admin:this.is_admin,business_id:this.business_id},{toke:true}).then(res=>{
					// 
					this.loading = this.disabled = false;
					// 修本地存储
					this.$store.commit('editUserInfoField',{
						key:'name',
						value:this.realname
					})
					// 
					return uni.showToast({
						title: this.$t('pages.realname.updateSuccess'),
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
