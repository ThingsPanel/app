<template>
  <view>
    <view class="tp-mg-l-r-30 action" v-for="(action, index) in actions" :key="action.$index">
      <view class="tp-flex tp-flex-row">
        <view style="align-self: center;" class="tp-panel tp-flex-1 feedback-body">            
          <CustomSelect
            class="item2"
            placeholder="执行动作"
            :options="getOptions(action.action_type)"
            @change="actionTypeChange($event, index)"
            v-model="action.action_type"
          ></CustomSelect>

          <!-- 操作设备 -->
          <SelectActionDevices class="item2" v-if="action.action_type === '1'" :data="action"></SelectActionDevices>

          <!-- 触发告警 -->
          <SelectNotice class="item2" v-if="action.action_type === '2'" :data="action"></SelectNotice>

          <!-- 激活场景 -->
          <SelectScene class="item2" v-if="action.action_type === '3'" :data="action"></SelectScene>
        </view>
        
        <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
          <!-- 条件数量大于1条时才允许删除 -->
          <uni-icons 
            v-if="actions.length > 1" 
            class="tp-mg-t-b-10"
            type="minus" 
            size="40rpx" 
            color="red"
            @click="removeAction(action, index)"
          ></uni-icons>
          
          <uni-icons
            v-if="actions.length < 3"
            class="tp-mg-t-b-10"
            type="plus" 
            size="40rpx"
            color="#2979ff"
            @click="addAction(action, index)"
          ></uni-icons>
        </view>
      </view>
    </view>
    
    <!-- 消息提示框 -->
    <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
  </view>
</template>

<script>
  import CustomSelect from '@/components/custom-select.vue'
  import SelectScene from './select-scene.vue'
  import SelectNotice from './select-notice.vue'
  import SelectActionDevices from './select-action-devices.vue'
  
  const actionTypeOptions = [
    { value: '1', label: '操作设备' },
    { value: '2', label: '触发告警' },
    { value: '3', label: '激活场景' },
  ]
  
  export default {
    components: {
      CustomSelect,
      SelectScene,
      SelectNotice,
      SelectActionDevices,
    },
    props: {
      list: {
        type: Array,
        default: () => ([]),
      },
    },
    watch: {
      list: {
        handler  (n, o) {
          this.initActions (n)
        },
        immediate: true,
      },
    },
    data () {
      return {
        toast: {
        	msg: ''
        },
        actions: [],
        actionTypeOptions,
      }
    },
    created () {
      console.log(this.list, this.actions)
    },
    methods: {
      // 响应式获取
      getOptions (action_type) {
        // 显示未选过的和当前的（如果存在）
        console.log(action_type)
        if (!this.actions.length) {
          return actionTypeOptions
        } else {
          const options = actionTypeOptions.filter(action => {
            // 如果选项在 actions 中已存在，且不与当前相同，则去除
            return !(action.value !== action_type && this.actions.findIndex(item => item.action_type === action.value) >= 0)
          })
          console.log(options)
          return options
        }
      },
      initActions (list) {
        list = JSON.parse(JSON.stringify(list))
        const actions = []
        const actionTypeList = new Set(list.map(action => {
          action.$index = Math.random()
          return action.action_type
        }))
        actionTypeList.forEach(actionType => {
          actions.push({
            $index: Math.random(),
            action_type: actionType,
            actions: list.filter(action => action.action_type === actionType),
          })
        })
        this.actions = actions
        
        console.log('initActions', this.actions)
      },
      actionTypeChange (action_type, index) {
        console.log(action_type, index)
        
        const action = this.actions[index] || {}
              
        this.$set(this.actions, index, {
          $index: Math.random(),
          action_type, // 1-操作设备 2-触发告警 3-激活场景
          actions: [
            {
              action_type,
              $index: action.$index,
              business_id: "", // 项目id
              asset_id: "", // 分组id
              device_id: "", // 设备id
              device_action_type: "", // 1-属性 2-事件 3-在线离线状态
              
              v1: "",
              v2: "",
              v3: "",
              v4: "",
              v5: "",
                  
              remark: "",
              
              group_number: action.group_number, // 条件分组编号（相邻两个条件 group_number 不同则用或连接，相同用且连接）
              
              // automation_id: this.formData.id, // 父id。todo：提交前重新设置
              id: action.id, // 自身id
              
              warning_strategy: {},
            }
          ]
        })
      },
      
      // 删除动作
      removeAction (currAction, index) {
        this.actions.splice(index, 1)
      },
      // 新增动作
      addAction (currAction, index) {
        console.log(1234)
        this.actions.splice(index+1, 0, {
          $index: Math.random(),
          action_type: '',
          actions: [
            {
              $index: Math.random(),
              warning_strategy: {},
            },
          ],
        })
      },
      
      getActionsData () {
        let msg = ''
        let actions = JSON.parse(JSON.stringify(this.actions))
        actions = actions.map(actionsGroup => actionsGroup.actions).flat()
        console.log(actions)
        for (let i = 0; i< actions.length; i++) {
          const action = actions[i]
          console.log('action' + i, action)
          const {
            action_type, // 1-操作设备 2-触发告警 3-激活场景

            business_id, // 项目
            asset_id, // 分组
            device_id, // 设备
            device_condition_type, // 状态/属性 1-属性 2-事件 3-在线离线状态
            v1,
            v3,
            
            scenario_strategy_id,
          } = action
          
          if (!action_type) {
            msg = '请选择需要执行的动作类型'
            break;
          } else if (action_type === '1') { // 1-操作设备
            if (!business_id || !asset_id || !device_id || !device_condition_type || !v1 || (!v3 && v3 !== 0)) { // device_condition_type 为空表示未选择属性
              msg = '请将“操作设备”信息补充完整'
              break;
            }
          } else if (action_type === '2') { // 2-触发告警
            const {
              warning_level,
              inform_way,
              repeat_count,
              warning_description,
            } = action.warning_strategy || {}
            
            if (!warning_level) { //
              msg = '请将“触发告警”信息补充完整（“告警级别”为必填）'
              break;
            }
            
            if (!inform_way) { //
              msg = '请将“触发告警”信息补充完整（“通知组”为必填）'
              break;
            }
          } else if (action_type === '3') { // 3-激活场景
            if (!scenario_strategy_id) {
              msg = '请将“激活场景”信息补充完整（“场景”为必填）'
              break;
            }
          } else {
            msg = '未知的操作类型'// 异常
            break;
          }
        }
        
        if (msg) {
          return {
            result: msg,
          }
        }
        
        return {
          result: true,
          actions: this.submitData(actions),
        }
      },
      submitData (actions) {
        return actions.map(action => {
          const {
            action_type,
            
            device_id,
            device_condition_type, // 状态/属性 1-属性 2-事件 3-在线离线状态
            v1,
            v3,
            
            warning_strategy,
            
            scenario_strategy_id,
          } = action
          
          const result = {
            action_type,
          }
          
          if (action_type === '1') {
            result.device_id = device_id
            result.additional_info = JSON.stringify({
              device_model: device_condition_type,
              instruct: {
                [v1]: v3,
              },
            })
          } else if (action_type === '2') {
            const {
              id,
              warning_level,
              inform_way,
              repeat_count,
              warning_description,
            } = warning_strategy || {}
            console.log(warning_strategy)
            result.warning_strategy = {
              id,
              warning_level,
              inform_way: inform_way || undefined,
              repeat_count: repeat_count || undefined,
              warning_description: warning_description || undefined,
            }
          } else if (action_type === '3') {
            result.scenario_strategy_id = scenario_strategy_id
          }
          return JSON.parse(JSON.stringify(result))
        })
      },
    },
  }
</script>

<style scoped>
  @import '@/common/alert-strategy.css';
  
  .action + .action {
    margin-top: 20rpx;
  }
</style>