<template>
  <view>
    <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
    	<CustomSelect 
        placeholder="触发方式" 
        :options="time_condition_type_options"
        @change="timeConditionTypeChange"
        v-model="data.time_condition_type"
      ></CustomSelect>
      
      <view class="tp-flex-1">
        <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
          <!-- 单次 -->
          <template v-if="data.time_condition_type === '1'">
            <uni-datetime-picker placeholder="触发日期时间" :clear-icon="false" :hide-second="true" v-model="data.v1" @change="singleDateTimeChange"/>
            <uni-tooltip class="tooltip" content="只执行一次，执行结束后条件消失">
              <uni-icons type="help-filled" size="36rpx" color="#999"></uni-icons>
            </uni-tooltip>
          </template>
        	
          
          <!-- 重复 -->
          <CustomSelect
            v-if="data.time_condition_type === '2'"
            placeholder="重复周期" 
            :options="intervalOptions"
            @change="intervalChange"
             v-model="data.v1"
          ></CustomSelect>
        </view>
      </view>
    </view>
    
    <!-- 范围 -->
    <template v-if="data.time_condition_type === '0'">
      <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      	<uni-datetime-picker placeholder="起始时间" :clear-icon="false" :hide-second="true" :end="data.v2" v-model="data.v1" @change="v1DateTimeChange"/>
        <text class="zhi">-</text>
        <uni-datetime-picker placeholder="结束时间" :clear-icon="false" :hide-second="true" :start="data.v1" v-model="data.v2" @change="v2DateTimeChange"/>
      </view>
    </template>
    
    <!-- 重复 -->
    <template v-if="data.time_condition_type === '2'">
      <!-- 1 每小时 -->
      <view v-if="data.v1 === '1'" class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
        <CustomSelect
          placeholder="mm:ss" 
          :options="minuteOptions"
          v-model="data.v3"
        ></CustomSelect>
        
        <view class="tp-flex-1 tp-flex">
          <view class="tp-flex-1"></view>
          <uni-tooltip class="tooltip" content='例: 33:00" 表示每小时的第33分钟触发'>
            <uni-icons type="help-filled" size="36rpx" color="#999"></uni-icons>
          </uni-tooltip>
        </view>
      </view>
      
      <!-- 2 每天 -->
      <view v-if="data.v1 === '2'" class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      	<picker class="tp-flex-1" mode="time" :value="data.v3" @change="bindTimeChange">
      		<view class="uni-input" :class="!data.v3 && 'placeholder'">{{data.v3 || 'hh:mm'}}</view>
      	</picker>
        
        <view class="tp-flex-1 tp-flex">
          <view class="tp-flex-1"></view>
          <uni-tooltip class="tooltip" content='例: "18:33" 表示每天的18:33触发'>
            <uni-icons type="help-filled" size="36rpx" color="#999"></uni-icons>
          </uni-tooltip>
        </view>
      </view>
      
      <!-- 3 每周 -->
      <view v-if="data.v1 === '3'" class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      	<CustomSelect
      	  placeholder="周几" 
      	  :options="weekOptions"
      	  v-model="data.v3"
      	></CustomSelect>
        
        <view class="tp-flex-1 tp-flex tp-flex-a-c">
          <picker class="tp-flex-1" v-if="data.v3" mode="time" :value="data.v4" @change="bindTimeChange2">
            <view class="uni-input" :class="!data.v4 && 'placeholder'">{{data.v4 || 'hh:mm'}}</view>
          </picker>
          
          <uni-tooltip v-if="data.v3" class="tooltip" content='例: "周一, 18:33" 表示每周一的18:33触发'>
            <uni-icons type="help-filled" size="36rpx" color="#999"></uni-icons>
          </uni-tooltip>
        </view>
      </view>
      
      <!-- 4 每月 -->
      <view v-if="data.v1 === '4'" class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      	<CustomSelect
      	  placeholder="日" 
      	  :options="dateOptions"
          @change="dateChange"
      	  v-model="date"
      	></CustomSelect>
        
        <view class="tp-flex-1 tp-flex tp-flex-a-c">
          <picker class="tp-flex-1" v-if="date" mode="time" :value="time" @change="bindTimeChange1">
          	<view class="uni-input" :class="!time && 'placeholder'">{{time || 'hh:mm'}}</view>
          </picker>
          
          <uni-tooltip v-if="date" class="tooltip" content='例: "1日, 9:00" 表示每月1日的09:00触发'>
            <uni-icons type="help-filled" size="36rpx" color="#999"></uni-icons>
          </uni-tooltip>
        </view>
      </view>
      
      <!-- 5 自定义cron -->
      <view v-if="data.v1 === '5'" class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      	<input class="uni-input" placeholder="执行日期时间规则" v-model="data.v3"/>
        
        <uni-tooltip class="tooltip tooltip-c">
          <uni-icons type="help-filled" size="36rpx" color="#999" @tap="ttt"></uni-icons>
          <template slot="content">
            <text>
              <strong style="margin-right: 16rpx;">0/2 * * * *</strong>每2分钟触发;<br>
              <strong style="margin-right: 16rpx;">0 0/2 * * *</strong>每两小时触发;<br>
              <strong style="margin-right: 16rpx;">15 10 * * *</strong>每天上午的10:15触发;<br>
              <strong style="margin-right: 16rpx;">0/5 14 * * *</strong>在每天下午2点到下午2:55期间的每5分钟触发;<br>
              <strong style="margin-right: 16rpx;">0/5 14,18 * * *</strong>在每天下午2点到2:55期间和下午6点到6:55期间的每5分钟触发;<br>
              <strong style="margin-right: 16rpx;">15 10 ? *</strong>周一至周五的上午10:15触发;<br>
              <strong style="margin-right: 16rpx;">15 10 15 * *</strong>每月15日上午10:15触发;
            </text>
          </template>
        </uni-tooltip>
      </view>
    </template>
  </view>
</template>

<script>
  import CustomSelect from '@/components/custom-select.vue'
  
  export default {
    components: {
      CustomSelect,
    },
    props: {
      data: {
        type: [Object],
        default: () => ({}),
      },
    },
    data() {
      return {
        time_condition_type_options: [
          { value: '1', label: '单次' },
          { value: '2', label: '重复' },
          { value: '0', label: '范围' },
          // { value: '3', label: '自定义' },
        ],
        intervalOptions: [
          { value: '1', label: '每小时' },
          { value: '2', label: '每天' },
          { value: '3', label: '每周' },
          { value: '4', label: '每月' },
          { value: '5', label: '自定义cron' },
        ],
        minuteOptions: [],
        weekOptions: [
          { value: '2', label: '周一' },
          { value: '3', label: '周二' },
          { value: '4', label: '周三' },
          { value: '5', label: '周四' },
          { value: '6', label: '周五' },
          { value: '7', label: '周六' },
          { value: '1', label: '周日' },
        ],
        dateOptions: [],
        date: '',
        time: '',
      };
    },
    created () {
      this.initMinuteOptions()
      this.initDateOptions()

      const { 
        condition_type, // 2 时间条件
        time_condition_type, // 2 重复
        v1, // 4 每月
        v3,
      } = this.data
      
      if (condition_type === '2' && time_condition_type === '2' && v1 === '4') {
        const [dd, hh, mm] = v3.split(':')
        this.date = dd
        this.time = hh+':'+mm
      }
    },
    methods: {
      ttt () {
        console.log('=====测试')
      },
      initMinuteOptions () {
        let minuteOptions = []
        for (let i = 0; i < 60; i++) {
          const minute = i + ''
          minuteOptions.push({ value: minute, label: minute.padStart(2, '0') + ':00' })
        }
        this.minuteOptions = minuteOptions
      },
      initDateOptions () {
        let dateOptions = []
        for (let i = 0; i < 31; i++) {
          const date = i + 1 + ''
          dateOptions.push({ value: date, label: date + '日' })
        }
        this.dateOptions = dateOptions
      },
      // 切换 单次、重复、范围
      timeConditionTypeChange () {
        this.data.v1 = ''
        this.data.v2 = ''
        this.data.v3 = ''
        this.data.v4 = ''
        this.data.v5 = ''
        
        this.date = ''
        this.time = ''
      },
      // 时间条件为重复时，切换周期
      intervalChange () {
        this.data.v2 = ''
        this.data.v3 = ''
        this.data.v4 = ''
        this.data.v5 = ''
        
        this.date = ''
        this.time = ''
      },
      bindTimeChange (e) {
        this.data.v3 = e.detail.value
      },
      dateChange () {
        this.data.v3 = this.date+':'+this.time
      },
      bindTimeChange1 (e) {
        this.time = e.detail.value
        this.data.v3 = this.date+':'+this.time
      },
      bindTimeChange2 (e) {
        this.data.v4 = e.detail.value
      },
      singleDateTimeChange (v1) {
        this.$nextTick(() => {
          this.data.v1 = v1.padEnd(16, '00:00')
        })
      },
      v1DateTimeChange (v1) {
        const v2 = this.data.v2
        this.$nextTick(() => {
          if (v2 && v1 > v2) {
            this.data.v1 = v2.padEnd(16, '00:00')
          } else {
            this.data.v1 = v1.padEnd(16, '00:00')
          }
        })
      },
      v2DateTimeChange (v2) { 
        const v1 = this.data.v1
        this.$nextTick(() => {
          if (this.data.v1 && v2 < this.data.v1) {
            this.data.v2 = v1.padEnd(16, '00:00')
          } else {
            this.data.v2 = v2.padEnd(16, '00:00')
          }
        })
      },
    },
  }
</script>

<style scoped>
  @import '@/common/alert-strategy.css';
  
  .zhi {
    font-size: 26rpx;
  }
  .placeholder {
    color: #999;
  }
  /deep/.uni-icons.uniui-calendar {
    display: none;
  }
  /deep/.uni-date-x {
    padding: 0 26rpx;
    background-color: transparent;
  }
  /deep/.uni-date__x-input {
    font-size: 26rpx;
    text-align: left;
    height: 80rpx;
    padding: 0;
  }
  /deep/.uni-input-placeholder.input-placeholder {
    color: #999;
  }
  
  /deep/.tooltip-c > .uni-tooltip-popup {
    max-width: 70vmin;
  }
</style>