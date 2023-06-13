<!--
  * DatePicke 时间组
  * ============================================================================
  * 版权所有 2019-2024 www.pfuni.cn，并保留所有权利。
  * 网站地址: http://www.pfuni.cn；
  * ----------------------------------------------------------------------------
  * 这不是一个自由软件！您只能在不用于商业目的的前提下对程序代码进行修改和
  * 使用；不允许对程序代码以任何形式任何目的的再发布。
  * ============================================================================
  *time 2019-10-17 14:39
  *version 1.0.0
-->
<template>
	<view class="pf-picker">
		<div class="mask" :class="{'show':showPicker}" @tap="maskTap" catchtouchmove="true"></div>
		<view class="pf-picker-cnt" :class="{'show':showPicker}">
			<view class="pf-picker-hd" catchtouchmove="true">
				<view class="pf-picker-btn" @tap="pickerCancel">取消</view>
				<view class="pf-picker-tit">选择时间</view>
				<view class="pf-picker-btn" :style="{'color':themeColor}" @tap="pickerConfirm">确定</view>
			</view>
			<view class="pf-picker-view">
				<picker-view indicator-style="height:80rpx;" :value="value" @change="bindChange">
					<picker-view-column v-if="yearStr">
						<view class="item" v-for="(item,index) in datas.years" :key="index">{{item}}年</view>
					</picker-view-column>
					<picker-view-column v-if="monthStr">
						<view class="item" v-for="(item,index) in datas.months" :key="index">{{item}}月</view>
					</picker-view-column>
					<picker-view-column v-if="dayStr">
						<view class="item"  v-for="(item,index) in datas.days" :key="index">{{item}}日</view>
					</picker-view-column>
					<picker-view-column v-if="hours">
						<view class="item" v-for="(item,index) in datas.hours" :key="index">{{item}}时</view>
					</picker-view-column>
					<picker-view-column v-if="minutes">
						<view class="item" v-for="(item,index) in datas.minutes" :key="index">{{item}}分</view>
					</picker-view-column>
					<picker-view-column v-if="seconds">
						<view class="item" v-for="(item,index) in datas.seconds" :key="index">{{item}}秒</view>
					</picker-view-column>
				</picker-view>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				value:[],
				datas: {},
				checkArr:[],//返回选中数据
				showPicker: false,
				yearStr:true,//年
				monthStr:true,//月
				dayStr:true,//日
				hours:true,//时
				minutes:true,//分
				seconds:true//秒
			}
		},
		props: {
			themeColor: {
				type: String,
				default () {
					return "#f00" //确定字体颜色
				}
			},
			startYear: { //开始时间
				type: String,
				default () {
					return "1970"
				}
			},
			endYear: { //结束时间
				type: [String,Number],
				default () {
					return new Date().getFullYear()+""
				}
			},
			val: { //设置选中时间格式--默认为当前时间
				type: String,
				default () {
					return " "  //年月日时分YYYY-MM-DD hh:mm:ss
				}
			}
		},
		watch:{
			mode(val){
				this.initData();
			},
			val(val){
				this.initData();
			}
		},
		created() {
		   //this.initData();
		},
		methods: {
		   //背景处理
			maskTap() {
				this.showPicker = false;
			},
			//显示
			show() {
				this.initData();//初始化时间
				this.showPicker = true;
			},
			//隐藏
			hide() {
				this.showPicker = false;
			},
			//点击取消
			pickerCancel() {
				this.showPicker = false;
			},
			//点击确定
			pickerConfirm(e) {
				let date=this.returnData()
				//console.log(date)
				this.$emit("confirm",date);
				this.showPicker = false;
			},
			//初始化时间
			initData() {
				this.datas = this.initPicker(this.startYear,this.endYear);
				this.selectedTimeInit();//处理选择
			},
			//返回数据处理
			returnData(){
				let date=[],result;
				if(this.yearStr){ //年
				    date.push(this.checkArr[0])
				}
				if(this.monthStr){ //月
				    date.push(this.checkArr[1])
				}
				if(this.dayStr){ //日
				    date.push(this.checkArr[2])
				}
				if(this.hours){ //时
				    date.push(this.checkArr[3])
				}
				if(this.minutes){//分
				    date.push(this.checkArr[4])
				}
				if(this.seconds){ //秒
				    date.push(this.checkArr[5])
				}
				//console.log(date.length)
				switch(date.length-1){ //返回时间格式2020 2020-01 2020-01-09 2020-01-09 22  2020-01-09 22:32 2020-01-09 22:32:34
					case 0: 
					result=date[0];
					break;
					case 1: 
					result=date[0]+'-'+date[1];
					break;
					case 2: 
					result=date[0]+'-'+date[1]+'-'+date[2];
					break;
					case 3: 
					result=date[0]+'-'+date[1]+'-'+date[2]+' '+date[3];
					break;
					case 4: 
					result=date[0]+'-'+date[1]+'-'+date[2]+' '+date[3]+":"+date[4];
					break;
					case 5:
					  result=date[0]+'-'+date[1]+'-'+date[2]+' '+date[3]+":"+date[4]+":"+date[5];
					break;
				}
				//console.log(result)
				return result;
			},
			//当前选中时间-默认处理
			selectedTimeInit(){
				let dateArray=this.checkValue(this.val);
				let crtDate = new Date();
				let yearStr=dateArray[0]?dateArray[0]:crtDate.getFullYear(); //年
				let monthStr=dateArray[1]?dateArray[1]:this.forMatNum(crtDate.getMonth() + 1);//月
				let dayStr=dateArray[2]?dateArray[2]:this.forMatNum(new Date(yearStr,monthStr,0).getDate());//日
				let hours=dateArray[3]?dateArray[3]:this.forMatNum(crtDate.getHours());//时
				let minutes=dateArray[4]?dateArray[4]:this.forMatNum(crtDate.getMinutes());//分
				let seconds=dateArray[5]?dateArray[5]:this.forMatNum(crtDate.getSeconds());//秒
				if(monthStr>12){
					console.log("时间格不正确,月不能大预12")
					monthStr=12;
				}
				if(dayStr>31){
					console.log("时间格不正确,日不能大预31");
					dayStr=31;
				}
				if(hours>24){
					console.log("时间格不正确,日不能大预23");
					hours="00";
				}
				if(minutes>59 || seconds>59 ){
					console.log("时间格不正确,分、秒不能大预59");
					dayStr=59;
				}
				let slctDate = [yearStr,monthStr,dayStr,hours,minutes,seconds]; //年月日分秒
				
				this.resetSelectDate(slctDate);
			},
			//刷新当前选中日期
			resetSelectDate(newValue) {	
				let pickVal=[0,0,0,0,0,0] //年月日时分秒
				for (let i = 0; i < newValue.length; i++){
					switch (i) {
						case 0://年
							pickVal[i]=this.queryItemForArray(this.datas.years,newValue[i]);
							break;
						case 1://月
							pickVal[i]=this.queryItemForArray(this.datas.months,newValue[i]);
							break;
						case 2://日
							pickVal[i]=this.queryItemForArray(this.datas.days,newValue[i]);
							break;
						case 3: //时
						   	 pickVal[i]=this.queryItemForArray(this.datas.hours,newValue[i]); 
							break;	
						case 4: //分
			                pickVal[i]=this.queryItemForArray(this.datas.minutes,newValue[i]); 
							break;	
						case 5://秒
						   pickVal[i]=this.queryItemForArray(this.datas.seconds,newValue[i]);
							break;						
					  }
				    this.checkArr[i] = newValue[i];//选中时间 
				}
				// console.log(pickVal)
			    this.$nextTick(()=>{
				  this.value=pickVal;
				})			
			},
			// 查询值在数组中对应的索引
			queryItemForArray(array,value) {
				for (let index = 0; index < array.length; index++) {
					if (array[index]==value) {
						return index;
					}
				}
			},
			//滚动获取值
			bindChange(val) {
				let arr=val.detail.value;
				let year,month,day,hour,minute,seconds;
				let dataS=[];
					year = this.datas.years[arr[0]];
					month = this.datas.months[arr[1]]
					day = this.datas.days[arr[2]];
					hour = this.datas.hours[arr[3]]
					minute = this.datas.minutes[arr[4]];
					seconds = this.datas.seconds[arr[5]]
				    dataS=[year,month,day,hour,minute,seconds];
				this.checkArr=dataS
			},
			//年月 
			initDays(year, month) { 
				let totalDays = new Date(year, month, 0).getDate();
				let dates = [];
				for (let d = 1; d <= totalDays; d++) {
					dates.push(this.forMatNum(d));
				};
				return dates;
			},
			//时间处理
			initPicker(start, end,step = 1) {
				let initstartDate = new Date(start);
				let endDate = new Date(end);
				let startYear = initstartDate.getFullYear();
				let startMonth = initstartDate.getMonth();
				let endYear = endDate.getFullYear();
				let years=[],months=[],days=[],hours=[],minutes=[],seconds=[];
				let totalDays = new Date(startYear, startMonth, 0).getDate();
				for (let s = startYear; s <= endYear; s++) {
					years.push(s + '');
				};
				for (let m = 1; m <= 12; m++) {
					months.push(this.forMatNum(m));
				};
				for (let d = 1; d <= totalDays; d++) {
					days.push(this.forMatNum(d));
				}
				for (let h = 0; h < 24; h++) {
					hours.push(this.forMatNum(h));
				}
				for (let m = 0; m < 60; m += step) {
					minutes.push(this.forMatNum(m));
				}
				for (let m = 0; m < 60; m += step) {
					seconds.push(this.forMatNum(m));
				}
				return {years,months,days,hours,minutes,seconds};
			},
			//处理小10时在前面加0
			forMatNum(num) { 
				return num < 10 ? '0' + num : num;
			},
			//验证时间是否正确
			checkValue(value){
				let example,strReg=[];
				let yearstrReg=/^\d{4}$/; //年2019
				let monthstrReg=/^\d{4}-\d{2}$/;//月 
				let daystrReg=/^\d{4}-\d{2}-\d{2}$/;//日
				let hoursReg=/^\d{4}-\d{2}-\d{2} \d{2}(?!:)/;//时 
				let minutesReg=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2}){0,1}?$/;//分
				let secondstrReg=/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;//秒
				if(secondstrReg.test(value)){
					 //console.log("秒")
					 example="2019-02-01 18:06:01";
					 let dVal=value.split(" ");
					 let dVal0=dVal[0].split("-");
					 let dVal1=dVal[1].split(":");
					     strReg=dVal0.concat(dVal1);
				}else if(minutesReg.test(value)){
					 //console.log("分")
					 example="2019-02-01 18:06:00或2019-02-01 18:06";
					 let dVal=value.split(" ");
					 let dVal0=dVal[0].split("-");
					 let dVal1=dVal[1].split(":");
					     strReg=dVal0.concat(dVal1);
					     this.seconds=false//秒
				}else if(hoursReg.test(value)){
					 //console.log("时")
					 example="2019-02-01 18:00:00或2019-02-01 18";
					 let dVal=value.split(" ");
					 let dVal0=dVal[0].split("-");
					     dVal0.push(dVal[1]);
					     strReg=dVal0;
					     this.minutes=false//分
					     this.seconds=false//秒
				}else if(daystrReg.test(value)){
					 //console.log("日")
					 example="2019-02-01";
					 strReg=value.split("-");
					 this.hours=false//时
					 this.minutes=false//分
					 this.seconds=false//秒
				}else if(monthstrReg.test(value)){
					 //console.log("月")
					 example="2019-02";
					 strReg=value.split("-");
					 this.dayStr=false//日
					 this.hours=false//时
					 this.minutes=false//分
					 this.seconds=false//秒
				}else if(yearstrReg.test(value)){
					 //console.log("年")
					 example="2019";
					 strReg.push(value);
					 this.monthStr=false//月
					 this.dayStr=false//日
					 this.hours=false//时
					 this.minutes=false//分
					 this.seconds=false//秒
				}else{
					//console.log("请传入正确的时间值，例value="+example+"");
				}
				return strReg;				
			},
		}
	}
</script>

<style lang="scss" scoped>
	.pf-picker {
		.mask {
			position: fixed;
			z-index: 1000000000;
			top: 0;
			right: 0;
			left: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.6);
			visibility: hidden;
			opacity: 0;
			transition: all 0.3s ease;
		}

		.mask.show {
			visibility: visible;
			opacity: 1;
		}

		.pf-picker-cnt {
			position: fixed;
			bottom: 0;
			left: 0;
			width: 100%;
			transition: all 0.3s ease;
			transform: translateY(100%);
			z-index: 3000000000;
		}

		.pf-picker-cnt.show {
			transform: translateY(0);
		}

		.pf-picker-hd {
			display: flex;
			padding: 22rpx 30rpx;
			background-color: #FFFFFF;
			position: relative;
			text-align: center;
			font-size: 32rpx;
			justify-content: space-between;
		}

		.pf-picker-hd:after {
			content: ' ';
			position: absolute;
			left: 0;
			bottom: 0;
			right: 0;
			height: 1rpx;
			border-bottom: 1rpx solid #e5e5e5;
			color: #e5e5e5;
			transform-origin: 0 100%;
			transform: scaleY(0.5);
		}

		.item {
			text-align: center;
			line-height: 80rpx;
			text-overflow: ellipsis;
			white-space: nowrap;
			font-size: 32rpx;
		}

		.pf-picker-view {
			width: 100%;
			height: 476rpx;
			overflow: hidden;
			background-color: rgba(255, 255, 255, 1);
			z-index: 666;
		}

		picker-view {
			height: 100%;
		}
	}
</style>
