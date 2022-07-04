<template>
	<view class="tp-box tp-box-sizing tp-flex tp-flex-col">

		<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略名称</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称" placeholder-class="tp-plc"
					v-model="name" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略描述</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入描述" placeholder-class="tp-plc"
					v-model="describe" />
			</view>
		</view>

		<view class="tp-txt tp-box-sizing tp-pd-30" style="padding-top:37rpx; padding-bottom: 36rpx;">触发对象所有位置</view>

		<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
			<!-- <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择业务</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">1号温棚</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view> -->
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择资产</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectZc">
					<text class="tp-mg-r-10" v-if="currentZc.name">{{currentZc.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>请选择设备</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectEqp">
					<text class="tp-mg-r-10" v-if="currentEqp.name">{{currentEqp.name}}</text>
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

		</view>

		<view class="tp-txt tp-box-sizing tp-pd-30">触发条件</view>

		<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
			<!-- <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>选择业务</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
					<text class="tp-mg-r-10">1号温棚</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view> -->
			<view class="tp-ipt-item-i tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="toSelectData" v-if="currentSel.name">
					{{currentSel.name}}<img src="/static/icon/up.png" style="width: 21rpx;height:21rpx;" />
				</view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c" @click="toSelectData" v-else>选择值<img
						src="/static/icon/up.png" style="width: 21rpx;height:21rpx;" /></view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c">—</view>
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c"><input type="number" :maxlength="6"
						placeholder="输入值" placeholder-class="tp-plc-i" v-model="warningNum" /></view>
			</view>
		</view>

		<view class="tp-panel tp-panel-textarea tp-flex tp-flex-col tp-mg-30 tp-box-sizing tp-pd-20">
			<view class="tp-mg-b-20">触发条件</view>
			<view>
				<textarea placeholder="请填写触发条件" class="tp-box-sizing tp-pd-20" placeholder-class="tp-plc-i"
					v-model="message"></textarea>
			</view>
		</view>

		<view class="tp-box-sizing tp-pd-l-r-30">
			<button class="tp-btn" :loading="loading" :class="{'vc-btn-disabled':disabled}" @tap="doUpdateSubmit">保
				存</button>
		</view>
		<uni-popup ref="epqPopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '700rpx' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in epqList" :key="index" @click="comfirEqp(item)">
						{{item.name}}
					</view>
				</view>
			</scroll-view>
		</uni-popup>
		<uni-popup ref="selectPopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '700rpx' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in gxList" :key="index" @click="confirmNum(item)">
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
		<!-- 资产 -->
		<uni-popup ref="zcPopup" type="bottom">
			<scroll-view :scroll-y="true" scroll-with-animation="true"
				:style="{ maxHeight: '700rpx',background:'#fff' }">
				<view class="selectlist">
					<view class="select_item" v-for="(item,index) in zcList" :key="index" @click="confirmZc(item)">
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
				loading: false,
				disabled: false,
				selectList: [], //选择值列表
				epqList: [], //设备列表
				currentEqp: {}, //选择的设备
				currentEqpSx: {},
				eqpSxList: [],
				currentSel: {}, //选择的选项值
				currentZc: {},
				zcList: [],
				toast: {
					msg: ''
				},
				describe: '',
				name: '',
				message: '',
				warningNum: '',
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
			}
		},
		onShow() {

		},
		onLoad() {
			this.getZcList()
		},
		methods: {
			//弹出设备属性
			toSelectEqpSx() {
				if (this.currentEqp.id == '' || this.currentEqp.id == undefined) {
					this.toast.msg = '请先选择触发条件的设备';
					this.$refs.toast.show();
				} else {
					if(this.eqpSxList.length == 0){
						this.toast.msg = '该设备没有对应的属性条件';
						this.$refs.toast.show();
					}else{
						this.$refs.eqpSxPopup.open()
					}
					
				}

			},
			//选择资产
			confirmZc(zc) {
				this.currentZc = zc
				this.currentEqp = {}
				this.currentEqpSx = {}
				this.$refs.zcPopup.close()
				this.getEpqData()
			},
			//弹出选择资产
			toSelectZc() {
				this.$refs.zcPopup.open()
			},
			validate() {
				if (this.currentZc.id == undefined) {
					this.toast.msg = '请先选择资产';
					this.$refs.toast.show();
					return false
				}
				if (this.currentEqp.id == undefined) {
					this.toast.msg = '请先选择设备';
					this.$refs.toast.show();
					return false
				}
				if (this.currentEqpSx.key == undefined) {
					this.toast.msg = '请先选择设备属性';
					this.$refs.toast.show();
					return false
				}
				if (this.currentSel.id == undefined) {
					this.toast.msg = '请先选择选项值';
					this.$refs.toast.show();
					return false
				}
				if (this.name == '') {
					this.toast.msg = '请输入策略名称';
					this.$refs.toast.show();
					return false
				}
				if (this.describe == '') {
					this.toast.msg = '请输入策略描述';
					this.$refs.toast.show();
					return false
				}
				if (this.message == '') {
					this.toast.msg = '请输入触发条件';
					this.$refs.toast.show();
					return false
				}
				if (this.warningNum == '') {
					this.toast.msg = '请输入值';
					this.$refs.toast.show();
					return false
				}
				return true
			},
			//保存策略
			doUpdateSubmit() {
				if (this.validate()) {
					uni.showLoading({
						title: '加载中'
					});
					var params = {
						wid: '92a00bb5-f28e-4849-baa5-f1edd85649e6',
						bid: this.currentEqp.id,
						sensor: this.currentZc.id,
						name: this.name,
						describe: this.describe,
						message: this.message,
						config: [{
							field: this.currentEqpSx.key,
							condition: this.currentSel.id,
							value: this.warningNum,
						}]
						// warningNum:this.warningNum,
					}
					this.API.apiRequest('/warning/add', params, 'post').then(res => {
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
				this.message = ''
				this.currentEqp = {}
				this.warningNum = ''
				this.currentSel = {}
				this.currentZc = {}
				this.currentEqpSx = {}
			},
			//弹出设备选择
			toSelectEqp() {
				if (this.currentZc.id == undefined) {
					this.toast.msg = '请先选择资产'
					this.$refs.toast.show();
				} else {
					if (this.epqList.length == 0) {
						this.toast.msg = '该资产没有对应的设备'
						this.$refs.toast.show();
					} else {
						this.$refs.epqPopup.open()
					}
				}
			},
			//确定选择设备
			comfirEqp(eqp) {
				this.$refs.epqPopup.close()
				this.currentEqp = eqp
				this.currentEqpSx={}
				this.getEqpType(this.currentEqp.id)
			},
			//确定选择设备属性
			confirmEqpSx(eqpsx) {
				this.currentEqpSx = eqpsx
				this.$refs.eqpSxPopup.close()
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
						this.getSelectData()
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
						// this.getEpqData()
					}
					uni.hideLoading()
				});
			},
			//确定选择选择值
			confirmNum(sel) {
				this.currentSel = sel
				this.$refs.selectPopup.close()
			},
			//获取设备列表
			getEpqData() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/device/index', {
					asset_id: this.currentZc.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.epqList = res.data
					}
					uni.hideLoading()
				});
			},
			//获取选择值列表
			getSelectData() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/automation/show', {
					bid: this.currentEqp.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.selectList = res.data
					}
					uni.hideLoading()
				});
			},

			//点击选择值
			toSelectData() {
				this.$refs.selectPopup.open()
				// if (this.currentEqp.id) {

				// } else {
				// 	this.toast.msg = '请先选择设备';
				// 	this.$refs.toast.show();
				// }
			},
		}
	}
</script>

<style>
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
