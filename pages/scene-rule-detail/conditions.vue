<template>
  <view >
    <view class="tp-mg-l-r-30" v-for="(condition, index) in conditions" :key="condition.$index">
      <!-- 选择且或关系 -->
      <view class='tp-mg-t-b-10' v-if="index !== 0">
        <uni-data-checkbox :localdata="relations" v-model="condition._relation" />
      </view>
      
      <view class="tp-flex tp-flex-row">
        <view style="align-self: center;" class="tp-panel tp-flex-1 feedback-body">
          <CustomSelect
            class="item2"
            placeholder="条件类型"
            :options="conditionTypeOptions"
            @change="conditionTypeChange($event, index)"
            v-model="condition.condition_type"
          ></CustomSelect>
          
          <!-- 设备条件 -->
          <SelectDevice class="item2" key="SelectDevice" v-if="condition.condition_type === '1'" :data="condition"></SelectDevice>
          
          <!-- 时间条件 -->
          <SelectTime class="item2" key="SelectTime" v-if="condition.condition_type === '2'" :data="condition"></SelectTime>
        </view>
        
        <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
          <!-- 条件数量大于1条时才允许删除 -->
          <uni-icons 
            v-if="conditions.length > 1" 
            class="tp-mg-t-b-10" 
            type="minus" 
            size="40rpx" 
            color="red"
            @click="removeCondition(condition, index)"
          ></uni-icons>
          
          <uni-icons
            class="tp-mg-t-b-10" 
            type="plus" 
            size="40rpx"
            color="#2979ff"
            @click="addCondition(condition, index)"
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
  import SelectDevice from '@/components/select-device'
  import SelectTime from '@/components/select-time'
  
  export default {
    components: {
      CustomSelect,
      SelectDevice,
      SelectTime,
      
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
          this.initConditions (n)
        },
        immediate: true,
      },
    },
    data () {
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
        conditions: [],
      }
    },
    created () {
      console.log(this.conditions)
    },
    methods: {
      initConditions (list) {
        list = JSON.parse(JSON.stringify(list))
        this.transRelation(list)

        this.conditions = list
      },
      conditionTypeChange (condition_type, index) {
        console.log(condition_type, index)
        
        const condition = this.conditions[index] || {}
      
        this.$set(this.conditions, index, {
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
          
          // automation_id: this.formData.id, // 父id。todo：提交前重新设置
          id: condition.id, // 自身id
          
          $index: condition.$index,
        })
        
        console.log(this.conditions)
      },
      // 删除条件
      removeCondition (currCondition, index) {
        this.conditions.splice(index, 1)
      },
      // 新增条件
      addCondition (currCondition, index) {
        this.conditions.splice(index+1, 0, {
          // condition_type: '1', // todo：赋默认值有bug
          $index: Math.random(),
        })
        console.log(this.conditions)
      },
      
      // 初始化数据时：
      // 设置且或连接符（第一个条件不需要）
      // 设置条件的唯一标识符（$index）
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
      
      // 点击保存时：
      // 设置 group_number 分组编号（第一个条件默认为1）。从第二个条件开始，如果用或连接，则分组编号+1；
      //    如果用且连接时需要判断相邻条件是否都为时间条件的重复与单次二者之一，
      //    如果否（不满足有两种情况，一是均为时间条件不满足，二是均为重复与单次二者之一不满足），则分组编号与前一个条件相同；
      //    如果是，则清除当前条件的连接符和分组编号，然后计数（清除了几个连接符）
      // 最后判断清除连接符的次数，如果次数为 0，方法返回 true，表示设置 分组编号 成功；
      //    如果次数不为0，方法返回 false，表示设置分组编号失败，此时需要提示用户检查条件详情
      transGroupNumber (automation_conditions) {
        let invalidRelationNum = 0
        
        if (automation_conditions?.length) {
          automation_conditions[0].group_number = 1
          
          if (automation_conditions.length > 1) { // 至少两条数据
            for (let i = 1; i < automation_conditions.length; i++) {
              const preCondition = automation_conditions[i - 1]
              const currCondition = automation_conditions[i]
      
              if (!currCondition._relation) {
                invalidRelationNum = -1
                break;
              } else if (currCondition._relation === 'and') {
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
        
        if (invalidRelationNum < 0) {
          return '请选择“且/或”'
        }
        
        if (invalidRelationNum > 0) {
          return '时间条件的“单次”与“单次”、“单次”与“重复”、“重复”与“单次”只能使用“或”连接，请检查您的条件'
        }

        return ''
      },
      
      getConditionsData () {
        // 校验数据并转换数据
        console.log('conditons', JSON.parse(JSON.stringify(this.conditions)))
        
        let msg = ''
        for (let i = 0; i < this.conditions.length; i++) {
          const condition = this.conditions[i]
          console.log('conditon' + i, JSON.parse(JSON.stringify(condition)))
          
          const {
            condition_type, // 条件类型 1-设备条件 2-时间条件
            
            business_id, // 项目
            asset_id, // 分组
            device_id, // 设备
            
            device_condition_type, // 状态/属性 1-属性 2-事件 3-在线离线状态
            
            time_condition_type, // 0-范围 1-单次 2-重复
            
            v1,
            v2, // 操作符
            v3,
            v4,
          } = condition
          
          if (!condition_type) {
            msg = '请选择条件类型'
            break;
          } else if (condition_type === '1') { // 校验设备条件
            if (!business_id || !asset_id || !device_id || !device_condition_type) {
              msg = '请将“设备条件”信息补充完整（“设备条件”中所有字段均为必填）'
              break;
            }
            
            if (device_condition_type === '1' && (!v2 || !v3)) { // 选择了属性
              msg = '请将“设备条件”信息补充完整（“设备条件”中所有字段均为必填）'
              break;
            }
          } else if (condition_type === '2') { // 时间条件
            if (!time_condition_type) {
              msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
              break;
            } else if (time_condition_type === '0') { // 时间条件-范围
              if (!v1 || !v2) {
                msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                break;
              }
            } else if (time_condition_type === '1') { // 时间条件-单次
              if (!v1) {
                msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                break;
              }
            } else if (time_condition_type === '2') { // 时间条件-重复
              console.log(v1)
              if (!v1) {
                msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                break;
              } else if (v1 === '1') {
                if (!v3) {
                  msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                  break;
                }
              } else if (v1 === '2') {
                if (!v3) {
                  msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                  break;
                }
              } else if (v1 === '3') {
                if (!v3 || !v4) {
                  msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                  break;
                }
              } else if (v1 === '4') {
                console.log(v3)
                const [dd, hh] = v3.split(':')
                if (!dd || !hh) {
                  msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                  break;
                }
              } else if (v1 === '5') {
                console.log(1234)
                if (!v3) {
                  msg = '请将“时间条件”信息补充完整（“时间条件”中所有字段均为必填）'
                  break;
                }
              }
            }
          } else {
            msg = '未知的条件类型'// 异常
            break;
          }
        }
        
        if (msg) {
          return {
            result: msg,
          }
        }
        
        const msg2 = this.transGroupNumber(this.conditions)
        if (msg2) {
          return {
            result: msg2,
          }
        } else {
          // 转换数据
          return {
            result: true,
            conditions: this.submitData(this.conditions)
          }
        }
      },
      submitData (conditions) {
        conditions = JSON.parse(JSON.stringify(conditions))
        return conditions.map(condition => {
          const {
            condition_type,
            device_condition_type,
            device_id,
            group_number,
            v1,
            v2,
            v3,
            v4,
            time_condition_type,
          } = condition
          
          return JSON.parse(JSON.stringify({
            condition_type: condition_type,
            
            device_condition_type: device_condition_type || undefined,
            device_id: device_id || undefined,
            group_number: group_number,
            v1: v1 || undefined,
            v2: v2 || undefined,
            v3: v3 || undefined,
            v4: v4 || undefined,
            
            time_condition_type: time_condition_type || undefined,
          })) 
        })
      }
    },
  }
</script>

<style scoped>
  @import '@/common/alert-strategy.css';
</style>