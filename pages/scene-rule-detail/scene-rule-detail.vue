<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">
			<view style="border-radius: 0;" class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view class="form-item-label">{{ $t('pages.sceneRuleDetail.ruleName') }}</view>
					<input maxlength="20" type="text" class="tp-flex-1" :placeholder="$t('pages.sceneRuleDetail.ruleName')" placeholder-class="tp-plc"
						v-model="formData.name" />
				</view>
        
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view class="form-item-label">{{ $t('pages.sceneRuleDetail.ruleDescription') }}</view>
					<input maxlength="40" type="text" class="tp-flex-1" :placeholder="$t('pages.sceneRuleDetail.ruleDescription')" placeholder-class="tp-plc"
						v-model="formData.description" />
				</view>
			</view>
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-30  uni-bold">
        <text class="title">{{ $t('pages.sceneRuleDetail.ifText') }}</text>
      </view>

      <!-- 条件列表 -->
      <conditions-edit
        v-if="formData.trigger_condition_groups" ref="conditions"
        :condition-data.sync="formData.trigger_condition_groups" />
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-30 uni-bold">
        <text class="title">{{ $t('pages.sceneRuleDetail.thenText') }}</text>
      </view>

      <!-- 操作列表 -->
      <actions-edit
        v-if="formData.actions"
        ref="actions" 
        :actions.sync="formData.actions"
      ></actions-edit>
      
			<view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-b-40">
				<button class="tp-btn" @tap="handlerSubmit">{{ $t('common.save') }}</button>
			</view>
		</view>
    
    <!-- 消息提示框 -->
    <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
    
    <Modal v-model="visible" :title="$t('pages.sceneRuleDetail.save')" :text="$t('pages.sceneRuleDetail.saveConfirm')" @cancel='cancel' @confirm='confirm' />
	</view>
</template>

<script>
  import ActionsEdit from '../scene-detail/actions-edit.vue';
  import ConditionsEdit from './conditions-edit.vue';
  import CustomSelect from '@/components/custom-select.vue'
  import moment from '@/static/js/moment.js';
  import Modal from '@/components/x-modal/x-modal'
  
	export default {
    components: {
      ActionsEdit,
      CustomSelect,
      ConditionsEdit,
      Modal
    },
		data() {
			return {
        toast: {
        	msg: ''
        },
        visible: false,
        
				formData: {},
        
				editId:''
			}
		},
    onShow(){
      uni.setNavigationBarTitle({
        title: this.$t('pages.addSceneLinkage')
      })
    },
		onLoad(options) {
			this.editId = options.id
      uni.setNavigationBarTitle({
        title: this.editId ? this.$t('pages.sceneRuleDetail.editSceneLinkage') : this.$t('pages.sceneRuleDetail.addSceneLinkage'),
      })
		},
    mounted () {
      if (this.editId) {
        this.getInfo();
      } else {
        this.formData = {
          name: '',
          description: '',
          trigger_condition_groups: [ // 条件
          ],
          actions: [ // 动作
            {
              $index: Math.random()
            }
          ],
        }
      }
    },
		methods: {
      // 获取修改信息
      getInfo(){
      	uni.showLoading({
      		title: this.$t('pages.sceneRuleDetail.loading')
      	});
        const params = {
      		id: this.editId
      	}
      	this.API.apiRequest('/api/v1/scene_automations/detail/'+this.editId, params, 'get').then(res => {
      		if (res.code == 200) {
            this.formData = { ...res.data,
              trigger_condition_groups: this.convertConditionsData(res.data.trigger_condition_groups),
              actions: this.convertActionsData(res.data.actions)
            };
            console.log(this.formData)
            if (!this.formData.trigger_condition_groups?.length) {
              this.formData.trigger_condition_groups = [
                {
                  $index: Math.random(),
                }
              ]
            }
      		} else {
      			this.toast.msg = res.message
      			this.$refs.toast.show();
      		}
      	}).finally(() => {
      		uni.hideLoading()
      	});
      },
      convertConditionsData(ifData) {
        // 遍历数据，处理每一项的逻辑
        ifData.forEach((item) => {
          item.forEach((ifItem) => {
            // 条件类型为 '10' 或 '11'
            if (ifItem.trigger_conditions_type === '10' || ifItem.trigger_conditions_type === '11') {
              ifItem.ifType = '1';
              if (ifItem.trigger_operator === 'between') {
                const [min, max] = ifItem.trigger_value.split('-');
                ifItem.minValue = min;
                ifItem.maxValue = max;
              }
              ifItem.trigger_param_key = `${ifItem.trigger_param_type}/${ifItem.trigger_param}`;
            }

            // 条件类型为 '22'
            if (ifItem.trigger_conditions_type === '22') {
              ifItem.ifType = '2';
              const [weekChose, startTime, endTime] = ifItem.trigger_value.split('|');
              ifItem.weekChoseValue = weekChose.split('');
              
              const formattedDate = moment().format('YYYY-MM-DD');
              ifItem.startTimeValue = moment(`${formattedDate} ${startTime}`).valueOf();
              ifItem.endTimeValue = moment(`${formattedDate} ${endTime}`).valueOf();
            }

            // 条件类型为 '20'
            if (ifItem.trigger_conditions_type === '20') {
              ifItem.ifType = '2';
              ifItem.onceTimeValue = moment(ifItem.execution_time).valueOf();
            }

            // 条件类型为 '21'
            if (ifItem.trigger_conditions_type === '21') {
              ifItem.ifType = '2';

              const formattedDate = moment().format('YYYY-MM-DD');
              const hour = moment().format('YYYY-MM-DD HH');

              switch (ifItem.task_type) {
                case 'HOUR':
                  ifItem.hourTimeValue = moment(`${hour}:${ifItem.params}`).valueOf();
                  break;
                case 'DAY':
                  ifItem.dayTimeValue = moment(`${formattedDate} ${ifItem.params}`).valueOf();
                  break;
                case 'WEEK':
                  const [weekStr, weekTime] = ifItem.params.split('|');
                  ifItem.weekChoseValue = weekStr.split('');
                  ifItem.weekTimeValue = moment(`${formattedDate} ${weekTime}`).valueOf();
                  break;
                case 'MONTH':
                  const [monthChose, monthTime] = ifItem.params.split('T');
                  ifItem.monthChoseValue = monthChose;
                  ifItem.monthTimeValue = moment(`${formattedDate} ${monthTime}`).valueOf();
                  break;
              }
            }
          });
        });
        return ifData;
      },
      // 提交时处理条件数据
      handleConditionsData(conditionsData) {
        const ifGroupsData = JSON.parse(JSON.stringify(conditionsData));
        // eslint-disable-next-line array-callback-return
        ifGroupsData.map((ifGroupItem) => {
          // eslint-disable-next-line array-callback-return
          ifGroupItem.map((ifItem) => {
            if (ifItem.trigger_conditions_type === '10' || ifItem.trigger_conditions_type === '11') {
              if (ifItem.trigger_operator === 'between') {
                ifItem.trigger_value = `${ifItem.minValue}-${ifItem.maxValue}`;
              }
            }
            if (ifItem.trigger_conditions_type === '22') {
              let trigger_value = '';
              // eslint-disable-next-line array-callback-return
              ifItem.weekChoseValue.map((item) => {
                trigger_value += item;
              });
              trigger_value += `|${moment(ifItem.startTimeValue).format('HH:mm:ssZ')}`;
              trigger_value += `|${moment(ifItem.endTimeValue).format('HH:mm:ssZ')}`;
              ifItem.trigger_value = trigger_value;
            }
            if (ifItem.trigger_conditions_type === '20') {
              ifItem.execution_time = moment(ifItem.onceTimeValue).format();
            }
            if (ifItem.trigger_conditions_type === '21') {
              if (ifItem.task_type === 'HOUR') {
                ifItem.params = moment(ifItem.hourTimeValue).format('mm:00Z');
              }
              if (ifItem.task_type === 'DAY') {
                ifItem.params = moment(ifItem.dayTimeValue).format('HH:mm:00Z');
              }
              if (ifItem.task_type === 'WEEK') {
                let params = '';
                // eslint-disable-next-line array-callback-return
                ifItem.weekChoseValue.map((item) => {
                  params += item;
                });
                ifItem.params = `${params}|${moment(ifItem.weekTimeValue).format('HH:mm:00Z')}`;
              }
              if (ifItem.task_type === 'MONTH') {
                ifItem.params = `${ifItem.monthChoseValue}T${moment(ifItem.monthTimeValue).format(`HH:mm:00Z`)}`;
              }
            }
          });
        });
        return ifGroupsData;
      },
      convertActionsData(actionsData) {
        const actionGroupsData = [];
        const actionInstructList = [];
        actionsData.map((item) => {
          if (item.action_type === '10' || item.action_type === '11') {
            item.actionParamOptions = [];
            const actionValueObj = JSON.parse(item.action_value);
            if (
              item.action_param_type === 'c_telemetry' ||
              item.action_param_type === 'c_attribute' ||
              item.action_param_type === 'c_command'
            ) {
              item.actionValue = item.action_value;
            }
            if (item.action_param_type === 'telemetry' || item.action_param_type === 'attributes') {
              item.actionValue = actionValueObj[item.action_param];
            }
            if (item.action_param_type === 'command') {
              item.actionValue = actionValueObj.params;
            }
            item.actionParamOptions = [];
            actionInstructList.push(item);
          } else {
            item.actionType = item.action_type;
            actionGroupsData.push(item);
          }
        });
        if (actionInstructList.length > 0) {
          const type1Data = {
            actionType: '1',
            actionInstructList
          };
          actionGroupsData.push(type1Data);
        }
        return actionGroupsData;
      },
      // 提交时处理动作数据
      handleActionData(inputActions) {
        // 处理动作的数据
        const actionGroupsData = inputActions;
        const actionsData = [];
        // eslint-disable-next-line array-callback-return
        actionGroupsData.map((item) => {
          if (item.actionType === '1') {
            // eslint-disable-next-line array-callback-return
            item.actionInstructList.map((instructItem) => {
              // 如果是c_telemetry/c_attribute,那么action_value示例格式：{"c_telemetry":2}
              // 如果是c_command,那么action_value示例格式：{"method":"switch1","params":{"false":0}}
              if (
                instructItem.action_param_type === 'c_telemetry' ||
                instructItem.action_param_type === 'c_attribute' ||
                instructItem.action_param_type === 'c_command'
              ) {
                instructItem.action_value = instructItem.actionValue;
              }
              // 如果是telemetry/attribute，那么 action_value示例格式：{"humidity":2}
              if (instructItem.action_param_type === 'telemetry' || instructItem.action_param_type === 'attributes') {
                const action_value = {};
                action_value[instructItem.action_param] = instructItem.actionValue;
                instructItem.action_value = JSON.stringify(action_value);
              }
              // 如果是command/c_command，那么 action_value示例格式:	{"method":"ReSet","params":{"switch":1,"light":"close"}}
              if (instructItem.action_param_type === 'command') {
                const action_value = {
                  method: instructItem.action_param,
                  params: instructItem.actionValue
                };
                instructItem.action_value = JSON.stringify(action_value);
              }
              actionsData.push(instructItem);
            });
          } else {
            item.action_type = item.actionType;
            actionsData.push(item);
          }
        });
        return actionsData;
      },
      
			
      // 校验
			validateBaseInfo () {
        // 场景基本信息校验
        const {
          name
        } = this.formData
        
				if (!name) {
          return {
            result: this.$t('pages.sceneRuleDetail.enterRuleName')
          }
				}
        
        return {
          result: true,
        }
			},
      
			// 保存
			handlerSubmit() {
        const submitData = {}
        
        const baseInfo = this.validateBaseInfo()
        if (baseInfo.result !== true) {
          this.toast.msg = baseInfo.result
          this.$refs.toast.show()
          return;
        } else {
          submitData.tenant_id = this.formData.tenant_id
          submitData.id = this.formData.id
          submitData.name = this.formData.name
          submitData.description = this.formData.description
          submitData.enabled = this.formData.enabled
        }
        const conditionsInfo = this.handleConditionsData(this.$refs.conditions.ifGroupsData());
        if (!conditionsInfo || conditionsInfo.length === 0) {
          this.toast.msg = this.$t('pages.sceneRuleDetail.enterRuleConditions')
          this.$refs.toast.show()
          return;
        } else {
          submitData.trigger_condition_groups = conditionsInfo
        }
        /*const conditionsInfo = this.$refs.conditions.getConditionsData()
        if (conditionsInfo.result != true) {
          this.toast.msg = conditionsInfo.result
          this.$refs.toast.show()
          return;
        } else {
          submitData.automation_conditions = conditionsInfo.conditions
        }*/
        const actionsInfo = this.handleActionData(this.formData.actions);
        if (!actionsInfo || actionsInfo.length === 0) {
          this.toast.msg = this.$t('pages.sceneRuleDetail.enterRuleActions')
          this.$refs.toast.show()
          return;
        } else {
          submitData.actions = actionsInfo
        }

        console.log(submitData)
        
        this.submitData = submitData
        this.visible = true
			},
      cancel() {
        console.log("取消")
        this.visible = false
      },
      confirm () {
        this.doSubmit(this.submitData)
      },
      doSubmit (submitData) {
        uni.showLoading({
        	title: this.$t('pages.sceneRuleDetail.loading')
        });
        
        let url = '/api/v1/scene_automations';
        let method = 'put';
        if (!submitData.id) {
          method = 'post';
        }
        
        this.API.apiRequest(url, submitData, method).then(res => {
        	if (res.code == 200) {
        		uni.navigateBack(-1)
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
		}
	}
</script>

<style scoped lang="scss">
	@import '@/common/alert-strategy.css';
  
  .form-item-label {
    width: 120rpx;
  }
  
  /deep/.uni-numbox {
    .uni-numbox-btns {
      width: 32rpx;
    }
    
    .uni-numbox__value {
      width: 128rpx;
      margin: 0 20rpx;
    }
  }

  .tooltip /deep/.uni-tooltip-popup {
    width: max-content;
    left: initial;
    right: 0;
  }
  
  .title {
    font-size: 26rpx;
  }
  
  /deep/.uni-input {
    font-size: 26rpx;
    background-color: transparent;
  }
  /deep/.uni-input-input {
    color: #000;
  }
  
  /deep/.uni-input .uni-input-placeholder.input-placeholder {
    color: #999;
  }
  
  
  /deep/.uniui-forward, 
  /deep/.uniui-clear {
    font-size: 28rpx !important;
    color: #999 !important;
    vertical-align: middle;
    margin-right: 12rpx;
  }
  
  /deep/.uniui-clear {
    font-size: 36rpx !important;
  }
  
  /deep/.uni-icons {
    display: block;
  }
  
  uni-text {
    color: #333;
  }
  
  /deep/.checklist-text > span {
    font-size: 26rpx;
  }
  
  /deep/.tp-panel {
    border-radius: 10rpx;
    // overflow: hidden;
  }
  
  /deep/.item2 + .item2 {
    border-top: 1rpx solid #dfdfdf;
  }
  /deep/.item > .tp-flex-1 + .tp-flex-1 {
    margin-left: 20rpx;
  }
  /deep/.item + .item {
    border-top: 1rpx solid #f1f1f1;
  }
  
  /deep/.uni-tooltip.tooltip {
    margin-right: 8rpx;
    
    .uni-tooltip-popup {
      color: #333;
      width: max-content;
      left: unset;
      right: 0;
      bottom: 44rpx;
      background-color: #fff;
      border: 1rpx solid #999;
      padding: 10rpx;
      border-radius: 8rpx;
    }
  }
</style>
