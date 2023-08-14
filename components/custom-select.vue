<template>
  <view>
    <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @click="showPop">
    	<input class="uni-input" :placeholder="placeholder" disabled :value="showValue"/>
    	<view class="iconfont iconjiantou1"></view>
    </view>
    
    <uni-popup ref="pop" type="bottom">
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
  
</style>