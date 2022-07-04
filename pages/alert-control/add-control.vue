<template>
	<view class="tp-box tp-box-sizing tp-flex tp-flex-col">

		<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略名称</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称" placeholder-class="tp-plc"
					v-model="name" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略描述</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入策略描述" placeholder-class="tp-plc"
					v-model="describe" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略优先级</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入策略优先级" placeholder-class="tp-plc"
					v-model="sort" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略类型</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="tpaClType">
					<text class="tp-mg-r-10" v-if="currentClType.name">{{currentClType.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
		</view>

		<view class="tp-txt tp-box-sizing tp-mg-30">触发条件</view>

		<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择资产</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectZcOne">
					<text class="tp-mg-r-10" v-if="currentZcOne.name">{{currentZcOne.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择设备</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectEqpOne">
					<text class="tp-mg-r-10" v-if="currentEqpOne.name">{{currentEqpOne.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择设备属性</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectEqpSx">
					<text class="tp-mg-r-10" v-if="currentEqpSx.name">{{currentEqpSx.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item-i tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="toGxPopup" v-if="currentGx.name">
					{{currentGx.name}}<img src="/static/icon/up.png" style="width: 21rpx;height:21rpx;" />
				</view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="toGxPopup" v-else>选择关系<img
						src="/static/icon/up.png" style="width: 21rpx;height:21rpx;" /></view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">—</view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c"><input type="number" placeholder="输入值"
						placeholder-class="tp-plc-i" v-model="warningNum" :maxlength="6" /></view>
			</view>
		</view>
		<view class="tp-txt tp-box-sizing tp-mg-30">控制指令</view>

		<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择资产</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectZcTwo">
					<text class="tp-mg-r-10" v-if="currentZcTwo.name">{{currentZcTwo.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择设备</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectEqpTwo">
					<text class="tp-mg-r-10" v-if="currentEqpTwo.name">{{currentEqpTwo.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择受控对象</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectSkdx">
					<text class="tp-mg-r-10" v-if="currentSkdx.name">{{currentSkdx.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="switchBtn">
				<view class="on">
					<view class="onIcon" v-if="switchOnOne == 1" @click="switchOnOne=0;switchCloseOne=1"></view>
					<view class="closeIcon" v-else @click="switchOnOne=1;switchOnOne=0">
						<view class="closeIconL"></view>
					</view>
					<i style="font-style: normal;">开</i>
				</view>
				<view class="close">
					<view class="closeIcon" v-if="switchCloseOne == 0" @click="switchCloseOne=1;switchOnOne=0">
						<view class="closeIconL"></view>
					</view>
					<view class="onIcon" v-else @click="switchCloseOne=0;switchOnOne=1"></view>关
				</view>
			</view>
		</view>
		<view class="tp-txt tp-box-sizing tp-mg-30"></view>
		<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30">
			<view class="tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view style="font-weight: bold;">策略状态</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<view class="switchBtn">
						<view class="on">
							<view class="onIcon" v-if="switchOnTwo == 1" @click="switchOnTwo=0;switchCloseTwo=1"></view>
							<view class="closeIcon" v-else @click="switchOnTwo=1;switchOnTwo=0">
								<view class="closeIconL"></view>
							</view>
							<i style="font-style: normal;">开</i>
						</view>
						<view class="close">
							<view class="closeIcon" v-if="switchCloseTwo == 0" @click="switchCloseTwo=1;switchOnTwo=0">
								<view class="closeIconL"></view>
							</view>
							<view class="onIcon" v-else @click="switchCloseTwo=0;switchOnTwo=1"></view>关
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- <view class="tp-box-sizing tp-mg-l-r-30">
			<view class="remark">
				<checkbox value="cb" :checked="isCheck" style="margin-right: 18rpx;" />选中下发策略到终端设备
			</view>
			<view class="info">（备注: 仅一个条件，和一个指令，且属于同一设备的情况方向允许下发）</view>
		</view> -->
		<view class="tp-box-sizing tp-mg-l-r-30">
			<button class="tp-btn" :loading="loading" :class="{'vc-btn-disabled':disabled}" @tap="doUpdateSubmit"
				style="margin-bottom: 118rpx;">保
				存</button>
		</view>
		<!-- 设备 -->
		<uni-popup ref="epqPopupOne" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in epqListOne" :key="index"
						@click="comfirEqpOne(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<uni-popup ref="epqPopupTwo" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in epqList" :key="index" @click="comfirEqpTwo(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<!-- 选择关系 -->
		<uni-popup ref="gxPopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in gxList" :key="index" @click="confirmGx(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<!-- 策略类型 -->
		<uni-popup ref="clTypePopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in clTypeList" :key="index"
						@click="confirmClType(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<!-- 资产 -->
		<uni-popup ref="zcPopupOne" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in zcList" :key="index" @click="confirmZcOne(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<uni-popup ref="zcPopupTwo" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in zcList" :key="index" @click="confirmZcTwo(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<!-- 受控对象 -->
		<uni-popup ref="skdxPopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in eqpSxListTwo" :key="index"
						@click="confirmSkdx (item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<!-- 设备属性 -->
		<uni-popup ref="eqpSxPopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in eqpSxList" :key="index"
						@click="confirmEqpSx(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<!-- 消息提示框 -->
		<cys-toast ref="toast" :msg="toast.msg" :direction="row" location="top"></cys-toast>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				switchOnOne: 0,
				switchCloseOne: 1,
				switchOnTwo: 0,
				switchCloseTwo: 1,
				switchTwo: 0,
				isCheck: false,
				loading: false,
				disabled: false,
				selectList: [], //选择值列表
				epqList: [], //设备列表
				currentEqp: {}, //选择的设备
				currentSel: {}, //选择的选项值
				toast: {
					msg: ''
				},
				describe: '',
				name: '',
				message: '',
				warningNum: '',
				clTypeList: [{
						name: '设备类型',
						id: '1'
					},
					{
						name: '时间类型',
						id: '2'
					}
				],
				currentClType: {},
				sort: '100',
				zcList: [],
				currentEqpOne: {},
				currentSkdx: {}, //受控对象
				skdxList: [],
				eqpSxList: [],
				currentGx: {},
				currentEqpOne: {},
				currentEqpTwo: {},
				currentZcTwo: {},
				currentZcOne: {},
				currentEqpSx: {},
				gxList: [{
						name: '>',
						id: '>'
					},
					{
						name: '<',
						id: '<'
					},
					{
						name: '=',
						id: '='
					},
					{
						name: '≥',
						id: '≥'
					},
					{
						name: '≤',
						id: '≤'
					},
				],
				eqpSxListTwo: [],
				epqListOne: []
			}
		},
		onShow() {

		},
		onLoad() {
			this.getZcList()
		},
		methods: {
			validate() {
				if (this.name == '') {
					this.toast.msg = '请输入策略名称';
					this.$refs.toast.show();
					return false
				}
				if (this.describe == '') {
					this.toast.msg = '请输入描述';
					this.$refs.toast.show();
					return false
				}
				if (this.currentClType.id == '' || this.currentClType.id == undefined) {
					this.toast.msg = '请先选择策略类型';
					this.$refs.toast.show();
					return false
				}
				if (this.currentZcOne.id == undefined || this.currentZcOne.id == '') {
					this.toast.msg = '请先选择触发条件的资产';
					this.$refs.toast.show();
					return false
				}

				if (this.currentEqpOne.id == undefined || this.currentEqpOne.id == '') {
					this.toast.msg = '请先选择触发条件的设备';
					this.$refs.toast.show();
					return false
				}
				if (this.currentEqpSx.key == undefined || this.currentEqpSx.key == '') {
					this.toast.msg = '请先选择触发条件的设备属性';
					this.$refs.toast.show();
					return false
				}
				if (this.currentGx.name == '' || this.currentGx.name == undefined) {
					this.toast.msg = '请选择关系';
					this.$refs.toast.show();
					return false
				}
				if (this.warningNum == '') {
					this.toast.msg = '请输入值';
					this.$refs.toast.show();
					return false
				}
				if (this.currentZcTwo.id == undefined || this.currentZcTwo.id == '') {
					this.toast.msg = '请先选择控制指令的资产';
					this.$refs.toast.show();
					return false
				}

				if (this.currentEqpTwo.id == undefined || this.currentEqpTwo.id == '') {
					this.toast.msg = '请先选择控制指令的设备';
					this.$refs.toast.show();
					return false
				}
				if (this.currentSkdx.key == undefined || this.currentSkdx.key == '') {
					this.toast.msg = '请先选择控制指令的受控对象';
					this.$refs.toast.show();
					return false
				}
				return true
			},
			//保存策略
			doUpdateSubmit() {
				if (this.validate()) {
					var switchOnOne, switchOnTwo;
					if (this.switchOnOne == 0) {
						switchOnOne = 1
					} else {
						switchOnOne = 0
					}
					if (this.switchOnTwo == 0) {
						switchOnTwo = 1
					} else {
						switchOnTwo = 0
					}
					uni.showLoading({
						title: '加载中'
					});
					var params = {
						business_id: '92a00bb5-f28e-4849-baa5-f1edd85649e6',
						status: switchOnTwo,
						name: this.name,
						sort: this.sort,
						type: this.currentClType.id,
						describe: this.describe,
						// issued: this.isCheck ? '1' : '0',
						issued: '0',
						config: {
							rules: [{
								asset_id: this.currentZcOne.id,
								duration: '0',
								field: this.currentEqpSx.key,
								device_id: this.currentEqpOne.id,
								condition: this.currentGx.name,
								value: this.warningNum,
							}],
							apply: [{
								asset_id: this.currentZcTwo.id,
								field: this.currentSkdx.key,
								device_id: this.currentEqpTwo.id,
								value: switchOnOne
							}]
						},
					}
					this.API.apiRequest('/automation/add', params, 'post').then(res => {
						if (res.code == 200) {
							this.empty()
							uni.showToast({
								title: res.message
							})
						} else {
							this.toast.msg = res.message
							this.$refs.toast.show();
						}
						uni.hideLoading()
					});
				}
			},
			empty() {
				this.name = ''
				this.describe = ''
				this.warningNum = ''
				this.currentClType = {}
				this.currentZcOne = {}
				this.currentEqpOne = {}
				this.currentEqpSx = {}
				this.currentGx = {}
				this.currentZcTwo = {}
				this.currentEqpTwo = {}
				this.currentSkdx = {}
			},
			//弹出策略类型选择
			tpaClType() {
				this.$refs.clTypePopup.open()
			},
			//选择策略类型
			confirmClType(type) {
				this.currentClType = type
				this.$refs.clTypePopup.close()
			},
			//弹出选择资产
			toSelectZcOne() {

				this.$refs.zcPopupOne.open()
			},
			//选择资产
			confirmZcOne(zc) {
				this.currentZcOne = zc
				this.epqListOne = []
				this.currentEqpOne = {}
				this.currentEqpSx = {}
				this.getEpqDataOne()
				this.$refs.zcPopupOne.close()
			},
			//弹出选择资产
			toSelectZcTwo() {
				this.$refs.zcPopupTwo.open()
			},
			//选择资产
			confirmZcTwo(zc) {
				this.currentZcTwo = zc
				this.currentZcTwo = zc
				this.epqList = ''
				this.currentEqpTwo = {}
				this.currentSkdx = {}
				this.getEpqData()
				this.$refs.zcPopupTwo.close()
			},
			//弹出受控对象选择
			toSelectSkdx() {
				if (this.currentEqpTwo.id == '' || this.currentEqpTwo.id == undefined) {
					this.toast.msg = '请先选控制指令的设备';
					this.$refs.toast.show();
				} else {
					if (this.eqpSxListTwo.length == 0) {
						this.toast.msg = '选择的控制指令设备没有受控的对象';
						this.$refs.toast.show();
					} else {
						this.$refs.skdxPopup.open()
					}
				}
				// this.$refs.skdxPopup.open()
			},
			//选择受控对象
			confirmSkdx(dx) {
				this.currentSkdx = dx
				this.$refs.skdxPopup.close()
			},
			//弹出设备属性
			toSelectEqpSx() {
				if (this.currentEqpOne.id == '' || this.currentEqpOne.id == undefined) {
					this.toast.msg = '请先选择触发条件的设备';
					this.$refs.toast.show();
				} else {
					if (this.eqpSxList.length == 0) {
						this.toast.msg = '选择的触发条件设备没有对应的属性';
						this.$refs.toast.show();
					} else {
						this.$refs.eqpSxPopup.open()
					}
				}
			},
			//确定选择设备属性
			confirmEqpSx(eqpsx) {
				this.currentEqpSx = eqpsx
				this.$refs.eqpSxPopup.close()
			},
			//弹出设备选择
			toSelectEqpOne() {
				if (this.currentZcOne.id == undefined) {
					this.toast.msg = '请先选择资产'
					this.$refs.toast.show();
				} else {
					if (this.epqListOne.length == 0) {
						this.toast.msg = '选择的资产没有对应的设备'
						this.$refs.toast.show();
					} else {
						this.$refs.epqPopupOne.open()
					}

				}
			},
			//确定选择设备
			comfirEqpOne(eqp) {
				this.$refs.epqPopupOne.close()
				this.currentEqpOne = eqp
				this.currentEqpSx = {}
				this.getEqpType(this.currentEqpOne.id)
			},
			//弹出设备选择
			toSelectEqpTwo() {
				if (this.currentZcTwo.id == undefined) {
					this.toast.msg = '请先选择资产'
					this.$refs.toast.show();
				} else {
					if (this.epqList.length == 0) {
						this.toast.msg = '选择的资产没有对应的设备'
						this.$refs.toast.show();
					} else {
						this.$refs.epqPopupTwo.open()
					}
				}
			},
			//确定选择设备
			comfirEqpTwo(eqp) {
				this.$refs.epqPopupTwo.close()
				this.currentEqpTwo = eqp
				this.currentSkdx = {}
				this.getEqpTypeTwo(this.currentEqpTwo.id)
			},
			//弹出关系弹框
			toGxPopup() {
				this.$refs.gxPopup.open()
			},
			//确定选择关系
			confirmGx(sel) {
				this.currentGx = sel
				this.$refs.gxPopup.close()
			},
			//获取设备类型
			getEqpType(id) {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/automation/show', {
					bid: id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.eqpSxList = res.data
					}
					uni.hideLoading()
				});
			},
			//获取设备类型
			getEqpTypeTwo(id) {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/automation/instruct', {
					bid: id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.eqpSxListTwo = res.data

					}
					uni.hideLoading()
				});
			},
			getEpqDataOne() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/device/index', {
					asset_id: this.currentZcOne.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.epqListOne = res.data
						// this.getZcList()
					}
					uni.hideLoading()
				});
			},
			//获取设备列表
			getEpqData() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/device/index', {
					asset_id: this.currentZcTwo.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.epqList = res.data
						// this.getZcList()
					}
					uni.hideLoading()
				});

			},
			//获取资产列表
			getZcList() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/automation/property', {
					business_id: '92a00bb5-f28e-4849-baa5-f1edd85649e6'
				}, 'post').then(res => {
					if (res.code == 200) {
						this.zcList = res.data
					}
					uni.hideLoading()
				});
			},
			//获取选择值列表
			getSelectData() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/warning/field', {
					bid: this.currentEqp.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.selectList = res.data
					}
					uni.hideLoading()
				});
			},


		},
		//获取资产列表
		getZcList() {
			uni.showLoading({
				title: '加载中'
			});
			this.API.apiRequest('/automation/property', {
				business_id: '92a00bb5-f28e-4849-baa5-f1edd85649e6'
			}, 'post').then(res => {
				if (res.code == 200) {
					this.zcList = res.data
					// this.getEpqData()
				}
				uni.hideLoading()
			});
		},
		//获取选择值列表
		getSelectData() {
			uni.showLoading({
				title: '加载中'
			});
			this.API.apiRequest('/warning/field', {
				bid: this.currentEqp.id
			}, 'post').then(res => {
				if (res.code == 200) {
					this.selectList = res.data
				}
				uni.hideLoading()
			});
		},
	}
</script>

<style>
	.info {
		font-size: 20rpx;
		font-family: Source Han Sans CN;
		font-weight: 400;
		color: #999999;
		line-height: 46rpx;
		margin-bottom: 51rpx;
	}

	.remark {
		margin-top: 47rpx;
		font-size: 26rpx;
		font-family: Source Han Sans CN;
		font-weight: bold;
		color: #434343;
	}

	.switchBtn {
		display: flex;
		text-align: right;
		float: right;
		flex: 1;
		justify-content: flex-end;
		height: 99rpx;
		line-height: 99rpx;
	}

	.on {
		display: flex;
		margin-right: 65rpx;
	}

	.onIcon {
		width: 25rpx;
		height: 25rpx;
		border: 2px solid #A5A5A5;
		background: #fff;
		border-radius: 25rpx;
		margin-top: 34rpx;
		margin-right: 10rpx;
	}

	.close {
		display: flex;
	}

	.closeIcon {
		width: 25rpx;
		height: 25rpx;
		border: 2px solid #32BAC0;
		background: #fff;
		/* padding: 10rpx; */
		border-radius: 25rpx;
		margin-top: 34rpx;
		margin-right: 10rpx;

	}

	.closeIconL {
		width: 15rpx;
		height: 15rpx;
		background: #32BAC0;
		border-radius: 15rpx;
		margin: 5rpx;
	}

	.selectlist {
		width: 100%;
		max-height: 700rpx;
		background-color: #fff;
	}

	.select_item {
		padding: 10rpx;
		text-align: center;
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
		height: 80rpx;
		line-height: 80rpx;
		border-bottom: 1rpx solid #F2F2F3;
	}

	.tp-box {
		width: 100%;
		min-height: 100vh;
		background: #F8F8F8;
		border-top: 1rpx solid #F6F6F6;
	}

	.tp-panel {
		background: #FFFFFF;
	}

	.tp-ipt-item {
		border-bottom: 1rpx solid #F1F1F1;
	}

	.tp-ipt-item>view:first-child {
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
	}

	.tp-ipt-item>input {
		font-size: 26rpx;
	}

	.tp-ipt-item>view:last-child {}

	.tp-ipt-item>view:last-child>text:first-child {
		font-size: 26rpx;
		font-weight: 500;
		color: #999999;
	}

	.tp-ipt-item>view:last-child>view:last-child {
		font-size: 26rpx;
		font-weight: 500;
		color: #999999
	}

	.tp-panel>.tp-ipt-item:last-child {
		border-bottom: none
	}

	.tp-txt {
		font-size: 26rpx;
		font-family: Source Han Sans CN;
		font-weight: 500;
		color: #434343;
	}

	.tp-ipt-item-i {}

	.tp-ipt-item-i>view:first-child,
	.tp-ipt-item-i>view:last-child {
		width: 44%;
		height: 56rpx;
		border: 1px solid #A4A4A4;
		border-radius: 4px;
		background: #FFFFFF;
	}

	.tp-ipt-item-i>view:first-child {
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
	}

	.tp-ipt-item-i>view:nth-child(2) {
		width: 4%;
	}

	.tp-ipt-item-i>view:last-child>input {
		width: 100%;
		height: 56rpx;
		text-align: center;
	}

	.tp-plc {
		font-size: 26rpx;
		font-weight: 500;
		color: #999999;
	}

	.tp-plc-i {
		font-size: 26rpx;
		font-weight: bold;
		color: #333333;
	}

	.tp-panel-textarea {
		border-radius: 10px;
	}

	.tp-panel-textarea>view:first-child {
		font-size: 26rpx;
		font-weight: bold;
		color: #666666;
	}

	.tp-panel-textarea>view:last-child {}

	.tp-panel-textarea>view:last-child>textarea {
		width: 100%;
		height: 290rpx;
		border: 1px solid #E8E8E8;
		border-radius: 10px;
	}

	.tp-btn {
		width: 100%;
		height: 86rpx;
		line-height: 86rpx;
		background: #343436;
		box-shadow: 0rpx 8rpx 31rpx 1rpx rgba(147, 147, 147, 0.35);
		border-radius: 10rpx;
		font-size: 26rpx;
		font-weight: bold;
		color: #FFFFFF;
	}

	.vc-btn-disabled {
		background: #888888;
	}
</style>
