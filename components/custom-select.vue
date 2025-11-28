<template>
  <view class="tp-flex-1 custom-select-popup">
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c select-row" @tap="showPop">
      <view class="label">{{label}}</view>
    	<view class="input-wrapper">
        <input class="uni-input" :placeholder="placeholder" disabled :value="currentDisplayText || showValue" :key="`input-${value || ''}-${currentDisplayText || showValue || ''}`"/>
        <view class="input-overlay" @tap="showPop"></view>
      </view>
    	<view class="" v-if="!clearable || (clearable && !value)">
        <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
      </view>
      <view class="" v-if="clearable && value" @tap.stop="clear">
        <uni-icons color="#999" type="clear" size="40rpx"></uni-icons>
      </view>
    </view>
    
    <uni-popup ref="pop" type="bottom" backgroundColor="#fff">
    	<scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '700rpx' }">
    		<view class="selectlist">
    			<view class="select_item" v-for="(option, key) in options" :key="key" @click="onSelect(option)">
    				{{ option[optionLabel] }}
    			</view>
    		</view>
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
      clearable: {
        type: Boolean,
        default: false,
      },
      value: {
        type: [String, Number],
      },
      options: {
        type: Array,
        default: () => [],
      },
      optionValue: {
        type: String,
        default: 'value',
      },
      optionLabel: {
        type: String,
        default: 'label',
      },
      label: {
        type: String,
        default: '',
      },
      placeholder: {
        type: String,
        default: '',
      },
    },
    
    watch: {
      value: {
        handler(n, o) {
          this.$emit('change', n, o)
          // 当 value 变化时，清空 currentDisplayText，让计算属性重新计算
          if (n !== o) {
            this.currentDisplayText = ''
          }
          // 使用 nextTick 确保在下一个 tick 更新
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        },
        immediate: false
      },
      options: {
        handler() {
          // 当选项列表更新时，强制更新显示值
          this.$nextTick(() => {
            this.$forceUpdate()
          })
        },
        deep: true,
        immediate: false
      }
    },
    computed: {
      showValue () {
        console.log('showValue computed - value:', this.value, 'options length:', this.options?.length, 'optionValue:', this.optionValue, 'optionLabel:', this.optionLabel)
        
        // 如果 value 为空（包括 null, undefined, ''），返回空字符串
        if (this.value === null || this.value === undefined || this.value === '') {
          console.log('showValue - value is empty')
          return ''
        }
        
        // 如果 options 为空，返回空字符串
        if (!this.options || this.options.length === 0) {
          console.log('showValue - options is empty')
          return ''
        }
        
        // 查找匹配的选项
        const option = this.options.find(item => {
          if (!item) return false
          const itemValue = item[this.optionValue]
          // 严格相等比较
          if (itemValue === this.value) {
            return true
          }
          // 字符串转换比较
          if (String(itemValue) === String(this.value)) {
            return true
          }
          // 数字类型比较（处理 0 和数字字符串的情况）
          const numItem = Number(itemValue)
          const numValue = Number(this.value)
          if (!isNaN(numItem) && !isNaN(numValue) && numItem === numValue) {
            return true
          }
          return false
        })
        
        if (option && option[this.optionLabel] !== undefined && option[this.optionLabel] !== null) {
          const displayText = String(option[this.optionLabel])
          console.log('showValue found:', { value: this.value, option, displayText, optionLabel: this.optionLabel })
          return displayText
        } else {
          console.log('showValue not found:', { value: this.value, valueType: typeof this.value, options: this.options.map(o => ({ id: o[this.optionValue], name: o[this.optionLabel] })), optionValue: this.optionValue })
          return ''
        }
      },
    },
    data () {
      return {
        currentDisplayText: '' // 当前显示的文本
      }
    },
    created () {
      
    },
    methods: {
      clear (e) {
        this.$emit('update:value')
      },
      showPop (e) {
        console.log('showPop', e)
        this.$emit('click')
        this.$refs.pop.open()
      },
      hidePop() {
        this.$refs.pop.close()
      },
      onSelect (option) {
        if (!option) return
        const newValue = option[this.optionValue]
        const displayText = option[this.optionLabel] || ''
        console.log('onSelect:', { option, newValue, displayText, optionValue: this.optionValue, optionLabel: this.optionLabel })
        // 立即更新显示文本
        this.currentDisplayText = String(displayText)
        this.$emit('update:value', newValue)
        this.$emit('change', newValue)
        this.hidePop()
        // 强制更新以确保显示值刷新
        this.$nextTick(() => {
          this.$forceUpdate()
        })
      },
    },
  }
</script>

<style scoped>
  .label {
    font-size: 26rpx;
  }
  .select-row {
    position: relative;
  }
  .input-wrapper {
    flex: 1;
    position: relative;
  }
  .input-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
  }
</style>

<style>
  /* 确保弹出层从页面底部弹出，不受父元素影响 */
  .custom-select-popup ::v-deep .uni-popup {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    z-index: 9999 !important;
  }
  
  .custom-select-popup ::v-deep .uni-popup.bottom .uni-popup__wrapper {
    position: fixed !important;
    bottom: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: auto !important;
  }
</style>