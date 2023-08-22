<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">
			<view style="border-radius: 0;" class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>场景标题</view>
					<input maxlength="20" type="text" class="tp-flex-1 tp-mg-l-20" placeholder="场景标题" placeholder-class="tp-plc"
						v-model.trim="formData.scenario_name" />
				</view>
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>场景描述</view>
					<input maxlength="40" type="text" class="tp-flex-1 tp-mg-l-20" placeholder="场景描述" placeholder-class="tp-plc"
						v-model.trim="formData.scenario_description" />
				</view>
			</view>
      
			<view class="tp-mg-l-r-30 tp-mg-t-25 tp-flex tp-flex-row" v-for="(action, index) in formData.scenario_actions" :key="action.$index">
			  
			  <view style="align-self: center;" class="tp-panel tp-flex-1">
			    <SelectDevice :showStatus="false" key="SelectDevice" :data="action"></SelectDevice>
			  </view>
			  
			  <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
			    <!-- 条件数量大于1条时才允许删除 -->
			    <uni-icons 
			      v-if="formData.scenario_actions.length > 1" 
			      class="tp-mg-t-b-10"
			      type="minus" 
			      size="40rpx" 
			      color="red"
			      @click="removeAction(action, index)"
			    ></uni-icons>
			    
			    <!-- 仅最后一个显示新增 -->
			    <uni-icons
			      class="tp-mg-t-b-10"
			      type="plus" 
			      size="40rpx"
			      color="#2979ff"
			      @click="addAction(action, index)"
			    ></uni-icons>
			  </view>
			</view>
      
      <view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-b-40">
      	<button class="tp-btn" @tap="handlerSubmit">保存</button>
      </view>
			
			<!-- 消息提示框 -->
			<cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
      
      <Modal v-model="visible" title='保存' text='确定要保存数据吗？' @cancel='cancel' @confirm='confirm' />
		</view>
	</view>
</template>

<script>
  import Modal from '@/components/x-modal/x-modal'
  import SelectDevice from '@/components/select-device'
  
	export default {
    components: {
      SelectDevice,
      Modal,
    },
		data() {
			return {
				toast: {
					msg: ''
				},
        editId:'',
        formData: {},
        visible: false,
			}
		},
		onShow() {

		},
		onLoad(options) {
			this.editId = options.id
      uni.setNavigationBarTitle({
        title: `${this.editId ? '编辑' : '新增'}场景`,
      })
		},
    created () {
      if (this.editId) {
        this.getInfo()
      } else {
        this.formData = {
          scenario_actions: [
            {
              $index: Math.random(),
              action_type: '1',
            },
          ]
        }
      }
    },
		methods: {
      getInfo(){
      	uni.showLoading({
      		title: '加载中'
      	});
        const params = {
      		id: this.editId
      	}
      	this.API.apiRequest('/api/scenario/strategy/detail', params, 'post').then(res => {
      		if (res.code == 200) {
            this.transActionsIn(res.data.scenario_actions)
            this.formData = res.data
      		} else {
      			this.toast.msg = res.message
      			this.$refs.toast.show();
      		}
      	}).finally(() => {
      		uni.hideLoading()
      	});
      },
      
      transActionsIn (actions) {
        actions.forEach(action => {
          const instruct = JSON.parse(action.instruct)
          const [[v1, v3]] = Object.entries(instruct)
          action.device_condition_type = action.device_model
          action.v1 = v1
          action.v3 = v3
          
          action.$index = Math.random()
        })
      },
      
      transActionsOut (actions) {
        const list = []
        for (let action of actions) {
          const {
            action_type,
            device_id,
            device_condition_type,
            v1,
            v3,
          } = action
          
          console.log(action)
          if (!action_type || !device_id || !device_condition_type || !v1 || !v3) {
            return {
              result: '请将设备信息补充完整'
            }
          }
          
          list.push({
            action_type,
            device_id,
            device_model: device_condition_type,
            instruct: JSON.stringify({ [v1]: v3 }),
          })
        }
        
        return {
          result: true,
          actions: list,
        }
      },
      
			// 删除
			removeAction (currAction, index) {
			  console.log(currAction, index)
			  this.formData.scenario_actions.splice(index, 1)
			},
			// 新增
			addAction (currAction, index) {
        console.log(this.formData)
			  this.formData.scenario_actions.splice(index+1, 0, {
			    $index: Math.random(),
			    action_type: '1',
			    
			    business_id: '',
			    asset_id: '',
			    device_id: '',
			    device_condition_type: '',
			    
			    v1: '',
			    v3: '',
			  })
			  console.log(this.formData.scenario_actions)
			},
      
      handlerSubmit () {
        console.log(this.formData)
        
        const {
          tenant_id,
          id,
          scenario_name,
          scenario_description,
          scenario_actions,
        } = this.formData
        
        if (!scenario_name) {
          this.toast.msg = '请输入场景标题'
          this.$refs.toast.show()
          return;
        }
        
        const validateReult = this.transActionsOut(scenario_actions)
        if (validateReult.result !== true) {
          this.toast.msg = validateReult.result
          this.$refs.toast.show()
          return;
        }

        const submitData = {
          id,
          scenario_name,
          scenario_description,
          tenant_id,
          scenario_actions: validateReult.actions,
        }
        
        console.log(submitData)
        
        this.submitData = submitData
        this.visible = true
      },
      cancel() {
        console.log("取消")
        this.visible = false
      },
      confirm () {
        this.doSubmit(this.submitData)
      },
      doSubmit (submitData) {
        uni.showLoading({
        	title: '加载中'
        });
        
        let url = '/api/scenario/strategy/edit'
        if (!submitData.id) {
          url = '/api/scenario/strategy/add'
        }
        
        this.API.apiRequest(url, submitData, 'post').then(res => {
        	if (res.code == 200) {
        		uni.navigateBack(-1)
        	} else {
        		this.toast.msg = res.message
        		this.$refs.toast.show();
        	}
        }).finally(() => {
        	uni.hideLoading()
        });
      },
		}
	}
</script>

<style>
	@import '@/common/alert-strategy.css';
  
  .tooltip /deep/.uni-tooltip-popup {
    width: max-content;
    left: initial;
    right: 0;
  }
  
  .title {
    font-size: 26rpx;
  }
  
  /deep/.uni-input {
    font-size: 26rpx;
  }
  /deep/.uni-input-input {
    color: #000;
  }
  
  /deep/.uni-input .uni-input-placeholder.input-placeholder {
    color: #999;
  }
  
  
  /deep/.uniui-forward, 
  /deep/.uniui-clear {
    font-size: 28rpx !important;
    color: #999 !important;
    vertical-align: middle;
    margin-right: 12rpx;
  }
  
  /deep/.uniui-clear {
    font-size: 36rpx !important;
  }
  
  /deep/.uni-icons {
    display: block;
  }
  
  uni-text {
    color: #333;
  }
  
  /deep/.checklist-text > span {
    font-size: 26rpx;
  }
  
  /deep/.tp-panel {
    border-radius: 10rpx;
    overflow: hidden;
  }
  
  /deep/.item2 {
    border-bottom: 1rpx solid #dfdfdf;
  }
  /deep/.item > .tp-flex-1 + .tp-flex-1 {
    margin-left: 20rpx;
  }
  /deep/.item + .item {
    border-top: 1rpx solid #f1f1f1;
  }
</style>
