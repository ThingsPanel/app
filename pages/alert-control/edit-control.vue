<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">

			<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>策略名称</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称" placeholder-class="tp-plc"
						v-model="formData.name" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>策略描述</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入策略描述" placeholder-class="tp-plc"
						v-model="formData.describe" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>策略优先级</view>
					<input type="number" class="tp-flex-1 tp-mg-l-20" placeholder="请输入策略优先级" placeholder-class="tp-plc"
						v-model="formData.sort" />
				</view>
			</view>

			<view class="tp-txt tp-box-sizing tp-mg-30">触发条件
				<view class="add_btn" @click="toAddtrig">
					+新增一行
				</view>
			</view>
			<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30" v-for="(data,index) in trigList" :key='index'
				:style="{background:index==0?'#fff':'#F6F8FA'}">
				<view class="info_header" v-if="data.relationship">
					<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
					</view>
					<view class="info_header_d">
						{{data.relationshipName}}
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="index == 0">
					<view>设备条件类型</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectConditionType(data,'trig')">
						<text class="tp-mg-r-10" v-if="data.conditionTypeName">{{data.conditionTypeName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 1">
					<view>请选择设备分组</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectEqpGroup(data,'trig')">
						<text class="tp-mg-r-10" v-if="data.eqpGroupName">{{data.eqpGroupName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 1">
					<view>请选择设备</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectEqp(data,'trig')">
						<text class="tp-mg-r-10" v-if="data.eqpName">{{data.eqpName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 1">
					<view>条件</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectCondition(data,'trig')">
						<text class="tp-mg-r-10" v-if="data.conditionName">{{data.conditionName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 1">
					<view>符号</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectSymbol(data,'trig')">
						<text class="tp-mg-r-10" v-if="data.symbolName">{{data.symbolName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 1">
					<view>数值</view>
					<input type="number" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
						placeholder-class="tp-plc" v-model="data.trigNum" v-if="data.filedType == 3" />
					<input v-else type="text'" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
						placeholder-class="tp-plc" v-model="data.trigNum" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 2">
					<view>次数</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="toSelectCishu(data)">
						<text class="tp-mg-r-10" v-if="data.cishuName">{{data.cishuName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="trigList[0].conditionType == 2">
					<view v-if="data.cishu == 0">日期</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" v-if="data.cishu == 0">
						<uni-datetime-picker type="datetime" v-model="data.dateTime">
							<view style="font-size: 26rpx;color: #999;text-align: right;">
								{{data.dateTime?data.dateTime:'请选择日期'}}
							</view>
						</uni-datetime-picker>
						<view class="iconfont iconjiantou1"></view>
					</view>
					<view v-if="data.cishu == 1">时间</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" v-if="data.cishu == 1">
						<picker mode="time" :value="data.dateTime" start="00:00" end="23:59"
							@change="bindTimeChange(data,$event)" v-model="data.dateTime">
							<view class="uni-input">{{data.dateTime?data.dateTime:'请选择时间'}}</view>
						</picker>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="index!=0">
					<view class="del_btn" @click="toDeltrig(data,index)">
						<image src="/static/icon/del.png"></image>删除
					</view>
				</view>
			</view>
			<view class="tp-txt tp-box-sizing tp-mg-30">执行命令
				<view class="add_btn" @click="toAddCon">
					+新增一行
				</view>
			</view>

			<view class="tp-panel tp-flex tp-flex-col tp-mg-l-r-30" v-for="(data,index) in controlList" :key="index"
				:style="{background:index==0?'#fff':'#F6F8FA',marginBottom: '15rpx'}">
				<view class="info_header" v-if="data.relationship">
					<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
					</view>
					<view class="info_header_d">
						{{data.relationshipName}}
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请选择设备分组</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectEqpGroup(data,'con')">
						<text class="tp-mg-r-10" v-if="data.eqpGroupName">{{data.eqpGroupName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>请选择设备</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectEqp(data,'con')">
						<text class="tp-mg-r-10" v-if="data.eqpName">{{data.eqpName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>条件</view>
					<view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c"
						@click="toSelectCondition(data,'con')">
						<text class="tp-mg-r-10" v-if="data.conditionName">{{data.conditionName}}</text>
						<view class="iconfont iconjiantou1"></view>
					</view>
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>数值</view>
					<!-- <input :type="data.filedType == 3 ? 'number' : 'text'" class="tp-flex-1 tp-mg-l-20"
						placeholder="请输入数值" placeholder-class="tp-plc" v-model="data.conNum" /> -->
					<input type="number" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
						placeholder-class="tp-plc" v-model="data.conNum" v-if="data.filedType == 3" />
					<input v-else type="text'" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
						placeholder-class="tp-plc" v-model="data.conNum" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-pd-t-b-25"
					v-if="index!=0">
					<view class="del_btn" @click="toDelCon(data,index)">
						<image src="/static/icon/del.png"></image>删除
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
								<view class="onIcon" v-if="switchOnTwo == 1" @click="switchOnTwo=0;switchCloseTwo=1">
								</view>
								<view class="closeIcon" v-else @click="switchOnTwo=1;switchCloseTwo=0">
									<view class="closeIconL"></view>
								</view>
								<i style="font-style: normal;">开</i>
							</view>
							<view class="close">
								<view class="closeIcon" v-if="switchCloseTwo == 0"
									@click="switchCloseTwo=1;switchOnTwo=0">
									<view class="closeIconL"></view>
								</view>
								<view class="onIcon" v-else @click="switchCloseTwo=0;switchOnTwo=1"></view>关
							</view>
						</view>
					</view>
				</view>
			</view>
			<view class="tp-box-sizing tp-mg-l-r-30" style="padding: 0;">
				<button class="tp-btn" :loading="loading" :class="{'vc-btn-disabled':disabled}" @tap="doUpdateSubmit"
					style="margin-bottom: 118rpx;">保
					存</button>
			</view>
			<!-- 设备条件类型 -->
			<uni-popup ref="conditionType" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in conditionTypeList" :key="index"
							@click="comfirConditionType(item)">
							{{item.label}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 设备分组 -->
			<uni-popup ref="eqpGroups" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in eqpGroupsList" :key="index"
							@click="toConfirmeqpGroup(item)">
							{{item.device_group}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 设备 -->
			<uni-popup ref="eqpPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in eqpList" :key="index" @click="comfirEqp(item)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>
			<!-- 选择条件 -->
			<uni-popup ref="conditionPopup" type="bottom">
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
			<!-- 选择符号 -->
			<uni-popup ref="symbolPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in symbolList" :key="index"
							@click="confirmSymbol(item)">
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
			<!-- 选择次数 -->
			<uni-popup ref="cishuPopup" type="bottom">
				<scroll-view :scroll-y="true" scroll-with-animation="true"
					:style="{ maxHeight: '700rpx',background:'#fff' }">
					<view class="selectlist">
						<view class="select_item" v-for="(item,index) in cishuList" :key="index"
							@click="confirmrCishu(item)">
							{{item.name}}
						</view>
					</view>
				</scroll-view>
			</uni-popup>

			<!-- 新增触发条件 -->
			<uni-popup ref="addtrigPopup" type="bottom" :mask="true" :maskClick="true">
				<view class="logInfo">
					<view class="info_title">
						新增触发条件
						<image src="../../static/icon/close.png" alt="" @click="$refs.addtrigPopup.close()"></image>
					</view>
					<view class="info_header">
						<view class="tp-circle tp-mg-l-r-20 tp-active" style="margin-left: 10rpx;">
						</view>
						<view class="info_header_d">
							{{addTrigForm.relationshipName}}
						</view>
						<span class="info_header_t" @click="relationship('trig')">
							<view class="iconfont iconjiantou1"></view>
						</span>
					</view>
					<view class="info_list" v-if="trigList[0].conditionType == 1">
						<view class="item" @click="toSelectEqpGroupAdd('trig')">
							<view class="value">
								请选择设备分组：
							</view>
							<view class="label">
								{{addTrigForm.eqpGroupName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" @click="toSelectEqpAdd('trig')">
							<view class="value">
								请选择设备：
							</view>
							<view class="label">
								{{addTrigForm.eqpName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" @click="toSelectConditionAdd('trig')">
							<view class="value">
								条件：
							</view>
							<view class="label">
								{{addTrigForm.conditionName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" @click="toSelectSymbolAdd('trig')">
							<view class="value">
								符号：
							</view>
							<view class="label">
								{{addTrigForm.symbolName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item">
							<view class="value">
								数值：
							</view>
							<!-- <input :type="addTrigForm.filedType == 3 ? 'number' : 'text'" class="input_num"
								placeholder="请输入数值" placeholder-class="tp-plc" v-model="addTrigForm.trigNum" /> -->
							<input type="number" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addTrigForm.trigNum"
								v-if="addTrigForm.filedType == 3" />
							<input v-else type="text'" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addTrigForm.trigNum" />
						</view>
					</view>
					<view class="info_list" v-if="trigList[0].conditionType == 2">
						<view class="item" @click="toSelectCishuAdd()">
							<view class="value">
								次数：
							</view>
							<view class="label">
								{{addTrigForm.cishuName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" v-if="addTrigForm.cishu == 0">
							<view class="value">
								日期：
							</view>
							<view class="label">
								<uni-datetime-picker type="datetime" v-model="addTrigForm.dateTime"
									@change="changeLog" />
								<!-- {{addTrigForm.eqpName}} -->
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" v-if="addTrigForm.cishu == 1">
							<view class="value">
								时间：
							</view>
							<view class="label">
								<picker mode="time" :value="addTrigForm.dateTime" start="00:00" end="23:59"
									@change="bindTimeChangeAdd($event)">
									<view class="uni-input">{{addTrigForm.dateTime?addTrigForm.dateTime:'请选择时间'}}</view>
								</picker>
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
					</view>
					<view class="info_btn">
						<view class="btn_del" @click="$refs.addtrigPopup.close()">取消</view>
						<view class="btn_save" @click="saveTrig()">
							保存
						</view>
					</view>
				</view>
			</uni-popup>
			<!-- 新增执行命令 -->
			<uni-popup ref="addConPopup" type="bottom" :mask="true" :maskClick="true">
				<view class="logInfo">
					<view class="info_title">
						新增执行命令
						<image src="../../static/icon/close.png" alt="" @click="$refs.addConPopup.close()"></image>
					</view>
					<view class="info_list">
						<view class="item" @click="toSelectEqpGroupAdd('con')">
							<view class="value">
								请选择设备分组：
							</view>
							<view class="label">
								{{addConForm.eqpGroupName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" @click="toSelectEqpAdd('con')">
							<view class="value">
								请选择设备：
							</view>
							<view class="label">
								{{addConForm.eqpName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item" @click="toSelectConditionAdd('con')">
							<view class="value">
								条件：
							</view>
							<view class="label">
								{{addConForm.conditionName}}
							</view>
							<view class="iconfont iconjiantou1"></view>
						</view>
						<view class="item">
							<view class="value">
								数值：
							</view>
							<input type="number" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addConForm.conNum"
								v-if="addConForm.filedType == 3" />
							<input v-else type="text'" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addConForm.conNum" />
							<!-- <input :type="addConForm.filedType == 3 ? 'number' : 'text'" class="input_num"
								placeholder="请输入数值" placeholder-class="tp-plc" v-model="addConForm.conNum" /> -->
						</view>
					</view>
					<view class="info_btn">
						<view class="btn_del" @click="$refs.addConPopup.close()">取消</view>
						<view class="btn_save" @click="saveCon()">
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
				addType: '',
				addTrigForm: {
					eqpGroup: '',
					eqpGroupName: '',
					eqp: '',
					eqpName: '',
					condition: '',
					conditionName: '',
					filedType: '',
					symbol: '',
					symbolName: '',
					trigNum: '',
					relationship: '',
					relationshipName: '',
					cishu: 0,
					cishuName: '单次',
					dateTime: ''
				},
				addConForm: {
					eqpGroup: '',
					eqpGroupName: '',
					eqp: '',
					eqpName: '',
					condition: '',
					conditionName: '',
					filedType: '',
					conNum: '',
					relationship: '',
					relationshipName: ''
				},
				trigList: [{
					conditionType: 1,
					conditionTypeName: '设备条件类型',
					eqpGroup: '',
					eqpGroupName: '',
					eqp: '',
					eqpName: '',
					condition: '',
					conditionName: '',
					filedType: '',
					symbol: '',
					symbolName: '',
					trigNum: '',
					relationship: '',
					relationshipName: '',
					cishu: 0,
					cishuName: '单次',
					dateTime: ''
				}], // 触发条件
				controlList: [{
					eqpGroup: '',
					eqpGroupName: '',
					eqp: '',
					eqpName: '',
					condition: '',
					conditionName: '',
					filedType: '',
					conNum: ''
				}],
				relationshipList: [{
						name: '且',
						id: '&&'
					},
					{
						name: '或',
						id: '||'
					}
				], // 关系
				conditionList: [], // 条件
				eqpGroupsList: [], // 设备分组
				conditionTypeList: [{
						label: '设备条件类型',
						value: 1
					},
					{
						label: '时间条件类型',
						value: 2
					}
				], // 条件类型
				symbolList: [{
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
				], // 符号
				switchOnTwo: 0, // 开关状态
				switchCloseTwo: 1,
				loading: false,
				disabled: false,
				eqpList: [], //设备列表
				currentEqp: {}, //选择的设备
				toast: {
					msg: ''
				},
				formData: {
					describe: '',
					name: '',
					sort: 100
				},
				currentTrigData: {}, // 当前触发条件
				currentConData: {}, //当前执行命令
				cishuList: [{
						name: '单次',
						id: 0
					},
					{
						name: '每天',
						id: 1
					}
				]
			}
		},
		onShow() {

		},
		onLoad(options) {
			this.editId = options.id
			this.getInfo()
		},
		methods: {
			// 获取策略信息
			getInfo() {
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/automation/details', {
					id: this.editId
				}, 'post').then(res => {
					if (res.code == 200) {
						this.formData.name = res.data.name
						this.formData.describe = res.data.describe
						this.formData.sort = res.data.sort
						if(res.data.status == '1') {
							this.switchOnTwo =  0 //开
							this.switchCloseTwo = 1
						} else {
							this.switchOnTwo =  1 //关
							this.switchCloseTwo = 0
						}
						const rules = JSON.parse(res.data.config).rules
						const applys= JSON.parse(res.data.config).apply
						var trigList = []
						var controlList = []	
						if (res.data.type == 1) {
							rules.forEach((item, index) => {								
								var obj = {
									conditionType: index == 0 ? res.data.type : '',
									conditionTypeName: index == 0 ? this.conditionTypeList.filter(
										item => {
											return item.value == res.data.type
										})[0].label : '',
									eqpGroup: item.asset_id,
									eqpGroupName: '',
									eqp: item.device_id,
									eqpName: '',
									condition: item.field,
									conditionName: '',
									filedType: '',
									symbol: item.condition,
									symbolName: '',
									trigNum: item.value,
									relationship: index != 0 ? item.operator : '',
									relationshipName: index != 0 && item.operator ? this.relationshipList.filter(
										c => {
											return c.id == item.operator
										})[0].name : '',
									cishu: 0,
									cishuName: '单次',
									dateTime: ''
								}
								trigList.push(obj)
							})
							this.trigList = trigList							
							applys.forEach((item, index) => {
								var obj = {
									eqpGroup: item.asset_id,
									eqpGroupName: '',
									eqp: item.device_id,
									eqpName: '',
									condition: item.field,
									conditionName: '',
									filedType: '',
									conNum: item.value
								}
								controlList.push(obj)
							})
							this.controlList = controlList
							this.toSelectEqpGroup({},'edit') //设备分组
							this.trigList.forEach(item=>{
								this.toSelectEqp(item, 'edit') //设备
								this.toSelectCondition(item, 'edit')
								this.symbolList.forEach(sy=>{
									if(sy.id == item.symbol){
										item.symbolName = sy.name
									}
								})
							})
							this.controlList.forEach(item=>{
								this.toSelectEqp(item, 'edit') //设备
								this.toSelectCondition(item, 'edit')
								this.symbolList.forEach(sy=>{
									if(sy.id == item.symbol){
										item.symbolName = sy.name
									}
								})
							})
						} else {
							rules.forEach((item, index) => {
								var obj
								obj = {
									cishu: item.interval,
									cishuName: this.cishuList.filter(c => {
										return c.id == item.interval
									})[0].name,
									dateTime: item.time,
									relationship: index != 0 ? '' : item.operator,
									relationshipName: index != 0 ? '' : this.relationshipList.filter(
										c => {
											return c.id == item.operator
										})[0].name,
									conditionType: index == 0 ? res.data.type : '',
									conditionTypeName: index == 0 ? this.conditionTypeList.filter(
										c => {
											return res.data.type == c.value
										})[0].label : ''
								}
								trigList.push(obj)
							})
							this.trigList = trigList
							const apply = JSON.parse(res.data.config).apply
							var controlList = []
							apply.forEach((item, index) => {
								var obj = {
									eqpGroup: '',
									eqpGroupName: '',
									eqp: '',
									eqpName: '',
									condition: '',
									conditionName: '',
									filedType: '',
									conNum: ''
								}
								controlList.push(obj)
							})
							this.controlList = controlList
						}						
					} else {
						this.toast.msg = res.message
						this.$refs.toast.show();
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
			},
			changeLog(e) {
				console.log('change事件:', e);
			},
			bindTimeChangeAdd(e) {
				console.log('change事件:', e);
				this.addTrigForm.dateTime = e.target.value
			},
			bindTimeChange(data, e) {
				if (this.addType) {
					this.addTrigForm.dateTime = e.target.value
				} else if (this.type) {
					data.dateTime = e.target.value
				}
			},
			validate() {
				const control = this.controlList.filter((item, index) => {
					return !item.eqpGroup || !item.eqp || !item.condition || !item.conNum
				})
				if (this.formData.name == '') {
					this.toast.msg = '请输入策略名称';
					this.$refs.toast.show();
					return false
				}
				if (this.formData.describe == '') {
					this.toast.msg = '请输入描述';
					this.$refs.toast.show();
					return false
				}
				if (this.trigList[0].conditionType == 1) {
					const trig = this.trigList.filter((item, index) => {
						if (index == 0) {
							return !item.conditionType || !item.eqpGroup || !item.eqp || !item.condition || !item
								.symbol || !item.trigNum
						} else {
							return !item.eqpGroup || !item.eqp || !item.condition || !item
								.symbol || !item.trigNum || !item.relationship
						}
					})
					if (trig.length > 0) {
						this.toast.msg = '存在数据项不符合触发条件，请检查触发条件数据项';
						this.$refs.toast.show();
						return false
					}
				} else {
					const trig = this.trigList.filter((item, index) => {
						return !item.cishuName || !item.dateTime
					})
					if (trig.length > 0) {
						this.toast.msg = '存在数据项不符合触发条件，请检查触发条件数据项';
						this.$refs.toast.show();
						return false
					}
				}
				if (control.length > 0) {
					this.toast.msg = '存在数据项不符合执行命令，请检查执行命令数据项';
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
					var trigList = []
					if (this.trigList[0].conditionType == 1) {
						this.trigList.forEach(item => {
							var obj = {
								asset_id: item.eqpGroup,
								device_id: item.eqp,
								field: item.condition,
								field_type: item.filedType,
								duration: '0',
								condition: item.symbol,
								value: item.trigNum,
								operator: item.relationship ? item.relationship : ''
							}
							trigList.push(obj)
						})
					} else {
						this.trigList.forEach(item => {
							var obj = {
								interval: item.cishu,
								time: item.dateTime,
								operator: item.relationship ? item.relationship : ''
							}
							trigList.push(obj)
						})
					}
					var controlList = []
					this.controlList.forEach(item => {
						var obj = {
							asset_id: item.eqpGroup,
							device_id: item.eqp,
							field: item.condition,
							field_type: item.filedType,
							value: item.conNum,
							field_symbol: item.field_symbol
						}
						controlList.push(obj)
					})
					var params = {
						business_id: uni.getStorageSync('ywId'), // 业务id
						status: switchOnTwo,
						name: this.formData.name,
						sort: this.formData.sort,
						type: this.trigList[0].conditionType,
						describe: this.formData.describe,
						issued: '0',
						config: {
							rules: trigList,
							apply: controlList
						},
						id: this.editId
					}
					params.config = JSON.stringify(params.config)
					this.API.apiRequest('/api/automation/edit', params, 'post').then(res => {
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
				}
			},
			// 删除触发条件
			toDeltrig(data, index) {
				this.trigList.forEach((item, itemIndex) => {
					if (itemIndex == index) {
						this.trigList.splice(index, 1)
					}
				})
			},
			// 删除指令
			toDelCon(data, index) {
				this.controlList.forEach((item, itemIndex) => {
					if (itemIndex == index) {
						this.controlList.splice(index, 1)
					}
				})
			},
			// 确定次数选择
			confirmrCishu(item) {
				if (this.addType == 'trig') {
					this.addTrigForm.cishu = item.id
					this.addTrigForm.cishuName = item.name
					this.$refs.addtrigPopup.open()
				} else if (this.type == 'trig') {
					this.currentTrigData.cishu = item.id
					this.currentTrigData.cishuName = item.name
				}
				this.$refs.cishuPopup.close()
			},
			// 新增一行选择次数
			toSelectCishuAdd() {
				this.addType = 'trig'
				this.type = ''
				this.$refs.addtrigPopup.close()
				this.$refs.cishuPopup.open()
			},
			// 选择次数
			toSelectCishu(data) {
				this.type = 'trig'
				this.addType = ''
				this.currentTrigData = data
				this.$refs.cishuPopup.open()
			},
			// 确定选择关系
			confirmrRelationship(item) {
				if (this.addType == 'trig') {
					this.addTrigForm.relationship = item.id
					this.addTrigForm.relationshipName = item.name
					this.$refs.addtrigPopup.open()
				} else if (this.addType == 'con') {
					this.addConForm.relationship = item.id
					this.addConForm.relationshipName = item.name
					this.$refs.addConPopup.open()
				}
				this.$refs.relationshipPopup.close()
			},
			// 选择关系
			relationship(type) {
				this.addType = type
				this.type = ''
				if (type == 'con') {
					this.$refs.addConPopup.close()
				} else if (type == 'trig') {
					this.$refs.addtrigPopup.close()
				}
				this.$refs.relationshipPopup.open()
			},
			// 保存执行命令验证
			saveConValidate() {
				// if (!this.addConForm.relationship) {
				// 	this.toast.msg = '请选择条件为且还是或';
				// 	this.$refs.toast.show();
				// 	return false
				// }
				if (!this.addConForm.eqpGroup) {
					this.toast.msg = '请选择设备分组';
					this.$refs.toast.show();
					return false
				}
				if (!this.addConForm.eqp) {
					this.toast.msg = '请选择设备';
					this.$refs.toast.show();
					return false
				}
				if (!this.addConForm.condition) {
					this.toast.msg = '请选择条件';
					this.$refs.toast.show();
					return false
				}
				if (!this.addConForm.conNum) {
					this.toast.msg = '请输入数值';
					this.$refs.toast.show();
					return false
				}
				return true
			},
			// 保存触发条件验证
			saveTrigValidate() {
				if (this.trigList[0].conditionType == 1) {
					if (!this.addTrigForm.relationship) {
						this.toast.msg = '请选择条件为且还是或';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.eqpGroup) {
						this.toast.msg = '请选择设备分组';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.eqp) {
						this.toast.msg = '请选择设备';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.condition) {
						this.toast.msg = '请选择条件';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.symbol) {
						this.toast.msg = '请选择符号';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.trigNum) {
						this.toast.msg = '请输入数值';
						this.$refs.toast.show();
						return false
					}
				} else {
					if (!this.addTrigForm.relationship) {
						this.toast.msg = '请选择条件为且还是或';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.cishuName) {
						this.toast.msg = '请选择次数';
						this.$refs.toast.show();
						return false
					}
					if (!this.addTrigForm.dateTime) {
						this.toast.msg = '请选择日期或时间';
						this.$refs.toast.show();
						return false
					}
				}
				return true
			},
			// 保存触发条件
			saveTrig() {
				if (this.saveTrigValidate()) {
					if (this.trigList[0].conditionType == 1) {
						this.trigList.push({
							eqpGroup: this.addTrigForm.eqpGroup,
							eqpGroupName: this.addTrigForm.eqpGroupName,
							eqp: this.addTrigForm.eqp,
							eqpName: this.addTrigForm.eqpName,
							condition: this.addTrigForm.condition,
							conditionName: this.addTrigForm.conditionName,
							filedType: this.addTrigForm.filedType,
							symbol: this.addTrigForm.symbol,
							symbolName: this.addTrigForm.symbolName,
							trigNum: this.addTrigForm.trigNum,
							relationship: this.addTrigForm.relationship,
							relationshipName: this.addTrigForm.relationshipName
						})
					} else {
						this.trigList.push({
							cishu: this.addTrigForm.cishu,
							cishuName: this.addTrigForm.cishuName,
							dateTime: this.addTrigForm.dateTime,
							relationship: this.addTrigForm.relationship,
							relationshipName: this.addTrigForm.relationshipName
						})
					}
					this.$refs.addtrigPopup.close()
				}
				this.$forceUpdate()
			},
			saveCon() {
				if (this.saveConValidate()) {
					this.controlList.push({
						eqpGroup: this.addConForm.eqpGroup,
						eqpGroupName: this.addConForm.eqpGroupName,
						eqp: this.addConForm.eqp,
						eqpName: this.addConForm.eqpName,
						condition: this.addConForm.condition,
						conditionName: this.addConForm.conditionName,
						filedType: this.addConForm.filedType,
						conNum: this.addConForm.conNum
					})
					this.$refs.addConPopup.close()
				}
			},
			// 确定选择符号
			confirmSymbol(item) {
				if (this.type) {
					if (this.type == 'trig') {
						this.currentTrigData.symbol = item.id
						this.currentTrigData.symbolName = item.name
					} else if (this.type == 'con') {
						this.currentConData.symbol = item.key
						this.currentConData.symbolName = item.name
					}
					this.$refs.symbolPopup.close()
				} else if (this.addType) {
					if (this.addType == 'trig') {
						this.addTrigForm.symbol = item.id
						this.addTrigForm.symbolName = item.name
						this.$refs.addtrigPopup.open()
					} else if (this.addType == 'con') {
						this.addConForm.symbol = item.key
						this.addConForm.symbolName = item.name
						this.$refs.addConPopup.open()
					}
					this.$refs.symbolPopup.close()
				}
			},
			// 选择符号新增一行
			toSelectSymbolAdd(type) {
				this.addType = type
				this.type = ''
				if (type == 'trig') {
					this.$refs.addtrigPopup.close()
				} else if (type == 'con') {
					this.$refs.addConPopup.close()
				}
				console.log('==')
				this.$refs.symbolPopup.open()
			},
			// 选择符号
			toSelectSymbol(data, type) {
				this.type = type
				this.addType = ''
				if (type == 'trig') {
					this.currentTrigData = data
				} else if (type == 'con') {
					this.currentConData = data
				}
				this.$refs.symbolPopup.open()
			},
			// 确定选择条件
			confirmCondition(item) {
				if (this.type) {
					if (this.type == 'trig') {
						this.currentTrigData.condition = item.key
						this.currentTrigData.conditionName = item.name
						this.currentTrigData.filedType = item.type
						this.currentTrigData.field_symbol = item.symbol
					} else if (this.type == 'con') {
						this.currentConData.condition = item.key
						this.currentConData.conditionName = item.name
						this.currentConData.filedType = item.type
						this.currentConData.field_symbol = item.symbol
					}
				} else if (this.addType) {
					if (this.addType == 'trig') {
						this.addTrigForm.condition = item.key
						this.addTrigForm.conditionName = item.name
						this.addTrigForm.filedType = item.type
						this.addTrigForm.field_symbol = item.symbol
						this.$refs.addtrigPopup.open()
					} else if (this.addType == 'con') {
						this.addConForm.condition = item.key
						this.addConForm.conditionName = item.name
						this.addConForm.filedType = item.type
						this.addConForm.field_symbol = item.symbol
						this.$refs.addConPopup.open()
					}
				}
				this.$refs.conditionPopup.close()
			},
			// 选择条件新增一行
			toSelectConditionAdd(type) {
				this.addType = type
				this.type = ''
				if (this.trigList[0].conditionType == 1) {
					if (type == 'trig') {
						if (!this.addTrigForm.eqp) {
							this.toast.msg = '请选择设备';
							this.$refs.toast.show();
							return
						}
					} else if (type == 'con') {
						if (!this.addConForm.eqp) {
							this.toast.msg = '请选择设备';
							this.$refs.toast.show();
							return
						}
					}
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/automation/show', {
					bid: type == 'trig' ? this.addTrigForm.eqp : this.addConForm.eqp
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							this.conditionList = res.data
							if (type == 'trig') {
								this.$refs.addtrigPopup.close()
							} else if (type == 'con') {
								this.$refs.addConPopup.close()
							}
							this.$refs.conditionPopup.open()
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
			// 选择条件
			toSelectCondition(data, type) {
				this.type = type
				this.addType = ''
				if (this.trigList[0].conditionType == 1) {
					if (type == 'trig') {
						this.currentTrigData = data
					} else if (type == 'con') {
						this.currentConData = data
					}
				}
				if (!data.eqp) {
					this.toast.msg = '请选择设备';
					this.$refs.toast.show();
					return
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/automation/show', {
					bid: data.eqp
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							if(type == 'edit'){
								res.data.forEach(item=>{
									this.trigList.forEach(list=>{
										if(item.key == list.condition){
											list.conditionName = item.name
											list.filedType = item.type
										}
									})
									this.controlList.forEach(list=>{
										if(item.key == list.condition){
											list.conditionName = item.name
											list.filedType = item.type
										}
									})
								})
							}else{
								this.$refs.conditionPopup.open()
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
			},
			// 确定选择设备
			comfirEqp(item) {
				if (this.type) {
					if (this.type == 'trig') {
						this.currentTrigData.eqp = item.device_id
						this.currentTrigData.condition = ''
						this.currentTrigData.conditionName = ''
						this.currentTrigData.eqpName = item.name
					} else if (this.type == 'con') {
						this.currentConData.condition = ''
						this.currentConData.conditionName = ''
						this.currentConData.eqp = item.device_id
						this.currentConData.eqpName = item.name
					}
					this.$refs.eqpPopup.close()
				} else if (this.addType) {
					if (this.addType == 'trig') {
						this.addTrigForm.eqp = item.device_id
						this.addTrigForm.eqpName = item.name
						this.addTrigForm.condition = ''
						this.addTrigForm.conditionName = ''
						this.$refs.addtrigPopup.open()
					} else if (this.addType == 'con') {
						this.addConForm.eqp = item.device_id
						this.addConForm.eqpName = item.name
						this.addConForm.condition = ''
						this.addConForm.conditionName = ''
						this.$refs.addConPopup.open()
					}
					this.$refs.eqpPopup.close()
				}
			},
			// 新增一行选择设备
			toSelectEqpAdd(type) {
				this.addType = type
				if (this.trigList[0].conditionType == 1) {
					if (type == 'trig') {
						if (!this.addTrigForm.eqpGroup) {
							this.toast.msg = '请选择设备分组';
							this.$refs.toast.show();
							return
						}
					} else if (type == 'con') {
						if (!this.addConForm.eqpGroup) {
							this.toast.msg = '请选择设备分组';
							this.$refs.toast.show();
							return
						}
					}
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/kv/current/asset/a', {
					asset_id: type == 'trig' ? this.addTrigForm.eqpGroup : this.addConForm.eqpGroup
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.devices.length > 0) {
							this.eqpList = res.data.devices
							if (type == 'trig') {
								this.$refs.addtrigPopup.close()
							} else if (type == 'con') {
								this.$refs.addConPopup.close()
							}
							this.$refs.eqpPopup.open()
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
			// 选择设备
			toSelectEqp(data, type) {
				this.type = type
				this.addType = ''
				if (type == 'trig') {
					this.currentTrigData = data
				} else if (type == 'con') {
					this.currentConData = data
				} 
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/kv/current/asset/a', {
					asset_id:  data.eqpGroup
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.devices.length > 0) {
							if(type == 'edit') {
								res.data.devices.forEach(item=>{
									this.trigList.forEach(list=>{
										if(item.device_id == list.eqp){
											list.eqpName = item.name
										}
									})
									this.controlList.forEach(list=>{
										if(item.device_id == list.eqp){
											list.eqpName = item.name
										}
									})
								})
							} else {
								this.$refs.eqpPopup.open()
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

			},
			//确定选择设备分组
			toConfirmeqpGroup(item) {
				if (this.type) {
					if (this.type == 'trig') {
						this.currentTrigData.eqpGroup = item.id
						this.currentTrigData.eqpGroupName = item.device_group
						this.currentTrigData.eqp = ''
						this.currentTrigData.eqpName = ''
						this.currentTrigData.condition = ''
						this.currentTrigData.conditionName = ''
					} else if (this.type == 'con') {
						this.currentConData.eqpGroup = item.id
						this.currentConData.eqpGroupName = item.device_group
						this.currentConData.eqp = ''
						this.currentConData.eqpName = ''
						this.currentConData.condition = ''
						this.currentConData.conditionName = ''
					}
					this.$refs.eqpGroups.close()
				} else if (this.addType) {
					if (this.addType == 'trig') {
						this.addTrigForm.eqp = ''
						this.addTrigForm.eqpName = ''
						this.addTrigForm.condition = ''
						this.addTrigForm.conditionName = ''
						this.addTrigForm.eqpGroup = item.id
						this.addTrigForm.eqpGroupName = item.device_group
						this.$refs.addtrigPopup.open()
					} else if (this.addType == 'con') {
						this.addConForm.eqp = ''
						this.addConForm.eqpName = ''
						this.addConForm.condition = ''
						this.addConForm.conditionName = ''
						this.addConForm.eqpGroup = item.id
						this.addConForm.eqpGroupName = item.device_group
						this.$refs.addConPopup.open()
					}
					this.$refs.eqpGroups.close()
				}
			},
			// 设备分组
			toSelectEqpGroup(data, type) {
				this.type = type
				this.addType = ''
				if (type == 'trig') {
					this.currentTrigData = data
				} else if (type == 'con') {
					this.currentConData = data
				}
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/asset/list/d', {
					business_id: uni.getStorageSync('ywId')
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							if(type == 'edit'){
								this.trigList.forEach(list => {
									res.data.forEach(item=>{
										if(item.id == list.eqpGroup) {
											list.eqpGroupName = item.device_group
										}
									})
								})
								console.log('controlList==', this.controlList)
								this.controlList.forEach(list => {
									res.data.forEach(item=>{
										if(item.id == list.eqpGroup) {
											console.log('list==', list)
											list.eqpGroupName = item.device_group
										}
									})
								})
							} else {
								this.$refs.eqpGroups.open()
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
			// 新增一行选择设备分组
			toSelectEqpGroupAdd(type) {
				this.addType = type
				this.type = ''
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/asset/list/d', {
					business_id: uni.getStorageSync('ywId')
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							this.eqpGroupsList = res.data
							if (type == 'trig') {
								this.$refs.addtrigPopup.close()
							} else if (type == 'con') {
								this.$refs.addConPopup.close()
							}
							this.$refs.eqpGroups.open()
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
			// 选择设备条件类型
			toSelectConditionType(data, type) {
				this.type = type
				this.addType = ''
				if (type == 'trig') {
					this.currentTrigData = data
				} else if (type == 'con') {
					this.currentConData = data
				}
				this.currentTrigData = data
				this.$refs.conditionType.open()
			},
			// 确定条件类型
			comfirConditionType(item) {
				if (this.type == 'trig') {
					this.currentTrigData.conditionType = item.value
					this.currentTrigData.conditionTypeName = item.label
				} else if (this.type == 'con') {
					this.currentConData.conditionType = item.value
					this.currentConData.conditionTypeName = item.label
				}
				this.$refs.conditionType.close()
			},
			// 新增执行命令
			toAddCon() {
				this.$refs.addConPopup.open()
			},
			// 新增触发条件
			toAddtrig() {
				this.$refs.addtrigPopup.open()
			}
		},
	}
</script>

<style scoped lang="css">
	@import '@/common/add-control.css';

	.uni-date__x-input {
		text-align: right;
	}

	.uni-date-x--border {
		border: none
	}

	/deep/ .uni-icons {
		display: none !important;
	}

	.input_num {
		margin-top: 35rpx;
		text-align: right;
	}

	.tp-panel .info_header {
		width: 100% !important;
		height: 100rpx !important;
		line-height: 100rpx !important;
	}

	.del_btn {
		font-size: 26rpx !important;
		font-family: Source Han Sans CN !important;
		font-weight: 500 !important;
		color: #DB2A2A !important;
		width: 100% !important;
		text-align: center !important;
	}

	.del_btn image {
		width: 32rpx !important;
		height: 32rpx !important;
		margin-right: 7rpx !important;
		vertical-align: text-bottom;
	}
</style>
