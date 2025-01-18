<template>
  <view class="pagehome">
    <view class="tp-box tp-box-sizing tp-flex tp-flex-col">
      <view style="border-radius: 0;" class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
        <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
          <view>{{ $t('pages.sceneDetail.sceneTitle') }}</view>
          <input
            maxlength="20"
            type="text"
            class="tp-flex-1 tp-mg-l-20"
            :placeholder="$t('pages.sceneDetail.sceneTitle')"
            placeholder-class="tp-plc"
            v-model.trim="formData.info.name"
          />
        </view>
        <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-b-25">
          <view>{{ $t('pages.sceneDetail.sceneDescription') }}</view>
          <input
            maxlength="40"
            type="text"
            class="tp-flex-1 tp-mg-l-20"
            :placeholder="$t('pages.sceneDetail.sceneDescription')"
            placeholder-class="tp-plc"
            v-model.trim="formData.info.description"
          />
        </view>
      </view>
      <view style="border-radius: 0;" class="tp-panel tp-flex tp-flex-col tp-pd-l-r-30">
      <view class="tp-ipt-item tp-flex tp-flex-row tp-flex-j-l tp-flex-a-c tp-box-sizing tp-pd-t-25">
        <view>{{ $t('pages.sceneDetail.actions') }}：</view>
      </view>
    </view>
    <actions-edit
        :actions.sync="formData.actions"
        :isInSceneEdit="true"
      ></actions-edit>

      <view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-b-40">
        <button class="tp-btn" @tap="handlerSubmit">{{ $t('common.save') }}</button>
      </view>

      <!-- 消息提示框 -->
      <cys-toast ref="toast" :msg="toast.msg" location="top"></cys-toast>

      <Modal 
        v-model="visible" 
        :title="$t('common.save')" 
        :text="$t('pages.sceneDetail.saveConfirmation')" 
        @cancel="cancel" 
        @confirm="confirm" 
      />
    </view>
  </view>
</template>

<script>
import Modal from '@/components/x-modal/x-modal';
import CustomSelect from '@/components/custom-select.vue';
import ActionsEdit from './actions-edit.vue';
import {
  deviceListAll,
  deviceConfigAll,
  deviceMetricsMenu,
  deviceConfigMetricsMenu
} from '@/service/automation';

export default {
  components: {
    CustomSelect,
    ActionsEdit,
    Modal
  },
  data() {
    return {
      toast: {
        msg: ''
      },
      editId: '',
      formData: {
        info: {
          name: '',
          description: ''
        },
        actions: [
        ],
      },
      visible: false,
      loadingSelect: false,
      popUpVisible: false
    };
  },
  onLoad(options) {
    this.editId = options.id;
      uni.setNavigationBarTitle({
      title: `${this.editId ? $t('common.edit') : $t('common.add')} ${$t('pages.sceneDetail.scene')}`
    });
  },
  created() {
    if (this.editId) {
      this.getInfo();
    } else {
      this.formData = {
        info: {
          name: '',
          description: ''
        },
        actions: [
          {
            actionType: '1',
            actionInstructList: [{
              action_target: '',
              action_type: null,
              action_param_type: null,
              action_param: null,
              actionValue: null,
              deviceGroupId: null,
              actionParamOptions: [],
              actionParamOptionsData: [],
              actionParamTypeOptions: [],
              showSubSelect: true,
              actionParamData: null,
              placeholder: '',
              inputFeedback: '',
              inputValidationStatus: ''
            }]
          }
        ]
      };
    }
    // this.getSceneList('');
    // this.getAlarmList('');
  },
  methods: {
    getInfo() {
        uni.showLoading({
        title: this.$t('common.loading')
      });
      const params = {
        id: this.editId
      };
      this.API.apiRequest('/api/v1/scene/detail/' + this.editId, params, 'get')
        .then((res) => {
          if (res.code == 200) {
            this.formData = { ...res.data, actions: this.convertActionsData(res.data.actions) };
            //this.formData.actions = this.convertActionsData(this.formData.actions);
          } else {
            this.toast.msg = res.message;
            this.$refs.toast.show();
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },

    convertActionsData(actionsData) {
      const actionGroupsData = [];
      const actionInstructList = [];
      actionsData.map((item) => {
        if (item.action_type === '10' || item.action_type === '11') {
          item.actionParamOptions = [];
          const actionValueObj = JSON.parse(item.action_value);
          if (
            item.action_param_type === 'c_telemetry' ||
            item.action_param_type === 'c_attribute' ||
            item.action_param_type === 'c_command'
          ) {
            item.actionValue = item.action_value;
          }
          if (item.action_param_type === 'telemetry' || item.action_param_type === 'attributes') {
            item.actionValue = actionValueObj[item.action_param];
          }
          if (item.action_param_type === 'command') {
            item.actionValue = actionValueObj.params;
          }
          item.actionParamOptions = [];
          actionInstructList.push(item);
        } else {
          item.actionType = item.action_type;
          actionGroupsData.push(item);
        }
      });
      if (actionInstructList.length > 0) {
        const type1Data = {
          actionType: '1',
          actionInstructList
        };
        actionGroupsData.push(type1Data);
      }
      return actionGroupsData;
    },

    handlerSubmit() {
      const configFormData = JSON.parse(JSON.stringify(this.formData.info));
      
      const { id, name, description } = this.formData.info;
      const { actions } = this.formData;

      if (!name) {
          this.toast.msg = this.$t('pages.sceneDetail.enterSceneTitle');
        this.$refs.toast.show();
        return;
      }

      const validateResult = this.transActionsOut(actions);
      configFormData.actions = validateResult;

      this.submitData = configFormData;
      this.visible = true;
    },
    cancel() {
      this.visible = false;
    },
    confirm() {
      this.doSubmit(this.submitData);
    },
    doSubmit(submitData) {
      uni.showLoading({
        title: this.$t('common.loading')
      });

      let url = '/api/v1/scene';
      let method = 'put';
      if (!submitData.id) {
        method = 'post';
      }

      this.API.apiRequest(url, submitData, method)
        .then((res) => {
          if (res.code == 200) {
            uni.navigateBack(-1);
          } else {
            this.toast.msg = res.message;
            this.$refs.toast.show();
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },
    newEdit() {
      this.getAlarmList('');
    },
    transActionsOut(actions) {
      const actionsData = [];
      // eslint-disable-next-line array-callback-return
      actions.map((item) => {
        if (item.actionType === '1') {
          // eslint-disable-next-line array-callback-return
          item.actionInstructList.map((instructItem) => {
            // 如果是c_telemetry/c_attribute,那么action_value示例格式：{"c_telemetry":2}
            // 如果是c_command,那么action_value示例格式：{"method":"switch1","params":{"false":0}}
            if (
              instructItem.action_param_type === 'c_telemetry' ||
              instructItem.action_param_type === 'c_attribute' ||
              instructItem.action_param_type === 'c_command'
            ) {
              instructItem.action_value = instructItem.actionValue;
            }
            // 如果是telemetry/attribute，那么 action_value示例格式：{"humidity":2}
            if (instructItem.action_param_type === 'telemetry' || instructItem.action_param_type === 'attributes') {
              const action_value = {};
              action_value[instructItem.action_param] = instructItem.actionValue;
              instructItem.action_value = JSON.stringify(action_value);
            }
            // 如果是command/c_command，那么 action_value示例格式:	{"method":"ReSet","params":{"switch":1,"light":"close"}}
            if (instructItem.action_param_type === 'command') {
              const action_value = {
                method: instructItem.action_param,
                params: JSON.stringify(JSON.parse(instructItem.actionValue))
              };
              instructItem.action_value = JSON.stringify(action_value);
            }
            actionsData.push(instructItem);
          });
        } else {
          item.action_type = item.actionType;
          actionsData.push(item);
        }
      });
      return actionsData;
    }
  }
};
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
