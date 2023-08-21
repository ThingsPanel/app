<template>
  <view>
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="showPop">
    	<input class="uni-input" placeholder="状态/属性" disabled :value="showValue"/>
    	<view>
    	  <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
    	</view>
    </view>
    
    <uni-popup ref="pop" type="bottom" backgroundColor="#fff">
    	<scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '700rpx' }">
    		<view class="selectlist" v-if="showStatus">
          <view style="color: #bbb;" class="select_item">上下线</view>
    			<view class="select_item" v-for="(option, key) in statusOptions" :key="key" @click="onSelect('3', option)">
    				{{ option.label }}
    			</view>
    		</view>
        
        <view class="selectlist" v-if="propOptions.length">
          <view style="color: #bbb;" class="select_item">属性</view>
        	<view class="select_item" v-for="(option, key) in propOptions" :key="key" @click="onSelect('1', option)">
        		{{ option.title }}
        	</view>
        </view>
        <template v-else>
          <view style="color:red;" class="select_item" v-if="!showStatus">
            <text>无数据！</text>
          </view>
        </template>
        
    	</scroll-view>
    </uni-popup>
  </view>
  
</template>

<script>
  export default {
    model:{ // 建议显示把这个写上
      event:'update:value',
      prop: 'value'
    },
    props: {
      value: {
        type: Object,
        default: () => ({}),
      },
      propOptions: {
        type: Array,
        default: [],
      },
      showStatus: {
        type: Boolean,
        default: true,
      },
    },
    computed: {
      showValue () {
        if (this.value.device_condition_type === '1') { // 当前选中的是 属性
          const option = this.propOptions.find(item => item.name === this.value.v1)
          if (option) {
            this.$emit('valueConfChange', option)
            return option.title
          }
        } else if (this.value.device_condition_type === '2') {  // 当前选中的是 事件
          
        } else if (this.value.device_condition_type === '3') {  // 当前选中的是 状态
          const option = this.statusOptions.find(item => item.value === this.value.v2)
          if (option) {
            this.$emit('valueConfChange', option)
            return option.label
          }
        } else {
          return ''
        }
      },
    },
    watch: {
      value (n, o) {
        this.$emit('change', n, o)
      },
    },
    data () {
      return {
        statusOptions: [
          { value: '1', name: 'online', label: '上线', mode: 'onlineState' },
          { value: '2', name: 'offline', label: '下线', mode: 'onlineState' },
          { value: '3', name: 'onAndOff', label: '上下线', mode: 'onlineState' },
        ],
      }
    },
    created () {
      
    },
    methods: {
      showPop () {
        this.$refs.pop.open()
      },
      hidePop() {
        this.$refs.pop.close()
      },
      onSelect (device_condition_type, option) {
        console.log(JSON.parse(JSON.stringify(option)))
        if (device_condition_type === '1') { // 当前选中的是 属性，v1有值  v2有值  v3有值
          this.$emit('update:value', {
            device_condition_type: '1',
            v1: option.name,
            v2: '',
          })
        } else if (device_condition_type === '2') { // 当前选中的是 事件
          
        } else if (device_condition_type === '3') { // 当前选中的是 状态，v1为空	  v2有值	  v3为空
          this.$emit('update:value', {
            device_condition_type: '3',
            v1: '',
            v2: option.value,
          })
        }
        
        this.hidePop()
      },
    },
  }
</script>

<style scoped>
  
</style>