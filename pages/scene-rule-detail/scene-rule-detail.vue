<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">
			<view style="border-radius: 0;" class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view class="form-item-label">规则名称</view>
					<input maxlength="20" type="text" class="tp-flex-1" placeholder="规则名称" placeholder-class="tp-plc"
						v-model="formData.automation_name" />
				</view>
        
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view class="form-item-label">规则说明</view>
					<input maxlength="40" type="text" class="tp-flex-1" placeholder="规则说明" placeholder-class="tp-plc"
						v-model="formData.automation_described" />
				</view>
        
        <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
        	<view class="form-item-label">优先级</view>
          <uni-number-box class="tp-flex-1" v-model="formData.priority" />
          
          <uni-tooltip class="tooltip" content="值越小优先级越高">
            <uni-icons type="help-filled" size="40rpx" color="#999"></uni-icons>
          </uni-tooltip>
        </view>
			</view>
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-30  uni-bold">
        <text class="title">如果</text>
      </view>

      <!-- 条件列表 -->
      <Conditions v-if="formData.automation_conditions" ref="conditions" :list="formData.automation_conditions" />
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-30 uni-bold">
        <text class="title">那么</text>
      </view>

      <!-- 操作列表 -->
      <Actions v-if="formData.automation_actions" ref="actions" :list="formData.automation_actions" />
      
			<view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-b-40">
				<button class="tp-btn" @tap="handlerSubmit">保存</button>
			</view>
		</view>
    
    <!-- 消息提示框 -->
    <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
    
    <Modal v-model="visible" title='保存' text='确定要保存数据吗？' @cancel='cancel' @confirm='confirm' />
	</view>
</template>

<script>
  import Conditions from './conditions.vue'
  import Actions from './actions.vue'
  import CustomSelect from '@/components/custom-select.vue'
  import Modal from '@/components/x-modal/x-modal'
  
	export default {
    components: {
      Conditions,
      Actions,
      CustomSelect,
      Modal
    },
		data() {
			return {
        toast: {
        	msg: ''
        },
        visible: false,
        
				formData: {},
        
				editId:''
			}
		},

		onLoad(options) {
			this.editId = options.id
      uni.setNavigationBarTitle({
        title: `${this.editId ? '编辑' : '新增'}场景联动`,
      })
		},
    mounted () {
      if (this.editId) {
        this.getInfo()
      } else {
        this.formData = {
          automation_name: '',
          automation_described: '',
          priority: 0,
          automation_conditions: [ // 条件
            {
              $index: Math.random()
            }
          ],
          automation_actions: [ // 动作
            {
              $index: Math.random()
            }
          ],
        }
      }
    },
		methods: {
      // 获取修改信息
      getInfo(){
      	uni.showLoading({
      		title: '加载中'
      	});
        const params = {
      		id: this.editId
      	}
      	this.API.apiRequest('/api/v1/automation/detail', params, 'post').then(res => {
      		if (res.code == 200) {
            this.formData = res.data
            console.log(this.formData)
            if (!this.formData.automation_conditions?.length) {
              this.formData.automation_conditions = [
                {
                  $index: Math.random(),
                }
              ]
            }
      		} else {
      			this.toast.msg = res.message
      			this.$refs.toast.show();
      		}
      	}).finally(() => {
      		uni.hideLoading()
      	});
      },
      
      
			
      // 校验
			validateBaseInfo () {
        // 场景基本信息校验
        const {
          automation_name,
          // automation_described,
          priority,
        } = this.formData
        
				if (!automation_name) {
          return {
            result: '请输入规则名称'
          }
				}
        // if(!automation_described){
        //   return {
        //     result: '请输入规则说明'
        //   }
        // }
				if (priority != 0 && !priority) {
          return {
            result: '请设置优先级'
          }
				}
        
        return {
          result: true,
        }
			},
      
			// 保存
			handlerSubmit() {
        const submitData = {}
        
        const baseInfo = this.validateBaseInfo()
        if (baseInfo.result !== true) {
          this.toast.msg = baseInfo.result
          this.$refs.toast.show()
          return;
        } else {
          submitData.tenant_id = this.formData.tenant_id
          submitData.id = this.formData.id
          submitData.automation_name = this.formData.automation_name
          submitData.automation_described = this.formData.automation_described
          submitData.priority = this.formData.priority
          submitData.enabled = '0' // 传0表示将状态改为停用
        }
        
        const conditionsInfo = this.$refs.conditions.getConditionsData()
        if (conditionsInfo.result != true) {
          this.toast.msg = conditionsInfo.result
          this.$refs.toast.show()
          return;
        } else {
          submitData.automation_conditions = conditionsInfo.conditions
        }
       
        const actionsInfo = this.$refs.actions.getActionsData()
        if (actionsInfo.result != true) {
          this.toast.msg = actionsInfo.result
          this.$refs.toast.show()
          return;
        } else {
          submitData.automation_actions = actionsInfo.actions
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
        
        let url = '/api/v1/automation/edit'
        if (!submitData.id) {
          url = '/api/v1/automation/add'
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

<style scoped lang="scss">
	@import '@/common/alert-strategy.css';
  
  .form-item-label {
    width: 120rpx;
  }
  
  /deep/.uni-numbox {
    .uni-numbox-btns {
      width: 32rpx;
    }
    
    .uni-numbox__value {
      width: 128rpx;
      margin: 0 20rpx;
    }
  }

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
    background-color: transparent;
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
    // overflow: hidden;
  }
  
  /deep/.item2 + .item2 {
    border-top: 1rpx solid #dfdfdf;
  }
  /deep/.item > .tp-flex-1 + .tp-flex-1 {
    margin-left: 20rpx;
  }
  /deep/.item + .item {
    border-top: 1rpx solid #f1f1f1;
  }
  
  /deep/.uni-tooltip.tooltip {
    margin-right: 8rpx;
    
    .uni-tooltip-popup {
      color: #333;
      width: max-content;
      left: unset;
      right: 0;
      bottom: 44rpx;
      background-color: #fff;
      border: 1rpx solid #999;
      padding: 10rpx;
      border-radius: 8rpx;
    }
  }
</style>

