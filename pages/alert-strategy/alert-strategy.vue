<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">
			<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>策略名称</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称" placeholder-class="tp-plc"
						v-model="formData.name" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>策略描述</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入描述" placeholder-class="tp-plc"
						v-model="formData.describe" />
				</view>
			</view>
			<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30 tp_pd_l_r_80">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请选择设备分组</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectGroup">
						<text class="tp-mg-r-10" v-if="formData.groupName">{{formData.groupName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请选择设备</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectEqp">
						<text class="tp-mg-r-10" v-if="formData.eqpName">{{formData.eqpName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
			</view>
			<view class="tp-txt tp-box-sizing tp-pd-30">触发条件
				<view class="add_btn" @click="toAdd">
					+新增一行
				</view>
			</view>
			<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30 tp_pd_l_r_80" v-for="(rule,index) in rulesList"
				:key="index">
				<view class="info_header" v-if="rule.gxName">
					<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
					</view>
					<view class="info_header_d">
						{{rule.gxName}}
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请选择条件</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectTj(rule)">
						<text class="tp-mg-r-10" v-if="rule.tjName">{{rule.tjName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请选择符号</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectFh(rule)">
						<text class="tp-mg-r-10" v-if="rule.fhName">{{rule.fhName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请输入值</view>
					<input type="number" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值" placeholder-class="tp-plc"
						v-model="rule.num" v-if="rule.filedType == 3" />
					<input v-else type="text'" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
						placeholder-class="tp-plc" v-model="rule.num" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="index!=0">
					<view class="del_btn" @click="toDel(data,index)">
						<image src="/static/icon/del.png"></image>删除
					</view>
				</view>
			</view>
			<view class="tp-panel tp-panel-textarea tp-flex tp-flex-col tp-mg-30 tp-box-sizing tp-pd-20">
				<view class="tp-mg-b-20">信息</view>
				<view>
					<textarea placeholder="请在此处填写信息" class="tp-box-sizing tp-pd-20" placeholder-class="tp-plc-i"
						v-model="formData.message"></textarea>
				</view>
			</view>
			<view class="tp-box-sizing tp-pd-l-r-30">
				<button class="tp-btn" @click="doUpdateSubmit">保
					存</button>
			</view>
			<!-- 分组 -->
			<uni-popup ref="groupPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '700rpx' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in eqpGroupsList" :key="index"
							@click="toConfirmeqpGroup(item)">
							{{item.device_group}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 设备 -->
			<uni-popup ref="epqPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '700rpx' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in eqpList" :key="index" @click="comfirEqp(item)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 条件 -->
			<uni-popup ref="tiaojianPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in conditionList" :key="index"
							@click="confirmCondition(item)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 符号 -->
			<uni-popup ref="fuhaoPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in fuhaoList" :key="index"
							@click="confirmFh(item)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 关系 -->
			<uni-popup ref="relationshipPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in relationshipList" :key="index"
							@click="confirmrRelationship(item)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 新增触发条件 -->
			<uni-popup ref="addFormPopup" type="bottom" :mask="true" :maskClick="true">
				<view class="logInfo">
					<view class="info_title">
						新增触发条件
						<image src="/static/icon/close.png" alt="" @click="$refs.addFormPopup.close()"></image>
					</view>
					<view class="info_header">
						<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
						</view>
						<view class="info_header_d">
							{{addForm.gxName}}
						</view>
						<span class="info_header_t" @click="relationship()">
							<view class="iconfont iconjiantou1"></view>
						</span>
					</view>
					<view class="info_list">
						<view class="item" @click="toSelectTjAdd">
							<view class="value">
								请选择条件：
							</view>
							<view class="label">
								{{addForm.tjName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" @click="toSelectFhAdd">
							<view class="value">
								请选择符号：
							</view>
							<view class="label">
								{{addForm.fhName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item">
							<view class="value">
								数值：
							</view>
							<input type="number" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addForm.num" v-if="addForm.filedType == 3" />
							<input v-else type="text" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addForm.num" />
						</view>
					</view>
					<view class="info_btn">
						<view class="btn_del" @click="$refs.addFormPopup.close()">取消</view>
						<view class="btn_save" @click="saveAddForm()">
							保存
						</view>
					</view>
				</view>
			</uni-popup>

			<!-- 消息提示框 -->
			<cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				conditionList: [],
				currentRule: {
					tj: '',
					tjName: '',
					fh: '',
					fhName: '',
					filedType: '',
					num: '',
					field_symbol: ''
				},
				addForm: {
					tj: '',
					tjName: '',
					fh: '',
					fhName: '',
					filedType: '',
					num: '',
					field_symbol: '',
					gx: '',
					gxName: ''
				},
				type: '',
				addType: '',
				relationshipList: [{
						name: '且',
						id: '&&'
					},
					{
						name: '或',
						id: '||'
					}
				], // 关系
				rulesList: [{
					tj: '',
					tjName: '',
					fh: '',
					fhName: '',
					filedType: '',
					num: '',
					field_symbol: ''
				}],
				eqpList: [],
				eqpGroupsList: [],
				loading: false,
				toast: {
					msg: ''
				},
				formData: {
					describe: '',
					name: '',
					groupName: '',
					group: '',
					eqp: '',
					eqpName: '',
					message: ''
				},
				fuhaoList: [{
						name: '大于',
						id: '>'
					},
					{
						name: '小于',
						id: '<'
					},
					{
						name: '等于',
						id: '='
					},
					{
						name: '大于等于',
						id: '≥'
					},
					{
						name: '小于等于',
						id: '≤'
					},
				],
			}
		},
		onShow() {

		},
		onLoad() {},
		methods: {
			validate() {
				if(!this.formData.name){
					this.toast.msg = '请输入策略名称';
					this.$refs.toast.show();
					return false
				}
				if(!this.formData.describe){
					this.toast.msg = '请输入策略描述';
					this.$refs.toast.show();
					return false
				}
				if(!this.formData.group){
					this.toast.msg = '请选择设备分组';
					this.$refs.toast.show();
					return false
				}
				if(!this.formData.eqp){
					this.toast.msg = '请选择设备';
					this.$refs.toast.show();
					return false
				}
				return true
			},
			// 保存告警策略
			doUpdateSubmit() {
				if (this.validate()) {
					var newArry = []
					this.rulesList.forEach((e, i) => {
						const obj = {
							field: e.tj,
							condition: e.fh,
							value: e.num,
							operator: e.gx ? e.gx : ''
						}
						newArry.push(obj)
					})
					var params = {
						wid: uni.getStorageSync('ywId'), //业务Id
						name: this.formData.name,
						describe: this.formData.describe,
						sensor: this.formData.group,
						bid: this.formData.eqp,
						config: JSON.stringify(newArry),
						message: this.formData.message
					}
				}
				console.log('params==', params)
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/warning/add', params, 'post').then(res => {
					if (res.code == 200) {
						this.toast.msg = res.message
						this.$refs.toast.show();
						uni.navigateBack(-1)
					} else {
						this.toast.msg = res.message
						this.$refs.toast.show();
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
			},
			// 新增一行
			toAdd() {
				this.$refs.addFormPopup.open()
			},
			// 删除触发条件
			toDel(data, index) {
				this.rulesList.forEach((item, itemIndex) => {
					if (itemIndex == index) {
						this.rulesList.splice(index, 1)
					}
				})
			},
			// 验证保存触发条件
			validateSave() {
				if (!this.addForm.gx) {
					this.toast.msg = '请选择关系';
					this.$refs.toast.show();
					return false
				}
				if (!this.addForm.tj) {
					this.toast.msg = '请选择条件';
					this.$refs.toast.show();
					return false
				}
				if (!this.addForm.fh) {
					this.toast.msg = '请选择符号';
					this.$refs.toast.show();
					return false
				}
				if (!this.addForm.num) {
					this.toast.msg = '请输入值';
					this.$refs.toast.show();
					return false
				}
				return true
			},
			// 保存新增触发条件
			saveAddForm() {
				if (this.validateSave()) {
					this.rulesList.push({
						tj: this.addForm.tj,
						tjName: this.addForm.tjName,
						fh: this.addForm.fh,
						fhName: this.addForm.fhName,
						filedType: this.addForm.filedType,
						num: this.addForm.num,
						field_symbol: this.addForm.field_symbol,
						gx: this.addForm.gx,
						gxName: this.addForm.gxName
					})
					this.$refs.addFormPopup.close()
				}
			},
			// 确定关系
			confirmrRelationship(item) {
				this.addForm.gx = item.id
				this.addForm.gxName = item.name
				this.$refs.relationshipPopup.close()
				this.$refs.addFormPopup.open()
			},
			// 选择关系
			relationship() {
				this.$refs.addFormPopup.close()
				this.$refs.relationshipPopup.open()
			},
			// 确定符号
			confirmFh(item) {
				if (this.type == '1') {
					this.currentRule.fh = item.id
					this.currentRule.fhName = item.name
					this.$refs.fuhaoPopup.close()
				} else if (this.addType == '1') {
					this.addForm.fh = item.id
					this.addForm.fhName = item.name
					this.$refs.fuhaoPopup.close()
					this.$refs.addFormPopup.open()
				}
			},
			// 新增框选择符号
			toSelectFhAdd() {
				this.type = ''
				this.addType = '1'
				this.$refs.addFormPopup.close()
				this.$refs.fuhaoPopup.open()
			},
			// 选择符号
			toSelectFh(rule) {
				this.type = '1'
				this.addType = ''
				this.currentRule = rule
				this.$refs.fuhaoPopup.open()
			},
			// 确定条件选择
			confirmCondition(item) {
				if (this.type == '1') {
					this.currentRule.tj = item.key
					this.currentRule.tjName = item.name
					this.currentRule.filedType = item.type
					this.currentRule.field_symbol = item.symbol
					this.$refs.tiaojianPopup.close()
				} else if (this.addType == '1') {
					this.addForm.tj = item.key
					this.addForm.tjName = item.name
					this.addForm.filedType = item.type
					this.addForm.field_symbol = item.symbol
					this.$refs.tiaojianPopup.close()
					this.$refs.addFormPopup.open()
				}
			},
			// 新增框选择条件
			toSelectTjAdd() {
				this.type = ''
				this.addType = '1'
				if (this.formData.eqp) {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/automation/show', {
						bid: this.formData.eqp
					}, 'post').then(res => {
						if (res.code === 200) {
							if (res.data && res.data.length > 0) {
								this.$refs.addFormPopup.close()
								this.$refs.tiaojianPopup.open()
								this.conditionList = res.data
							} else {
								this.toast.msg = '暂无可选择数据';
								this.$refs.toast.show();
							}
						}
						uni.hideLoading()
					}).finally(() => {
						uni.hideLoading()
					});
				} else {
					this.toast.msg = '请选择设备';
					this.$refs.toast.show();
				}
			},
			// 选择条件
			toSelectTj(rule) {
				this.type = '1'
				this.addType = ''
				this.currentRule = rule
				if (this.formData.eqp) {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/automation/show', {
						bid: this.formData.eqp
					}, 'post').then(res => {
						if (res.code === 200) {
							if (res.data && res.data.length > 0) {
								this.$refs.tiaojianPopup.open()
								this.conditionList = res.data
							} else {
								this.toast.msg = '暂无可选择数据';
								this.$refs.toast.show();
							}
						}
						uni.hideLoading()
					}).finally(() => {
						uni.hideLoading()
					});
				} else {
					this.toast.msg = '请选择设备';
					this.$refs.toast.show();
				}
			},
			// 确定选择设备
			comfirEqp(item) {
				this.formData.eqp = item.device_id
				this.formData.eqpName = item.name
				this.$refs.epqPopup.close()
			},
			// 选择设备
			toSelectEqp() {
				if (this.formData.groupName) {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/kv/current/asset/a', {
						asset_id: this.formData.group
					}, 'post').then(res => {
						if (res.code === 200) {
							if (res.data && res.data.devices.length > 0) {
								this.$refs.epqPopup.open()
								this.eqpList = res.data.devices
							} else {
								this.toast.msg = '暂无可选择数据';
								this.$refs.toast.show();
							}
						}
						uni.hideLoading()
					}).finally(() => {
						uni.hideLoading()
					});
				} else {
					this.toast.msg = '请选择设备分组';
					this.$refs.toast.show();
				}
			},
			// 确定选择设备分组
			toConfirmeqpGroup(item) {
				this.formData.group = item.id
				this.formData.groupName = item.device_group
				this.$refs.groupPopup.close()
			},
			// 选择设备分组
			toSelectGroup() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/asset/list/d', {
					business_id: uni.getStorageSync('ywId')
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							this.$refs.groupPopup.open()
							this.eqpGroupsList = res.data
						} else {
							this.toast.msg = '暂无可选择数据';
							this.$refs.toast.show();
						}
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
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
			}
		}
	}
</script>

<style>
	@import '@/common/alert-strategy.css';
</style>
