<template>
  <view class="tp-flex-1">
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="showPop">
      <view class="label">{{label}}</view>
    	<input class="uni-input" :placeholder="placeholder" disabled :value="showValue"/>
    	<view class="iconfont iconjiantou1"></view>
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
        this.$emit('change', n, o)
      },
    },
    computed: {
      showValue () {
        const option = this.options.find(item => item[this.optionValue] === this.value)
        if (option) {
          return option[this.optionLabel]
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
      showPop () {
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
    font-size: 28rpx;
  }
</style>