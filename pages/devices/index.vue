<template>
	<view class="tp-box">
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
				<image :src="!activeNotify ? '/static/icon/notify.svg' : '/static/icon/notify-red.svg'" class="notify-icon" :class="{ 'notify-active': activeNotify }"></image>
				<view class="notify-dot" v-if="activeNotify"></view>
			</view>
		</view>

		<view class="device-toolbar">
			<view class="device-search">
				<image src="/static/image/search.png" class="search-icon" mode="aspectFit" />
				<input
					v-model.trim="searchKeyword"
					class="search-input"
					confirm-type="search"
					:placeholder="$t('pages.devices.searchPlaceholder')"
					@confirm="applyDeviceFilters"
				/>
				<text v-if="searchKeyword" class="search-clear" @click="clearSearch">×</text>
				<text class="search-action" @click="applyDeviceFilters">{{ $t('common.search') }}</text>
			</view>
			<scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
				<view class="filter-row">
					<view
						v-for="option in statusFilters"
						:key="option.key"
						class="filter-chip"
						:class="{ active: activeStatusFilter === option.key }"
						@click="selectStatusFilter(option.key)"
					>
						{{ option.label }}
					</view>
				</view>
			</scroll-view>
		</view>

		<view class="tp-content">
			<view class="device-list">
				<DeviceListItem
					v-for="item in deviceList"
					:key="item.id"
					:device="item"
					@select="clickDevice"
				/>
				<view class="empty-state" v-if="!isDeviceLoading && deviceList.length === 0">
					<text class="iconfont iconequipment"></text>
					<text>{{ $t('common.noData') }}</text>
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

		<app-toast ref="toast" :msg="toast.msg" direction="row" location="top"></app-toast>
		
		<!-- Scroll to Top Button -->
		<view class="scroll-to-top" v-if="showScrollTop" @click="scrollToTop">
			<image src="/static/icon/arrow-up.png" class="scroll-icon-img" mode="aspectFit" />
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
import { deviceList as deviceListApi } from '@/api/modules/device'
import deviceStatusSocket from '@/services/device-status-socket'
import { buildWebViewUrl } from '@/utils/platform-web.js'
import DeviceListItem from '@/features/devices/components/device-list-item.vue'
//
export default {
	components: { DeviceListItem },
	data() {
		return {
			isDeviceLoading: true,
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
			viewportSubscribeTimer: null,
			currentLog: {},
			currentYw: '',
			topHeight: 0,
			height: 0,
			marginTop: 0,
			isMore: false,
			ytName: '',
			isGetPhone: false,
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
				contentdown: this.$t('pages.devices.pullUpForMore'),
				contentrefresh: this.$t('common.loading'),
				contentnomore: this.$t('pages.devices.noMoreData')
			},
			devicePaginationStatus: 'more', //分页状态
			showDeviceLoadMore: true,
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
			searchKeyword: '',
			activeStatusFilter: 'all',
			showScrollTop: false // 控制回到顶部按钮显示
		}
	},
	computed: {
		statusFilters() {
			return [
				{ key: 'all', label: this.$t('pages.devices.allDevices') },
				{ key: 'online', label: this.$t('pages.devices.online') },
				{ key: 'offline', label: this.$t('pages.devices.offline') },
				{ key: 'alarm', label: this.$t('pages.devices.alarming') }
			]
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
		this.$store.commit('resetOffset'); //清空日志页码
		this.$store.commit('resetDevicePage'); //清空设备页码

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
		// 恢复上次选择的设备分组
		this.restoreSelectedGroup()
		// this.ywData = []
		// this.showData()


	},
	onShow() {
		this.isLogin = this.$login.isLoginType().isLogin
		this.$store.state.list.devicePage = 1
		this.ywData = []
		// 恢复上次选择的设备分组（保持分组选择）
		this.restoreSelectedGroup()
		this.showData();
		//this.checkNotify()
		this.$nextTick(() => {
			setTimeout(() => {
				uni.setNavigationBarTitle({
					title: this.$t('pages.deviceList')
				})
			}, 100)
		})
	},
	// 监听页面滚动
	onPageScroll(e) {
		// 当滚动超过300px时显示回到顶部按钮
		this.showScrollTop = e.scrollTop > 300;
		// 滚动停止后再订阅，避免频繁重连
		this.scheduleViewportSubscription();
	},
	// 上拉加载更多,onReachBottom上拉触底函数
	onReachBottom() {
		// if (this.statusType == 'more') {
		// 	this.toLoadMore();
		// }
		if (this.devicePaginationStatus == 'more') {
			this.loadMoreDevices()
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
		if (this.viewportSubscribeTimer) {
			clearTimeout(this.viewportSubscribeTimer)
			this.viewportSubscribeTimer = null
		}
		deviceStatusSocket.close()
	},
	beforeUnmount() {
		// 清除定时器
		clearInterval(this.timer)
		// 清除在线/离线状态定时器
		this.clearDeviceStatusTimer()
		if (this.viewportSubscribeTimer) {
			clearTimeout(this.viewportSubscribeTimer)
			this.viewportSubscribeTimer = null
		}
		// 关闭WebSocket连接
		deviceStatusSocket.close()
	},
	// onLoad(options) {
	// 	this.$store.commit('resetOffset'); //清空日志页码
	// 	this.$store.commit('resetDevicePage'); //清空设备页码
	// },
	//
	methods: {
		getSelectedGroupStorageKey() {
			return 'device_list_selected_group'
		},
		persistSelectedGroup() {
			const key = this.getSelectedGroupStorageKey()
			if (this.selectedGroupId) {
				uni.setStorageSync(key, {
					id: this.selectedGroupId,
					name: this.selectedGroupName || ''
				})
			} else {
				uni.removeStorageSync(key)
			}
		},
		restoreSelectedGroup() {
			const key = this.getSelectedGroupStorageKey()
			const legacyKey = 'fishery_monitor_selected_group'
			const saved = uni.getStorageSync(key) || uni.getStorageSync(legacyKey)
			if (saved && saved.id) {
				this.selectedGroupId = saved.id
				this.selectedGroupName = saved.name || ''
				// 保留升级前的用户选择，并在读取后迁移到新的领域命名键。
				uni.setStorageSync(key, saved)
				uni.removeStorageSync(legacyKey)
			}
		},
		
		// WebSocket相关方法
		// 初始化WebSocket连接
		initWebSocket() {
			deviceStatusSocket.init({
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
		
		// 滚动停止后再做可见区域计算 + 订阅（防抖）
		scheduleViewportSubscription() {
			if (this.viewportSubscribeTimer) {
				clearTimeout(this.viewportSubscribeTimer)
			}
			this.viewportSubscribeTimer = setTimeout(() => {
				this.viewportSubscribeTimer = null
				this.updateVisibleDevices()
			}, 400)
		},
		
		// 更新可见设备（视窗化订阅）
		updateVisibleDevices() {
			if (this.deviceList.length === 0) {
				return;
			}

			// 注意：boundingClientRect 的 top/bottom 是相对于“视口”的坐标
			// 所以这里不能再用 scrollTop 做比较，否则会出现滚动后订阅错位
			const windowHeight = uni.getSystemInfoSync().windowHeight;
			const bufferPx = 200; // 上下缓冲像素（预加载区域）
			const prefetchCount = 10; // 前后各取 N 条，避免滚动停下后漏订阅

			uni.createSelectorQuery().selectAll('.device-card').boundingClientRect((rects) => {
				if (!rects || rects.length === 0) {
					return;
				}

				const visibleIndices = [];
				rects.forEach((rect, index) => {
					if (!rect) return;
					// 视口坐标系：可见范围是 [-bufferPx, windowHeight + bufferPx]
					if (rect.bottom > -bufferPx && rect.top < (windowHeight + bufferPx)) {
						visibleIndices.push(index);
					}
				});

				if (visibleIndices.length === 0) {
					return;
				}

				let minIndex = Math.min.apply(null, visibleIndices);
				let maxIndex = Math.max.apply(null, visibleIndices);

				// 扩大订阅范围：可见区前后各 prefetchCount 条
				minIndex = Math.max(0, minIndex - prefetchCount);
				maxIndex = Math.min(this.deviceList.length - 1, maxIndex + prefetchCount);

				const subscribeIds = this.deviceList
					.slice(minIndex, maxIndex + 1)
					.map(d => d && d.id)
					.filter(Boolean);

				const norm = (arr) => (arr || []).slice().sort().join(',');
				const idsChanged = norm(subscribeIds) !== norm(this.lastVisibleDeviceIds);

				if (idsChanged && subscribeIds.length > 0) {
					this.visibleDeviceIds = subscribeIds;
					this.lastVisibleDeviceIds = [...subscribeIds];

					// 重新连接并订阅新的可见设备
					this.reconnectAndSubscribe();
				}
			}).exec();
		},
		
		// 重新连接并订阅（每次订阅都重新连接）
		reconnectAndSubscribe() {
			deviceStatusSocket.reconnectAndSubscribe(this.visibleDeviceIds, {
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
				url: '../alarms/index'
			})
		},
		showData() {
			this.deviceList = []
			this.getDeviceList()
		},
		applyDeviceFilters() {
			this.$store.state.list.devicePage = 1
			this.deviceList = []
			deviceStatusSocket.close()
			this.getDeviceList()
		},
		clearSearch() {
			this.searchKeyword = ''
			this.applyDeviceFilters()
		},
		selectStatusFilter(filter) {
			if (this.activeStatusFilter === filter) return
			this.activeStatusFilter = filter
			this.applyDeviceFilters()
		},
		changeIndex(item, i, iIndex) {
			item.currentIndex = iIndex
			this.$forceUpdate()
		},
		// 点击设备
		clickDevice(data, dataIndex) {
			const token = uni.getStorageSync("access_token");
			const url = buildWebViewUrl('/device-details-app', {
				d_id: data.id,
				token
			});
			uni.navigateTo({
			  url: `/pages/web-view/index?url=${encodeURIComponent(url)}`
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
			this.$store.state.list.devicePage = 1
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
			this.persistSelectedGroup()
			// 关闭现有WebSocket连接
			deviceStatusSocket.close();
			this.getDeviceList();
		},
		// 改变设备开关
		/*changSwitch(dev, sw) {
			var stateNum;
			if (sw.state == 0) {
				stateNum = 1
			} else if (sw.state == 1) {
				stateNum = 0
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
			this.persistSelectedGroup()
			this.$refs.navDrawer.close()
			this.$store.state.list.devicePage = 1
			// 关闭现有WebSocket连接
			deviceStatusSocket.close()
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

				return this.$t('pages.devices.maxFourNode')
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
				this.$store.commit('incrementOffset');
				this.getWarningList();
			} else if (this.statusType == 'noMore') { }
		},
		loadMoreDevices() {
			// 还有数据
			if (this.devicePaginationStatus == 'more') {
				this.$store.commit('incrementDevicePage');
				this.getDeviceList();
			} else if (this.devicePaginationStatus == 'noMore') { }
		},
		loadMoreModels() {
			// 还有数据
			if (this.modelPaginationStatus == 'more') {
				this.$store.commit('incrementModelPage');
				this.getDetail();
			} else if (this.modelPaginationStatus == 'noMore') { }
		},
		//添加设备
		addEqp() {
			let _this = this
			// 允许从相机和相册扫码
			uni.scanCode({
				success: function (res) {
					let result = res.result
					uni.navigateTo({
						url: './create?code=' + result + '&groupId=' + _this.currentGroup.id,
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
			clearInterval(this.timer)
			this.isDeviceLoading = true
			uni.showLoading({ title: this.$t('common.loading'), mask: true })
			const filters = {
				group_id: this.selectedGroupId,
				search: this.searchKeyword,
				page: this.$store.state.list.devicePage,
				page_size: 20
			}
			if (this.activeStatusFilter === 'online') filters.is_online = 1
			if (this.activeStatusFilter === 'offline') filters.is_online = 0
			if (this.activeStatusFilter === 'alarm') filters.warn_status = 'Y'
			deviceListApi(filters).then(res => {
				if (res.code !== 200) {
					this.showDeviceLoadMore = false
					this.devicePaginationStatus = 'noMore'
					this.toast.msg = res.msg
					this.$refs.toast.show()
					return
				}

				const pageSize = 20
				const serverUrl = uni.getStorageSync('serverAddress')
				const baseUrl = serverUrl ? serverUrl.replace('/api/v1', '').replace(/\/$/, '') : ''
				const newDevices = (res.data?.list || []).map(item => ({
					...item,
					currentIndex: 0,
					latest_ts_name: item.ts ? dayjs(item.ts).format('YYYY-MM-DD HH:mm:ss') : '',
					image_url: item.image_url ? `${baseUrl}/${String(item.image_url).replace(/^\//, '')}` : '',
					chart_data: {}
				}))

				this.devicePaginationStatus = newDevices.length === pageSize ? 'more' : 'noMore'
				this.showDeviceLoadMore = newDevices.length === pageSize
				this.deviceList = this.deviceList.concat(newDevices)
				this.$nextTick(() => {
					setTimeout(() => this.scheduleViewportSubscription(), 300)
				})
			}).catch(() => {
				this.toast.msg = this.$t('common.loadFailed')
				this.$refs.toast.show()
			}).finally(() => {
				this.isDeviceLoading = false
				uni.hideLoading()
			})
		},
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
	background: #f2f6f4;
	position: relative;
	color: #18332f;
	font-size: 28rpx;
}

/* Header */
.tp-header {
	position: relative;
	padding: 24rpx 28rpx;
	background: #0f5147;
	border-bottom: 6rpx solid #63b7a4;
}

.group-select-box {
	height: 72rpx;
	max-width: 540rpx;
	background: #174f47;
	border: 2rpx solid rgba(255, 255, 255, 0.34);
	border-radius: 6rpx;
	box-sizing: border-box;
	
	.icon-box {
		width: 72rpx;
		height: 68rpx;
		border-right: 2rpx solid rgba(255, 255, 255, 0.24);
		
		.menu-icon {
			width: 32rpx;
			height: 32rpx;
			filter: brightness(0) invert(1);
		}
	}
	
	.group-info {
		min-width: 0;
		padding: 0 18rpx;

		.group-name {
			font-size: 28rpx;
			font-weight: 500;
			color: #ffffff;
			max-width: 340rpx;
		}
		
		.clear-btn {
			width: 36rpx;
			height: 36rpx;
			margin-left: 14rpx;
			border-left: 2rpx solid rgba(255, 255, 255, 0.24);
			
			.close-icon {
				width: 16rpx;
				height: 16rpx;
				filter: brightness(0) invert(1);
				opacity: 0.8;
			}
		}
	}
}

.notify-box {
	width: 72rpx;
	height: 72rpx;
	background: #174f47;
	border-radius: 6rpx;
	position: relative;
	border: 2rpx solid rgba(255, 255, 255, 0.34);
	
	.notify-icon {
		width: 34rpx;
		height: 34rpx;
		filter: brightness(0) invert(1);

		&.notify-active {
			filter: none;
		}
	}
	
	.notify-dot {
		position: absolute;
		top: 12rpx;
		right: 12rpx;
		width: 10rpx;
		height: 10rpx;
		background: #f18a4a;
		border-radius: 50%;
		border: 2rpx solid #0f5147;
	}
}

.device-toolbar {
	padding: 22rpx 28rpx 0;
	background: #f4f7f6;
}

.device-search {
	display: flex;
	align-items: center;
	height: 76rpx;
	background: #ffffff;
	border: 2rpx solid #bdcdc8;
	border-radius: 4rpx;
	box-sizing: border-box;
}

.search-icon {
	width: 30rpx;
	height: 30rpx;
	margin-left: 22rpx;
	opacity: 0.55;
}

.search-input {
	min-width: 0;
	height: 72rpx;
	padding: 0 16rpx;
	flex: 1;
	color: #18332f;
	font-size: 26rpx;
}

.search-clear {
	padding: 12rpx;
	color: #82928d;
	font-size: 34rpx;
}

.search-action {
	height: 44rpx;
	padding: 0 22rpx;
	color: #0f6658;
	border-left: 2rpx solid #d8e2de;
	font-size: 25rpx;
	font-weight: 600;
	line-height: 44rpx;
}

.filter-scroll {
	width: 100%;
	white-space: nowrap;
}

.filter-row {
	display: inline-flex;
	gap: 12rpx;
	padding: 18rpx 0 4rpx;
}

.filter-chip {
	padding: 10rpx 20rpx;
	color: #61736d;
	background: #e7eeeb;
	border-bottom: 4rpx solid transparent;
	border-radius: 2rpx;
	font-size: 23rpx;
	line-height: 32rpx;

	&.active {
		color: #0f6658;
		background: #dcebe6;
		border-color: #147d6b;
		font-weight: 600;
	}
}

/* Content */
.tp-content {
	padding: 20rpx 28rpx 48rpx;
}

/* Device List */
.device-list {
	padding-bottom: 40rpx;
	background: #ffffff;
	border-top: 2rpx solid #cbdad5;
	border-bottom: 2rpx solid #cbdad5;
}

.empty-state {
	min-height: 300rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #82928d;

	.iconfont {
		font-size: 56rpx;
		color: #aab9b4;
		margin-bottom: 18rpx;
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
	border-radius: 8rpx 8rpx 0 0;
	border-top: 6rpx solid #147d6b;
	padding: 40rpx;
	color: #18332f;
}

.info_title {
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 30rpx;
	display: flex;
	justify-content: space-between;
	align-items: center;
	color: #18332f;
	
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
	width: 76rpx;
	height: 76rpx;
	background: #0f5147;
	border-radius: 4rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx solid #63b7a4;
	z-index: 999;
	
	.scroll-icon-img {
		width: 38rpx;
		height: 38rpx;
		filter: brightness(0) invert(1);
	}
	
	&:active {
		background: #147d6b;
	}
}
</style>
