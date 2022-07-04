<template>
	<view class="tp-box tp-box-sizing tp-flex tp-flex-col tp-pd-30">
		
		<block v-for="(item,index) in deviceData" :key="index">
			<view class="tp-panel tp-device tp-flex tp-flex-row tp-flex-j-s tp-mg-b-30 tp-box-sizing tp-pd-25" :class="!item.status?'tp-device-close':''">
				
				<view class="tp-flex tp-flex-col tp-flex-1">
					<view class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-mg-b-20">
						<view class="iconfont tp-mg-r-20" :class=" item.icon?item.icon:'iconbengzhan'"></view><text>{{item.title}}</text>
					</view>
					<view class="tp-pd-t-b-05">时间：{{item.time}}</view>
					<view class="tp-pd-t-b-05">设备值：{{item.value}}</view>
					<view class="tp-pd-t-b-05">设备类型：{{item.type}}</view>
				</view>
				
				<view class="tp-flex tp-flex-col tp-flex-j-s tp-flex-a-c">
					<view>{{item.status?'已开启':'未开启'}}</view>
					<view class="tp-flex tp-flex-j-c tp-flex-a-c"><text class="iconfont iconkaiguan"></text></view>
				</view>
				
			</view>
		</block>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				deviceData:[
					{
						id:1000,
						icon:'iconbengzhan',
						title:'水泵1',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1001,
						icon:'iconbengzhan',
						title:'水泵2',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1002,
						icon:'iconbengzhan',
						title:'水泵3',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1003,
						icon:'iconbengzhan',
						title:'水泵4',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1000,
						icon:'iconbengzhan',
						title:'水泵1',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1001,
						icon:'iconbengzhan',
						title:'水泵2',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1002,
						icon:'iconbengzhan',
						title:'水泵3',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1003,
						icon:'iconbengzhan',
						title:'水泵4',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1000,
						icon:'iconbengzhan',
						title:'水泵1',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1001,
						icon:'iconbengzhan',
						title:'水泵2',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1002,
						icon:'iconbengzhan',
						title:'水泵3',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1003,
						icon:'iconbengzhan',
						title:'水泵4',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1000,
						icon:'iconbengzhan',
						title:'水泵1',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1001,
						icon:'iconbengzhan',
						title:'水泵2',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1002,
						icon:'iconbengzhan',
						title:'水泵3',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1003,
						icon:'iconbengzhan',
						title:'水泵4',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1000,
						icon:'iconbengzhan',
						title:'水泵1',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1001,
						icon:'iconbengzhan',
						title:'水泵2',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					},
					{
						id:1002,
						icon:'iconbengzhan',
						title:'水泵3',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:1
					},
					{
						id:1003,
						icon:'iconbengzhan',
						title:'水泵4',
						time:'2021-04-06 10:36:01',
						value:'1',
						type:'Device',
						status:0
					}
				]
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
}
.tp-panel{
	background: #FFFFFF;
	border-radius: 20rpx;
}
.tp-device{
	
}
.tp-device>view:first-child{
	
}
.tp-device>view:first-child>view{
	font-size: 28rpx;
	font-weight: 500;
	color: #999999;
}
.tp-device>view:first-child>view:first-child>view{
	font-size: 34rpx;
	font-weight: bold;
	color: #666666;
}
.tp-device>view:first-child>view:first-child>text{
	font-size: 30rpx;
	font-weight: bold;
	color: #666666;
}

.tp-device>view:last-child{
	width: 120rpx;
}
.tp-device>view:last-child>view:first-child{
	font-size: 28rpx;
	font-weight: 500;
	color: #30C7CE;
}
.tp-device>view:last-child>view:last-child{
	width: 64rpx;
	height: 64rpx;	
	opacity: 0.41;
	background: #82d4d8;
	border-radius: 20rpx;
}
.tp-device>view:last-child>view:last-child>text{
	color: #005b5f;
	font-size: 36rpx;
}
.tp-device.tp-device-close>view:last-child>view:first-child{
	color: #999999;
}
.tp-device.tp-device-close>view:last-child>view:last-child{
	background: #D6D6D8;
}
.tp-device.tp-device-close>view:last-child>view:last-child>text{
	color: #999999;
}
</style>
