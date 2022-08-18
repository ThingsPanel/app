<template>
<<<<<<< HEAD
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
					<input type="number" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值" placeholder-class="tp-plc"
						v-model="data.trigNum" v-if="data.filedType == 3" />
					<input v-else type="text'" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
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
					<input type="number" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值" placeholder-class="tp-plc"
						v-model="data.conNum" v-if="data.filedType == 3" />
					<input v-else type="text'" class="tp-flex-1 tp-mg-l-20" placeholder="请输入数值"
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
						<image src="/static/icon/close.png" alt="" @click="$refs.addtrigPopup.close()"></image>
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
							<input type="number" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addTrigForm.trigNum"
								v-if="addTrigForm.filedType == 3" />
							<input v-else type="text'" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
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
							<input type="number" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
								placeholder-class="tp-plc" v-model="addConForm.conNum"
								v-if="addConForm.filedType == 3" />
							<input v-else type="text'" class="tp-flex-1 tp-mg-l-20 add_input" placeholder="请输入数值"
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
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
	</view>
</template>

<script>
	export default {
		data() {
			return {
<<<<<<< HEAD
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
				switchOnTwo: 0,
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
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
			}
		},
		onShow() {

		},
		onLoad() {
<<<<<<< HEAD
			// this.getZcList()
		},
		methods: {
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
=======
			this.getZcList()
		},
		methods: {
			validate() {
				if (this.name == '') {
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					this.toast.msg = '请输入策略名称';
					this.$refs.toast.show();
					return false
				}
<<<<<<< HEAD
				if (this.formData.describe == '') {
=======
				if (this.describe == '') {
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
					this.toast.msg = '请输入描述';
					this.$refs.toast.show();
					return false
				}
<<<<<<< HEAD
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
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
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
<<<<<<< HEAD
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
					}
					params.config = JSON.stringify(params.config)
					this.API.apiRequest('/api/automation/add', params, 'post').then(res => {
						if (res.code == 200) {
							this.toast.msg = res.message
							this.$refs.toast.show();
							uni.navigateBack(-1)
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
						} else {
							this.toast.msg = res.message
							this.$refs.toast.show();
						}
						uni.hideLoading()
<<<<<<< HEAD
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
						if (!this.currentTrigData.eqp) {
							this.toast.msg = '请选择设备';
							this.$refs.toast.show();
							return
						}
					} else if (type == 'con') {
						this.currentConData = data
						if (!this.currentConData.eqp) {
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
					bid: type == 'trig' ? this.currentTrigData.eqp : this.currentConData.eqp
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.length > 0) {
							this.$refs.conditionPopup.open()
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
					asset_id: type == 'trig' ? this.currentTrigData.eqpGroup : this.currentConData.eqpGroup
				}, 'post').then(res => {
					if (res.code === 200) {
						if (res.data && res.data.devices.length > 0) {
							this.$refs.eqpPopup.open()
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
							this.$refs.eqpGroups.open()
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
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
		},
	}
</script>

<<<<<<< HEAD
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
=======
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
>>>>>>> 3e9a48e158bc1df266cd9f74bc1c602a8cb76f05
	}
</style>
