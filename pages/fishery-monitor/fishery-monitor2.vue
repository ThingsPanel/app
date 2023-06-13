<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-pd-l-r-30">
			<!-- 已登录 -->
			<view :style="{marginTop: marginTop}">
				<!-- <view class="tp-status-bar"></view> -->
				<view class="tp-fishery-select tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
					<view style="display: flex;" @click="toMore">
						<view class="iconmore" style="margin-top: 10rpx;" @click='toShowNavDrawer'>
							<image src="/static/icon/more.png">
								<view class="title">{{currentGroup.device_group}}</view>
						</view>
					</view>
				</view>
				<view class="tp-fishery-top"></view>
				<view class="tp-title tp-mg-t-25" :style="{marginTop: marginConTop,marginBottom: '36rpx'}">设备监控
					<view class="tp-add" @click="addEqp">
						<image src="../../static/image/scan.png"></image>
					</view>
				</view>
				<view class="device_list">
					<view class="device_item" v-for="(item,index) in deviceList" :key="index"
						@click="clickDevice(item)">
						<view class="device_name">
							<view class="device_name_l">
								<view class="item-name">
									{{item.device_name}}									
								</view>
								<view class="item-info">
									<span v-if="item.latest_ts && TimeDifference(formatDate(item.latest_ts),formatDate(parseInt(
									new Date().getTime() *
									1000))) <= 30"><i></i>在线</span>
									<!-- <span v-if="item.latest_ts && TimeDifference(formatDate(item.latest_ts),formatDate(parseInt(
									new Date().getTime() *
									1000))) > 30" class='grey'><i></i>离线</span> -->
									<span v-else class='grey'><i></i>离线</span>
									<view class="item-time" v-if="item.latest_ts_name && item.latest_ts_name != null">
										更新时间：{{item.latest_ts_name}}
									</view>
								</view>
								
							</view>
							<view class="device_name_r" v-if="item.gateway_name">
								{{item.gateway_name}}
							</view>
						</view>
						<!-- <view class="line">

						</view>
						<view class="device_tab" v-if="item.valuesNew.length > 0">
							<view v-for="(i,iIndex) in item.valuesNew" :key="iIndex"
								@click.stop="changeIndex(item,i,iIndex)"
								:class="item.currentIndex == iIndex ?'device_tab_item active':'device_tab_item'">
								<view class="tab-label" v-if="i.name">
									{{i.name}}
								</view>
								<view class="tab-value" v-if="i.value">
									{{i.value}}
									<view class="value-unit" v-if="i.unit">
										{{i.unit}}
									</view>
								</view>
							</view>
						</view>
						<view class="line" v-if="item.controlData.length > 0">

						</view>
						<view v-if="item.controlData.length > 0" v-for="(sw,swIndex) in item.controlData"
							:key="swIndex">
							<view class="device_switch">
								<view class="switch_l">
									<view class="switch_l_name">
										{{sw.typeName}}
									</view>
									<view class="switch_l_state">
										<span v-if="sw.state == 1">开</span>
										<span v-if="sw.state == 0">关</span>
									</view>
								</view>
								<view class="switch_r" v-if="!sw.disabled">
									<image src="/static/icon/switch_on.png" @click.stop="changSwitch(item,sw)"
										v-if="sw.state == 1">
										<image src="/static/icon/switch_close.png" @click.stop="changSwitch(item,sw)"
											v-if="sw.state == 0">
								</view>
							</view>
						</view> -->
					</view>
					<!-- 分页加载 -->
					<!-- <view class="uni-tab-bar-loading" @click="toLoadEqupMore(active)" v-if="loadMoreEqupShow">
						<uni-load-more :status="statusEqupType" :contentText="contentText"></uni-load-more>
					</view> -->
				</view>
				<!-- <view class="tp-title tp-mg-t-25" style="margin-top: 75rpx; margin-bottom: 36rpx;">操作日志与状态</view>
				<block>
					<view class="tp-log tp-flex tp-flex-col tp-mg-t-15">
						<view class="tp-panel tp-flex tp-flex-col tp-box-sizing tp-pd-20"
							v-for="(item,index) in logData" :key="index" @click="logInfo(item, index)">
							<view class="tp-log-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c">
								<view class="tp-time">{{item.cteate_time}}</view>
								<view class="tp-circle tp-mg-l-r-20" :class="index==currentIndex?'tp-active':'' "
									style="margin-left: 10rpx;">
								</view>
								<view class="tp-flex-1">{{item.remark}}</view>
								<view v-if="index==currentIndex">
									<image src="../../static/icon/log_icon_on.png"></image>
								</view>
								<view v-else>
									<image src="../../static/icon/log_icon.png"></image>
								</view>
							</view>
						</view>
						<view class="uni-tab-bar-loading" @click="toLoadMore(active)" v-if="loadMoreShow">
							<uni-load-more :status="statusType" :contentText="contentText"></uni-load-more>
						</view>
					</view>
				</block>
				<view class="tp-tmp"></view> -->
			</view>
		</view>
		<!-- 菜单抽屉 -->
		<uni-drawer ref="navDrawer" :mask="true" :maskClick="true" :width="300" :drawerTop='topHeight'>
			<scroll-view scroll-y :style="{height:height - 80 + 'px'}" style="padding-top: 50rpx;">
				<view class="draw-title" v-for='(item,index) in ywData' :key='index'>
					<h3 @click='getYTData(item)'>{{item.name}}
						<uni-icons :type="item.secondShow?'bottom':'top'" size="15" class="rightIcons"></uni-icons>
					</h3>
					<view class="draw-title-list" v-for="(equip,equipIndex) in item.equipLists" :key="equipIndex"
						v-if="item.equipLists && item.equipLists.length > 0 && item.secondShow"
						@click="toClickEquip(item, equip)">
						<view class="list-item">
							<text class="item_text">{{equip.device_group}}</text>
						</view>
					</view>
				</view>
			</scroll-view>
		</uni-drawer>
		<!-- 日志详情 -->
		<uni-popup ref="logoPopup" type="bottom" :mask="true" :maskClick="true">
			<view class="logInfo">
				<view class="info_title">
					日志详情
					<image src="../../static/icon/close.png" alt="" @click="$refs.logoPopup.close()">
				</view>
				<view class="info_header">
					<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
					</view>
					<view class="info_header_d">
						{{currentLog.remark}}
					</view>
					<span class="info_header_t">{{currentLog.cteate_time}}</span>
				</view>
				<view class="info_list">
					<view class="item">
						<view class="value">
							设备名称：
						</view>
						<view class="label">
							{{currentLog.device_name}}
						</view>
					</view>
					<view class="item">
						<view class="value">
							设备分组名称：
						</view>
						<view class="label">
							{{currentLog.asset_name}}>{{currentLog.device_name}}
						</view>
					</view>
					<view class="item">
						<view class="value">
							业务名称：
						</view>
						<view class="label">
							{{currentLog.business_name}}
						</view>
					</view>
					<view class="item">
						<view class="value">
							操作类型：
						</view>
						<view class="label" v-if="currentLog.operation_type == '1'">
							定时触发
						</view>
						<view class="label" v-if="currentLog.operation_type == '2'">
							手动控制
						</view>
					</view>
					<view class="item">
						<view class="value">
							指令：
						</view>
						<view class="label">
							{{currentLog.instruct}}
						</view>
					</view>
					<view class="item">
						<view class="value">
							发送结果：
						</view>
						<view class="label" v-if="currentLog.send_result == '1'">
							成功
						</view>
						<view class="label" v-if="currentLog.send_result == '2'">
							失败
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" direction="row" location="top"></cys-toast>
	</view>
</template>

<script>
	var socketOpen = false;
	var socketMsgQueue = {
		wid: '',
		config: {
			startTs: '0',
			endTs: '0',
			latestTime: '10',
			operator: 'AVG',
			interval: '15000'
		}
	};
	var Dissolved_Oxygen1, PH1, temperature1;
	//
	import {
		mapState
	} from "vuex";
	//
	export default {
		data() {
			return {
				marginConTop: 0,
				currentDataIndex: -1,
				currentD: -1,
				deviceList: [],
				currentIndex: 0,
				currentLog: {},
				currentYw: '',
				topHeight: 0,
				height: 0,
				marginTop: 0,
				isMore: false,
				ytName: '',
				isGetPhone: false,
				fishery: 1000,
				oxygen: 66,
				ph: 6.5,
				logData: [],
				userInfo: {
					isAuth: false,
					isLogin: false,
				},
				isLogin: false,
				wxData: {
					iv: '',
					encryptedData: '',
				},
				toast: {
					msg: ''
				},
				ytData: [],
				currentDashboardId: '', //当前渔场的id
				ywData: [],
				statusType: 'more', //分页状态
				loadMoreShow: true,
				contentText: {
					contentdown: '上拉显示更多数据',
					contentrefresh: '正在加载...',
					contentnomore: '没有数据了'
				},
				statusEqupType: 'more', //分页状态
				loadMoreEqupShow: true,
				currentGroup: null,
				ktxStatusHeight: 0,
				timer: null
			}
		},
		// 
		onReady() {
			const {
				statusBarHeight,
				platform
			} = uni.getSystemInfoSync();
			//页面的高度
			uni.setStorageSync('pageHeight', uni.getSystemInfoSync().windowHeight + 'px');
			// 状态栏高度
			uni.setStorageSync('statusBarHeight', statusBarHeight);
			// #ifdef MP-WEIXIN
			const {
				top,
				height
			} = uni.getMenuButtonBoundingClientRect();
			// 胶囊按钮高度 一般是32 如果获取不到就使用32
			uni.setStorageSync('menuButtonHeight', height ? height : 32);
			// 判断胶囊按钮信息是否成功获取
			if (top && top !== 0 && height && height !== 0) {
				const navigationBarHeight = (top - statusBarHeight) * 2 + height;
				// 导航栏高度
				uni.setStorageSync('navigationBarHeight', navigationBarHeight);
			} else {
				uni.setStorageSync('navigationBarHeight', platform === 'android' ? 48 : 40);
			}
			// 导航栏和状态栏高度
			var navigationBarAndStatusBarHeight = uni.getStorageSync('statusBarHeight') + uni.getStorageSync(
				'navigationBarHeight') + 'px';
			this.topHeight = uni.getStorageSync('statusBarHeight') + uni.getStorageSync(
				'navigationBarHeight') - this.ktxStatusHeight + 100 + 'px';
			// #endif
		},
		//
		onLoad(options) {
			this.$store.commit('zerOingOffser'); //清空日志页码
			this.$store.commit('zerOingEqupPage'); //清空设备页码
			
			let systemInfo = wx.getSystemInfoSync();
			// px转换到rpx的比例
			let pxToRpxScale = 750 / systemInfo.windowWidth;
			// 状态栏的高度
			let ktxStatusHeight = systemInfo.statusBarHeight * pxToRpxScale;
			this.ktxStatusHeight = ktxStatusHeight
			// 导航栏的高度
			let navigationHeight = 44 * pxToRpxScale;
			this.marginTop = ktxStatusHeight + 'rpx';
			this.marginConTop = ktxStatusHeight + 12 + 'rpx'
			this.isLogin = this.$login.isLoginType().isLogin
			// this.ywData = []
			// this.showData()

		},
		onShow() {
			this.isLogin = this.$login.isLoginType().isLogin
			this.$store.state.list.equpPage = 1
			this.ywData = []
			this.showData();
		},
		// 上拉加载更多,onReachBottom上拉触底函数
		onReachBottom() {
			if (this.statusType == 'more') {
				this.toLoadMore();
			}
			if (this.statusEqupType == 'more') {
				this.toLoadEqupMore()
			}
		},
		mounted() {
			uni.getSystemInfo({
				success: res => {
					// #ifdef H5
					this.height = res.screenHeight + 45;
					// #endif
					// #ifdef MP-WEIXIN
					this.height = res.screenHeight - 200;
					// #endif
					// #ifdef APP
					this.height = res.screenHeight
					// #endif
				}
			});
		},
		// onLoad(options) {
		// 	this.$store.commit('zerOingOffser'); //清空日志页码
		// 	this.$store.commit('zerOingEqupPage'); //清空设备页码
		// },
		//
		methods: {
			showData(){
				if (uni.getStorageSync("currentYw").id) {
					if (uni.getStorageSync("currentGroup").id) {
						this.deviceList = []
						this.currentGroup = uni.getStorageSync("currentGroup")
						this.getDeviceList()
					} else {
						this.getYTData(uni.getStorageSync("currentYw"))
					}
				} else {
					this.getYwData()
				}
				// 获取日志接口
				// this.getWarningList()
				// let count = 0;
				// setInterval(() => {
					// count++;
					// if (count % 10 === 0) {
						// this.getYwData()
						// if (uni.getStorageSync("currentYw").id) {
						// 	if (uni.getStorageSync("currentGroup").id) {
						// 		this.deviceList = []
						// 		this.currentGroup = uni.getStorageSync("currentGroup")
						// 		this.getDeviceList()
						// 	} else {
						// 		this.getYTData(uni.getStorageSync("currentYw"))
						// 	}
						// } else {
						// 	this.getYwData()
						// }
						// 获取日志接口
						// this.getWarningList()
					// }
				// }, 1000)
			},
			changeIndex(item, i, iIndex) {
				item.currentIndex = iIndex
				this.$forceUpdate()
			},
			// 点击设备
			clickDevice(data, dataIndex) {
				var state = ''
				if (data.latest_ts && this.TimeDifference(this.formatDate(data.latest_ts), this.formatDate(parseInt(
						new Date().getTime() *
						1000))) > 30) {
					state = 0
				}
				if (data.latest_ts && this.TimeDifference(this.formatDate(data.latest_ts), this.formatDate(parseInt(
						new Date().getTime() *
						1000))) <= 30) {
					state = 1
				}
				this.currentDataIndex = dataIndex
				uni.navigateTo({
					url: './deviceDetail?type=' + data.type + '&device_id=' + data.device_id + '&device_name=' +
						data.device_name + '&latest_ts_name=' + data.latest_ts_name + '&state=' + state
				})
			},
			// 日志详情
			logInfo(log, index) {
				this.currentLog = log
				this.currentIndex = index
				this.$refs.logoPopup.open()
			},
			// 点击设备分组
			toClickEquip(yw, equip) {
				uni.setStorageSync('ywId', yw.id)
				uni.setStorageSync('ywName', yw.name)
				uni.setStorageSync('currentGroup', equip)
				this.$store.state.list.equpPage = 1
				this.ywData = []
				this.showData();
				this.currentGroup = equip
				this.$refs.navDrawer.close()
			},
			// 展示分组
			toShowNavDrawer() {
				if (this.ywData.length == 0) {
					this.getYwData()
				}
				this.$refs.navDrawer.open()
			},
			// 改变设备开关
			changSwitch(dev, sw) {
				var stateNum;
				if (sw.state == 0) {
					stateNum = 1
				} else if (sw.state == 1) {
					stateNum = 0
				}
				var values = {
					[sw.name]: stateNum
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/device/operating_device', {
					device_id: dev.device_id,
					values: values
				}, 'post').then(res => {
					if (res.code === 200) {
						this.toast.msg = '修改状态成功';
						this.$refs.toast.show();
						this.getContorl(dev, sw)
					}
					// uni.hideLoading()
				}).finally(() => {});
				setTimeout(()=>{
					uni.hideLoading()
				},1000);
			},
			// 获取业务列表
			getYwData() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/business/index', {
					page: 1,
					limit: 100
				}, 'post').then(res => {
					if (res.code === 200) {
						this.ywData = res.data.data
						this.ywData.forEach(item => {
							item.secondShow = false
						})
						this.getYTData(res.data.data[0])
						uni.setStorageSync('ywName', res.data.data[0].name)
						uni.setStorageSync('ywId', res.data.data[0].id)
					}
				}).finally(() => {
					// uni.hideLoading()
				});
				setTimeout(()=>{
					uni.hideLoading()
				},1000);
			},
			//获取业务下分组列表
			getYTData(item) {
				uni.setStorageSync('currentYw', item)
				// uni.showLoading({
				// 	title: '加载中'
				// });
				this.API.apiRequest('/api/asset/list/d', {
					business_id: item.id
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							item.secondShow = !item.secondShow
							const data = res.data
							data.forEach(t => {
								t.device_group = t.device_group.replace(/\//g, '');
							})
							this.ywData.forEach(d => {
								if (item.id == d.id) {
									d.equipLists = data
								}
							})
							console.log("aaa",this.currentGroup);
							if(!this.currentGroup){
								console.log("currentGroup")
								this.currentGroup = data[0]
								this.deviceList = []
								this.getDeviceList()
							}
							this.currentGroup = data[0]
							this.$forceUpdate()
						}
					}
					// setTimeout(()=>{
						// uni.hideLoading();
					// },500);
				});
			},
			//获取操作日志
			getWarningList() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/conditions/log/index', {
					current_page: this.$store.state.list.offset,
					per_page: 10
				}, 'post').then(res => {
					if (res.code === 200) {
						var data = res.data.data;
						var lastTableData = [];
						if (data.length > 0) {
							let pauArry = data;
							/* 分页 */
							let pageSize = 10;
							if (pageSize == data.length) {
								this.statusType = 'more';
								this.loadMoreShow = true;
							} else {
								this.statusType = 'noMore';
							}
							let newTableData = this.logData.concat(pauArry);
							lastTableData = newTableData;
						} else {
							this.statusType = 'noMore';
							lastTableData = this.logData.concat([]);
						}
						this.logData = lastTableData;

					} else {
						this.loadMoreShow = false;
						this.statusType = 'noMore';
						this.toast.msg = res.msg;
						this.$refs.toast.show();
					}
				});
				setTimeout(()=>{
					uni.hideLoading()
				},1000)
			},
			// 加载更多
			toLoadMore() {
				// 还有数据
				if (this.statusType == 'more') {
					this.$store.commit('addOffset');
					this.getWarningList();
				} else if (this.statusType == 'noMore') {}
			},
			toLoadEqupMore() {
				// 还有数据
				if (this.statusEqupType == 'more') {
					this.$store.commit('addEqupPage');
					this.getDeviceList();
				} else if (this.statusEqupType == 'noMore') {}
			},
			toLoadModelMore() {
				// 还有数据
				if (this.statusModelType == 'more') {
					this.$store.commit('addModelPage');
					this.getDetail();
				} else if (this.statusModelType == 'noMore') {}
			},
			//添加设备
			addEqp() {
				let _this = this
				// 允许从相机和相册扫码
				uni.scanCode({
					success: function(res) {
						let result = res.result
						uni.navigateTo({
							url: './addMonitor?code=' + result + '&id=' + _this.currentGroup.id,
						})
					}
				});
			},
			//查看更多鱼塘
			toMore() {
				this.isMore = true
			},
			// 获取设备列表
			getDeviceList() {
				var newData = {};
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/device/list', {
					asset_id: this.currentGroup.id,
					current_page: this.$store.state.list.equpPage,
					per_page: 20
				}, 'post').then(res => {
					if (res.code === 200) {
						var newData = res.data.data;
						var data = []
						if (newData.length > 0) {
							newData.forEach(item => {
								if (item.device_type != 2) {
									data.push(item)
								}
							})
						}
						var lastTableData = [];
						if (data.length > 0) {
							let pauArry = data;
							/* 分页 */
							let pageSize = 20;
							if (pageSize == data.length) {
								this.statusEqupType = 'more';
								this.loadMoreEqupShow = true;
							} else {
								this.statusEqupType = 'noMore';
							}
							let newTableData = this.deviceList.concat(pauArry);
							lastTableData = newTableData;
						} else {
							this.statusEqupType = 'noMore';
							lastTableData = this.deviceList.concat([]);
						}
						this.deviceList = lastTableData;
						this.deviceList.forEach(item => {
							item.currentIndex = 0
							if (item.latest_ts && item.latest_ts != null) {
								item.latest_ts_name = this.formatDate(item.latest_ts)
							}
							item.chart_data = {}
							this.getDetail(item) // 获取组件信息
						})
					} else {
						this.loadMoreEqupShow = false;
						this.statusEqupType = 'noMore';
						this.toast.msg = res.msg;
						this.$refs.toast.show();
					}
				}).finally(() => {
					
				})
				setTimeout(()=>{
					uni.hideLoading()
				},1000);
			},
			// 插件查询
			getDetail(device) {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/device/model/list', {
					id: device.type,
					current_page: 1,
					per_page: 1
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data.data.length > 0) {
							var data = res.data.data[0];
							device.valuesNew = []
							device.controlData = []
							device.chart_data = JSON.parse(data.chart_data)
							// 
							if (device.chart_data.chart.length > 0) {
								device.chart_data.chart.forEach(ch => {
									if (ch.controlType == 'dashboard') {
										if (ch.mapping && ch.mapping.length > 0) {
											ch.mapping.forEach(map => {
												var obj = {
													name: map,
													value: '',
													unit: ''
												}
												device.valuesNew.push(obj)
											})
										}
									}
									if (ch.controlType == 'control') {
										var obj = {
											name: ch.series[0].mapping.value,
											typeName: ch.name,
											state: '',
											disabled: ch.disabled
										}
										device.controlData.push(obj)
									}
								})
							}

							if (device.valuesNew.length > 0) {
								device.valuesNew.forEach(va => {
									for (let key in device.values) {
										if (va.name == key) {
											va.value = device.values[key]
										}
									}
								})
							}
							if (device.chart_data.tsl.properties && device.chart_data.tsl.properties.length > 0) {
								device.chart_data.tsl.properties.forEach(d => {
									if (device.valuesNew && device.valuesNew.length > 0) {
										device.valuesNew.forEach(i => {
											if (d.name == i.name) {
												i.unit = d.unit
											}
										})
									}
								})
							}
							if (device.controlData.length > 0) {
								device.controlData.forEach(va => {
									for (let key in device.values) {
										if (va.name == key) {
											va.state = device.values[key]
										}
									}
									this.getContorl(device, va)
								})
							}
							this.$forceUpdate()
						}
					} else {
						this.toast.msg = res.msg;
						this.$refs.toast.show();
					}
					setTimeout(()=>{
						uni.hideLoading()
					},1000);
				})
			},
			// 定时获取开关
			getContorl(device, con) {
				const delayTime = 60 * 1000
				this.getDevieceKv(device, con)
				// 清除定时器
				clearInterval(this.timer)
				this.timer = setInterval(() => {
					this.getContorl(device, con)
				}, delayTime)
			},
			// 获取设备的开关状态
			getDevieceKv(device, con) {
				var newArry = []
				newArry.push(con.name)
				// uni.showLoading({
				// 	title: '加载中'
				// });
				this.API.apiRequest('/api/kv/current', {
					entity_id: device.device_id,
					attribute: newArry
				}, 'post').then(res => {
					if (res.code === 200) {
						// uni.hideLoading()
						if (res.data && res.data.length > 0) {
							for (let key in res.data[0]) {
								if (con.name == key && res.data[0][key]) {
									con.state = res.data[0][key]
								}
							}
							this.$forceUpdate()
						}
					}
				});
			},
			// 时间格式转化
			formatDate(shijianchuo) {
				//shijianchuo是整数，否则要parseInt转换
				var time = new Date(shijianchuo / 1000);
				var y = time.getFullYear();
				var m = time.getMonth() + 1;
				var d = time.getDate();
				var h = time.getHours();
				var mm = time.getMinutes();
				var s = time.getSeconds();
				return y + '-' + this.add0(m) + '-' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this
					.add0(s);
			},
			add0(m) {
				return m < 10 ? '0' + m : m
			},
			TimeDifference(time1, time2) {
				//判断开始时间是否大于结束日期
				if (time1 > time2) {
					return false;
				}

				//截取字符串，得到日期部分"2009-12-02",用split把字符串分隔成数组
				var begin1 = time1.substr(0, 10).split("-");
				var end1 = time2.substr(0, 10).split("-");

				//将拆分的数组重新组合，并实例成化新的日期对象
				var date1 = new Date(begin1[1] + - +begin1[2] + - +begin1[0]);
				var date2 = new Date(end1[1] + - +end1[2] + - +end1[0]);

				//得到两个日期之间的差值m，以分钟为单位
				//Math.abs(date2-date1)计算出以毫秒为单位的差值
				//Math.abs(date2-date1)/1000得到以秒为单位的差值
				//Math.abs(date2-date1)/1000/60得到以分钟为单位的差值
				var m = parseInt(Math.abs(date2 - date1) / 1000 / 60);

				//小时数和分钟数相加得到总的分钟数
				//time1.substr(11,2)截取字符串得到时间的小时数
				//parseInt(time1.substr(11,2))*60把小时数转化成为分钟
				var min1 = parseInt(time1.substr(11, 2)) * 60 + parseInt(time1.substr(14, 2));
				var min2 = parseInt(time2.substr(11, 2)) * 60 + parseInt(time2.substr(14, 2));

				//两个分钟数相减得到时间部分的差值，以分钟为单位
				var n = min2 - min1;

				//将日期和时间两个部分计算出来的差值相加，即得到两个时间相减后的分钟数
				var minutes = m + n;
				return minutes
			}
		}
	}
</script>
<style scoped lang="css">
	@import '@/common/fishery-monitor.css';

	.rightIcons {}

	.draw-title {}

	.draw-title h3 {
		height: 109rpx;
		line-height: 109rpx;
		border-bottom: 1rpx solid #EDEEF2;
		font-size: 28rpx;
		font-family: Source Han Sans CN;
		font-weight: 500;
		color: #494857;
		padding-left: 44rpx;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		width: 500rpx;
	}

	.draw-title h3 .rightIcons {
		margin-right: 57rpx;
	}

	.draw-title .draw-title-list {
		height: 109rpx;
		line-height: 109rpx;
		border-bottom: 1rpx solid #EDEEF2;
		font-size: 28rpx;
		font-family: Source Han Sans CN;
		font-weight: 500;
		color: #494857;
		padding-left: 82rpx;

	}

	.draw-title .draw-title-list .item_text {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		width: 400rpx;
	}
</style>
