<template name="aui-toast">
	<!-- 有图标 -->
	<view class="aui-toast aui-toast-middle" :class="{'aui-toast-row': direction=='row'}" v-if="SHOW && icon">
		<view class="aui-toast-main">
			<view class="aui-toast-icon"><image :src="icon" /></view>
			<view class="aui-toast-msg" v-html="msg"></view>
		</view>
	</view>
	<!-- 无图标 -->
	<view class="aui-toast" :class="{'aui-toast-bottom': location=='bottom', 'aui-toast-middle': location=='middle','aui-toast-top': location=='top'}" v-else-if="SHOW && !icon" :style="{top:toastTop}">
		<view class="aui-toast-main">
			<view class="aui-toast-icon"><image src="@/static/icon/tip_icon.png" /></view>
			<view class="aui-toast-msg" v-html="msg"></view>
		</view>
	</view>
</template>
<script>
	export default {
		name: "aui-toast",
		props: {
			msg: { //描述内容
				type: String,
				default: ''
			},
			icon: { //图标
				type: String,
				default: ''
			},
			direction: { //（icon参数配置后有效）横向("row")或纵向("col")控制，默认纵向
				type: String,
				default: 'col'
			},
			location: { //（icon参数未配置时可配置）位置	<1、bottom:位于底部，从底部弹出显示>、<2、middle:位于页面中心位置>
				type: String,
				default: 'bottom'
			},
			duration: { //显示时长
				String: Number,
				default: 3000
			}
		},
		data(){
			return {
				SHOW: false, //是否显示
				toastTop:0
			}
		},
		created(){
			
		},
		mounted(){
			this.toastTop=uni.getStorageSync('contentPaddingTop')
		},
		methods:{
			//显示
			show(){
				var _this = this;
				return new Promise(function(resolve, reject){
					_this.SHOW = true;
					var _timer_ = setTimeout(function(){
						_this.SHOW = false;
						clearTimeout(_timer_);
						resolve();
					}, _this.duration);
				});
			},
		}
	}
</script>

<style>
	/*toast 消息提示弹窗*/
	.aui-toast{
		width: 750rpx;
		max-height: -webkit-calc(100% - 140px);
		line-height: 20px;
		display: inline-table;
		border-radius: 5px;
		padding: 5px 15px;
		box-sizing: border-box;
		background: rgba(0,0,0,.7);
		color: #ff0000;
		font-size: 24rpx;
		overflow-y: scroll;
		position: fixed;
		left: 50%;
		-ms-transform: translate(-50%,0);
		-webkit-transform: translate(-50%,0);
		transform: translate(-50%,0);
		z-index: 99999;
		background: #ffdbda;
		border-radius: 10rpx;
		border: 2px solid #ff0000;
	}
	.aui-toast::-webkit-scrollbar {
		width: 1px;
	}
	.aui-toast-row .aui-toast-main{
		white-space: nowrap;
	}
	.aui-toast-row .aui-toast-main .aui-toast-icon{
		display: inline-block;
	}
	.aui-toast-top .aui-toast-main{
		display: flex;
	}
	.aui-toast-top .aui-toast-main .aui-toast-icon{
		display: inline-block;
		margin-right: 10rpx;
	}
	.aui-toast-top .aui-toast-main .aui-toast-icon image{
		width: 30rpx;
		height: 30rpx;
		vertical-align: middle;
	}
	.aui-toast-row .aui-toast-main .aui-toast-msg{
		display: inline-block;
		margin: 0 0 0 10px;
	}
	.aui-toast-bottom{
		bottom: -60px;
		-ms-animation: aui-toast-from-bottom .55s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
		-webkit-animation: aui-toast-from-bottom .55s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
		animation: aui-toast-from-bottom .55s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
	}
	.aui-toast-top{
		/* top: 120rpx; */
		-ms-animation: aui-toast-from-bottom .55s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
		-webkit-animation: aui-toast-from-bottom .55s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
		animation: aui-toast-from-bottom .55s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards;
	}
	.aui-toast-middle{
		text-align: center;
		left: 50%;
		top: 50%;
		-ms-transform: translate(-50%,-50%);
		-webkit-transform: translate(-50%,-50%);
		transform: translate(-50%,-50%);
		-ms-animation: aui-fade-in .3s ease-out forwards;
		-webkit-animation: aui-fade-in .3s ease-out forwards;
		animation: aui-fade-in .3s ease-out forwards;
	}
	.aui-toast-middle .aui-toast-main{
		width: 100%;
		white-space: nowrap;
	}
	.aui-toast-middle .aui-toast-main .aui-toast-icon{
		vertical-align: middle;
	}
	.aui-toast-middle .aui-toast-main .aui-toast-msg{
		font-size: 14px;
		vertical-align: middle;
	}
	.aui-toast-middle .aui-toast-main .aui-toast-icon image{
		width: 30px;
		height: 30px;
	}
	/* toast 从底部弹出显示动画 */
	@-ms-keyframes aui-toast-from-bottom{
		0%{bottom: 30px;opacity: 0;}
		100%{bottom: 70px;opacity: 1;}
	}
	@-webkit-keyframes aui-toast-from-bottom{
		0%{bottom: 30px;opacity: 0;}
		100%{bottom: 70px;opacity: 1;}
	}
	@keyframes aui-toast-from-bottom{
		0%{bottom: 30px;opacity: 0;}
		100%{bottom: 70px;opacity: 1;}
	}
</style>
