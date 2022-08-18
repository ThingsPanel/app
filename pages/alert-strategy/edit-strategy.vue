<template>
<<<<<<< HEAD
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
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectTj(rule,'edit')">
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
						<image src="../../static/icon/del.png"></image>删除
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
				<button class="tp-btn" :class="{'vc-btn-disabled':disabled}" @tap="doUpdateSubmit">保
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
						<image src="../../static/icon/close.png" @click="$refs.addFormPopup.close()"></image>
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
=======
	<view class="tp-box tp-box-sizing tp-flex tp-flex-col">

		<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略名称</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称!" placeholder-class="tp-plc"
					v-model="name" />
			</view>
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>策略描述</view>
				<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入描述!" placeholder-class="tp-plc"
					v-model="describe" />
			</view>
		</view>

		<view class="tp-txt tp-box-sizing tp-pd-30" style="padding-top:37rpx; padding-bottom: 36rpx;">触发对象所有位置</view>

		<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
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
			<!-- 
			<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
				<view>请选择设备</view>
				<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectEqp">
					<text class="tp-mg-r-10" v-if="currentEqp.name">{{currentEqp.name}}</text>
					<view class="iconfont iconjiantou1"></view>
				</view>
			</view> -->
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
				<view class="tp-flex tp-flex-row tp-flex-j-c tp-flex-a-c"><input type="number" placeholder="输入值"
						placeholder-class="tp-plc-i" v-model="warningNum" :maxlength="6" /></view>
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
	</view>
</template>

<script>
	export default {
		data() {
			return {
<<<<<<< HEAD
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
				editId:''
=======
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
				editId: '',
				currentEqpEditId: '',
				currentSelEditKey: '',
				currentEqpSx: {},
				eqpSxList: [],
				currentSel: {}, //选择的选项值
				currentZc: {},
				zcList: [],
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
			}
		},
		onShow() {

		},
		onLoad(options) {
			this.editId = options.id
<<<<<<< HEAD
			this.getInfo()
		},
		methods: {
			// 获取修改信息
			getInfo(){
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/warning/update', {
=======
			this.getDetail()
			// 
		},
		methods: {
			//获取策略信息
			getDetail() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/warning/update', {
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					id: this.editId
				}, 'post').then(res => {
					if (res.code == 200) {
						const data = res.data
<<<<<<< HEAD
						this.formData.name = data.name
						this.formData.describe = data.describe
						this.formData.message = data.message
						this.formData.group = data.sensor
						this.formData.eqp = data.bid
						const config = JSON.parse(data.config)
						var newArry = []
						config.forEach(item=>{
							var obj = {
								tj: item.field,
								fh: item.condition,
								num: item.value,
								gx: item.operator
							}
							newArry.push(obj)
						})
						newArry.forEach(item=>{
							this.fuhaoList.forEach(fh=>{
								if(item.fh == fh.id){
									item.fhName = fh.name
								}
							})
						})
						this.relationshipList.forEach(re=>{
							newArry.forEach(item=>{
								if(item.gx == re.id){
									item.gxName = re.name
								}
							})
						})
						this.rulesList = newArry
						this.toSelectGroup('edit') // 选择分组
						this.toSelectEqp('edit') // 选择设备
						this.toSelectTj('','edit') //选择条件
					} else {
						this.toast.msg = res.message
						this.$refs.toast.show();
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
			},
			validate() {
				if(!this.formData.name){
=======
						this.describe = data.describe
						this.name = data.name
						this.message = data.message
						this.currentZc.id = data.sensor
						const config = JSON.parse(data.config)
						this.warningNum = config[0].value
						this.currentEqpSx.id = config[0].field
						this.currentSel.key = config[0].condition
						this.currentEqp.id = data.bid
						this.gxList.forEach(item => {
							if (item.id == this.currentSel.key) {
								this.currentSel = item
							}
						})
						// this.epqList = res.data
						this.getZcList()
					}
					uni.hideLoading()
				});

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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					this.toast.msg = '请输入策略名称';
					this.$refs.toast.show();
					return false
				}
<<<<<<< HEAD
				if(!this.formData.describe){
=======
				if (this.describe == '') {
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					this.toast.msg = '请输入策略描述';
					this.$refs.toast.show();
					return false
				}
<<<<<<< HEAD
				if(!this.formData.group){
					this.toast.msg = '请选择设备分组';
					this.$refs.toast.show();
					return false
				}
				if(!this.formData.eqp){
					this.toast.msg = '请选择设备';
=======
				if (this.message == '') {
					this.toast.msg = '请输入触发条件';
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					this.$refs.toast.show();
					return false
				}
				return true
			},
<<<<<<< HEAD
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
						message: this.formData.message,
						id: this.editId
					}
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/warning/edit', params, 'post').then(res => {
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
			toSelectTj(rule,type) {
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
								if(type && type == 'edit'){
									this.rulesList.forEach(rule=>{
										res.data.forEach(item=>{
											if(item.key == rule.tj){
												rule.tjName = item.name
											}
										})
									})
								}else{
									this.$refs.tiaojianPopup.open()
								}
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
			toSelectEqp(type) {
				if (this.formData.group) {
					uni.showLoading({
						title: '加载中'
					});
					this.API.apiRequest('/api/kv/current/asset/a', {
						asset_id: this.formData.group
					}, 'post').then(res => {
						if (res.code === 200) {
							if (res.data && res.data.devices.length > 0) {
								if(type && type =='edit'){
									res.data.devices.forEach(item=>{
										if(item.device_id == this.formData.eqp){
											this.formData.eqpName = item.name
										}
									})
								}else{
									this.$refs.epqPopup.open()
								}
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
			toSelectGroup(type) {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/asset/list/d', {
					business_id: uni.getStorageSync('ywId')
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							if(type && type == 'edit'){
								res.data.forEach(item=>{
									if(item.id == this.formData.group){
										this.formData.groupName = item.device_group
									}
								})
							} else {
								this.$refs.groupPopup.open()
							}
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
=======
			//保存策略
			doUpdateSubmit() {
				if (this.validate()) {
					uni.showLoading({
						title: '加载中'
					});
					var params = {
						wid: '92a00bb5-f28e-4849-baa5-f1edd85649e6',
						// bid: this.currentEqp.id,
						// sensor: this.currentSel.key,
						// name: this.name,
						// describe: this.describe,
						// message: this.message,

						id: this.editId,
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
					}
					this.API.apiRequest('/warning/edit', params, 'post').then(res => {
						if (res.code == 200) {
							// this.empty()
							uni.showToast({
								title: res.message
							})
							this.getDetail()
						}
						uni.hideLoading()
					});
				}
			},
			// empty() {
			// 	this.name = ''
			// 	this.describe = ''
			// 	this.message = ''
			// 	this.currentEqp = {}
			// 	this.currentSel = ''
			// },
			//弹出设备选择
			toSelectEqp() {
				this.$refs.epqPopup.open()
			},
			//确定选择设备
			// comfirEqp(eqp) {
			// 	this.$refs.epqPopup.close()
			// 	this.currentEqp = eqp
			// 	this.currentEqp.id = eqp.id
			// 	this.getSelectData()
			// },
			//确定选择选择值
			confirmNum(sel) {
				this.currentSel = sel
				this.currentSel.key = sel.key
				this.$refs.selectPopup.close()
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
						res.data.forEach(item => {
							if (item.id == this.currentZc.id) {
								this.currentZc = item
							}
						})
						this.getEpqData()
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
					asset_id: this.currentZc.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.epqList = res.data
						const data = res.data
						data.forEach(item => {
							if (item.id == this.currentEqp.id) {
								this.currentEqp = item
							}
						})
						this.getEqpType()

					}
					uni.hideLoading()
				});
			},
			//获取设备属性列表
			getEqpType() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/automation/show', {
					bid: this.currentEqp.id
				}, 'post').then(res => {
					if (res.code == 200) {
						this.eqpSxList = res.data
						const data = res.data
						data.forEach(item => {
							if (item.key == this.currentEqpSx.id) {
								this.currentEqpSx = item
							}
						})
					}
					uni.hideLoading()
				});
			},
			//弹出设备选择
			toSelectEqp() {
				if (this.currentZc.id == undefined) {
					this.toast.msg = '请先选择资产'
					this.$refs.toast.show();
				} else {
					if (this.epqList.length == 0) {
						this.toast.msg = '该资产没有对应的设备';
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
				this.currentEqpSx = {}
				this.getEqpType(this.currentEqp.id)
			},
			//确定选择设备属性
			confirmEqpSx(eqpsx) {
				this.currentEqpSx = eqpsx
				this.$refs.eqpSxPopup.close()
			},
			//点击选择值
			toSelectData() {
				if (this.currentEqp.id) {
					this.$refs.selectPopup.open()
				} else {
					this.toast.msg = '请先选择设备';
					this.$refs.toast.show();
				}
			},
			//弹出设备属性
			toSelectEqpSx() {
				if (this.currentEqp.id == '' || this.currentEqp.id == undefined) {
					this.toast.msg = '请先选择触发条件的设备';
					this.$refs.toast.show();
				} else {
					if (this.eqpSxList.length == 0) {
						this.toast.msg = '该设备没有对应的触发条件';
						this.$refs.toast.show();
					} else {
						this.$refs.eqpSxPopup.open()
					}
				}

			},
			//选择资产
			confirmZc(zc) {
				this.currentZc = zc
				this.$refs.zcPopup.close()
				this.currentEqp={}
				this.currentEqpSx = {}
				this.getEpqData()
			},
			//弹出选择资产
			toSelectZc() {
				this.$refs.zcPopup.open()
			},
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
		}
	}
</script>

<style>
<<<<<<< HEAD
	@import '@/common/alert-strategy.css';
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
</style>
