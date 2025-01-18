<template>
  <view class="">
    <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      <CustomSelect
        :placeholder="$t('pages.sceneRuleDetail.alertLevel')"
        :options="levelOptions"
        @change="change"
        v-model="warningStrategy.warning_level"
      ></CustomSelect>
      
    	<CustomSelect
    	  :placeholder="$t('pages.sceneRuleDetail.notificationGroup')"
    	  :options="noticOptions"
    	  @change="change"
    	  optionValue="id"
    	  optionLabel="group_name"
    	  v-model="warningStrategy.inform_way"
    	></CustomSelect>
    </view>
    
    <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
        <!-- <view class="label">重复次数</view> -->
      	<input class="uni-input" :placeholder="$t('pages.sceneRuleDetail.repeatCount')" v-model.number="warningStrategy.repeat_count"/>
      </view>
    </view>
    
    <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
        <!-- <view class="label">告警描述</view> -->
      	<input class="uni-input" :placeholder="$t('pages.sceneRuleDetail.alertDescription')" v-model="warningStrategy.warning_description"/>
      </view>
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
    },
    watch: {
      data (n, o) {
        console.log(12345, n, o)
      },
    },
    data () {
      return {
        levelOptions: [
          { value: '1', label: this.$t('pages.sceneRuleDetail.levels.low') },
          { value: '2', label: this.$t('pages.sceneRuleDetail.levels.medium') },
          { value: '3', label: this.$t('pages.sceneRuleDetail.levels.high') },
        ],
        noticOptions: [],
        warningStrategy: this.data.actions[0].warning_strategy || {},
      }
    },
    created () {
      console.log(this.data)
      this.queryNoticeOptions()
    },
    mounted () {
      
    },
    
    methods: {
      change () {},
      queryNoticeOptions () {
        // uni.showLoading({
        // 	title: '加载中'
        // });
        
        const params = {
          current_page: 1,
          per_page: 999,
        }
        this.API.apiRequest('/api/notification/list', params, 'post').then(res => {
        	if (res.code == 200) {
        		this.noticOptions = res.data.data || []
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
