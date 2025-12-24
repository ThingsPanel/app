<template>
	<view class="tp-box">
		<!-- Background Elements for Atmosphere -->
		<view class="bg-glow-1"></view>
		<view class="bg-glow-2"></view>

		<!-- Top Header -->
		<view class="tp-header tp-flex tp-flex-j-s tp-flex-a-c">
			<!-- Group Selector -->
			<view class="group-select-box tp-flex tp-flex-a-c" @click='toShowNavDrawer'>
				<view class="icon-box tp-flex tp-flex-j-c tp-flex-a-c">
					<image src="/static/icon/more.png" class="menu-icon" />
				</view>
				<view class="group-info tp-flex tp-flex-a-c">
					<text class="group-name text-ellipsis">{{ selectedGroupName || $t('pages.deviceDetail.groupSelection') }}</text>
					<view v-if="selectedGroupId" class="clear-btn tp-flex tp-flex-j-c tp-flex-a-c" @click.stop='clearSelectedGroup'>
						<image src="/static/icon/close.png" class="close-icon" />
					</view>
				</view>
			</view>

			<!-- Notify Button -->
			<view class="notify-box tp-flex tp-flex-j-c tp-flex-a-c" @click="toNotify">
				<image :src="!activeNotify ? '/static/icon/notify.svg' : '/static/icon/notify-red.svg'" class="notify-icon"></image>
				<view class="notify-dot" v-if="activeNotify"></view>
			</view>
		</view>

		<!-- Main Content -->
		<view class="tp-content">
			<view class="section-header tp-flex tp-flex-j-s tp-flex-a-c">
				<text class="section-title">{{ $t('pages.deviceDetail.deviceMonitor') }}</text>
			</view>

			<view class="device-list">
				<view class="tp-panel device-card" v-for="(item, index) in deviceList" :key="index" @click="clickDevice(item)">
					<view class="card-inner tp-flex tp-flex-row tp-flex-j-s">
						
						<!-- Left: Icon & Info -->
						<view class="tp-flex tp-flex-row tp-flex-1 tp-overflow-hidden">
							<!-- Icon -->
							<view class="device-icon-wrapper tp-flex tp-flex-j-c tp-flex-a-c" :class="+item.is_online == 1 ? 'online' : 'offline'">
								<image v-if="item.image_url" :src="item.image_url" class="device-img" mode="aspectFit"></image>
								<text v-else class="iconfont iconequipment"></text>
							</view>
							
							<!-- Info -->
							<view class="device-info tp-flex tp-flex-col tp-flex-j-c">
								<view class="device-name text-ellipsis">{{ item.name }}</view>
								<view class="device-meta" v-if="item.gateway_name">
									<text class="label">GW:</text> {{ item.gateway_name }}
								</view>
								<view class="device-meta">
									<text class="label">{{ $t('pages.deviceDetail.reportTime') }}:</text> 
									<text class="time-val">{{ item.latest_ts_name || '--' }}</text>
								</view>
							</view>
						</view>

						<!-- Right: Status -->
						<view class="device-status tp-flex tp-flex-col tp-flex-a-e tp-flex-j-c">
							<view class="status-badge" :class="+item.is_online == 1 ? 'status-on' : 'status-off'">
								<view class="dot"></view>
								<text>{{ +item.is_online == 1 ? $t('pages.deviceDetail.online') : $t('pages.deviceDetail.offline') }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- Components -->
		<gq-tree
			ref="gqTree"
			:range="deviceGroupData"
			idKey="id"
			nameKey="name"
			allKey="value"
			childKey="children"
			pidKey="pid"
			:showSearch="false"
			:multiple="false"
			:cascade="false"
			:selectParent="true"
			:foldAll="false"
			confirmColor="#646cff"
			cancelColor="#757575"
			:title="$t('pages.deviceDetail.groupSelection')"
			titleColor="#333333"
			@cancel="treeCancel"
			@confirm="treeConfirm"
		>
		</gq-tree>

		<uni-drawer ref="navDrawer" :mask="true" :maskClick="true" :width="300" :drawerTop='topHeight'>
			<scroll-view scroll-y :style="{ height: height - 80 + 'px' }" style="padding-top: 50rpx;">
			</scroll-view>
		</uni-drawer>

		<uni-popup ref="logoPopup" type="bottom" :mask="true" :maskClick="true">
			<view class="logInfo tp-panel-popup">
				<view class="info_title">
					{{ $t('pages.deviceDetail.logTitle') }}
					<image src="/static/icon/close.png" class="close-popup" @click="$refs.logoPopup.close()" />
				</view>
			</view>
		</uni-popup>

		<cys-toast ref="toast" :msg="toast.msg" direction="row" location="top"></cys-toast>
		
		<!-- Scroll to Top Button -->
		<view class="scroll-to-top" v-if="showScrollTop" @click="scrollToTop">
			<image src="/static/icon/top.png" class="scroll-icon-img" mode="aspectFit" />
		</view>
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
import dayjs from 'dayjs';
import { deviceList as deviceListApi } from '@/service/device'
import { updateTabbarText } from '@/lang/index'
import deviceWebSocket from '@/common/deviceWebSocket'
//
export default {
	data() {
		return {
			timer: 0,
			deviceStatusTimer: 0,
			activeNotify: false,
			marginConTop: 0,
			currentDataIndex: -1,
			currentD: -1,
			deviceList: [],
			currentIndex: 0,
			// WebSocket相关
			visibleDeviceIds: [], // 当前可见的设备ID
			lastVisibleDeviceIds: [], // 上一次可见的设备ID，用于对比
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
				contentdown: this.$t('pages.fisheryMonitor.pullUpForMore'),
				contentrefresh: this.$t('common.loading'),
				contentnomore: this.$t('pages.fisheryMonitor.noMoreData')
			},
			statusEqupType: 'more', //分页状态
			loadMoreEqupShow: true,
			currentGroup: {},
			ktxStatusHeight: 0,
			timer: null,
			statusBarHeight: 0,
			uiMode: 'popup',
			funcMode: 'radio',
			deviceGroupData: [],
			// treeData: this.formatData(this.deviceGroupData.data), // 假设deviceGroupData是你的数据源
			selectedGroupId: '' ,// 当前选中的group id
			selectedGroupName: '',
			showScrollTop: false // 控制回到顶部按钮显示
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

		let systemInfo = uni.getSystemInfoSync();
		this.statusBarHeight = (systemInfo.statusBarHeight || 25) + 'px'

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
		this.marginTop = (ktxStatusHeight || 50) + 'rpx';
		this.marginConTop = (ktxStatusHeight || 20) + 'rpx'
		this.isLogin = this.$login.isLoginType().isLogin
		// this.ywData = []
		// this.showData()


	},
	onShow() {
		this.isLogin = this.$login.isLoginType().isLogin
		this.$store.state.list.equpPage = 1
		this.ywData = []
		this.showData();
		//this.checkNotify()
		this.$nextTick(() => {
			setTimeout(() => {
				uni.setNavigationBarTitle({
					title: this.$t('pages.deviceList')
				})
			}, 100)
		})
		// Force update tabbar text
		updateTabbarText()
	},
	// 监听页面滚动
	onPageScroll(e) {
		// 当滚动超过300px时显示回到顶部按钮
		this.showScrollTop = e.scrollTop > 300;
		// 更新可见设备列表
		this.updateVisibleDevices();
	},
	// 上拉加载更多,onReachBottom上拉触底函数
	onReachBottom() {
		// if (this.statusType == 'more') {
		// 	this.toLoadMore();
		// }
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
	onHide() {
		this.clearDeviceStatusTimer()
		deviceWebSocket.close()
	},
	beforeDestroy() {
		// 清除定时器
		clearInterval(this.timer)
		// 清除在线/离线状态定时器
		this.clearDeviceStatusTimer()
		// 关闭WebSocket连接
		deviceWebSocket.close()
	},
	// onLoad(options) {
	// 	this.$store.commit('zerOingOffser'); //清空日志页码
	// 	this.$store.commit('zerOingEqupPage'); //清空设备页码
	// },
	//
	methods: {
		// WebSocket相关方法
		// 初始化WebSocket连接
		initWebSocket() {
			deviceWebSocket.init({
				onMessage: (data) => {
					this.updateDeviceStatus(data);
				},
				onError: (err) => {
					console.error('WebSocket error:', err);
				},
				onClose: () => {
					console.log('WebSocket closed');
				}
			});
		},
		
		// 更新设备状态
		updateDeviceStatus(statusData) {
			const { device_id, is_online, latest_temp } = statusData;
			
			// 查找并更新对应设备
			const device = this.deviceList.find(d => d.id === device_id);
			if (device) {
				device.is_online = is_online;
				if (latest_temp) {
					device.ts = latest_temp;
					device.latest_ts_name = dayjs(latest_temp).format('YYYY-MM-DD HH:mm:ss');
				}
				this.$forceUpdate();
			}
		},
		
		// 更新可见设备（视窗化订阅）
		updateVisibleDevices() {
			if (this.deviceList.length === 0) {
				return;
			}
			
			// 获取当前页面滚动信息
			uni.createSelectorQuery().selectViewport().scrollOffset((res) => {
				const scrollTop = res.scrollTop;
				const windowHeight = uni.getSystemInfoSync().windowHeight;
				
				// 计算可见区域（包含上下缓冲区）
				const bufferHeight = 200; // 缓冲区高度
				const visibleTop = scrollTop - bufferHeight;
				const visibleBottom = scrollTop + windowHeight + bufferHeight;
				
				// 获取所有设备卡片的位置
				uni.createSelectorQuery().selectAll('.device-card').boundingClientRect((rects) => {
					if (!rects || rects.length === 0) {
						return;
					}
					
					// 筛选可见的设备
					const visibleIds = [];
					rects.forEach((rect, index) => {
						if (rect.top < visibleBottom && rect.bottom > visibleTop) {
							if (this.deviceList[index]) {
								visibleIds.push(this.deviceList[index].id);
							}
						}
					});
					
					// 检查可见设备是否有变化
					const idsChanged = JSON.stringify(visibleIds.sort()) !== JSON.stringify(this.lastVisibleDeviceIds.sort());
					
					if (idsChanged && visibleIds.length > 0) {
						this.visibleDeviceIds = visibleIds;
						this.lastVisibleDeviceIds = [...visibleIds];
						
						// 重新连接并订阅新的可见设备
						this.reconnectAndSubscribe();
					}
				}).exec();
			}).exec();
		},
		
		// 重新连接并订阅（每次订阅都重新连接）
		reconnectAndSubscribe() {
			deviceWebSocket.reconnectAndSubscribe(this.visibleDeviceIds, {
				onMessage: (data) => {
					this.updateDeviceStatus(data);
				},
				onError: (err) => {
					console.error('WebSocket error:', err);
				},
				onClose: () => {
					console.log('WebSocket closed');
				}
			});
		},
		
		// 滚动到顶部
		scrollToTop() {
			uni.pageScrollTo({
				scrollTop: 0,
				duration: 300 // 动画持续时间，单位ms
			});
		},
		checkNotify() {
			this.API.apiRequest('/api/v1/alarm/info/history', {
				page: 1,
				page_size: 10
			}, 'get').then(res => {
				clearInterval(this.timer)
				if (res.code === 200) {
					this.activeNotify = !!res.data.data.length
					if (this.activeNotify) {
						this.timer = setInterval(() => {
							this.activeNotify = !this.activeNotify
						}, 500)
					}
				}
			})
		},
		toNotify() {
			uni.navigateTo({
				url: '../notify/notify'
			})
		},
		showData() {
			this.deviceList = []
			this.getDeviceList()
		},
		changeIndex(item, i, iIndex) {
			item.currentIndex = iIndex
			this.$forceUpdate()
		},
		// 点击设备
		clickDevice(data, dataIndex) {
			const token = uni.getStorageSync("access_token");
			const serverUrl = uni.getStorageSync('serverAddress');
			const url = `${serverUrl}/device-details-app?d_id=${data.id}&token=${token}`;
			uni.navigateTo({
			  url: `/pages/webViewPage/webViewPage?url=${encodeURIComponent(url)}`
			});
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
			this.getGroupData();
			//this.$refs.navDrawer.open()
			//this.$refs.nextTreeRef.showTree = true
			//this.$refs.gqTree._show();
			//setTimeout(() => {
				this.$refs.gqTree._show();
			//}, 1000)
		},
		clearSelectedGroup() {
			this.deviceList = [];
			this.selectedGroupId = '';
			this.selectedGroupName = '';
			// 关闭现有WebSocket连接
			deviceWebSocket.close();
			this.getDeviceList();
		},
		// 改变设备开关
		/*changSwitch(dev, sw) {
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
				title: this.$t('common.loading'),
				mask: true
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
			}).finally(() => { });
			setTimeout(() => {
				uni.hideLoading()
			}, 1000);
		},*/
		/*formatGroupData(data) {
			// 处理数据使其适应next-tree组件
			return data.map(group => {
			  const formattedGroup = {
				id: group.group.id,
				label: group.group.name,
				children: group.children ? this.formatGroupData(group.children) : [],
			  };
			  return formattedGroup;
			});
		},*/
		formatGroupData(data, parentId) {
			return data.map(group => {
			  const formattedGroup = {
				id: group.group.id,
				name: group.group.name,
				pid: parentId,
				children: group.children ? this.formatGroupData(group.children, group.group.id) : [],
			  };
			  return formattedGroup;
			});
		},
		getGroupData() {
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
			});
			this.API.apiRequest('/api/v1/device/group/tree', {
			}, 'get').then(res => {
				if (res.code === 200) {
					this.deviceGroupData = this.formatGroupData(res.data)
					console.log(this.deviceGroupData)
				}
			}).finally(() => {
				this.$refs.gqTree._show();
			});
			setTimeout(() => {
				uni.hideLoading()
			}, 1000);
		},
		treeConfirm(e) {
			this.deviceList = []
			this.selectedGroupId = e[0].id
			this.selectedGroupName = e[0].name
			this.$refs.navDrawer.close()
			this.$store.state.list.equpPage = 1
			// 关闭现有WebSocket连接
			deviceWebSocket.close()
			this.getDeviceList()
		},
		treeCancel() {
			// 处理树形选择器取消事件
			// 可以在这里添加取消时的逻辑，比如关闭抽屉等
			// this.$refs.navDrawer.close()
		},
		changeVerify: function(current, chooseList) {
			console.log('当前变化的数据', current)
			console.log('已选择的数据', chooseList)
			if(chooseList && chooseList.length > 4) {

				return this.$t('pages.fisheryMonitor.maxFourNode')
			}
		},
		//获取操作日志
		getWarningList() {
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
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
			setTimeout(() => {
				uni.hideLoading()
			}, 1000)
		},
		// 加载更多
		toLoadMore() {
			// 还有数据
			if (this.statusType == 'more') {
				this.$store.commit('addOffset');
				this.getWarningList();
			} else if (this.statusType == 'noMore') { }
		},
		toLoadEqupMore() {
			// 还有数据
			if (this.statusEqupType == 'more') {
				this.$store.commit('addEqupPage');
				this.getDeviceList();
			} else if (this.statusEqupType == 'noMore') { }
		},
		toLoadModelMore() {
			// 还有数据
			if (this.statusModelType == 'more') {
				this.$store.commit('addModelPage');
				this.getDetail();
			} else if (this.statusModelType == 'noMore') { }
		},
		//添加设备
		addEqp() {
			let _this = this
			// 允许从相机和相册扫码
			uni.scanCode({
				success: function (res) {
					let result = res.result
					uni.navigateTo({
						url: './addMonitor?code=' + result + '&groupId=' + _this.currentGroup.id,
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
			// 清除定时器
			clearInterval(this.timer)
			var newData = {};
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
			});
			deviceListApi({
				group_id: this.selectedGroupId,
				page: this.$store.state.list.equpPage,
				page_size: 20
			}).then(res => {
				if (res.code === 200) {
					var newData = res.data.list || [];
					var lastTableData = [];
					if (newData.length > 0) {
						let pauArry = newData;
						/* 分页 */
						let pageSize = 20;
						if (pageSize == newData.length) {
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
					var ids = []
					const serverUrl = uni.getStorageSync('serverAddress');
					const baseUrl = serverUrl ? serverUrl.replace('/api/v1', '') : '';

					this.deviceList.forEach(item => {
						item.currentIndex = 0
						if (item.ts && item.ts != null) {
							item.latest_ts_name = item.ts ? dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss') : ''; //this.formatDate(item.ts)
						}
						if (item.image_url) {
							item.image_url = baseUrl + '/' + item.image_url;
						}
						item.chart_data = {}
						ids.push(item.id)
					})
					
					// 数据加载完成后，初始化WebSocket并订阅可见设备
					this.$nextTick(() => {
						setTimeout(() => {
							this.updateVisibleDevices();
						}, 300);
					});
				} else {
					this.loadMoreEqupShow = false;
					this.statusEqupType = 'noMore';
					this.toast.msg = res.msg;
					this.$refs.toast.show();
				}
			}).finally(() => {

			})
			setTimeout(() => {
				uni.hideLoading()
			}, 1000);
		},
		// 获取离线在线状态
		/*getDetailStatus(ids) {
			this.API.apiRequest('/api/device/status', {
				device_id_list: ids
			}, 'post').then(res => {
				if (res.code === 200) {
					for (let key in res.data) {
						this.deviceList.forEach(item => {
							if (key == item.device_id) {
								this.$set(item, 'status', res.data[key])
							}
						})
					}
				}
			})
		},*/
		// 插件查询
		getDetail(device) {
			uni.showLoading({
				title: this.$t('common.loading'),
				mask: true
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
				setTimeout(() => {
					uni.hideLoading()
				}, 1000);
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
			//time1.substr(11,2)截取字符串得到时间的小时数
			//parseInt(time1.substr(11,2))*60把小时数转化成为分钟
			var min1 = parseInt(time1.substr(11, 2)) * 60 + parseInt(time1.substr(14, 2));
			var min2 = parseInt(time2.substr(11, 2)) * 60 + parseInt(time2.substr(14, 2));

			//两个分钟数相减得到时间部分的差值，以分钟为单位
			var n = min2 - min1;

			//将日期和时间两个部分计算出来的差值相加，即得到两个时间相减后的分钟数
			var minutes = m + n;
			return minutes
		},
		clearDeviceStatusTimer() {
			if (this.deviceStatusTimer > 0) {
				clearInterval(this.deviceStatusTimer)
				this.deviceStatusTimer = 0
			}
		},
		formatData(data) {
		  return data.map(item => ({ ...item, children: item.children || [] }));
		},
		handleGroupSelect(groupItem) {
		  this.selectedGroupId = groupItem.group.id; // 更新选中的group id
		  console.log('Selected group:', groupItem);
		  this.$refs.navDrawer.close(); // 关闭drawer
		}
	}
}
</script>

<style lang="scss">
/* Global Reset & Base */
.tp-box {
	width: 100%;
	min-height: 100vh;
	background: #f5f7fa; /* Light airy background */
	position: relative;
	overflow: hidden;
	color: #334155;
	font-size: 28rpx;
}

/* Ambient Background Glows */
.bg-glow-1 {
	position: absolute;
	top: -10%;
	left: -10%;
	width: 700rpx;
	height: 700rpx;
	background: radial-gradient(circle, rgba(100, 108, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
	border-radius: 50%;
	z-index: 0;
	pointer-events: none;
	filter: blur(40px);
}
.bg-glow-2 {
	position: absolute;
	bottom: 5%;
	right: -5%;
	width: 600rpx;
	height: 600rpx;
	background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
	border-radius: 50%;
	z-index: 0;
	pointer-events: none;
	filter: blur(40px);
}

/* Header */
.tp-header {
	position: relative;
	z-index: 10;
	padding: 30rpx 30rpx 10rpx;
}

.group-select-box {
	background: rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border-radius: 40rpx;
	padding: 8rpx 24rpx 8rpx 12rpx;
	border: 1px solid rgba(255, 255, 255, 0.8);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	
	.icon-box {
		width: 56rpx;
		height: 56rpx;
		background: #646cff;
		border-radius: 50%;
		margin-right: 16rpx;
		
		.menu-icon {
			width: 32rpx;
			height: 32rpx;
			filter: brightness(0) invert(1); /* Make icon white */
		}
	}
	
	.group-info {
		.group-name {
			font-size: 28rpx;
			font-weight: 600;
			color: #1e293b;
			max-width: 300rpx;
		}
		
		.clear-btn {
			width: 32rpx;
			height: 32rpx;
			margin-left: 16rpx;
			background: rgba(0, 0, 0, 0.05);
			border-radius: 50%;
			
			.close-icon {
				width: 16rpx;
				height: 16rpx;
				opacity: 0.6;
			}
		}
	}
}

.notify-box {
	width: 80rpx;
	height: 80rpx;
	background: rgba(255, 255, 255, 0.6);
	backdrop-filter: blur(10px);
	border-radius: 24rpx;
	position: relative;
	border: 1px solid rgba(255, 255, 255, 0.8);
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.03);
	
	.notify-icon {
		width: 40rpx;
		height: 40rpx;
	}
	
	.notify-dot {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 12rpx;
		height: 12rpx;
		background: #ef4444;
		border-radius: 50%;
		border: 2rpx solid #fff;
	}
}

/* Content */
.tp-content {
	position: relative;
	z-index: 1;
	padding: 30rpx;
}

.section-header {
	margin-bottom: 30rpx;
	
	.section-title {
		font-size: 36rpx;
		font-weight: 700;
		color: #1e293b;
		letter-spacing: 0.5rpx;
	}
}

/* Device List */
.device-list {
	padding-bottom: 40rpx;
}

.tp-panel {
	background: rgba(255, 255, 255, 0.7);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border: 1px solid rgba(255, 255, 255, 0.9);
	border-radius: 32rpx;
	box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
	margin-bottom: 30rpx;
	transition: all 0.3s ease;
	overflow: hidden;
}

.device-card:active {
	transform: scale(0.98);
	background: rgba(255, 255, 255, 0.9);
}

.card-inner {
	padding: 30rpx;
}

/* Device Icon */
.device-icon-wrapper {
	width: 100rpx;
	height: 100rpx;
	border-radius: 28rpx;
	background: #f1f5f9;
	margin-right: 30rpx;
	flex-shrink: 0;
	
	.iconfont {
		font-size: 48rpx;
		color: #94a3b8;
	}
	
	&.online {
		background: rgba(100, 108, 255, 0.1);
		
		.iconfont {
			color: #646cff;
		}
	}
	
	&.offline {
		background: #f1f5f9;
		
		.iconfont {
			color: #cbd5e1;
		}
	}
}

/* Device Info */
.device-info {
	.device-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #1e293b;
		margin-bottom: 12rpx;
	}
	
	.device-meta {
		font-size: 24rpx;
		color: #64748b;
		margin-bottom: 6rpx;
		
		.label {
			color: #94a3b8;
			margin-right: 8rpx;
		}
		
		.time-val {
			font-family: monospace;
			color: #64748b;
		}
	}
}

/* Status Badge */
.status-badge {
	display: flex;
	align-items: center;
	padding: 8rpx 20rpx;
	border-radius: 50rpx;
	font-size: 22rpx;
	font-weight: 600;
	background: #f1f5f9;
	color: #94a3b8;
	
	.dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		background: #cbd5e1;
		margin-right: 10rpx;
	}
	
	&.status-on {
		background: rgba(100, 108, 255, 0.1);
		color: #646cff;
		
		.dot {
			background: #646cff;
			box-shadow: 0 0 8rpx rgba(100, 108, 255, 0.4);
		}
	}
	
	&.status-off {
		background: #f1f5f9;
		color: #94a3b8;
		
		.dot {
			background: #cbd5e1;
		}
	}
}

/* Utilities */
.text-ellipsis {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

.tp-flex { display: flex; }
.tp-flex-col { flex-direction: column; }
.tp-flex-row { flex-direction: row; }
.tp-flex-j-s { justify-content: space-between; }
.tp-flex-j-c { justify-content: center; }
.tp-flex-a-c { align-items: center; }
.tp-flex-a-e { align-items: flex-end; }
.tp-flex-1 { flex: 1; }
.tp-overflow-hidden { overflow: hidden; }

/* Popup Styles */
.tp-panel-popup {
	background: #ffffff;
	border-radius: 32rpx 32rpx 0 0;
	padding: 40rpx;
	color: #334155;
}

.info_title {
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #0f172a;
	
	.close-popup {
		width: 32rpx;
		height: 32rpx;
		opacity: 0.5;
	}
}

.device-img {
	width: 100%;
	height: 100%;
}

/* Scroll to Top Button */
.scroll-to-top {
	position: fixed;
	right: 40rpx;
	bottom: 140rpx;
	width: 88rpx;
	height: 88rpx;
	background: rgba(255, 255, 255, 0.9);
	backdrop-filter: blur(10px);
	-webkit-backdrop-filter: blur(10px);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
	border: 1px solid rgba(255, 255, 255, 0.8);
	z-index: 999;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	
	.scroll-icon-img {
		width: 44rpx;
		height: 44rpx;
		opacity: 0.8;
	}
	
	&:active {
		transform: scale(0.92);
		background: rgba(255, 255, 255, 1);
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
	}
}

@keyframes fadeInUp {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
