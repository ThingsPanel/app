<template>
  <view>
    <view class=" tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
    	<CustomSelect
    	  placeholder="场景" 
    	  :options="sceneOptions"
    	  @change="change"
    	  optionValue="id"
    	  optionLabel="scenario_name"
    	  v-model="data.actions[0].scenario_strategy_id"
    	></CustomSelect>
    </view>
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
        default: () => ({
          action_type: '',
          actions: [],
        }),
      },
      test: String,
    },
    watch: {
      data (n, o) {
        console.log(n, o)
      },
    },
    data () {
      return {
        sceneOptions: [],
      }
    },
    created () {
      this.querySceneOptions()
    },
    mounted () {
      console.log(123, this.data)
    },
    
    methods: {
      change () {},
      querySceneOptions () {
        // uni.showLoading({
        // 	title: '加载中'
        // });
        
        const params = {
          current_page: 1,
          per_page: 999,
        }
        this.API.apiRequest('/api/scenario/strategy/list', params, 'post').then(res => {
        	if (res.code == 200) {
        		this.sceneOptions = res.data.data || []
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
    },
  }
</script>

<style scoped>
  @import '@/common/alert-strategy.css';
</style>