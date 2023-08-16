<template>
  <view class="tp-flex tp-flex-col">
    <view class="item2 tp-pd-l-r-25 " v-for="(action, index) in data.actions" :key="action.$index">
      
      <view class="tp-flex tp-flex-row">
        <view style="align-self: center;" class="tp-panel tp-flex-1">
          
          <!-- 设备条件 -->
          <SelectDevice :showStatus="false" key="SelectDevice" :data="action"></SelectDevice>
        </view>
        
        <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
          <!-- 条件数量大于1条时才允许删除 -->
          <uni-icons 
            v-if="data.actions.length > 1" 
            class="tp-mg-t-b-10"
            type="minus" 
            size="40rpx" 
            color="red"
            @click="removeAction(action, index)"
          ></uni-icons>
          
          <!-- 仅最后一个显示新增 -->
          <uni-icons
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
  import SelectDevice from '@/components/select-device'
  
  export default {
    components: {
      CustomSelect,
      SelectDevice,
    },
    props: {
      data: {
        type: [Object],
        default: () => ({
          action_type: '',
          actions: [],
        }),
      },
    },
    data () {
      return {
        toast: {
        	msg: ''
        },
        actions: [],
      }
    },
    created () {
      console.log(this.data)
      this.data.actions.forEach(action => {
        if (action.additional_info) {
          const info = JSON.parse(action.additional_info)
          const [[v1, v3]] = Object.entries(info.instruct)
          
          this.$set(action, 'device_condition_type', info.device_model)
          this.$set(action, 'v1', v1)
          this.$set(action, 'v3', v3)
        }
      })
      
      console.log(this.data.actions)
    },
    methods: {
      // 删除
      removeAction (currAction, index) {
        console.log(currAction, index)
        this.data.actions.splice(index, 1)
      },
      // 新增
      addAction (currAction, index) {
        this.data.actions.splice(index+1, 0, {
          $index: Math.random(),
          action_type: '1',
          
          business_id: '',
          asset_id: '',
          device_id: '',
          device_condition_type: '',
          
          v1: '',
          v3: '',
        })
        console.log(this.data.actions)
      },
    },
  }
</script>

<style scoped>
  @import '@/common/alert-strategy.css';
  
  .ttt {
    margin-bottom: 30rpx;
  }
</style>