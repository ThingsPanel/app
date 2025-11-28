<template>
  <view class="tp-flex-1 custom-select-popup">
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c select-row" @tap="showPop">
      <view class="label">{{label}}</view>
    	<view class="input-wrapper">
        <input class="uni-input" :placeholder="placeholder" disabled :value="showValue"/>
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
        type: String,
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
      value (n, o) {
        this.$emit('change', n, o)
      },
    },
    computed: {
      showValue () {
        const option = this.options.find(item => item[this.optionValue] === this.value)
        if (option) {
          return option[this.optionLabel]
        } else {
          return ''
        }
      },
    },
    data () {
      return {
        
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
        const newValue = option[this.optionValue]
        this.$emit('update:value', newValue)
        this.$emit('change', newValue)
        this.hidePop()
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