<template>
	<view class="tp-box tp-flex tp-flex-col tp-box-sizing tp-flex tp-flex-col">
		
		<view class="tp-datetime-select tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-fixed tp-box-sizing tp-pd-t-b-25 tp-pd-l-r-30">
			<view class="tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c" @tap="doOpenSelectDateTime">
				<text class="tp-mg-r-10">{{date}}年{{month}}月</text>
				<view class="iconfont iconjiantou"></view>
			</view>
		</view>
		
		<view class="tp-pd-t-b-40"></view>
		
		<block v-for="(item,index) in logData" :key="index">
			<view class="tp-log tp-flex tp-flex-col tp-mg-t-15 tp-mg-l-r-30">
				<view class="tp-log-title tp-mg-t-15 tp-mg-b-20">{{item.date}}<text>/{{item.month}}月</text></view>
				<view class="tp-panel tp-flex tp-flex-col tp-box-sizing tp-pd-20">
					<block v-for="(items,indexs) in item.list" :key="indexs">
						<view class="tp-log-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c">
							<view class="tp-time">{{items.time}}</view>
							<view class="tp-circle tp-mg-l-r-20" :class=" items.status?'tp-active':'' "></view>
							<view class="tp-flex-1">{{items.log}}</view>
							<view><image :src="items.icon"></image></view>
						</view>
					</block>
				</view>
			</view>
		</block>
		
		<view class="tp-tmp"></view>		
		
		<DatePicke :startYear="startYear" :endYear="endYear" :val="selectedTime" @confirm="onConfirm" ref="DatePicke"></DatePicke>
		
	</view>
</template>

<script>
	// 
	import DatePicke from '@/components/uni/DatePicke/DatePicke.vue';
	// 
	export default {
		components:{
			DatePicke
		},
		data() {
			return {
				startYear:'2016',
				endYear:'2021',
				selectedTime:"2021-04",
				date:'2021',
				month:'04',
				logData:[
					{
						month:4,
						date:25,
						list:[
							{
								id:1000,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1001,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-oxygen.png',
								status:1
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							}
						]
					},
					{
						month:4,
						date:24,
						list:[
							{
								id:1000,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1001,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-oxygen.png',
								status:1
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							}
						]
					},
					{
						month:4,
						date:23,
						list:[
							{
								id:1000,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1001,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-oxygen.png',
								status:1
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							}
						]
					},
					{
						month:4,
						date:22,
						list:[
							{
								id:1000,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1001,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-oxygen.png',
								status:1
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							},
							{
								id:1002,
								time:'14:22',
								log:'PH值>7时，自动打开水泵',
								icon:'/static/icon/icon-small-ph.png',
								status:0
							}
						]
					}
				]
			}
		},
		methods: {
			//
			doOpenSelectDateTime:function(){
				this.$refs.DatePicke.show();
			},
			onConfirm:function(e){
				// 
				let dateTime = e;
				let dateArr = dateTime.split('-');
				// 
				this.date = dateArr[0];
				this.month = dateArr[1];
				// 
				this.selectedTime = this.date+'-'+this.month;
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
.tp-datetime-select{
	width: 100%;
	border-top: 1rpx solid #E2E2E2;
	background: #FFFFFF;
	top: 88rpx;
	left: 0;
	z-index: 9999;
	background: #FFFFFF;
}
.tp-datetime-select>view>text{
	font-size: 30rpx;
	font-weight: bold;
	color: ##333333;
}
.tp-datetime-select>view>view.iconfont{
	color: #333333;
	font-size: 26rpx;
}

.tp-panel{
	width: 100%;
	background: #FFFFFF;
	border-radius: 20rpx;
}
.tp-log-title{
	color: #333333;
	font-size: 32rpx;
	font-weight: bold;
}
.tp-log-title>text{
	color: #999999;
	font-size: 22rpx;
	font-weight: normal;
}
.tp-log-item{
	height: 100rpx;
	position: relative;
	z-index: 1;
}
.tp-log-item::before{
	content: '';
	height: 140rpx;
	border-left: 1rpx solid #F2F2F3;
	position: absolute;
	top: -10;
	left: 110rpx;
	z-index: -1;
}
.tp-log-item>view.tp-time{
	width: 80rpx;
	color: #434343;
	font-size: 28rpx;
}
.tp-log-item>view.tp-circle{
	width: 20rpx;
	height: 20rpx;
	background: #E2E2E2;
	border-radius: 50%;
}
.tp-log-item>view.tp-circle.tp-active{
	background: #32BAC0;
}
.tp-log-item>view:nth-child(3){
	font-size: 28rpx;
	font-weight: 400;
	color: #434343;
}
.tp-log-item>view:last-child{
	width: 50rpx;
	height: 50rpx;
}
.tp-log-item>view:last-child>image{
	width: 50rpx;
	height: 50rpx;
}
.tp-tmp{
	height: 35rpx;
}
</style>
