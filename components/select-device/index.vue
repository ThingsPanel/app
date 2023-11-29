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
    
    <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
      <CustomSelect
        placeholder="项目" 
        :options="projectOptions"
        @change="businessIdChange"
        optionValue="id"
        optionLabel="name"
        v-model="data.business_id"
      ></CustomSelect>
      
      <view class="tp-flex-1">
        <CustomSelect
          v-if="data.business_id" 
          placeholder="分组" 
          :options="groupOptions"
          @change="groupIdChange"
          optionValue="id"
          optionLabel="device_group"
          v-model="data.asset_id"
        ></CustomSelect>
      </view>
      
    </view>
    
    <view class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing" v-if="data.asset_id || data.device_id">
      <Device 
        class="tp-flex-1"
        :options="deviceOptions"
        @change="deviceIdChange"
        @propTypeChange="propTypeChange"
        v-model="data.device_id"
      ></Device>
      
      <view class="tp-flex-1">
        <SelectPes
          v-if="data.device_id"
          :showStatus="showStatus"
          :propOptions="propOptions"
          v-model="pesData" 
          @change="pesDataChange"
          @valueConfChange="valueConfChange"
          ></SelectPes>
      </view>
      
    </view>
    
    <!-- 前一个选择框选择了属性时才显示 -->
    <view 
      class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing" 
      v-if="data.device_condition_type === '1'"
    >
      <CustomSelect
        v-if="showStatus"
        placeholder="操作符" 
        :options="symbolOptions"
        v-model="data.v2"
      ></CustomSelect>
      
      <view class="tp-flex-1">
        <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-a-c tp-mg-l-20">
          <view class="control_l_item_l" v-if="data.v1.startsWith('switch')">
            <view class="control_l_item_r_switch" @click="changSwitch(data)">
              <image src="/static/icon/switch_on.png" v-if="data.v3 == 1" />
              <image src="/static/icon/switch_close.png" v-if="data.v3 == 0" />
            </view>

          </view>
        	<input v-else class="uni-input" placeholder="属性值" v-model.trim="data.v3"/>
          <text class="tp-font-size-13 tp-mg-l-r-15 unit">{{ valueConf.unit }}</text>
        </view>
      </view>
    </view>
  </view>
  
</template>

<script>
  import CustomSelect from '@/components/custom-select.vue'
  import Device from './device.vue'
  import SelectPes from './select-pes.vue'
  
  export default {
    components: {
      CustomSelect,
      Device,
      SelectPes,
    },
    props: {
      data: {
        type: [Object],
        default: () => ({}),
      },
      showStatus: {
        type: Boolean,
        default: true,
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
      console.log(this.data)
    },
    methods: {
      changSwitch(data){
        if(data.v3 == 1){
          this.$set(data, 'v3', '0')
        }else{
          this.$set(data, 'v3', '1')
        }
      },
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
        		this.groupOptions = res.data.map(item => ({ 
              id: item.id,
              device_group: item.device_group.slice(1)
            })) || []
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
        this.groupOptions = []
        
        // todo：待优化
        this.$set(this.data, 'asset_id', '')
        this.$set(this.data, 'device_id', '')
        this.$set(this.data, 'device_condition_type', '')
        this.$set(this.data, 'v1', '')
        this.$set(this.data, 'v2', '')
        this.$set(this.data, 'v3', '')
        
        
        this.queryGroupOptions()
        
        console.log(this.data)
      },
      
      groupIdChange () {
        // todo：待优化
        this.$set(this.data, 'device_id', '')
        this.$set(this.data, 'device_condition_type', '')
        this.$set(this.data, 'v1', '')
        this.$set(this.data, 'v2', '')
        this.$set(this.data, 'v3', '')
        
        this.deviceOptions = []
        this.queryDeviceOptions()
        
        console.log(34, this.data)
      }, 
      
      deviceIdChange () {
        console.log(this.data)
        
        // todo：待优化
        this.$set(this.data, 'device_condition_type', '')
        this.$set(this.data, 'v1', '')
        this.$set(this.data, 'v2', '')
        this.$set(this.data, 'v3', '')
        
        console.log(this.data)
        this.initPesData()
      },
      propTypeChange (propType) {
        this.propOptions = []
        propType && this.queryPropOptions(propType)
      },
      
      pesDataChange (pesData) {
        console.log(pesData)
        
        // todo：待优化
        this.$set(this.data, 'device_condition_type', pesData.device_condition_type)
        this.$set(this.data, 'v1', pesData.v1)
        this.$set(this.data, 'v2', pesData.v2)
        this.$set(this.data, 'v3', '')
        if(this.data.v1.startsWith('switch')){
          this.$set(this.data, 'v3', '0')
        } else {
          this.$set(this.data, 'v3', '')
        }
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
  @import '@/common/alert-strategy.css';

  .unit {
    color: #999;
  }
  .control_l_item_r_switch uni-image{
    text-align: left;
    margin-top: 10px;
    width: 78px;
    height: 37px;
  }
</style>