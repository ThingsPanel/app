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
          <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
            <picker
                mode="selector"
                :range="actionOptions"
                range-key="label"
                :value="getPickerIndex(actionOptions, actionGroupItem.actionType, 'value')"
                @change="onActionTypePickerChange($event, actionGroupItem, actionGroupIndex)"
                class="tp-flex-1"
            >
              <view class="uni-input" :class="!actionGroupItem.actionType && 'placeholder'">
                {{ getPickerDisplayText(actionOptions, actionGroupItem.actionType, 'value', 'label') || $t('pages.sceneDetail.actionsEdit.selectActionType') }}
              </view>
            </picker>
            <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
          </view>
        </view>

        <!-- 当 actionType 为 '1' 时（操作设备） -->
        <view v-if="actionGroupItem.actionType === '1'" class="flex-1 border-class">
          <view
              v-for="(instructItem, instructIndex) in actionGroupItem.actionInstructList"
              :key="instructIndex"
              class="action-item-card item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-flex-wrap tp-mg-10 tp-pd-b-10"
          >
          <view class="tp-flex-1">
            <view class="max-w-30 w-full">
              <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                <picker
                    mode="selector"
                    :range="actionTypeOptions"
                    range-key="label"
                    :value="getPickerIndex(actionTypeOptions, instructItem.action_type, 'value')"
                    @change="onDeviceTypePickerChange($event, actionGroupIndex, instructIndex)"
                    class="tp-flex-1"
                >
                  <view class="uni-input" :class="!instructItem.action_type && 'placeholder'">
                    {{ getPickerDisplayText(actionTypeOptions, instructItem.action_type, 'value', 'label') || $t('pages.sceneDetail.actionsEdit.selectDeviceType') }}
                  </view>
                </picker>
                <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
              </view>
            </view>

            <!-- 单个设备 -->
            <view v-if="instructItem.action_type === '10'" class="max-w-40 w-full">
              <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                <picker
                    mode="selector"
                    :range="deviceOptions"
                    range-key="name"
                    :value="getPickerIndex(deviceOptions, instructItem.action_target, 'id')"
                    @change="onDevicePickerChange($event, actionGroupIndex, instructIndex)"
                    class="tp-flex-1"
                >
                  <view class="uni-input" :class="!instructItem.action_target && 'placeholder'">
                    {{ getPickerDisplayText(deviceOptions, instructItem.action_target, 'id', 'name') || $t('pages.sceneDetail.actionsEdit.selectDevice') }}
                  </view>
                </picker>
                <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
              </view>
            </view>

            <!-- 单类设备 -->
            <view v-if="instructItem.action_type === '11'" class="max-w-40 w-full">
              <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                <picker
                    mode="selector"
                    :range="deviceConfigOption"
                    range-key="name"
                    :value="getPickerIndex(deviceConfigOption, instructItem.action_target, 'id')"
                    @change="onDeviceConfigPickerChange($event, actionGroupIndex, instructIndex)"
                    class="tp-flex-1"
                >
                  <view class="uni-input" :class="!instructItem.action_target && 'placeholder'">
                    {{ getPickerDisplayText(deviceConfigOption, instructItem.action_target, 'id', 'name') || $t('pages.sceneDetail.actionsEdit.selectDeviceCategory') }}
                  </view>
                </picker>
                <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
              </view>
            </view>

            <view v-if="instructItem.action_type">
              <!-- 选择属性类型 -->
              <view class="max-w-30 w-full">
                <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                  <picker
                      mode="selector"
                      :range="instructItem.actionParamTypeOptions"
                      range-key="label"
                      :value="getPickerIndex(instructItem.actionParamTypeOptions, instructItem.action_param_type, 'value')"
                      @change="onActionParamTypePickerChange($event, actionGroupIndex, instructIndex)"
                      class="tp-flex-1"
                  >
                    <view class="uni-input" :class="!instructItem.action_param_type && 'placeholder'">
                      {{ getPickerDisplayText(instructItem.actionParamTypeOptions, instructItem.action_param_type, 'value', 'label') || $t('pages.sceneDetail.actionsEdit.selectMetricType') }}
                    </view>
                  </picker>
                  <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                </view>
              </view>

              <!-- 选择属性 -->
              <view v-if="instructItem.showSubSelect" class="max-w-40 w-full">
                <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                  <picker
                      mode="selector"
                      :range="instructItem.actionParamOptions"
                      range-key="label"
                      :value="getPickerIndex(instructItem.actionParamOptions, instructItem.action_param, 'key')"
                      @change="onActionParamPickerChange($event, actionGroupIndex, instructIndex)"
                      class="tp-flex-1"
                  >
                    <view class="uni-input" :class="!instructItem.action_param && 'placeholder'">
                      {{ getPickerDisplayText(instructItem.actionParamOptions, instructItem.action_param, 'key', 'label') || $t('pages.sceneDetail.actionsEdit.selectMetric') }}
                    </view>
                  </picker>
                  <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                </view>
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
                  :placeholder="$t('pages.sceneDetail.actionsEdit.examplePrefix') + instructItem.placeholder"
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
                  :placeholder="$t('pages.sceneDetail.actionsEdit.examplePrefix') + instructItem.placeholder"
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
                color="#4CAF50"
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
          <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
            <picker
                mode="selector"
                :range="sceneList"
                range-key="name"
                :value="getPickerIndex(sceneList, actionGroupItem.action_target, 'id')"
                @change="onScenePickerChange($event, actionGroupIndex)"
                class="tp-flex-1"
            >
              <view class="uni-input" :class="!actionGroupItem.action_target && 'placeholder'">
                {{ getPickerDisplayText(sceneList, actionGroupItem.action_target, 'id', 'name') || $t('pages.sceneDetail.actionsEdit.selectScene') }}
              </view>
            </picker>
            <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
          </view>
        </view>

        <!-- 触发告警 -->
        <view v-if="actionGroupItem.actionType === '30'" class="ml-6 max-w-40 w-auto">
          <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
            <picker
                mode="selector"
                :range="alarmList"
                range-key="name"
                :value="getPickerIndex(alarmList, actionGroupItem.action_target, 'id')"
                @change="onAlarmPickerChange($event, actionGroupIndex)"
                class="tp-flex-1"
            >
              <view class="uni-input" :class="!actionGroupItem.action_target && 'placeholder'">
                {{ getPickerDisplayText(alarmList, actionGroupItem.action_target, 'id', 'name') || $t('pages.sceneDetail.actionsEdit.selectAlarm') }}
              </view>
            </picker>
            <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
          </view>
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
            color="#4CAF50"
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
            label: this.$t('pages.sceneRuleDetail.actionType1'),
            value: '1',
            disabled: false
            },
            {
            label: this.$t('pages.sceneRuleDetail.actionType3'),
            value: '20',
            disabled: false
            },
            {
            label: this.$t('pages.sceneRuleDetail.actionType2'),
            value: '30',
            disabled: false
            }
        ],
        actionTypeOptions: [
            {
            label: this.$t('pages.sceneRuleDetail.singleDevice'),
            value: '10'
            },
            {
            label: this.$t('pages.sceneRuleDetail.singleDeviceType'),
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
                if (!newActions || !Array.isArray(newActions)) {
                    return;
                }
                newActions.forEach((item, index) => {
                    if (item && item.actionType === '1' && item.actionInstructList && Array.isArray(item.actionInstructList)) {
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
        if (this.actions && Array.isArray(this.actions)) {
            this.actions.map((item, index) => {
                if (item && item.actionType === '1' && item.actionInstructList && Array.isArray(item.actionInstructList)) {
                  item.actionInstructList.map((instructItem, instructIndex) => {
                    this.actionParamShow(index, instructIndex, true);
                  });
                }
            });
        }
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
        actionGroupItem.actionType = data;
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
        instructItem.action_type = data;
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
        instructItem.action_param_type = data;
        if (!updateOptions) {
          instructItem.action_param = null;
          instructItem.actionParamData = null;
        }
        const foundItem = instructItem.actionParamOptionsData.find((item) => item.data_source_type === data);
        instructItem.actionParamOptions = foundItem ? foundItem.options : [];
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
        instructItem.action_param = data;
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
                title: this.$t('pages.sceneRuleDetail.jsonFormat'),
                icon: 'none'
              });
              instructItem.inputValidationStatus = 'error';
            }
          } catch (e) {
            uni.showToast({
              title: this.$t('pages.sceneRuleDetail.jsonFormat'),
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
      },
      // Picker change 事件处理方法
      onActionTypePickerChange(e, actionGroupItem, actionGroupIndex) {
        const index = e.detail.value;
        const selectedValue = this.actionOptions[index] ? this.actionOptions[index].value : null;
        this.actionChange(actionGroupItem, actionGroupIndex, selectedValue);
      },
      onDeviceTypePickerChange(e, actionGroupIndex, instructIndex) {
        const index = e.detail.value;
        const selectedValue = this.actionTypeOptions[index] ? this.actionTypeOptions[index].value : null;
        this.actionTypeChange(actionGroupIndex, instructIndex, selectedValue);
      },
      onDevicePickerChange(e, actionGroupIndex, instructIndex) {
        const index = e.detail.value;
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        instructItem.action_target = this.deviceOptions[index] ? this.deviceOptions[index].id : null;
        this.actionTargetChange(actionGroupIndex, instructIndex);
      },
      onDeviceConfigPickerChange(e, actionGroupIndex, instructIndex) {
        const index = e.detail.value;
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        instructItem.action_target = this.deviceConfigOption[index] ? this.deviceConfigOption[index].id : null;
        this.actionTargetChange(actionGroupIndex, instructIndex);
      },
      onActionParamTypePickerChange(e, actionGroupIndex, instructIndex) {
        const index = e.detail.value;
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        const selectedValue = instructItem.actionParamTypeOptions[index] ? instructItem.actionParamTypeOptions[index].value : null;
        this.actionParamTypeChange(actionGroupIndex, instructIndex, selectedValue);
      },
      onActionParamPickerChange(e, actionGroupIndex, instructIndex) {
        const index = e.detail.value;
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        const selectedValue = instructItem.actionParamOptions[index] ? instructItem.actionParamOptions[index].key : null;
        this.actionParamChange(actionGroupIndex, instructIndex, selectedValue);
      },
      onScenePickerChange(e, actionGroupIndex) {
        const index = e.detail.value;
        const actionGroupItem = this.actions[actionGroupIndex];
        actionGroupItem.action_target = this.sceneList[index] ? this.sceneList[index].id : null;
      },
      onAlarmPickerChange(e, actionGroupIndex) {
        const index = e.detail.value;
        const actionGroupItem = this.actions[actionGroupIndex];
        actionGroupItem.action_target = this.alarmList[index] ? this.alarmList[index].id : null;
      },
      // 获取 picker 的索引值
      getPickerIndex(options, value, valueKey = 'value') {
        if (!options || !Array.isArray(options) || options.length === 0) {
          return 0;
        }
        if (value === null || value === undefined || value === '') {
          return 0;
        }
        const index = options.findIndex(item => {
          if (!item) return false;
          const itemValue = item[valueKey];
          // 严格相等比较
          if (itemValue === value) {
            return true;
          }
          // 字符串转换比较
          if (String(itemValue) === String(value)) {
            return true;
          }
          // 数字类型比较
          const numItem = Number(itemValue);
          const numValue = Number(value);
          if (!isNaN(numItem) && !isNaN(numValue) && numItem === numValue) {
            return true;
          }
          return false;
        });
        return index >= 0 ? index : 0;
      },
      // 获取 picker 的显示文本
      getPickerDisplayText(options, value, valueKey = 'value', labelKey = 'label') {
        if (!options || !Array.isArray(options) || options.length === 0) {
          return '';
        }
        if (value === null || value === undefined || value === '') {
          return '';
        }
        const option = options.find(item => {
          if (!item) return false;
          const itemValue = item[valueKey];
          // 严格相等比较
          if (itemValue === value) {
            return true;
          }
          // 字符串转换比较
          if (String(itemValue) === String(value)) {
            return true;
          }
          // 数字类型比较
          const numItem = Number(itemValue);
          const numValue = Number(value);
          if (!isNaN(numItem) && !isNaN(numValue) && numItem === numValue) {
            return true;
          }
          return false;
        });
        return option && option[labelKey] !== undefined && option[labelKey] !== null ? String(option[labelKey]) : '';
      }
    }
  };
  </script>
  <style>
	@import '@/common/alert-strategy.css';
	
	.action-item-card {
		background: #f5f5f5;
		border-radius: 24rpx;
		padding: 32rpx 28rpx;
    margin-left: 24rpx;
    margin-right: 24rpx;
		margin-bottom: 24rpx;
		position: relative;
	}
	
	.action-item-card:not(:last-child)::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 28rpx;
		right: 28rpx;
		height: 1rpx;
		background-color: rgba(0, 0, 0, 0.1);
	}
	
	.action-item-card .tp-flex-1 {
		margin-right: 24rpx;
	}
	
	.action-item-card .tp-flex-1:last-child {
		margin-right: 0;
	}
	
	.action-item-card .max-w-30,
	.action-item-card .max-w-40,
	.action-item-card .max-w-60 {
		margin-right: 20rpx;
		margin-bottom: 8rpx;
	}
	
	.action-item-card .max-w-30:last-child,
	.action-item-card .max-w-40:last-child,
	.action-item-card .max-w-60:last-child {
		margin-right: 0;
	}
	
	.placeholder {
		color: #999;
	}
	
	.picker-wrapper {
		position: relative;
	}
	
	.picker-wrapper picker {
		flex: 1;
	}
	
	.picker-wrapper .uni-icons {
		margin-left: 8rpx;
		flex-shrink: 0;
	}
  </style>
