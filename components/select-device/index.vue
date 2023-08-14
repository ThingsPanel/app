<template>
  <view class="">
    <!-- automation_id 是父id，是当前此联动场景的id，
    id是当前条件的id -->
    <!-- <p style="font-size: 10px;">dsns_id：{{data.business_id}}</p>
    <p style="font-size: 10px;">asset_id：{{data.asset_id}}</p>
    <p style="font-size: 10px;">device_id：{{data.device_id}}</p>
    <p style="font-size: 10px;">device_condition_type：{{data.device_condition_type}}</p>
    <p style="font-size: 10px;">v1：{{data.v1}}</p>
    <p style="font-size: 10px;">v2：{{data.v2}}</p>
    <p style="font-size: 10px;">v3：{{data.v3}}</p> -->
    
    <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      <CustomSelect
        placeholder="请选择" 
        :options="projectOptions"
        @change="businessIdChange"
        optionValue="id"
        optionLabel="name"
        v-model="data.business_id"
      ></CustomSelect>
      
      <CustomSelect
        v-if="data.business_id" 
        placeholder="请选择" 
        :options="groupOptions"
        @change="groupIdChange"
        optionValue="id"
        optionLabel="device_group"
        v-model="data.asset_id"
      ></CustomSelect>
    </view>
    
    <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      <SelectDevice 
        v-if="data.asset_id"
        :options="deviceOptions"
        @change="deviceIdChange"
        @propTypeChange="propTypeChange"
        v-model="data.device_id"
      ></SelectDevice>
      
      <SelectPes 
        v-if="data.device_id"
        :propOptions="propOptions"
        v-model="pesData" 
        @change="pesDataChange"
        @valueConfChange="valueConfChange"
        ></SelectPes>
    </view>
    
    <!-- 前一个选择框选择了属性时才显示 -->
    <view 
      class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing" 
      v-if="data.device_condition_type === '1'"
    >
      <CustomSelect
        placeholder="请选择" 
        :options="symbolOptions"
        v-model="data.v2"
      ></CustomSelect>
      
      <view class="">
        <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c">
        	<input class="uni-input" placeholder="输入内容" v-model="data.v3"/>
          <view style="width:16px;" class="iconfont">{{ valueConf.unit }}</view>
        </view>
      </view>
      
    </view>
  </view>
  
</template>

<script>
  import CustomSelect from '@/components/custom-select.vue'
  import SelectDevice from './select-device.vue'
  import SelectPes from './select-pes.vue'
  
  export default {
    components: {
      CustomSelect,
      SelectDevice,
      SelectPes,
    },
    props: {
      data: {
        type: [Object],
        default: () => ({}),
      },
    },
    data() {
      return {
        condition: {},
        
        projectOptions: [],
        groupOptions: [],
        deviceOptions: [],
        propOptions: [],
        symbolOptions: [
          { value: '>', label: '>' },
          { value: '>=', label: '>=' },
          { value: '<', label: '<' },
          { value: '<=', label: '<=' },
          { value: '==', label: '==' },
          { value: '!=', label: '!=' },
          { value: 'in', label: 'in' },
          { value: 'between', label: 'between' },
        ],
        
        pesData: {},
        valueConf: {},
      };
    },
    computed: {
      
    },
    watch: {
      
    },
    created () {
      this.queryProjectOptions()
      this.data.business_id && this.queryGroupOptions()
      this.data.asset_id && this.queryDeviceOptions()
      
      this.initPesData()
    },
    mounted () {
      
    },
    methods: {
      // 加载项目列表
      queryProjectOptions () {
        // uni.showLoading({
        // 	title: '加载中'
        // });
        
        const params = {}
        this.API.apiRequest('/api/business/index', params, 'post').then(res => {
        	if (res.code == 200) {
        		this.projectOptions = res.data.data || []
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
      
      // 加载分组列表
      queryGroupOptions () {
        if (!this.data.business_id) {
          return
        }
        
        // uni.showLoading({
        // 	title: '加载中'
        // });
        
        const params = {
        	business_id: this.data.business_id,
        }
        
        this.API.apiRequest('/api/asset/list/d', params, 'post').then(res => {
        	if (res.code == 200) {
        		this.groupOptions = res.data || []
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
      
      // 加载设备列表树
      queryDeviceOptions () {
        if (!this.data.asset_id) {
          return
        }
        
        // uni.showLoading({
        // 	title: '加载中'
        // });
        
        const params = {
        	asset_id: this.data.asset_id,
        	current_page: 1,
        	per_page: 9999,
        }
        this.API.apiRequest('/api/device/list/tree', params, 'post').then(res => {
        	if (res.code == 200) {
        		this.deviceOptions = res.data.data || []
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
      
      // 加载属性列表
      queryPropOptions (id) {
        if (!id) {
          return
        }
        
        // uni.showLoading({
        // 	title: '加载中'
        // });
        
        const params = {
        	id,
          current_page: 1,
          per_page: 9999,
        }
        this.API.apiRequest('/api/device/model/list', params, 'post').then(res => {
        	if (res.code == 200) {
        		this.propOptions = JSON.parse(res.data.data[0].chart_data)?.tsl?.properties || []
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
      
      // 加载属性列表
      queryEventOptions () {},
      
      // 监听切换项目的事件
      // 切换项目需要重置后面所有联动表单项的值，
      // 且如果紧跟在后面的第一个表单项有下拉选项，则需要清空选项数据
      businessIdChange () {
        Object.assign(this.data, {
          asset_id: '', 
          device_id: '', 
          device_condition_type: '', 
          v1: '', 
          v2: '', 
          v3: '', 
        })
        
        this.groupOptions = []
        this.queryGroupOptions()
        
        console.log(this.data)
      },
      
      groupIdChange () {
        
        Object.assign(this.data, {
          device_id: '', 
          device_condition_type: '', 
          v1: '', 
          v2: '', 
          v3: '', 
        })
        
        this.deviceOptions = []
        this.queryDeviceOptions()
        
        console.log(34, this.data)
      }, 
      
      deviceIdChange () {
        Object.assign(this.data, {
          device_condition_type: '', 
          v1: '', 
          v2: '', 
          v3: '', 
        })
        
        this.initPesData()
      },
      propTypeChange (propType) {
        this.propOptions = []
        propType && this.queryPropOptions(propType)
      },
      
      pesDataChange (pesData) {
        Object.assign(this.data, pesData, {
          v3: '', 
        })
      },
      
      // 更新传递给属性选择器的数据。在属性选择器修改了选项，需要同步需改显示值
      initPesData () {
        this.pesData = {
          device_condition_type: this.data.device_condition_type,
          v1: this.data.v1,
          v2: this.data.v2,
        }
      },
      
      valueConfChange (valueConf) {
        this.valueConf = valueConf
      },
    },
  }
</script>

<style scoped>

</style>