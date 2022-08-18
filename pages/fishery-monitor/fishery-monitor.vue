<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-pd-l-r-30">
			<!-- 已登录 -->
			<view :style="{marginTop: marginTop}">
				<!-- <view class="tp-status-bar"></view> -->
				<view class="tp-fishery-select tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c">
					<view v-if="ywData.length >0" style="display: flex;" @click="toMore">
						<view class="iconmore" style="margin-top: 10rpx;" @click='toShowNavDrawer'>
							<image src='/static/icon/more.png'></image>
							<view class="title">{{currentGroup.device_group}}</view>
						</view>
					</view>
				</view>
				<view class="tp-grid-three tp-mg-t-25">
					<view class="tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing"
						v-for="(device, index) in deviceList" :key="index" @click="currentD = index">
						<view class="list_item" v-if="device.current_data.length > 0">
							<view class="tp-flex tp-flex-col tp_list" v-for="(data,dataIndex) in device.current_data"
								:style="{background:currentD == index && currentDataIndex == dataIndex ? '#207AF5':''}"
								@click="currentDataIndex = dataIndex">
								<view class="device_name"
									:style="{color:currentD == index && currentDataIndex == dataIndex? '#fff':''}"
									v-if="device.name && data.name">
									{{device.name}}~{{data.name}}
								</view>
								<view class="device_unit"
									:style="{color:currentD == index && currentDataIndex == dataIndex? '#fff':''}">
									{{data.value}}
									<text class="tp-mg-l-05"
										:style="{color:currentD == index && currentDataIndex == dataIndex? '#fff':''}">mg/l</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="tp-title tp-mg-t-25" style="margin-top: 51rpx; margin-bottom: 48rpx;">设备状态
					<!-- <view class="tp-add" @click="addEqp"> + 添加设备</view> -->
				</view>
				<view class="tp-panel-two tp-mg-t-25" v-if="deviceSwtichList.length > 0">
					<block v-for="(item,index) in deviceSwtichList" :key="index">
						<view
							class="tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-l-r-20 tp-pd-t-b-15 eq_item"
							v-for="(swith,swithIndex) in item.current_data"
							:class="swith.value == 0?'tp-device-close':''">
							<view class="tp-flex tp-flex-row">
								<view class="tp-mg-t-b-10 iconfontImg">
									<image src="/static/icon/device_close.png" v-if="swith.value == 0"> </image>
									<image src="/static/icon/device_on.png" v-if="swith.value == 1"> </image>
								</view>
								<view style="margin-left: 24rpx;">
									<view class="tp-mg-b-05 sp_item_title">{{item.name}}~{{swith.name}}</view>
									<view class="tp-mg-b-05 sp_item_status" v-if="swith.value == 0">关闭</view>
									<view class="tp-mg-b-05 sp_item_status" v-if="swith.value == 1">开启</view>
								</view>
							</view>
							<view>
								<view class="tp-flex tp-flex-j-c tp-flex-a-c switch"
									@click="changSwitch(item,swith,index)">
									<image src="/static/icon/switch_on.png" v-if="swith.value == 1"></image>
									<image src="/static/icon/switch_close.png" v-if="swith.value == 0"></image>
								</view>
							</view>
						</view>
					</block>
				</view>
				<view class="tp-title tp-mg-t-25" style="margin-top: 75rpx; margin-bottom: 36rpx;">操作日志与状态</view>
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
						<!-- 分页加载 -->
						<view class="uni-tab-bar-loading" @click="toLoadMore(active)" v-if="loadMoreShow">
							<uni-load-more :status="statusType" :contentText="contentText"></uni-load-more>
						</view>
					</view>
				</block>
				<view class="tp-tmp"></view>
			</view>
		</view>
		<!-- 菜单抽屉 -->
		<uni-drawer ref="navDrawer" :mask="true" :maskClick="true" :width="260" :drawerTop='topHeight'>
			<scroll-view scroll-y :style="{height:height + 'px'}">
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
					<image src="../../static/icon/close.png" alt="" @click="$refs.logoPopup.close()"></image>
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
		<!-- 添加鱼塘 -->
		<uni-popup ref="addpopup" :mask-click="false">
			<view class="add">
				<view class="addtitle">添加猪场</view>
				<view class="addcontent">
					<input type="text" placeholder="请输入猪场" v-model="ytName" />
				</view>
				<view class="addbtn">
					<button @click="$refs.addpopup.close()" class="cancelbtn">取消</button>
					<button @click="toAddConfirm" class="confirmbtn">确定</button>
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
				currentDataIndex: -1,
				currentD: -1,
				deviceList: [],
				currentIndex: 0,
				currentLog: {},
				currentYw: '',
				topHeight: 0,
				height: 0,
				ytTitle: '',
				socketTask: null,
				socketSwitchTask: null,
				marginTop: 0,
				isMore: false,
				ytName: '',
				isGetPhone: false,
				fishery: 1000,
				oxygen: 66,
				ph: 6.5,
				waterTemperature: 20,
				deviceData: [{
						id: 1001,
						icon: '/static/icon/zy_close.png',
						iconActive: '/static/icon/zy_on.png',
						title: '增氧',
						status: ''
					},
					{
						id: 1002,
						icon: '/static/icon/sl_close.png',
						iconActive: '/static/icon/sl_on.png',
						title: '饲料',
						status: ''
					},
					{
						id: 1002,
						icon: '/static/icon/sb_close.png',
						iconActive: '/static/icon/sb_on.png',
						title: '水泵',
						status: ''
					}
				],
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
				boxData: {},
				rjyData: {
					name: '',
					latest: [],
				},
				phData: {
					name: '',
					latest: [],
				},
				swData: {
					name: '',
					latest: [],
				},
				rjyname: '',
				ywData: [],
				statusType: 'more', //分页状态
				loadMoreShow: true,
				contentText: {
					contentdown: '上拉显示更多日志',
					contentrefresh: '正在加载...',
					contentnomore: '没有日志了'
				},
				currentGroup: {},
				ktxStatusHeight: 0,
				deviceSwtichList: []
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
		onShow() {
			this.getYwData()
			this.$store.commit('addOffset');
			this.getWarningList();
			let systemInfo = wx.getSystemInfoSync();
			// px转换到rpx的比例
			let pxToRpxScale = 750 / systemInfo.windowWidth;
			// 状态栏的高度
			let ktxStatusHeight = systemInfo.statusBarHeight * pxToRpxScale;
			this.ktxStatusHeight = ktxStatusHeight
			// 导航栏的高度
			let navigationHeight = 44 * pxToRpxScale;
			this.marginTop = ktxStatusHeight + 'rpx';
			this.isLogin = this.$login.isLoginType().isLogin
		},
		// 关闭websocket【必须在实例销毁之前关闭,否则会是underfined错误】
		beforeDestroy() {
			this.closeSocket();
		},
		// 上拉加载更多,onReachBottom上拉触底函数
		onReachBottom() {
			if (this.statusType == 'more') {
				this.toLoadMore();
			}
		},
		mounted() {
			uni.getSystemInfo({
				success: res => {
					// #ifdef MP-WEIXIN
					this.height = res.screenHeight - 200;
					// #endif
					// #ifdef APP
					this.height = res.screenHeight - 100
					// #endif
				}
			});
		},
		//
		methods: {
			// 日志详情
			logInfo(log, index) {
				this.currentLog = log
				this.currentIndex = index
				this.$refs.logoPopup.open()
			},
			// 点击设备分组
			toClickEquip(yw, equip) {
				uni.setStorageSync('ywId', yw.id)
				this.currentGroup = equip
				this.$refs.navDrawer.close()
			},
			// 展示分组
			toShowNavDrawer() {
				this.$refs.navDrawer.open()
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
						uni.setStorageSync('ywId', res.data.data[0].id)
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
			},
			//获取业务下分组列表
			getYTData(item) {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/asset/list/d', {
					business_id: item.id
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data != null) {
							if (res.data.length > 0) {
								item.secondShow = !item.secondShow
								this.ywData.forEach(d => {
									if (item.id == d.id) {
										d.equipLists = res.data
									}
								})
								this.currentGroup = res.data[0]
								this.$forceUpdate()
								this.getDeviceList()
								this.$refs.navDrawer.close()
							}
						}
					}
					uni.hideLoading()
				});
			},
			//控制设备开关
			changSwitch(item, swith, index) {
				var status = ''
				if (item.value == 1) {
					status = 0
				} else if (item.value == 0) {
					status = 1
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/device/reset', {
					id: item.id,
					status: status
				}, 'post').then(res => {
					if (res.code === 200) {
						this.toast.msg = res.msg;
						this.$refs.toast.show();
					}
					uni.hideLoading()
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
					uni.hideLoading()
				});
			},
			// 加载更多
			toLoadMore() {
				// 还有数据
				if (this.statusType == 'more') {
					this.$store.commit('addOffset');
					this.getWarningList();
				} else if (this.statusType == 'noMore') {}
			},
			//添加设备
			addEqp() {
				let _this = this
				// 允许从相机和相册扫码
				uni.scanCode({
					success: function(res) {
						let result = res.result
						//激活设备
						_this.API.apiRequest('/device/scan', {
							code: result,
							dashboard_id: _this.currentDashboardId,
						}, 'post').then(res => {
							if (res.code === 200) {
								_this.getBox()
							} else {
								this.toast.msg = res.message;
								this.$refs.toast.show();
							}
						});
					}
				});
			},
			//切换鱼塘
			changYt(m) {
				this.ytTitle = m.title
				this.isMore = false
				this.closeSocket();
				this.currentDashboardId = m.id
				this.getBox()
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
				this.API.apiRequest('/api/kv/current/asset/a', {
					asset_id: this.currentGroup.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.deviceList = res.data.devices
						const deviceSwtichList = res.data.devices.filter((item) => {
							return item.type == 'switch'
						})
						if (deviceSwtichList.length > 0) {
							deviceSwtichList.forEach(item => {
								item.current_data.forEach(device => {
									if (device.value == 0) {
										device.icon = require('../../static/icon/switch_close.png')
									} else if (device.value == 1) {
										device.icon = require('../../static/icon/switch_on.png')
									}
								})
							})
						}
						this.deviceSwtichList = deviceSwtichList
						// this.getWarningList()
					}
					uni.hideLoading()
				})
			},

			//获取box信息
			getBox() {
				var newData = {};
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/dashboard/dashboard', {
					chart_id: this.currentDashboardId
				}, 'post').then(res => {
					if (res.code == 200) {
						if (res.data.length > 0) {
							newData = res.data[0]
							// this.getWarningList()
						}
						this.boxData = newData
					}
					uni.hideLoading()
				})
			},
			//添加鱼塘
			toAddConfirm() {
				if (this.ytName == '') {
					this.toast.msg = '请输入鱼塘名称';
					this.$refs.toast.show();
				} else {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/dashboard/paneladd', {
						title: this.ytName,
						business_id: '92a00bb5-f28e-4849-baa5-f1edd85649e6'
					}, 'post').then(res => {
						if (res.code == 200) {
							this.ytName = ''
							this.toast.msg = res.msg;
							this.$refs.toast.show();
							this.$refs.addpopup.close()
							this.getYTData()
						}
						uni.hideLoading()
					});
				}
			},
			//获取绑定的手机号
			getPhoneNumber(e) {
				this.wxData = e.detail
				this.isGetPhone = false
				this.toLogin()
			},
			//登录
			toLogin() {
				this.$router.push({
					path: 'pages/login/login'
				})
			},
			//关闭
			toCloseLogin() {
				this.$refs.authPopup.close()
			},
			//获取授权
			getAuth() {
				var that = this;
				//判断是否授权
				uni.getUserProfile({
					desc: '登录',
					success(infoRes) {
						const userInfo = infoRes.userInfo;
						uni.setStorageSync('userWxInfo', JSON.stringify(userInfo))
						uni.setStorageSync('isAuth', '1')
						that.isGetPhone = true
						that.$refs.authPopup.close()

					},
					fail: err => {
						console.log('未授权err==', err);
					}
				});
			},

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
</style>
