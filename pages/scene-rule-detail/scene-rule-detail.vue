<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">
			<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>规则名称</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称" placeholder-class="tp-plc"
						v-model="formData.automation_name" />
				</view>
        
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>规则说明</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入说明" placeholder-class="tp-plc"
						v-model="formData.automation_described" />
				</view>
        
        <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
        	<view>优先级</view>
          <uni-number-box class="tp-flex-1" v-model="formData.priority" />
          
          <uni-tooltip class="tooltip" content="值越小优先级越高">
            <view class="iconfont iconbianji tp-mg-r-10"></view>
          </uni-tooltip>
        </view>
			</view>
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-l-r-30 uni-bold">
        <text class=tp-font-size-14>如果</text>
      </view>
      
      <!-- 条件列表 -->
      <view class="tp-mg-l-r-30" v-for="(condition, index) in formData.automation_conditions" :key="condition.$index">
        <!-- 选择且或关系 -->
        <view class='tp-mg-t-b-10' v-if="index !== 0">
          <uni-data-checkbox :localdata="relations" v-model="condition._relation" />
        </view>
        
        <view class="tp-flex tp-flex-row">
          <view class="tp-panel tp-flex-1">
            <CustomSelect
              placeholder="条件类型"
              :options="conditionTypeOptions"
              @change="conditionTypeChange($event, index)"
              v-model="condition.condition_type"
            ></CustomSelect>
            
            <!-- 设备条件 -->
            <SelectDevice key="SelectDevice" v-if="condition.condition_type === '1'" :data="condition"></SelectDevice>
            
            <!-- 时间条件 -->
            <SelectTime key="SelectTime" v-if="condition.condition_type === '2'" :data="condition"></SelectTime>
          </view>
          
          <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
            <!-- 条件数量大于1条时才允许删除 -->
            <uni-icons 
              v-if="formData.automation_conditions.length > 1" 
              style="color:red;" 
              class="tp-mg-t-b-10" 
              type="minus" 
              size="20" 
              @click="removeCondition(condition, index)"
            ></uni-icons>
            
            <uni-icons
              style="color:#2979ff;" 
              class="tp-mg-t-b-10" 
              type="plus" 
              size="20" 
              @click="addCondition(condition, index)"
            ></uni-icons>
          </view>
        </view>
      </view>
      
      <!-- 
        <conditions conditions="formData.automation_conditions" />
       -->
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-l-r-30 uni-bold">
        <text class=tp-font-size-14>那么</text>
      </view>
      
      <!-- 操作列表 -->
      <view class="tp-mg-l-r-30" v-for="(action, index) in formData.automation_actions" :key="Math.random()">
        <view class="tp-flex tp-flex-row">
          <view class="tp-panel tp-flex-1">            
            <CustomSelect
              placeholder="执行动作"
              :options="actionTypeOptions"
              @change="actionTypeChange($event, index)"
              v-model="action.action_type"
            ></CustomSelect>
            
            <!-- 操作设备 -->
            <view class="" v-if="action.actions_type === '1'">操作设备</view>
            
            <!-- 触发告警 -->
            <view class="" v-if="action.actions_type === '2'">触发告警</view>
            
            <!-- 激活场景 -->
            <view class="" v-if="action.actions_type === '3'">激活场景</view>
          </view>
          
          <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
            <!-- 条件数量大于1条时才允许删除 -->
            <uni-icons 
              v-if="formData.automation_actions.length > 1" 
              style="color:red;" 
              class="tp-mg-t-b-10" 
              type="minus" 
              size="20" 
              @click="removeAction(action, index)"
            ></uni-icons>
            
            <uni-icons 
              style="color:#2979ff;" 
              class="tp-mg-t-b-10" 
              type="plus" 
              size="20" 
              @click="addAction(action, index)"
            ></uni-icons>
          </view>
        </view>
      </view>
      
			<view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-b-40">
				<button class="tp-btn" @tap="doUpdateSubmit">保存</button>
			</view>
		</view>
    
    <!-- 消息提示框 -->
    <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
	</view>
</template>

<script>
  import CustomSelect from '@/components/custom-select.vue'
  import SelectDevice from '@/components/select-device'
  import SelectTime from '@/components/select-time'
  
	export default {
    components: {
      CustomSelect,
      SelectDevice,
      SelectTime,
      
    },
		data() {
			return {
        toast: {
        	msg: ''
        },
        
        relations: [
          { text: '且', value: 'and' }, 
          { text: '或', value: 'or' },
        ],
        conditionTypeOptions: [
          { value: '1', label: '设备条件' },
          { value: '2', label: '时间条件' },
        ],
        actionTypeOptions: [
          { value: '1', label: '操作设备' },
          { value: '2', label: '触发告警' },
          { value: '3', label: '激活场景' },
        ],
        
				formData: {},
        
				editId:''
			}
		},
		onShow() {

		},
		onLoad(options) {
			this.editId = options.id
		},
    created () {
      if (this.editId) {
        this.getInfo()
      } else {
        this.formData = {
          automation_name: '',
          automation_described: '',
          priority: 0,
          automation_conditions: [ // 条件
            {
              $index: Math.random()
            }
          ],
          automation_actions: [ // 动作
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
      		title: '加载中'
      	});
        const params = {
      		id: this.editId
      	}
      	this.API.apiRequest('/api/v1/automation/detail', params, 'post').then(res => {
      		if (res.code == 200) {
      			const formData = res.data
            this.transRelation(formData.automation_conditions)
            
            this.formData = formData
            console.log(this.formData)
      		} else {
      			this.toast.msg = res.message
      			this.$refs.toast.show();
      		}
      	}).finally(() => {
      		uni.hideLoading()
      	});
      },
      transRelation (automation_conditions) {
        if (automation_conditions?.length) {
          automation_conditions[0].$index = Math.random()
          
          if (automation_conditions.length > 1) {
            for (let i = 1; i < automation_conditions.length; i++) {
              const preCondition = automation_conditions[i - 1]
              const currCondition = automation_conditions[i]
              
              currCondition._relation = currCondition.group_number === preCondition.group_number ? 'and' : 'or'
              
              currCondition.$index = Math.random()
            }
          }
        }
        
        
      },
      /**
       * @description 转换条件分组(gropu_number)
       * @param {Object} automation_conditions
       * @return {Boolean} 是否转换成功
       */
      transGroupNumber (automation_conditions) {
        let invalidRelationNum = 0
        
        if (automation_conditions?.length) {
          automation_conditions[0].group_number = 1
          
          if (automation_conditions.length > 1) { // 至少两条数据
            for (let i = 1; i < automation_conditions.length; i++) {
              const preCondition = automation_conditions[i - 1]
              const currCondition = automation_conditions[i]

              if (currCondition._relation === 'and') {
                // 此处校验相邻两个条件为单次、重复时是否使用了 and 连接。
                if (currCondition.condition_type === '2' && preCondition.condition_type === '2') { // 时间条件
                  const arr = ['1', '2']
                  if (arr.includes(currCondition.time_condition_type) && arr.includes(preCondition.time_condition_type)) {
                    invalidRelationNum++
                    currCondition._relation = ''
                    currCondition.group_number = ''
                  } else {
                    currCondition.group_number = preCondition.group_number
                  }
                } else {
                  currCondition.group_number = preCondition.group_number
                }
              } else if (currCondition._relation === 'or') {
                currCondition.group_number = preCondition.group_number + 1
              }
            }
          }
        }
        if (invalidRelationNum) {
          this.toast.msg = '相邻条件均为时间条件时，单次、重复只能用“或”连接。请检查条件';
          this.$refs.toast.show();
          return
        }
        return true;
      },
      
      conditionTypeChange (condition_type, index) {
        console.log(condition_type, index)
        
        const condition = this.formData.automation_conditions[index] || {}

        this.$set(this.formData.automation_conditions, index, {
          condition_type, // 1-设备条件 2-时间条件
          
          business_id: "", // 项目id
          asset_id: "", // 分组id
          device_id: "", // 设备id
          device_condition_type: "", // 1-属性 2-事件 3-在线离线状态

          time_condition_type: "", // 0-时间范围 1-单次 2-重复 3-自定义
          
          v1: "",
          v2: "",
          v3: "",
          v4: "",
          v5: "",

          remark: "",
          
          group_number: condition.group_number, // 条件分组编号（相邻两个条件 group_number 不同则用或连接，相同用且连接）
          _relation: condition._relation,
          
          automation_id: this.formData.id, // 父id
          id: condition.id, // 自身id
          
          $index: condition.$index,
        })
      },
      
      actionTypeChange (action_type, index) {
        
      },
      
      // 删除条件
      removeCondition (currCondition, index) {
        this.formData.automation_conditions.splice(index, 1)
      },
      // 新增条件
      addCondition (currCondition, index) {
        this.formData.automation_conditions.splice(index+1, 0, {
          // condition_type: '1', // todo：赋默认值有bug
          $index: Math.random(),
        })
        console.log(this.formData)
      },
      
      // 删除动作
      removeAction (currAction, index) {
        this.formData.automation_actions.splice(index, 1)
      },
      // 新增动作
      addAction (currAction, index) {
        this.formData.automation_actions.splice(index+1, 0, {
          
        })
      },
			
      // 校验
			validate() {
        const {
          automation_name,
          // automation_described,
          priority,
          automation_conditions = [],
          automation_actions = [],
        } = this.formData
        
				if(!automation_name){
					this.toast.msg = '请输入规则名称';
          this.$refs.toast.show();
          return
				}
        
        // if(!automation_described){
        // 	this.toast.msg = '请输入规则说明';
        //  this.$refs.toast.show();
        // }
        
				if(priority != 0 && !priority){
					this.toast.msg = '请设置优先级';
          this.$refs.toast.show();
          return
				}
				
        for (const condition of automation_conditions) {
          const {
            group_number, // 且、或
            condition_type, // 条件类型               1-设备条件 2-时间条件
            
            business_id, // 项目
            asset_id, // 分组
            device_id, // 设备
            device_condition_type, // 状态/属性       1-属性 2-事件 3-在线离线状态
            time_condition_type, // 0-范围 1-单次 2-重复
            v1,
            v2, // 操作符
            v3,
            v4,
          } = condition

          console.log(group_number, condition)
          if (!group_number) {
            this.toast.msg = '请选择且、或';
            this.$refs.toast.show();
            return
          }
          
          if (!condition_type) {
            this.toast.msg = '请选择条件类型';
            this.$refs.toast.show();
            return
          }
          
          if (condition_type === '1') { // 校验设备条件
            if (!business_id) {
              this.toast.msg = '请选择项目';
              this.$refs.toast.show();
              return
            }
            
            if (!asset_id) {
              this.toast.msg = '请选择分组';
              this.$refs.toast.show();
              return
            }
            
            if (!device_id) {
              this.toast.msg = '请选择设备';
              this.$refs.toast.show();
              return
            }
            
            if (!device_condition_type) {
              this.toast.msg = '请选择状态/属性';
              this.$refs.toast.show();
              return
            }
            
            if (device_condition_type === '1') {
              if (!v2) {
                this.toast.msg = '请选择操作符';
                this.$refs.toast.show();
                return
              }
              
              if (!v3) {
                this.toast.msg = '请输入内容';
                this.$refs.toast.show();
                return
              }
            }
          } else if (condition_type === '2') { // 校验时间条件
            if (!time_condition_type) {
              this.toast.msg = '请选择时间条件类型';
              this.$refs.toast.show();
              return
            } else if (time_condition_type === '0') { // 时间条件-范围
              if (!v1 || !v2) {
                this.toast.msg = '请选择日期和时间范围';
                this.$refs.toast.show();
                return
              }
            } else if (time_condition_type === '1') { // 时间条件-单次
              if (!v1) {
                this.toast.msg = '请选择日期和时间';
                this.$refs.toast.show();
                return
              }
            } else if (time_condition_type === '2') { // 时间条件-重复
              if (!v1) {
                this.toast.msg = '请选择重复周期';
                this.$refs.toast.show();
                return
              } else if (v1 === '1') { 
                if (!v3) {
                  this.toast.msg = '请选择分钟';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '2') {
                if (!v3) {
                  this.toast.msg = '请选择时间';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '3') {
                if (!v3) {
                  this.toast.msg = '请选择星期';
                  this.$refs.toast.show();
                  return
                }
                
                if (!v4) {
                  this.toast.msg = '请选择时间';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '4') {
                const [dd, hh] = v4.split(':')
                if (!dd) {
                  this.toast.msg = '请选择日期';
                  this.$refs.toast.show();
                  return
                }
                if (!hh) {
                  this.toast.msg = '请选择时间';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '5') {
                if (!v3) {
                  this.toast.msg = '请输入日期时间规则';
                  this.$refs.toast.show();
                  return
                }
              }
            }
          }
        }
        
        for (const action of automation_actions) {
          const {
            
          } = action
        }
        
        return true
			},
			// 保存
			doUpdateSubmit() {
        if (!this.transGroupNumber(this.formData.automation_conditions)) {
          return;
        }

				if (!this.validate()) {
          return;
				}
        
        console.log(JSON.parse(JSON.stringify(this.formData)))
        
        return;
        
        
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
		}
	}
</script>

<style scoped>
	@import '@/common/alert-strategy.css';

  .tooltip /deep/.uni-tooltip-popup {
    width: max-content;
    left: initial;
    right: 0;
  }
  
  .uni-data-checklist /deep/ .checklist-group .checklist-box .checklist-content .checklist-text {
    font-size: 26rpx;
  }
</style>

