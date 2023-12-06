<template>
	<view :style="{ height: pageHeight, 'overflow-y': 'auto' }" class="device_list">
		<view class="content device_item"
			:style="{ marginTop: marginTopHeight, display: 'inline-block', width: '100%', 'box-sizing': 'border-box' }">
			<view class="device">
				<view class="device_img">
					<image src="/static/image/device_icon.png" mode=""></image>
				</view>
				<view class="device_info">
					<view class="device_name">
						<span class="name">{{ device_name }}</span>
						<span class="state green" v-if="device_state == 1">• 在线</span>
						<span class="state" v-if="device_state == 0">• 离线</span>
					</view>
					<view class="updatetime">
						更新时间: <span v-if="latest_ts_name">{{ latest_ts_name }}</span>
					</view>
				</view>
			</view>
			<!-- 当前值 -->
			<view class="device_tab" v-if="textCompData.length > 0">
				<view v-for="(item, index) in textCompData" :key="index" @click="changeIndex(index)"
					:class="currentValueIndex == index ? 'device_tab_item active' : 'device_tab_item'">
					<view class="device_tab_item_container">
						<view class="tab-label" v-if="item.name">
							{{ item.name }}
						</view>
						<view class="tab-value" :class="item.type ? 'small-font' : ''">

							{{ item.value }}
							<view class="value-unit" v-if="item.unit">
								{{ item.unit }}
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="jiance" v-for="(chart, index) in device.chartData" :key="index">
				<view style="height: 488rpx;margin-bottom: 40rpx;">
					<view>{{ chart.name }}</view>
					<l-echart class="echart-container" ref="chartRef"></l-echart>
				</view>
			</view>
			<view class="control" v-if="device.controlData.length > 0">
				<view class="control_t">
					控制
				</view>
				<view class="control_l" v-if="device.controlData.length > 0">
					<block v-for="(item, index) in device.controlData" :key="index">
						<view class="control_l_item">
							<view class="control_l_item_l">
								<view class="iconfontImg">
									<image src="/static/icon/device_close.png" v-if="item.value == 0" />
									<image src="/static/icon/device_on.png" v-if="item.value == 1" />
								</view>
								<view style="margin-left: 24rpx;">
									<view class="sp_item_title">{{ item.typeName }}</view>
									<view class="sp_item_status" v-if="item.state == 0 && item.type == 'switch'">关闭
									</view>
									<view class="sp_item_status" v-if="item.state == 1 && item.type == 'switch'">开启
									</view>
								</view>
							</view>
							<view class="control_l_item_r" v-if="item.type == 'switch'">
								<view class="control_l_item_r_switch" @click="changSwitch(item, index)">
									<image src="/static/icon/switch_on.png" v-if="item.state == 1" />
									<image src="/static/icon/switch_close.png" v-if="item.state == 0" />
								</view>
							</view>
							<view v-else class="send">
								<input v-model="item.num" class="sendNum" type="text" />
								<button @click="toSendNum(item)">下发</button>
							</view>
						</view>
					</block>
				</view>
			</view>
			<!-- <view class="warning" v-if="warningData.length > 0">
				<view class="warning_t">
					告警
				</view>
				<view class="warning_c" v-for="(warn, index) in warningData" :key="index">
					<view class="warning_c_l">
						<view class="warning_c_l_img">
							<img src="/static/image/warning_icon.png">
						</view>
						<view class="warning_c_l_i">
							<view class="warning_c_l_i_t">
								{{warn.describe}}
							</view>
							<view class="warning_c_l_i_c">
								超过预警值3℃
							</view>  
						</view>
					</view>
				</view>
			</view> -->
			<view class="history" v-if="logData.length">
				<view class="tp-title tp-mg-t-25" style="margin-top: 35rpx; margin-left: 20rpx; margin-bottom: 10rpx">日志
				</view>
				<block>
					<view class="tp-log tp-flex tp-flex-col tp-mg-t-15">
						<view class="tp-panel tp-flex tp-flex-col tp-box-sizing tp-pd-20" v-for="(item, index) in logData" :key="index"
							@click="logInfo(item, index)">
							<view class="tp-log-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c">
								<view class="tp-time">
									{{ item.cteate_time }}
									<view class="tp-circle tp-mg-l-r-20" :class="index == currentIndex ? 'tp-active' : ''"
										style="margin-left: 10rpx;">
									</view>
								</view>

								<view class="tp-flex-1">{{ item.remark }}</view>
								<!-- <view class="tp-flex-1 color-grey">{{item.instruct.name}}</view> -->
								<view class="tp-flex-1 tp-mg-r-10 color-grey">{{item.showInstructText}}</view>
								<view v-if="index == currentIndex">
									<image src="../../static/icon/log_icon_on.png"></image>
								</view>
								<view v-else>
									<image src="../../static/icon/log_icon.png"></image>
								</view>
							</view>
						</view>
					</view>
				</block>
			</view>
		</view>
		<!-- 日志详情 -->
		<uni-popup ref="logoPopup" type="bottom" :mask="true" :maskClick="true">
			<view class="logInfo">
				<view class="info_title">
					日志详情
					<image src="../../static/icon/close.png" alt="" @click="$refs.logoPopup.close()" />
				</view>
				<view class="info_header">
					<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
					</view>
					<view class="info_header_d">
						{{ currentLog.remark }}
					</view>
					<span class="info_header_t">{{ currentLog.cteate_time }}</span>
				</view>
				<view class="info_list">
					<view class="item">
						<view class="value">
							设备名称：
						</view>
						<view class="label">
							{{ currentLog.device_name }}
						</view>
					</view>
					<view class="item">
						<view class="value">
							设备分组名称：
						</view>
						<view class="label">
							{{ currentLog.asset_name }}>{{ currentLog.device_name }}
						</view>
					</view>
					<view class="item">
						<view class="value">
							业务名称：
						</view>
						<view class="label">
							{{ currentLog.business_name }}
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
							{{ currentLog.showInstructText }}
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
	</view>
</template>

<script>
import dayjs from 'dayjs'
import * as echarts from 'echarts';
import uCharts from '@/components/u-charts/u-charts.min.js';
import customNav from '@/components/customNav/customNav.vue';
var canvaLineA = null;
var canvaLineB = null;
export default {
	components: {
		customNav
	},
	data() {
		return {
			propMap: {},
			textCompData: [],
			currentIndex: 0,
			currentLog: {},
			currentLog: {},
			statusType: 'more', //分页状态
			loadMoreShow: true,
			contentText: {
				contentdown: '上拉显示更多日志',
				contentrefresh: '正在加载...',
				contentnomore: '没有日志了'
			},
			deviceSwtichList: [{
				value: 0,
				name: '风机'
			},
			{
				value: 1,
				name: '水帘'
			},
			{
				value: 1,
				name: '照明'
			}
			],
			pageHeight: 0,
			marginTopHeight: 0,
			chartDataA: {
				categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
				series: [{
					data: [35, 36, 31, 33, 13, 34]
				}]
			},
			chartDataB: {
				categories: ["2016", "2017", "2018", "2019", "2020", "2021"],
				series: [{
					name: "目标值",
					data: [35, 36, 31, 33, 13, 34]
				}]
			},
			cWidth: '',
			cHeight: '',
			pixelRatio: 1,
			deviceType: '',
			device: {
				state: '',
				controlData: []
			},
			device_id: '',
			device_name: '',
			latest_ts_name: '',
			device_state: '',
			end_time: '',
			start_time: '',
			logData: [],
			statusWarnType: 'more',
			loadMoreWarnShow: true,
			statusType: 'more', //分页状态
			loadMoreShow: true,
			contentText: {
				contentdown: '上拉显示更多数据',
				contentrefresh: '正在加载...',
				contentnomore: '没有数据了'
			},
			warningData: [],
			currentValueData: [],
			currentValueIndex: 0,
			statusBarHeight: 0,
			socketTask: null,
			// 确保websocket是打开状态
			is_open_socket: false,
			token: '',
			// 历史曲线计时器
			timers: []
		}
	},
	onLoad(options) {
		let systemInfo = uni.getSystemInfoSync();
		this.token = uni.getStorageSync("access_token")
		this.statusBarHeight = (systemInfo.statusBarHeight || 25) + 'px'

		this.$store.commit('zerOingOffser'); //清空日志页码
		this.$store.commit('zerOingEqupPage'); //清空告警页码
		this.device_name = options.device_name
		this.deviceType = options.type
		this.device_id = options.device_id
		if (options.latest_ts_name != "undefined") {
			this.latest_ts_name = options.latest_ts_name
		}
		this.device_state = options.state
		this.cWidth = uni.upx2px(750);
		this.cHeight = uni.upx2px(420);
		this.getCurrentTime()

	},

	onShow() {
		this.marginTopHeight = uni.getStorageSync('contentPaddingTop');
		this.pageHeight = uni.getStorageSync('pageHeight');
	},
	onReady() {
		this.getDetail()
		this.connectSocketInit();
	},
	beforeDestroy() {
		this.closeSocket();
		this.clearTimer();
	},
	methods: {
		formatDate(date) {
			return dayjs(date * 1000).format('YYYY-MM-DD HH:mm')
		},
		connectSocketInit() {
			let server = uni.getStorageSync("serverAddress")
			let httpServer = new URL(server);
			const hostname = httpServer.hostname
			// 创建一个this.socketTask对象【发送、接收、关闭socket都由这个对象操作】
			this.socketTask = uni.connectSocket({
				// 【非常重要】必须确保你的服务器是成功的,如果是手机测试千万别使用ws://127.0.0.1:9099【特别容易犯的错误】
				url: `ws://${hostname}:9999/ws/device/current`,
				success(data) {
					console.log("websocket连接成功");
				},
				fail(){
					uni.showToast('链接websocket失败，端口必须是9999')
				}
			});

			// 消息的发送和接收必须在正常连接打开中,才能发送或接收【否则会失败】
			this.socketTask.onOpen((res) => {
				console.log("WebSocket连接正常打开中...！");
				this.is_open_socket = true;
				// 注：只有连接正常打开中 ，才能正常成功发送消息
				this.socketTask.send({
					data: JSON.stringify({
						device_id: this.device_id,
						token: this.token,
					}),
					async success() {
						console.log("消息发送成功");
					},
				});
				// 注：只有连接正常打开中 ，才能正常收到消息
				this.socketTask.onMessage((res) => {
					if (res.data) {
						const resData = JSON.parse(res.data)
						for (let i = 0; i < this.device.controlData.length; i++) {
							const con = this.device.controlData[i]
							for (let key in resData) {
								const val = String(resData[key])
								if (con.name == key && val) {
									console.log(`${key}__${resData[key]}`)
									this.$set(con, 'state', resData[key])
									con.state = resData[key]
								}
							}
							this.$forceUpdate()
						}
						this.setCurrentTextValue(resData)
					}
					// console.log("收到服务器内容：" + JSON.stringify(res.data));
				});
			})
			// 这里仅是事件监听【如果socket关闭了会执行】
			this.socketTask.onClose(() => {
				console.log("已经被关闭了")
			})
		},
		closeSocket() {
			this.socketTask.close({
				success(res) {
					this.is_open_socket = false;
					console.log("关闭成功", res)
				},
				fail(err) {
					console.log("关闭失败", err)
				}
			})
		},
		clickRequest() {
			if (this.is_open_socket) {
				// websocket的服务器的原理是:发送一次消息,同时返回一组数据【否则服务器会进去死循环崩溃】
				this.socketTask.send({
					data: "请求一次发送一次message",
					async success() {
						console.log("消息发送成功");
					},
				});
			}
		},
		clearTimer() {
			if (this.timers && this.timers.length) {
				for (var i = 0; i < this.timers.length; i++) {
					clearInterval(this.timers[i])
				}
			}
			this.timers = [];
		},
		changeIndex(index) {
			this.currentValueIndex = index
			this.$forceUpdate()
		},
		// 数值下发
		toSendNum(item) {
			if (item.dataType == 'float') {
				item.num = parseFloat(item.num)
			} else if (item.dataType == 'String') {
				item.num = item.num.toString()
			} else if (item.dataType == 'Integer') {
				item.num = parseInt(item.num)
			}
			if (item.num < item.dataRange.split('-')[1] && item.num >= item.dataRange.split('-')[0]) {
				const params = {
					device_id: this.device_id,
					values: {
						[item.name]: item.num
					}
				}
				this.API.apiRequest('/api/device/operating_device', params, 'post').then(res => {
					if (res.code === 200) {
						this.getCurrentTime()
						this.getLogData() //获取日志
						this.getWarningData() //获取告警信息
						this.getDetail()
					}
				});
			} else {
				uni.showToast('非法输入')
			}
		},
		// 获取设备的历史数据
		getDeviceHistory(itme, num) {
			let timestamp = (new Date()).getTime();
			const key = itme.attribute[0]
			const im = this.propMap[key]
			this.API.apiRequest('/api/kv/statistic', {
				device_id: this.device_id,
				start_time: (timestamp - 60 * 60 * 3 * 1000) * 1000, // 3小时
				end_time: timestamp * 1000,
				key,
				"aggregate_window": "30s",
				"aggregate_function": "max"
			}, 'post').then(response => {
				if (response.code == 200 && response.data) {
					let time_series = response.data.time_series || []
					time_series.forEach(x => {
						x.x = this.formatDate(x.x)
						x.y = x.y.toFixed(2)
					})
					// time_series = time_series.reverse()
					var data = response.data.systime
					var yData = [];
					var newArry = []
					var xData = []
					if (data && data.length > 0) {
						data.forEach((item, i) => {
							if (item && Math.floor((new Date(this.end_time).getTime() - new Date(item)
								.getTime()) / 1000 / 60 / 60) <= 0.5 && item.indexOf(' ') > -1) {
								var index = item.lastIndexOf(' ')
								newArry.push(item.substring(index, item.length))
							}
						})
					}
					if (newArry.length > 0) {
						newArry.forEach(item => {
							var index = item.lastIndexOf(':')
							xData.push(item.substring(0, index))
						})
					}
					itme.opts = {
						colors: ["#1890FF", '#F88B33'],
						padding: [15, 15, 0, 0],
						touchMoveLimit: 24,
						enableScroll: true,
						legend: {},
						dataset: {
							dimensions: ['x', 'y'],
							source: time_series,
						},
						width: this.cWidth * this.pixelRatio,
						height: this.cHeight * this.pixelRatio,
						xAxis: {
							type: 'time',
							disableGrid: true,
							scrollShow: true,
							itemCount: 4
						},
						yAxis: {
							data: [{
								min: 0
							}]
						},
						extra: {
							column: {
								type: "group",
								width: 30,
								activeBgColor: "#000000",
								activeBgOpacity: 0.08
							}
						}
					}
					let chartData = {
						categories: response.data.systime,
						series: yData
					}

					itme.chartData = JSON.parse(JSON.stringify(chartData));
					this.$nextTick(() => {
						const chartRef = this.$refs?.chartRef[num]
						chartRef.init(echarts, chart => {
							chart.setOption({
								animation: false,
								grid: {
									left: '15%',
									right: '10%',
									bottom: '10%',
									top: '5%',
								},
								tooltip: {
									trigger: 'axis',
									formatter(params) {
										console.log(params, im)
										let y = params[0].value.y
										if (key === 'Motiondetect') {
											if (y == 1) {
												y = '有人'
											} else {
												y = '无人'
											}
										}
										return `${params[0].value.x}
${im.title}: ${y} ${im.unit || ''}
												`
									}
								},
								dataZoom: [
									{
										type: 'inside'
									}
								],
								xAxis: {
									type: 'category',
									boundaryGap: false,
									// data:  response.data.systime
								},
								yAxis: {
									type: 'value'
								},
								dataset: {
									dimensions: ['x', 'y'],
									source: time_series,
								},
								series: [
									{
										type: 'line',
										smooth: true,
										seriesLayoutBy: 'row',
										yAxisIndex: 0,
										emphasis: { focus: 'series' }
									}
									// ...yData
								]
							});
						})
					})
					this.$forceUpdate()

				}
			}).finally(() => { });
		},
		// 改变状态
		changSwitch(item, index) {
			var state = ''
			if (item.state == 0) {
				state = 1
				this.$set(this.device.controlData[index], 'state', 1);
			} else if (item.state == 1) {
				state = 0
				this.$set(this.device.controlData[index], 'state', 0);
			}

			const params = {
				device_id: this.device_id,
				values: {
					[item.name]: state,
					// state,
					// name: item.typeName 
				}
			}
			this.API.apiRequest('/api/device/operating_device', params, 'post').then(res => {
				if (res.code === 200) {

					this.getLogData() //获取日志

				}
			});
		},
		// 获取曲线图
		showLine(canvasId, xData, yData) {
			var canvaLine = new uCharts({
				$this: this,
				enableScroll: true,
				colors: ["#1890FF", '#F88B33'],
				canvasId: canvasId,
				type: 'line',
				fontSize: 11,
				padding: [15, 20, 10, 15], //上右下左
				legend: {
					show: false,
					padding: 5,
					lineHeight: 11,
					margin: 0,
				},
				dataLabel: true,
				dataPointShape: false,
				background: '#FFFFFF',
				pixelRatio: this.pixelRatio,
				categories: xData,
				series: [{
					data: yData
				}],
				animation: true,
				xAxis: {
					disableGrid: true,
					scrollShow: true,
					itemCount: 5,
					scrollAlign: 'left', //滚动条初始位置
				},
				yAxis: {
					gridType: 'solid',
					gridColor: '#f7f7f7',
					axisLineColor: '#f7f7f7',
					fontColor: '#999999',
					dashLength: 5,
					splitNumber: 5,
					format: (val) => {
						return val.toFixed(0)
					}
				},
				extra: {
					line: {
						type: "straight",
						width: 2,
						activeType: "hollow"
					}
				},
				width: this.cWidth * this.pixelRatio,
				height: this.cHeight * this.pixelRatio
			});
		},
		// 插件查询
		getDetail() {

			this.API.apiRequest('/api/device/model/list', {
				id: this.deviceType,
				current_page: 1,
				per_page: 1
			}, 'post').then(res => {
				if (res.code === 200) {
					var data = res.data.data[0];
					this.device.valuesNew = []
					this.textCompData = []
					this.device.controlData = []
					this.device.chartData = []
					this.device.chart_data = JSON.parse(data.chart_data)
					var currentValueData = []
					if (this.device.chart_data.chart.length > 0) {
						this.device.chart_data.chart.forEach((ch, index) => {
							// 当前值
							if (this.device.chart_data.tsl.properties.length > 0) {
								this.device.chart_data.tsl.properties.forEach(pro => {
									this.propMap[pro.name] = { name: pro.name, unit: pro.unit, title: pro.title }
									if (ch.series && ch.series.length > 0 && ch.name == pro.title) {
										ch.series.forEach(se => {
											if (se.type == 'gauge') {
												this.textCompData.push({ name: ch.name, value: '', valueOld: ch.mapping[0], unit: pro.unit })
												currentValueData.push({ name: ch.name, value: '', valueOld: ch.mapping[0], unit: pro.unit })
											}
										})
									}
								})
							}

							if (ch.controlType == 'dashboard' && ['status', 'signalStatus'].includes(ch.type)) {
								if (ch.mapping && ch.mapping.length > 0) {
									// ch.mapping.forEach(map => {
									var obj = {
										name: ch.name,
										value: '',
										valueOld: Array.isArray(ch.mapping) ? ch.mapping[0] : ch.mapping,
										unit: '',
										type: ch.type,
									}
									this.textCompData.push(obj)
									// })
								}
							}
							if (ch.controlType == 'control') {
								var obj = {
									name: ch.series[0].mapping.value,
									typeName: ch.name,
									state: '',
									id: ch.id,
									disabled: ch.disabled,
									type: ch.type,
									num: ch.series[0].value,
									dataType: ch.series[0].mapping.attr.dataType,
									dataRange: ch.series[0].mapping.attr.dataRange
								}
								this.device.controlData.push(obj)
								console.log(this.device.controlData)
							}
							if (ch.controlType == 'history') {
								this.device.chartData.push({
									attribute: ch.mapping,
									name: ch.name,
									series: ch.series,
									xAxis: ch.xAxis,
									yAxis: ch.yAxis,
									id: 'canvasLine' + index,
									opts: {},
									chartData: {},
								})
							}
						})
						this.currentValueData = currentValueData
					}
					if (this.device.valuesNew.length > 0) {
						this.device.valuesNew.forEach(va => {
							for (let key in this.device.values) {
								if (va.name == key) {
									va.value = this.device.values[key]
								}
							}
						})
					}
					if (this.device.chart_data.tsl.properties && this.device.chart_data.tsl.properties.length >
						0) {
						this.device.chart_data.tsl.properties.forEach(d => {
							if (this.device.valuesNew && this.device.valuesNew.length > 0) {
								this.device.valuesNew.forEach(i => {
									if (d.name == i.name) {
										i.unit = d.unit
									}
								})
							}
						})
					}
					console.log('chartData-----', this.device.chartData)
					this.clearTimer()
					if (this.device.chartData.length > 0) {
						this.device.chartData.forEach((itme, index) => {
							this.getDeviceHistory(itme, index)
							this.timers[index] = setInterval(() => {
								this.getDeviceHistory(itme, index)
							}, 5000)
						})
					}
					if (this.device.controlData.length > 0) {
						// debugger
						this.device.controlData.forEach(va => {
							console.log(this.device.values)
							for (let key in this.device.values) {
								if (va.name == key) {
									va.state = this.device.values[key]
								}
							}
							this.getContorl(this.device, va)
						})
						this.getLogData()
					}
					this.getCurrentContorl()
					this.$forceUpdate()
				} else {
					this.toast.msg = res.msg;
					this.$refs.toast.show();
				}
				// uni.hideLoading()
			})
		},
		// 定时获取开关
		getContorl(device, con) {
			this.getDevieceKv(device, con)
		},
		// 获取设备的当前值
		getCurrentContorl() {
			const attribute = this.textCompData.map(x => x.valueOld)
			this.API.apiRequest('/api/kv/current', {
				entity_id: this.device_id,
				attribute: ["systime", ...attribute]
			}, 'post').then(res => {
				if (res.code === 200 && res.data) {
					if (this.textCompData.length > 0) {
						this.textCompData.forEach(item => {
							for (var key in res.data) {

								if (item.valueOld == key) {
									item.value = res.data[key]
									if (item.value && String(item.value).includes('.')) {
										item.value = Number(item.value).toFixed(2)
									}
									if (['status', 'signalStatus'].includes(item.type)) {
										if (item.valueOld === 'Motiondetect') {
											item.value = { 0: '无人', 1: '有人' }[item.value]
										} else {
											item.value = { 0: '关闭', 1: '开启' }[item.value]
										}
									}
								}
								if (key === 'systime') {
									this.latest_ts_name = res.data[key]
								}
							}
						})
					}
					this.$forceUpdate()
				}
			});
		},
		setCurrentTextValue(data) {
			if (this.textCompData.length > 0) {
				this.textCompData.forEach(item => {
					for (var key in data) {
						if (item.valueOld == key) {
							item.value = data[key]
							if (item.value && String(item.value).includes('.')) {
								item.value = Number(item.value).toFixed(2)
							}
							if (['status', 'signalStatus'].includes(item.type)) {
								if (item.valueOld === 'Motiondetect') {
									item.value = { 0: '无人', 1: '有人' }[item.value]
								} else {
									item.value = { 0: '关闭', 1: '开启' }[item.value]
								}
							}
						}
						if (key === 'systime') {
							this.latest_ts_name = data[key]
						}
					}
				})
			}
			this.$forceUpdate()
		},
		// 获取设备的开关状态
		getDevieceKv(device, con) {
			var newArry = []
			newArry.push(con.name)
			// uni.showLoading({
			// 	title: '加载中'
			// });
			this.API.apiRequest('/api/kv/current', {
				entity_id: this.device_id,
				attribute: newArry
			}, 'post').then(res => {
				if (res.code === 200) {
					// uni.hideLoading()
					if (res.data) {
						for (let key in res.data) {
							if (con.name == key && res.data[key]) {
								con.state = res.data[key]
							}
						}
						this.$forceUpdate()
					}
				}
			});
		},
		//获取操作日志
		getLogData() {

			this.API.apiRequest('/api/conditions/log/index', {
				current_page: 1,
				per_page: 20,
				device_id: this.device_id
			}, 'post').then(res => {
				if (res.code === 200) {
					this.logData = (res.data.data || []).map(x => {
						const instruct = JSON.parse(x.instruct)
						return {
							...x,
							instruct,
							showInstructText: x.instruct
						}
					});

				} else {
					this.toast.msg = res.message;
					this.$refs.toast.show();
				}
				// uni.hideLoading()
			});
		},
		// 日志详情
		logInfo(log, index) {
			this.currentLog = log
			this.currentIndex = index
			this.$refs.logoPopup.open()
		},
		// 加载更多
		toLoadMore() {
			// 还有数据
			if (this.statusType == 'more') {
				this.$store.commit('addOffset');
				this.getLogData();
			} else if (this.statusType == 'noMore') { }
		},
		// 获取设备告警信息
		getWarningData() {
			// uni.showLoading({
			// 	title: '加载中'
			// });
			this.API.apiRequest('/api/warning/log/list', {
				// current_page: this.$store.state.list.equpPage,
				page: 1,
				limit: 5,
				device_id: this.device_id,
				// start_date: this.start_time,
				// end_date: this.end_time
			}, 'post').then(res => {
				if (res.code === 200) {
					this.warningData = res.data.data;

				} else {
					this.toast.msg = res.msg;
					this.$refs.toast.show();
				}
				// uni.hideLoading()
			});
		},
		// 加载更多
		toLoadWarnMore() {
			// 还有数据
			if (this.statusWarnType == 'more') {
				this.$store.commit('addEqupPage');
				this.getWarningData();
			} else if (this.statusWarnType == 'noMore') { }
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
		},
		getCurrentTime() {
			//年
			let year = new Date().getFullYear();
			//月份是从0月开始获取的，所以要+1;
			let month = new Date().getMonth() + 1;
			//日
			let day = new Date().getDate();
			//时
			let hour = new Date().getHours();
			//分
			let minute = new Date().getMinutes();
			//秒
			let second = new Date().getSeconds()
			this.end_time = year + '-' + this.add0(month) + '-' + this.add0(day) + ' ' + this.add0(hour) + ':' + this
				.add0(minute) + ':' + this.add0(second)
			this.start_time = year + '-' + this.add0(month) + '-' + this.add0(day - 1) + ' ' + this.add0(hour) + ':' +
				this.add0(minute) + ':' + this.add0(second)
		},
	}
}
</script>

<style scoped>
@import '@/common/fishery-monitor.css';
@import '@/common/deviceDetail.css';
</style>
