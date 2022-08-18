<template>
	<view class="tp-box tp-box-sizing tp-flex tp-flex-col tp-pd-b-30">
		
		<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略名称</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称!" placeholder-class="tp-plc" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略描述</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入描述!" placeholder-class="tp-plc" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略优先级</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入描述!" placeholder-class="tp-plc" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略类型</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">设备条件类型</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
		</view>
		
		<view class="tp-txt tp-box-sizing tp-pd-30">触发条件</view>
		
		<view class="tp-panel tp-panel-textarea tp-flex tp-flex-col tp-mg-l-r-30 tp-box-sizing tp-pd-20">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择业务</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">1号温棚</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>请选择设备</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">设备1</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择值</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">温棚</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item-i tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">选择关系<text class="iconfont iconjiantou tp-mg-l-10"></text></view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">—</view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c"><input type="text" placeholder="输入值" placeholder-class="tp-plc-i" /></view>
			</view>
		</view>
		
		<view class="tp-txt tp-box-sizing tp-pd-30">控制指令</view>
		
		<view class="tp-panel tp-panel-area tp-flex tp-flex-col tp-mg-l-r-30 tp-box-sizing tp-pd-t-20 tp-pd-b-10 tp-pd-l-r-20">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择业务</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">温棚</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>请选择设备</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">设备1</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择受控对象</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">继电器</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item-r tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c"></view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">
					<radio-group @change="radioChange">
						<label class="tp-radio"><radio value="r1" color="#32BAC0" checked="true" />关</label>
						<label class="tp-radio"><radio value="r2" color="#32BAC0" />开</label>
					</radio-group>
				</view>
			</view>
		</view>
		
		<view class="tp-panel tp-panel-area tp-flex tp-flex-col tp-mg-t-30 tp-mg-l-r-30 tp-box-sizing tp-pd-t-b-05 tp-pd-l-r-20">
			<view class="tp-ipt-item-r tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">策略状态</view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">
					<radio-group @change="radioChange">
						<label class="tp-radio"><radio value="r1" color="#32BAC0" checked="true" />关</label>
						<label class="tp-radio"><radio value="r2" color="#32BAC0" />开</label>
					</radio-group>
				</view>
			</view>
		</view>
		
		<view class="tp-panel tp-panel-bot tp-flex tp-flex-col tp-mg-t-30 tp-mg-l-r-30 tp-box-sizing tp-pd-t-b-05">
			<view class="tp-mg-t-b-10">
				<label>
					<checkbox value="cb" checked="true" color="#434343" style="transform:scale(0.7)" />下发策略到终端设备
				</label>
			</view>
			<view>（备注: 仅一个条件，和一个指令，且属于同一设备的情况方向允许下发）</view>
		</view>
		
		<view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-30">
			<button class="tp-btn" :loading="loading":class="{'vc-btn-disabled':disabled}" @tap="doUpdateSubmit">保 存</button>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				loading:false,
				disabled:false,
			}
		},
		methods: {
			
		}
	}
</script>

<style>
.tp-box{
	width: 100%;
	min-height: 100vh;
	background: #F8F8F8;
	border-top: 1rpx solid #F6F6F6;
}
.tp-panel{
	background: #FFFFFF;
}
.tp-ipt-item{
	border-bottom: 1rpx solid #F1F1F1;
}
.tp-ipt-item>view:first-child{
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
}
.tp-ipt-item>input{
	font-size: 30rpx;
}
.tp-ipt-item>view:last-child{
	
}
.tp-ipt-item>view:last-child>text:first-child{
	font-size: 26rpx;
	font-weight: 500;
	color: #999999;
}
.tp-ipt-item>view:last-child>view:last-child{
	font-size: 26rpx;
	font-weight: 500;
	color: #999999
}
.tp-panel>.tp-ipt-item:last-child{
	border-bottom:none
}
.tp-txt{	
	font-size: 30rpx;
	font-weight: bold;
	color: #434343;	
}
.tp-ipt-item-i{
	
}
.tp-ipt-item-i>view:first-child,.tp-ipt-item-i>view:last-child{
	width: 44%;
	height: 56rpx;
	border: 1px solid #A4A4A4;
	border-radius: 4px;
	background: #FFFFFF;
}
.tp-ipt-item-i>view:first-child{
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
}
.tp-ipt-item-i>view:first-child>text{
	font-size: 26rpx;
	font-weight: bold;
	color: #333333;
}
.tp-ipt-item-i>view:nth-child(2){
	width: 4%;
}
.tp-ipt-item-i>view:last-child>input{ 
	width: 100%;
	height: 56rpx;
	text-align: center;
}
.tp-plc{
	font-size: 30rpx;
	font-weight: 500;
	color: #999999;
}
.tp-plc-i{
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
}
.tp-panel-area{
	border-radius: 10px;
}
.tp-panel-area>view:first-child{
	font-size: 26rpx;
	font-weight: bold;
	color: #666666;
}
.tp-panel-area>view:last-child{
		
}
.tp-panel-area>view:last-child>textarea{
	width: 100%;
	height: 290rpx;
	border: 1px solid #E8E8E8;
	border-radius: 10px;
}
.tp-ipt-item-r>view:first-child{
	font-size: 30rpx;
	font-weight: bold;
	color: #333333;
}
.tp-radio{
	font-size: 26rpx;
	font-weight: 500;
	color: #333333;
}
.tp-radio>radio{
	transform:scale(0.7)
}
.tp-panel-bot{
	background: none;
}
.tp-panel-bot>view:first-child{
	font-size: 28rpx;
	font-weight: bold;
	color: #434343;
}
.tp-panel-bot>view:last-child{
	font-size: 24rpx;
	font-weight: 400;
	color: #999999;
	line-height: 40rpx;
}
.tp-btn{
	width: 100%;
	height: 86rpx;
	line-height: 86rpx;
	background: #343436;
	box-shadow: 0rpx 8rpx 31rpx 1rpx rgba(147, 147, 147, 0.35);
	border-radius: 10rpx;
	font-size: 30rpx;
	font-weight: bold;
	color: #FFFFFF;
}
.vc-btn-disabled{
	background: #888888;
}
</style>
