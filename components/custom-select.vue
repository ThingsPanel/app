<template>
  <view class="tp-flex-1">
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @tap="showPop">
      <view class="label">{{label}}</view>
    	<input class="uni-input" :placeholder="placeholder" disabled :value="showValue"/>
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
        default: [],
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
        console.log(1234, n, o)
        this.$emit('change', n, o)
      },
    },
    computed: {
      showValue () {
        console.log('value', this.value)
        const option = this.options.find(item => item[this.optionValue] === this.value)
        console.log('option', option)
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
        this.$emit('update:value', option[this.optionValue])
        this.hidePop()
      },
    },
  }
</script>

<style scoped>
  .label {
    font-size: 26rpx;
  }
</style>