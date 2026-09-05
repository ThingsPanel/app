<template>
  <view class="pagehome">
    <view class="editor-nav">
      <view class="nav-side nav-back" @tap="goBack"><uni-icons type="left" size="20" color="#172033" /></view>
      <text class="nav-title">{{ editId ? $t('pages.sceneEditor.editScene') : $t('pages.sceneEditor.newScene') }}</text>
      <text class="nav-side nav-save" @tap="handlerSubmit">{{ $t('common.save') }}</text>
    </view>
    <view class="tp-box tp-box-sizing tp-flex tp-flex-col">
      <!-- Background Elements for Atmosphere -->
      <view class="bg-glow-1"></view>
      <view class="bg-glow-2"></view>

      <!-- Content Container -->
      <view class="content-wrapper">
        <!-- Scene Info Card -->
        <view class="tp-panel scene-card">
          <view class="tp-ipt-item">
            <view class="input-label">{{ $t('pages.sceneEditor.sceneTitle') }}</view>
            <input
              maxlength="20"
              type="text"
              class="modern-input"
              :placeholder="$t('pages.sceneEditor.sceneTitle')"
              placeholder-class="input-placeholder"
              v-model.trim="formData.info.name"
            />
          </view>
          <view class="tp-ipt-item">
            <view class="input-label">{{ $t('pages.sceneEditor.sceneDescription') }}</view>
            <input
              maxlength="40"
              type="text"
              class="modern-input"
              :placeholder="$t('pages.sceneEditor.sceneDescription')"
              placeholder-class="input-placeholder"
              v-model.trim="formData.info.description"
            />
          </view>
        </view>

        <!-- Actions Card -->
        <view class="actions-section">
          <view class="section-header">
            <text class="section-title">{{ $t('pages.sceneEditor.actions') }}</text>
          </view>
          <action-editor
            v-model:actions="formData.actions"
            :isInSceneEdit="true"
          ></action-editor>
        </view>

      </view>

      <ConfirmationModal
        v-model="visible"
        :title="$t('common.save')"
        :text="$t('pages.sceneEditor.saveConfirm')"
        @cancel="cancel"
        @confirm="confirm"
      />
    </view>
  </view>
</template>

<script>
import ConfirmationModal from '@/components/confirmation-modal/index.vue';
import CustomSelect from '@/components/custom-select.vue';
import ActionEditor from '@/features/automation/components/action-editor.vue';
import {
  deviceListAll,
  deviceConfigAll,
  deviceMetricsMenu,
  deviceConfigMetricsMenu
} from '@/api/modules/automation';

export default {
  components: {
    CustomSelect,
    ActionEditor,
    ConfirmationModal
  },
  data() {
    return {
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
  onShow() {
    this.$nextTick(() => {
      setTimeout(() => {
        uni.setNavigationBarTitle({
          title: this.editId ? this.$t('pages.sceneEditor.editScene') : this.$t('pages.sceneEditor.newScene')
        })
      }, 100)
    })
  },
  onLoad(options) {
    this.editId = options.id || '';
    if (this.editId) {
      this.getInfo();
    } else {
      this.formData = this.createEmptyFormData();
    }
    this.$nextTick(() => {
      setTimeout(() => {
        uni.setNavigationBarTitle({
          title: this.editId ? this.$t('pages.sceneEditor.editScene') :  this.$t('pages.sceneEditor.newScene')
        });
      }, 100)
    })
  },
  methods: {
    createEmptyFormData() {
      return {
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
    },
    goBack() {
      uni.navigateBack();
    },
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
            uni.showToast({
              title: res.message,
              icon: 'none',
              duration: 2000
            });
          }
        })
        .finally(() => {
          uni.hideLoading();
        });
    },

    convertActionsData(actionsData) {
      const actionGroupsData = [];
      const actionInstructList = [];
      (actionsData || []).map((sourceItem) => {
        const item = { ...sourceItem };
        if (item.action_type === '10' || item.action_type === '11') {
          item.actionParamOptions = [];
          let actionValueObj = {};
          try {
            actionValueObj = JSON.parse(item.action_value || '{}');
          } catch (_error) {
            actionValueObj = {};
          }
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
            item.actionValue = typeof actionValueObj.params === 'string'
              ? actionValueObj.params
              : JSON.stringify(actionValueObj.params ?? {});
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
        uni.showToast({
          title: this.$t('pages.sceneEditor.enterSceneTitle'),
          icon: 'none',
          duration: 2000
        });
        return;
      }

      const actionValidation = this.$refs.actions?.validateActions?.();
      if (actionValidation !== true) {
        uni.showToast({ title: actionValidation, icon: 'none', duration: 2000 });
        return;
      }

      try {
        configFormData.actions = this.transActionsOut(actions);
      } catch (_error) {
        uni.showToast({ title: this.$t('pages.sceneAutomationEditor.jsonFormat'), icon: 'none', duration: 2000 });
        return;
      }

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
            uni.showToast({
              title: res.message,
              icon: 'none',
              duration: 2000
            });
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
      const actionGroups = JSON.parse(JSON.stringify(actions || []));
      actionGroups.forEach((item) => {
        if (item.actionType === '1') {
          item.actionInstructList.forEach((instructItem) => {
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
                // 与 PC 编辑器保持一致：命令参数在 action_value 中使用 JSON 字符串。
                params: typeof instructItem.actionValue === 'string'
                  ? instructItem.actionValue
                  : JSON.stringify(instructItem.actionValue ?? {})
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

<style lang="scss">
  .editor-nav {
    position: sticky;
    top: 0;
    z-index: 20;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: 96rpx minmax(0, 1fr) 96rpx;
    align-items: center;
    height: calc(88rpx + var(--status-bar-height));
    padding: var(--status-bar-height) 24rpx 0;
    background: rgba(255, 255, 255, 0.96);
    border-bottom: 1rpx solid #edf0f3;
  }

  .nav-side { display: flex; align-items: center; min-width: 0; height: 88rpx; }
  .nav-back { justify-content: flex-start; }
  .nav-save { justify-content: flex-end; color: #1677FF; font-size: 26rpx; font-weight: 500; }
  .nav-title { overflow: hidden; color: #172033; font-size: 30rpx; font-weight: 650; text-align: center; text-overflow: ellipsis; white-space: nowrap; }

	@import '@/features/automation/styles/forms.css';

  /* Global Reset & Base */
  .pagehome {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
    position: relative;
    overflow: visible;
  }

  .tp-box {
    width: 100%;
    min-height: 100vh;
    background: #f5f7fa;
    position: relative;
    color: #334155;
    font-size: 28rpx;
    padding-bottom: 40rpx;
  }

  /* Ambient Background Glows */
  .bg-glow-1 {
    position: fixed;
    top: -10%;
    left: -10%;
    width: 700rpx;
    height: 700rpx;
    background: radial-gradient(circle, rgba(22, 119, 255, 0.2) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
    filter: blur(40px);
  }

  .bg-glow-2 {
    position: fixed;
    bottom: 5%;
    right: -5%;
    width: 600rpx;
    height: 600rpx;
    background: radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
    z-index: 0;
    pointer-events: none;
    filter: blur(40px);
  }

  /* Content Wrapper */
  .content-wrapper {
    position: relative;
    z-index: 1;
    padding: 30rpx;
    padding-bottom: 100rpx;
  }

  /* Modern Card Styles */
  .tp-panel {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.9);
    border-radius: 32rpx;
    box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.04);
    margin-bottom: 30rpx;
    transition: all 0.3s ease;
    overflow: hidden;
  }

  .scene-card {
    padding: 0;
    background: #ffffff;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
  }

  .actions-card {
    padding: 30rpx;
  }

  /* Section Header */
  .section-header {
    margin-bottom: 30rpx;

    .section-title {
      font-size: 32rpx;
      font-weight: 700;
      color: #1e293b;
      letter-spacing: 0.5rpx;
    }
  }

  /* Input Items */
  .tp-ipt-item {
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
    padding: 30rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 20rpx;

    &:last-child {
      border-bottom: none;
    }

    .input-label {
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #334155 !important;
      min-width: 78px !important;
      flex-shrink: 0 !important;
    }
  }

  /* Modern Input */
  .modern-input {
    flex: 1;
    height: auto;
    background: transparent;
    border: none;
    border-radius: 0;
    padding: 0;
    font-size: 28rpx;
    color: #1e293b;
    transition: all 0.3s ease;

    &:focus {
      background: transparent;
      border: none;
      box-shadow: none;
    }
  }

  .input-placeholder {
    color: #94a3b8;
    font-size: 28rpx;
  }

  /* Modern Button */
  .button-wrapper {
    position: relative;
    padding: 40rpx 0;
  }

  .modern-btn {
    width: 100%;
    height: 88rpx;
    line-height: 88rpx;
    background: #1677FF;
    border-radius: 32rpx;
    font-size: 30rpx;
    font-weight: 600;
    color: #ffffff;
    border: none;
    box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3), 0 2rpx 8rpx rgba(22, 119, 255, 0.2);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:active {
      transform: scale(0.98);
      box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.25), 0 1rpx 4rpx rgba(22, 119, 255, 0.15);
    }

    &::after {
      border: none;
    }
  }

  /* Reuse the device-list visual language for scene editing. */
  .pagehome,
  .tp-box {
    background: #f7f8fa;
    color: #172033;
  }

  .bg-glow-1,
  .bg-glow-2 {
    display: none;
  }

  .content-wrapper {
    padding: 20rpx var(--page-gutter, 30rpx) calc(28rpx + env(safe-area-inset-bottom));
  }

  .tp-panel,
  .scene-card {
    margin-bottom: 8px;
    background: #ffffff;
    border: 1rpx solid #e4e9f0;
    border-radius: 10rpx;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transition: none;
  }

  .tp-ipt-item {
    min-height: 48px;
    padding: 8px 12px;
    border-bottom-color: #edf0f3;
  }

  .tp-ipt-item .input-label,
  .section-header .section-title {
    color: #172033 !important;
  }

  .modern-input {
    color: #172033;
    font-size: 13px;
    line-height: 18px;
  }

  .input-placeholder {
    color: #98a2b3;
    font-size: 13px;
  }

  .actions-section {
    position: relative;
    overflow: visible;
    margin-bottom: 8px;
  }

  .actions-section .section-header {
    margin-bottom: 6px;
    padding: 0;
  }

  .section-header {
    margin-bottom: 6px;
    padding: 0;
  }

  .section-header .section-title {
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0;
  }

  .button-wrapper {
    padding: 12rpx 0 0;
  }

  .modern-btn {
    height: 88rpx;
    line-height: 88rpx;
    background: #1677FF;
    border-radius: 16rpx;
    box-shadow: none;
  }

  .modern-btn:active {
    transform: none;
    background: #0f6fe8;
    box-shadow: none;
  }

  /* Tooltip */
  .tooltip ::v-deep .uni-tooltip-popup {
    width: max-content;
    left: initial;
    right: 0;
  }

  .title {
    font-size: 26rpx;
  }

  ::v-deep .uni-input {
    background-color: transparent;
    font-size: 28rpx;
  }

  ::v-deep .uni-input-input {
    color: #1e293b;
  }

  ::v-deep .uni-input .uni-input-placeholder.input-placeholder {
    color: #94a3b8;
  }

  ::v-deep .uniui-forward,
  ::v-deep .uniui-clear {
    font-size: 28rpx !important;
    color: #94a3b8 !important;
    vertical-align: middle;
    margin-right: 12rpx;
  }

  ::v-deep .uniui-clear {
    font-size: 36rpx !important;
  }

  ::v-deep .uni-icons {
    display: block;
  }

  uni-text {
    color: #1e293b;
  }

  ::v-deep .checklist-text > span {
    font-size: 26rpx;
  }

  ::v-deep .item2 {
    border-bottom: 1rpx solid rgba(0, 0, 0, 0.05);
  }

  ::v-deep .item > .tp-flex-1 + .tp-flex-1 {
    margin-left: 20rpx;
  }

  ::v-deep .item + .item {
    border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  }

</style>
