<template>
  <view class="tp-mg-l-r-30" v-for="(condition, index) in conditions" :key="condition.$index">
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
          v-if="conditions.length > 1" 
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
      conditions: {
        type: Array,
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
      }
    },
    methods: {
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
        console.log(this.formData)
      },
    },
  }
</script>

<style>
</style>