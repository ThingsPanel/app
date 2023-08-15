<template>
	<view class="pagehome">
		<view class="tp-box tp-box-sizing tp-flex tp-flex-col">
			<view class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>规则名称</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入名称" placeholder-class="tp-plc"
						v-model="formData.automation_name" />
				</view>
        
				<view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
					<view>规则说明</view>
					<input type="text" class="tp-flex-1 tp-mg-l-20" placeholder="请输入说明" placeholder-class="tp-plc"
						v-model="formData.automation_described" />
				</view>
        
        <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
        	<view>优先级</view>
          <uni-number-box class="tp-flex-1" v-model="formData.priority" />
          
          <uni-tooltip class="tooltip" content="值越小优先级越高">
            <!-- <view class="iconfont iconbianji tp-mg-r-10"></view/> -->
            <!-- <icon type="warn" size="26"/> -->
            <uni-icons type="help-filled"></uni-icons>
            <!-- <uni-icons type="info" size="26"></uni-icons> -->
          </uni-tooltip>
        </view>
			</view>
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-30  uni-bold">
        <text class=tp-font-size-14>如果</text>
      </view>

      <!-- 条件列表 -->
      <Conditions :conditions="formData.automation_conditions" />
      
      <view class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-30 uni-bold">
        <text class=tp-font-size-14>那么</text>
      </view>

      <!-- 操作列表 -->
      <Actions ref="actions" :list="formData.automation_actions" />
      
			<view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-b-40">
				<button class="tp-btn" @tap="doUpdateSubmit">保存</button>
			</view>
		</view>
    
    <!-- 消息提示框 -->
    <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>
	</view>
</template>

<script>
  import Conditions from './conditions.vue'
  import Actions from './actions.vue'
  import CustomSelect from '@/components/custom-select.vue'
  
	export default {
    components: {
      Conditions,
      Actions,
      CustomSelect,
    },
		data() {
			return {
        toast: {
        	msg: ''
        },
        
				formData: {},
        
				editId:''
			}
		},
		onShow() {

		},
		onLoad(options) {
			this.editId = options.id
		},
    created () {
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
      			const formData = res.data
            this.transRelation(formData.automation_conditions)
            
            this.formData = formData
            console.log(this.formData)
      		} else {
      			this.toast.msg = res.message
      			this.$refs.toast.show();
      		}
      	}).finally(() => {
      		uni.hideLoading()
      	});
      },
      // 初始化数据时：
      // 设置且或连接符（第一个条件不需要）
      // 设置条件的唯一标识符（$index）
      transRelation (automation_conditions) {
        if (automation_conditions?.length) {
          automation_conditions[0].$index = Math.random()
          
          if (automation_conditions.length > 1) {
            for (let i = 1; i < automation_conditions.length; i++) {
              const preCondition = automation_conditions[i - 1]
              const currCondition = automation_conditions[i]
              
              currCondition._relation = currCondition.group_number === preCondition.group_number ? 'and' : 'or'
              
              currCondition.$index = Math.random()
            }
          }
        }
      },
      // 点击保存时：
      // 设置 group_number 分组编号（第一个条件默认为1）。从第二个条件开始，如果用或连接，则分组编号+1；
      //    如果用且连接时需要判断相邻条件是否都为时间条件的重复与单次二者之一，
      //    如果否（不满足有两种情况，一是均为时间条件不满足，二是均为重复与单次二者之一不满足），则分组编号与前一个条件相同；
      //    如果是，则清除当前条件的连接符和分组编号，然后计数（清除了几个连接符）
      // 最后判断清除连接符的次数，如果次数为 0，方法返回 true，表示设置 分组编号 成功；
      //    如果次数不为0，方法返回 false，表示设置分组编号失败，此时需要提示用户检查条件详情
      transGroupNumber (automation_conditions) {
        let invalidRelationNum = 0
        
        if (automation_conditions?.length) {
          automation_conditions[0].group_number = 1
          
          if (automation_conditions.length > 1) { // 至少两条数据
            for (let i = 1; i < automation_conditions.length; i++) {
              const preCondition = automation_conditions[i - 1]
              const currCondition = automation_conditions[i]

              if (currCondition._relation === 'and') {
                // 此处校验相邻两个条件为单次、重复时是否使用了 and 连接。
                if (currCondition.condition_type === '2' && preCondition.condition_type === '2') { // 时间条件
                  const arr = ['1', '2']
                  if (arr.includes(currCondition.time_condition_type) && arr.includes(preCondition.time_condition_type)) {
                    invalidRelationNum++
                    currCondition._relation = ''
                    currCondition.group_number = ''
                  } else {
                    currCondition.group_number = preCondition.group_number
                  }
                } else {
                  currCondition.group_number = preCondition.group_number
                }
              } else if (currCondition._relation === 'or') {
                currCondition.group_number = preCondition.group_number + 1
              }
            }
          }
        }
        if (invalidRelationNum) {
          return
        }
        return true;
      },
			
      // 校验
			validate() {
        // 请将“时间条件”信息补充完整
        // 请将“设备条件”信息补充完整
        // 请将“激活场景”信息补充完整
        // 请将“触发告警”信息补充完整
        // 请将“操作设备”信息补充完整
        
        // 场景基本信息校验，待拆分
        const {
          automation_name,
          // automation_described,
          priority,
        } = this.formData
				if(!automation_name){
					this.toast.msg = '请输入规则名称';
          this.$refs.toast.show();
          return
				}
        // if(!automation_described){
        // 	this.toast.msg = '请输入规则说明';
        //  this.$refs.toast.show();
        // }
				if(priority != 0 && !priority){
					this.toast.msg = '请设置优先级';
          this.$refs.toast.show();
          return
				}
        
        // 校验单个条件的数据填写是否完整，待拆分
        const automation_conditions = this.formData.automation_conditions || []
        for (const condition of automation_conditions) {
          const {
            group_number, // 且、或
            condition_type, // 条件类型               1-设备条件 2-时间条件
            
            business_id, // 项目
            asset_id, // 分组
            device_id, // 设备
            device_condition_type, // 状态/属性       1-属性 2-事件 3-在线离线状态
            time_condition_type, // 0-范围 1-单次 2-重复
            v1,
            v2, // 操作符
            v3,
            v4,
          } = condition

          console.log(group_number, condition)
          if (!group_number) {
            this.toast.msg = '请选择且、或';
            this.$refs.toast.show();
            return
          }
          
          if (!condition_type) {
            this.toast.msg = '请选择条件类型';
            this.$refs.toast.show();
            return
          }
          
          if (condition_type === '1') { // 校验设备条件
            if (!business_id) {
              this.toast.msg = '请选择项目';
              this.$refs.toast.show();
              return
            }
            
            if (!asset_id) {
              this.toast.msg = '请选择分组';
              this.$refs.toast.show();
              return
            }
            
            if (!device_id) {
              this.toast.msg = '请选择设备';
              this.$refs.toast.show();
              return
            }
            
            if (!device_condition_type) {
              this.toast.msg = '请选择状态/属性';
              this.$refs.toast.show();
              return
            }
            
            if (device_condition_type === '1') {
              if (!v2) {
                this.toast.msg = '请选择操作符';
                this.$refs.toast.show();
                return
              }
              
              if (!v3) {
                this.toast.msg = '请输入内容';
                this.$refs.toast.show();
                return
              }
            }
          } else if (condition_type === '2') { // 校验时间条件
            if (!time_condition_type) {
              this.toast.msg = '请选择时间条件类型';
              this.$refs.toast.show();
              return
            } else if (time_condition_type === '0') { // 时间条件-范围
              if (!v1 || !v2) {
                this.toast.msg = '请选择日期和时间范围';
                this.$refs.toast.show();
                return
              }
            } else if (time_condition_type === '1') { // 时间条件-单次
              if (!v1) {
                this.toast.msg = '请选择日期和时间';
                this.$refs.toast.show();
                return
              }
            } else if (time_condition_type === '2') { // 时间条件-重复
              if (!v1) {
                this.toast.msg = '请选择重复周期';
                this.$refs.toast.show();
                return
              } else if (v1 === '1') { 
                if (!v3) {
                  this.toast.msg = '请选择分钟';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '2') {
                if (!v3) {
                  this.toast.msg = '请选择时间';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '3') {
                if (!v3) {
                  this.toast.msg = '请选择星期';
                  this.$refs.toast.show();
                  return
                }
                
                if (!v4) {
                  this.toast.msg = '请选择时间';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '4') {
                const [dd, hh] = v4.split(':')
                if (!dd) {
                  this.toast.msg = '请选择日期';
                  this.$refs.toast.show();
                  return
                }
                if (!hh) {
                  this.toast.msg = '请选择时间';
                  this.$refs.toast.show();
                  return
                }
              } else if (v1 == '5') {
                if (!v3) {
                  this.toast.msg = '请输入日期时间规则';
                  this.$refs.toast.show();
                  return
                }
              }
            }
          }
        }
        
        // 校验单个动作的数据填写是否完整，待拆分
        const automation_actions = this.formData.automation_actions || []
        for (const action of automation_actions) {
          const {
            
          } = action
        }
        
        return true
			},
      
			// 保存
			doUpdateSubmit() {
        console.log(JSON.parse(JSON.stringify(this.$refs.actions.getActions())))
        if (!this.transGroupNumber(this.formData.automation_conditions)) {
          this.toast.msg = '相邻条件均为时间条件时，单次、重复只能用“或”连接。请检查条件';
          this.$refs.toast.show();
          return;
        }

				// if (!this.validate()) {
    //       return;
				// }
        
        console.log(JSON.parse(JSON.stringify(this.formData)))
        
        return;
        
        
				uni.showLoading({
					title: '加载中'
				});
				this.API.apiRequest('/api/warning/edit', params, 'post').then(res => {
					if (res.code == 200) {
						this.toast.msg = res.message
						this.$refs.toast.show();
						uni.navigateBack(-1)
					} else {
						this.toast.msg = res.message
						this.$refs.toast.show();
					}
					uni.hideLoading()
				}).finally(() => {
					uni.hideLoading()
				});
			},
		}
	}
</script>

<style scoped>
	@import '@/common/alert-strategy.css';

  .tooltip /deep/.uni-tooltip-popup {
    width: max-content;
    left: initial;
    right: 0;
  }
  
  .uni-data-checklist /deep/ .checklist-group .checklist-box .checklist-content .checklist-text {
    font-size: 26rpx;
  }
  
  .uni-tooltip .uni-icons {
    font-size: 42rpx !important;
    color: #808080 !important;
  }
</style>

