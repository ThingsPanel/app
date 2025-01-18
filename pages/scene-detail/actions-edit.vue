<template>
<view>
    <!-- 动作编辑部分 -->
    <view
    v-for="(actionGroupItem, actionGroupIndex) in actions"
    :key="actionGroupIndex"
    class="mt-1 w-100%"
    >
    <view style="align-self: center" class="tp-flex tp-flex-1 tp-mg-10 tp-pd-b-10 w-80">
      <view class="tp-panel tp-flex-1">
        <view
          class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing"
          :style="isInSceneEdit ? 'display:none' : ''">
          <CustomSelect
              v-model="actionGroupItem.actionType"
              :options="actionOptions"
              :placeholder="$t('pages.sceneDetail.actionsEdit.selectActionType')"
              @change="(data) => actionChange(actionGroupItem, actionGroupIndex, data)"
          ></CustomSelect>
        </view>

        <!-- 当 actionType 为 '1' 时（操作设备） -->
        <view v-if="actionGroupItem.actionType === '1'" class="flex-1 border-class">
          <view
              v-for="(instructItem, instructIndex) in actionGroupItem.actionInstructList"
              :key="instructIndex"
              style="border: 1px solid #ccc;"
              class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-flex-wrap tp-mg-10 tp-pd-b-10"
          >
          <view class="tp-flex-1">
            <view class="max-w-30 w-full">
              <CustomSelect
                  v-model="instructItem.action_type"
                  :options="actionTypeOptions"
                  :placeholder="$t('pages.sceneDetail.actionsEdit.selectDeviceType')"
                  @change="(data) => actionTypeChange(actionGroupIndex, instructIndex, data)"
              ></CustomSelect>
            </view>

            <!-- 单个设备 -->
            <view v-if="instructItem.action_type === '10'" class="max-w-40 w-full">
              <CustomSelect
                  v-model="instructItem.action_target"
                  :options="deviceOptions"
                  :placeholder="$t('pages.sceneDetail.actionsEdit.selectDevice')"
                  option-value="id"
                  option-label="name"
                  @change="() => actionTargetChange(actionGroupIndex, instructIndex)"
              ></CustomSelect>
            </view>

            <!-- 单类设备 -->
            <view v-if="instructItem.action_type === '11'" class="max-w-40 w-full">
              <CustomSelect
                  v-model="instructItem.action_target"
                  :options="deviceConfigOption"
                  :placeholder="$t('pages.sceneDetail.actionsEdit.selectDeviceCategory')"
                  option-value="id"
                  option-label="name"
                  @change="() => actionTargetChange(actionGroupIndex, instructIndex)"
              ></CustomSelect>
            </view>

            <view v-if="instructItem.action_type">
              <!-- 选择属性类型 -->
              <view class="max-w-30 w-full">
                <CustomSelect
                  v-model="instructItem.action_param_type"
                  :options="instructItem.actionParamTypeOptions"
                  :placeholder="$t('pages.sceneDetail.actionsEdit.selectMetricType')"
                  @change="(data) => actionParamTypeChange(actionGroupIndex, instructIndex, data)"
                ></CustomSelect>
              </view>

              <!-- 选择属性 -->
              <view v-if="instructItem.showSubSelect" class="max-w-40 w-full">
                <CustomSelect
                  v-model="instructItem.action_param"
                  :placeholder="$t('pages.sceneDetail.actionsEdit.selectMetric')"
                  :options="instructItem.actionParamOptions"
                  @change="(data) => actionParamChange(actionGroupIndex, instructIndex, data)"
                ></CustomSelect>
              </view>

              <!-- 输入动作值 -->
              <view v-if="instructItem.showSubSelect && instructItem.actionParamData" class="max-w-60 w-full">
                  <input
                  v-if="instructItem.actionParamData.data_type === 'string'"
                  v-model="instructItem.actionValue"
                  :placeholder="$t('pages.sceneDetail.actionsEdit.examplePrefix') + instructItem.placeholder"
                  @blur="() => actionValueChange(actionGroupIndex, instructIndex)"
                  class="w-full uni-input"
                  />
                  <input
                  v-if="instructItem.actionParamData.data_type === 'number'"
                  v-model.number="instructItem.actionValue"
                  :placeholder="'例如：' + instructItem.placeholder"
                  class="w-full uni-input"
                  />
                  <switch
                  v-if="instructItem.actionParamData.data_type === 'boolean'"
                  v-model="instructItem.actionValue"
                  @change="() => actionValueChange(actionGroupIndex, instructIndex)"
                  ></switch>
              </view>

              <view v-else class="w-60">
                  <input
                  v-model="instructItem.actionValue"
                  :placeholder="'例如：' + instructItem.placeholder"
                  @blur="() => actionValueChange(actionGroupIndex, instructIndex)"
                  class="w-full uni-input"
                  />
              </view>
              </view>
            </view>
            <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
              <!-- 条件数量大于1条时才允许删除 -->
              <uni-icons 
                v-if="actionGroupItem.actionInstructList.length > 1" 
                class="tp-mg-t-b-10"
                type="minus" 
                size="40rpx" 
                color="red"
                @click="deleteIfGroupsSubItem(actionGroupIndex, instructIndex)"
              ></uni-icons>
              
              <!-- 仅最后一个显示新增 -->
              <uni-icons
                v-if="instructIndex === actionGroupItem.actionInstructList.length - 1"
                class="tp-mg-t-b-10"
                type="plus" 
                size="40rpx"
                color="#2979ff"
                @click="addIfGroupsSubItem(actionGroupIndex)"
              ></uni-icons>
            </view>
            <!--
            <button
              v-if="instructIndex !== 0"
              @click="() => deleteIfGroupsSubItem(actionGroupIndex, instructIndex)"
              class="tp-btn"
              style="width: 50%; margin-right: 15px;"
            >
            删除
            </button> -->
          </view>
          <!-- 
          <button
              @click="() => addIfGroupsSubItem(actionGroupIndex)"
              style="width: 50%; margin-right: 15px;"
              class="tp-btn"
          >
              新增一个操作
          </button>
          -->
        </view>

        <!-- 激活场景 -->
        <view v-if="actionGroupItem.actionType === '20'" class="ml-6 max-w-40 w-auto">
          <CustomSelect
            v-model="actionGroupItem.action_target"
            :placeholder="$t('pages.sceneDetail.actionsEdit.selectScene')"
            :options="sceneList"
            option-value="id"
            option-label="name"
          ></CustomSelect>
        </view>

        <!-- 触发告警 -->
        <view v-if="actionGroupItem.actionType === '30'" class="ml-6 max-w-40 w-auto">
          <CustomSelect
            v-model="actionGroupItem.action_target"
            :options="alarmList"
            :placeholder="$t('pages.sceneDetail.actionsEdit.selectAlarm')"
            option-value="id"
            option-label="name"
          ></CustomSelect>
          <!-- <button @click="popUpVisible = true" class="tp-btn">
          创建告警
          </button> -->
        </view>
        </view>
        <view v-if="!isInSceneEdit" style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
          <!-- 条件数量大于1条时才允许删除 -->
          <uni-icons 
            v-if="actions.length > 1" 
            class="tp-mg-t-b-10"
            type="minus" 
            size="40rpx" 
            color="red"
            @click="deleteActionGroupItem(actionGroupIndex)"
          ></uni-icons>
          
          <!-- 仅最后一个显示新增 -->
          <uni-icons
            v-if="actionGroupIndex === actions.length - 1"
            class="tp-mg-t-b-10"
            type="plus" 
            size="40rpx"
            color="#2979ff"
            @click="addActionGroupItem()"
          ></uni-icons>
        </view>
        <!--
        <button
          v-if="actionGroupIndex > 0"
          @click="() => deleteActionGroupItem(actionGroupIndex)"
          class="tp-btn mt-6"
          style="width: 50%; margin-right: 15px;"
        >
        删除执行动作
        </button>
        -->
    </view>
    </view>
</view>
</template>
  
<script>
  import CustomSelect from '@/components/custom-select.vue';
  import { warningMessageList } from '@/service/alarm';
  import { deviceMetricsMenu,
    deviceConfigMetricsMenu,
    deviceConfigAll,
    deviceListAll,
    sceneGet
  } from '@/service/automation';
  
  export default {
    name: 'ActionsEdit',
    components: {
      CustomSelect
    },
    props: {
      actions: {
        type: Array,
        required: true
      },
      isInSceneEdit: false
    },
    data() {
      return {
        instructListItem: {
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
        },
        actionItem: {
          actionType: null,
          action_type: null,
          action_target: '',
          actionInstructList: []
        },
        popUpVisible: false,
        actionOptions: [
            {
            label: '操作设备',
            value: '1',
            disabled: false
            },
            {
            label: '激活场景',
            value: '20',
            disabled: false
            },
            {
            label: '触发告警',
            value: '30',
            disabled: false
            }
        ],
        actionTypeOptions: [
            {
            label: '单个设备',
            value: '10'
            },
            {
            label: '单类设备',
            value: '11'
            }
        ],
        deviceOptions: [],
        sceneList: [],
        alarmList: [],
        queryDevice: {
            group_id: null,
            device_name: null,
            bind_config: 0
        },
        deviceConfigOption: [],
        queryDeviceConfig: {
            device_config_name: ''
        },
        placeholderMap: {
            telemetry: '20',
            attributes: 'on-line',
            command: '{"param1":1}',
            c_telemetry: '{"switch":1,"switch1":0}',
            c_attribute: '{"addr":1,"port":0}',
            c_command: '{"method":"switch1","params":{"false":0}}'
        }
      };
    },
    watch: {
        actions: {
            handler(newActions, _oldVal) {
                newActions.forEach((item, index) => {
                    if (item.actionType === '1') {
                        item.actionInstructList.map((instructItem, instructIndex) => {
                            this.actionParamShow(index, instructIndex, true);
                        });
                    }
                });
            },
            deep: false, // 深度监听
            immediate: false // 是否在初始时立即执行一次
        }
    },
    created() {
        this.actions.map((item, index) => {
            if (item.actionType === '1') {
              item.actionInstructList.map((instructItem, instructIndex) => {
                this.actionParamShow(index, instructIndex, true);
              });
            }
        });
        if( this.deviceOptions.length === 0 ) {
            this.getDevice(null, null);
        }
        if( this.deviceConfigOption.length === 0 ) {
            this.getDeviceConfig('');
        }
        this.getSceneList('');
        this.getAlarmList('');
    },
    methods: {
      async getDevice(groupId, name) {
          this.queryDevice.group_id = groupId || null;
          this.queryDevice.device_name = name || null;
          const res = await deviceListAll(this.queryDevice);
          this.deviceOptions = res.data;
      },
      async getDeviceConfig(name) {
          this.queryDeviceConfig.device_config_name = name || '';
          const res = await deviceConfigAll(this.queryDeviceConfig);
          this.deviceConfigOption = res.data || [];
      },
      async getSceneList(name) {
        const params = {
          page: 1,
          page_size: 10,
          name: name || ''
        };
        const res = await sceneGet(params);
        this.sceneList = res.data.list;
      },
      async getAlarmList(name) {
        const params = {
          page: 1,
          page_size: 10,
          name: name || ''
        };
        const res = await warningMessageList(params);
        this.alarmList = res.data.list;
      },
      actionChange(actionGroupItem, actionGroupIndex, data) {
        this.actionOptions.map((item) => {
          item.disabled = false;
        });
        actionGroupItem.actionInstructList = [];
        actionGroupItem.action_type = null;
        actionGroupItem.action_target = '';
        if (data === '1') {
          this.addIfGroupsSubItem(actionGroupIndex);
        }
        this.$forceUpdate();
      },
      actionTypeChange(actionGroupIndex, instructIndex, data) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        instructItem.action_target = null;
        instructItem.action_param_type = null;
        instructItem.action_param = null;
        instructItem.actionValue = null;
  
        if (data === '10') {
          if( this.deviceOptions.length === 0 ) {
            this.getDevice(null, null);
          }
        } else if (data === '11') {
          if( this.deviceConfigOption.length === 0 ) {
            this.getDeviceConfig('');
          }
        }
        this.$forceUpdate();
      },
      actionTargetChange(actionGroupIndex, instructIndex) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        instructItem.action_param_type = null;
        instructItem.action_param = null;
        instructItem.actionValue = null;
        instructItem.actionParamOptionsData = [];
        instructItem.actionParamTypeOptions = [];
        instructItem.actionParamOptions = [];
        this.actionParamShow(actionGroupIndex, instructIndex);
      },
      async actionParamShow(actionGroupIndex, instructIndex, updateOptions = false) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        if (instructItem.action_target) {
          let res = null;
          if (instructItem.action_type === '10') {
            res = await deviceMetricsMenu({ device_id: instructItem.action_target });
          } else if (instructItem.action_type === '11') {
            res = await deviceConfigMetricsMenu({
              device_config_id: instructItem.action_target
            });
          }
          if (res.data) {
            res.data.map((item) => {
              item.value = item.data_source_type;
              item.label = `${item.data_source_type}${item.label ? `(${item.label})` : ''}`;
  
              item.options.map((subItem) => {
                subItem.value = subItem.key;
                subItem.label = `${subItem.key}${subItem.label ? `(${subItem.label})` : ''}`;
              });
            });
            instructItem.actionParamOptionsData = res.data;
            instructItem.actionParamTypeOptions = res.data.map((item) => {
              return {
                label: item.label,
                value: item.value
              };
            });
            instructItem.showSubSelect = true;
            if (updateOptions && instructItem.action_param_type) {
              this.actionParamTypeChange(actionGroupIndex, instructIndex, instructItem.action_param_type, updateOptions);
            }
            if (updateOptions && instructItem.action_param) {
              this.actionParamChange(actionGroupIndex, instructIndex, instructItem.action_param, updateOptions);
            }
            this.$forceUpdate();
          }
        }
      },
      actionParamTypeChange(actionGroupIndex, instructIndex, data, updateOptions) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        if (!updateOptions) {
          instructItem.action_param = null;
          instructItem.actionParamData = null;
        }
        instructItem.actionParamOptions =
          instructItem.actionParamOptionsData.find((item) => item.data_source_type === data)?.options || [];
        instructItem.placeholder = this.placeholderMap[data];
        if (!updateOptions) instructItem.actionValue = null;
        if (
          instructItem.action_param_type === 'c_attribute' ||
          instructItem.action_param_type === 'c_telemetry' ||
          instructItem.action_param_type === 'c_command'
        ) {
          instructItem.showSubSelect = false;
        } else {
          instructItem.showSubSelect = true;
        }
        if (!updateOptions) this.$forceUpdate();
      },
      actionParamChange(actionGroupIndex, instructIndex, data, updateOptions) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        if (!updateOptions) instructItem.actionValue = null;
        instructItem.actionParamData = instructItem.actionParamOptions.find((item) => item.key === data) || null;
        if (instructItem.actionParamData && instructItem.actionParamData.data_type) {
          instructItem.actionParamData.data_type = instructItem.actionParamData.data_type.toLowerCase();
        }
        if (!updateOptions) this.$forceUpdate();
      },
      actionValueChange(actionGroupIndex, instructIndex) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        if (
          instructItem.action_param_type === 'command' ||
          instructItem.action_param_type === 'c_attribute' ||
          instructItem.action_param_type === 'c_telemetry' ||
          instructItem.action_param_type === 'c_command'
        ) {
          try {
            JSON.parse(instructItem.actionValue);
            if (typeof JSON.parse(instructItem.actionValue) === 'object') {
              instructItem.inputFeedback = '';
              instructItem.inputValidationStatus = undefined;
            } else {
              uni.showToast({
                title: '请输入JSON格式',
                icon: 'none'
              });
              instructItem.inputValidationStatus = 'error';
            }
          } catch (e) {
            uni.showToast({
              title: '请输入JSON格式',
              icon: 'none'
            });
            instructItem.inputValidationStatus = 'error';
          }
        }
      },
      addIfGroupsSubItem(actionGroupIndex) {
        const data = JSON.parse(JSON.stringify(this.instructListItem));
        this.actions[actionGroupIndex].actionInstructList.push(data);
      },
      deleteIfGroupsSubItem(actionGroupIndex, instructIndex) {
        this.actions[actionGroupIndex].actionInstructList.splice(instructIndex, 1);
      },
      deleteActionGroupItem(actionGroupIndex) {
        this.actions.splice(actionGroupIndex, 1);
      },
      addActionGroupItem() {
        const actionItemData = JSON.parse(JSON.stringify(this.actionItem));
        this.actions.push(actionItemData);
      }
    }
  };
  </script>
  <style>
	@import '@/common/alert-strategy.css';
  </style>
