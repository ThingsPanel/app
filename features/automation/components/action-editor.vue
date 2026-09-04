<template>
<view class="action-editor">
    <!-- 动作编辑部分 -->
    <view
    v-for="(actionGroupItem, actionGroupIndex) in actions"
    :key="actionGroupIndex"
    class="mt-1 w-100%"
    >
    <view class="action-group-shell">
      <view class="tp-panel action-summary-card">
        <view v-if="!isActionEditing(actionGroupIndex)" class="automation-summary" @tap="startActionEdit(actionGroupIndex)">
          <view class="summary-icon"><uni-icons type="paperplane-filled" size="22" color="#F59E0B" /></view>
          <view class="summary-copy">
            <text class="summary-title">{{ getActionSummary(actionGroupItem).title }}</text>
            <text class="summary-line">{{ getActionSummary(actionGroupItem).subtitle }}</text>
            <text class="summary-line">{{ getActionSummary(actionGroupItem).detail }}</text>
          </view>
          <view class="summary-menu"><uni-icons type="more-filled" size="18" color="#172033" /></view>
        </view>
        <view
          v-show="isActionEditing(actionGroupIndex)"
          class="item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing">
          <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
            <CustomSelect v-model="actionGroupItem.actionType" :options="availableActionOptions" :placeholder="$t('pages.sceneEditor.actionsEdit.selectActionType')" @change="actionChange(actionGroupItem, actionGroupIndex, $event)" />
          </view>
        </view>

        <!-- 当 actionType 为 '1' 时（操作设备） -->
        <view v-show="isActionEditing(actionGroupIndex)" v-if="actionGroupItem.actionType === '1'" class="flex-1 border-class">
          <view
              v-for="(instructItem, instructIndex) in actionGroupItem.actionInstructList"
              :key="instructIndex"
              class="action-item-card item tp-flex tp-flex-row tp-flex-j-s tp-flex-a-c tp-box-sizing tp-flex-wrap tp-mg-10 tp-pd-b-10"
          >
          <view class="tp-flex-1">
            <view class="max-w-30 w-full">
              <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                <CustomSelect v-model="instructItem.action_type" :options="actionTypeOptions" :placeholder="$t('pages.sceneEditor.actionsEdit.selectDeviceType')" @change="actionTypeChange(actionGroupIndex, instructIndex, $event)" />
              </view>
            </view>

            <!-- 单个设备 -->
            <view v-if="instructItem.action_type === '10'" class="max-w-40 w-full">
              <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                <CustomSelect v-model="instructItem.action_target" :options="deviceOptions" option-value="id" option-label="name" searchable :placeholder="$t('pages.sceneEditor.actionsEdit.selectDevice')" @change="actionTargetChange(actionGroupIndex, instructIndex)" />
              </view>
            </view>

            <!-- 单类设备 -->
            <view v-if="instructItem.action_type === '11'" class="max-w-40 w-full">
              <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                <CustomSelect v-model="instructItem.action_target" :options="deviceConfigOption" option-value="id" option-label="name" searchable :placeholder="$t('pages.sceneEditor.actionsEdit.selectDeviceCategory')" @change="actionTargetChange(actionGroupIndex, instructIndex)" />
              </view>
            </view>

            <view v-if="instructItem.action_target">
              <!-- 选择属性类型 -->
              <view class="max-w-30 w-full">
                <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                  <CustomSelect v-model="instructItem.action_param_type" :options="instructItem.actionParamTypeOptions" :placeholder="$t('pages.sceneEditor.actionsEdit.selectMetricType')" @change="actionParamTypeChange(actionGroupIndex, instructIndex, $event)" />
                </view>
              </view>

              <!-- 选择属性 -->
              <view v-if="instructItem.showSubSelect" class="max-w-40 w-full">
                <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                  <CustomSelect v-model="instructItem.action_param" :options="instructItem.actionParamOptions" option-value="key" option-label="label" :placeholder="$t('pages.sceneEditor.actionsEdit.selectMetric')" @change="actionParamChange(actionGroupIndex, instructIndex, $event)" />
                </view>
              </view>

              <!-- 输入动作值 -->
              <view v-if="instructItem.showSubSelect && instructItem.actionParamData" class="max-w-60 w-full">
                  <input
                  v-if="instructItem.actionParamData.data_type === 'string'"
                  v-model="instructItem.actionValue"
                  :placeholder="$t('pages.sceneEditor.actionsEdit.examplePrefix') + instructItem.placeholder"
                  @blur="() => actionValueChange(actionGroupIndex, instructIndex)"
                  class="w-full uni-input"
                  />
                  <input
                  v-if="instructItem.actionParamData.data_type === 'number'"
                  v-model.number="instructItem.actionValue"
                  type="number"
                  :placeholder="$t('pages.sceneEditor.actionsEdit.examplePrefix') + instructItem.placeholder"
                  class="w-full uni-input"
                  />
                  <switch
                  v-if="instructItem.actionParamData.data_type === 'boolean'"
                  :checked="instructItem.actionValue"
                  @change="(event) => booleanActionValueChange(event, actionGroupIndex, instructIndex)"
                  ></switch>
              </view>

              <view v-if="!instructItem.showSubSelect" class="w-60">
                  <textarea
                  v-model="instructItem.actionValue"
                  :placeholder="$t('pages.sceneEditor.actionsEdit.examplePrefix') + instructItem.placeholder"
                  @blur="() => actionValueChange(actionGroupIndex, instructIndex)"
                  class="w-full automation-json-input"
                  />
                  <text v-if="instructItem.inputValidationStatus === 'error'" class="field-error">{{ $t('pages.sceneAutomationEditor.jsonFormat') }}</text>
              </view>
              </view>
            </view>
            <view class="action-card-controls tp-flex">
              <!-- 条件数量大于1条时才允许删除 -->
              <uni-icons 
                v-if="actionGroupItem.actionInstructList.length > 1" 
                class="tp-mg-t-b-10"
                type="minus" 
                size="40rpx" 
                color="#FF3B30"
                @click="deleteIfGroupsSubItem(actionGroupIndex, instructIndex)"
              ></uni-icons>
              
              <!-- 仅最后一个显示新增 -->
              <uni-icons
                v-if="instructIndex === actionGroupItem.actionInstructList.length - 1"
                class="tp-mg-t-b-10"
                type="plus" 
                size="40rpx"
                color="#1677FF"
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
        <view v-show="isActionEditing(actionGroupIndex)" v-if="actionGroupItem.actionType === '20'" class="action-target-row">
          <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
            <CustomSelect v-model="actionGroupItem.action_target" :options="sceneList" option-value="id" option-label="name" :placeholder="$t('pages.sceneEditor.actionsEdit.selectScene')" />
          </view>
        </view>

        <!-- 触发告警 -->
        <view v-show="isActionEditing(actionGroupIndex)" v-if="actionGroupItem.actionType === '30'" class="action-target-row">
          <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
            <CustomSelect v-model="actionGroupItem.action_target" :options="alarmList" option-value="id" option-label="name" :placeholder="$t('pages.sceneEditor.actionsEdit.selectAlarm')" />
          </view>
          <!-- <button @click="popUpVisible = true" class="tp-btn">
          创建告警
          </button> -->
        </view>
        </view>
        <view class="action-group-controls tp-flex">
          <!-- 条件数量大于1条时才允许删除 -->
          <text
            v-if="actions.length > 1" 
            class="editor-action editor-action-danger"
            @click="deleteActionGroupItem(actionGroupIndex)"
          >{{ $t('common.delete') }}</text>
          
          <!-- 仅最后一个显示新增 -->
          <text v-if="isActionEditing(actionGroupIndex)" class="editor-action" @click="finishActionEdit(actionGroupIndex)">{{ $t('common.confirm') }}</text>
          <view v-else-if="actionGroupIndex === actions.length - 1" class="add-summary-row" @click="addActionGroupItem()">＋ 添加动作</view>
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
    <view v-if="actions.length === 0" class="empty-add-card" @click="addActionGroupItem()">＋ 添加动作</view>
    </view>
    
</view>
</template>
  
<script>
  import { getAlarmRules } from '@/api/modules/alarm';
  import CustomSelect from '@/components/custom-select.vue';
  import { deviceMetricsMenu,
    deviceConfigMetricsMenu,
    deviceConfigAll,
    deviceListAll,
    sceneGet
  } from '@/api/modules/automation';
  
  export default {
    name: 'ActionsEdit',
    components: { CustomSelect },
    props: {
      actions: {
        type: Array,
        required: true
      },
      isInSceneEdit: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        editingActionIndex: -1,
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
            label: this.$t('pages.sceneAutomationEditor.actionType1'),
            value: '1',
            disabled: false
            },
            {
            label: this.$t('pages.sceneAutomationEditor.actionType3'),
            value: '20',
            disabled: false
            },
            {
            label: this.$t('pages.sceneAutomationEditor.actionType2'),
            value: '30',
            disabled: false
            }
        ],
        actionTypeOptions: [
            {
            label: this.$t('pages.sceneAutomationEditor.singleDevice'),
            value: '10'
            },
            {
            label: this.$t('pages.sceneAutomationEditor.singleDeviceType'),
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
        },
      };
    },
    computed: {
      availableActionOptions() {
        return this.isInSceneEdit
          ? this.actionOptions.filter(item => item.value === '1')
          : this.actionOptions;
      }
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
      isActionEditing(index) {
        return this.editingActionIndex === index;
      },
      startActionEdit(index) {
        this.editingActionIndex = index;
      },
      finishActionEdit(index) {
        if (!this.isActionComplete(this.actions[index])) {
          uni.showToast({ title: '请先完成当前动作配置', icon: 'none' });
          return;
        }
        this.editingActionIndex = -1;
      },
      isActionComplete(action) {
        if (!action || !action.actionType) return false;
        if (action.actionType === '20' || action.actionType === '30') return Boolean(action.action_target);
        if (action.actionType !== '1' || !Array.isArray(action.actionInstructList) || action.actionInstructList.length === 0) return false;
        return action.actionInstructList.every(item => {
          if (!item.action_type || !item.action_target || !item.action_param_type) return false;
          if (item.showSubSelect !== false && !item.action_param) return false;
          return item.actionValue !== null && item.actionValue !== undefined && item.actionValue !== '';
        });
      },
      validateActions() {
        if (!Array.isArray(this.actions) || this.actions.length === 0) {
          return '请至少添加一个动作';
        }
        const invalidIndex = this.actions.findIndex(action => !this.isActionComplete(action));
        if (invalidIndex !== -1) {
          this.startActionEdit(invalidIndex);
          return `请完成第 ${invalidIndex + 1} 个动作配置`;
        }
        if (this.isInSceneEdit && this.actions.some(action => action.actionType !== '1')) {
          return '场景管理仅支持操作设备动作';
        }
        return true;
      },
      getActionSummary(action) {
        if (!action || !action.actionType) {
          return {
            title: this.$t('pages.sceneEditor.actionsEdit.selectActionType'),
            subtitle: '点击配置执行动作',
            detail: '操作设备、激活场景或触发告警'
          };
        }
        if (action.actionType === '20') {
          const scene = this.sceneList.find(item => String(item.id) === String(action.action_target));
          return { title: this.$t('pages.sceneAutomationEditor.actionType3'), subtitle: scene ? scene.name : '请选择场景', detail: '' };
        }
        if (action.actionType === '30') {
          const alarm = this.alarmList.find(item => String(item.id) === String(action.action_target));
          return { title: this.$t('pages.sceneAutomationEditor.actionType2'), subtitle: alarm ? alarm.name : '请选择告警', detail: '' };
        }
        const instructs = Array.isArray(action.actionInstructList) ? action.actionInstructList : [];
        const first = instructs[0] || {};
        const target = first.action_type === '11'
          ? this.getDeviceConfigDisplayText(first.action_target)
          : this.getDeviceDisplayText(first.action_target);
        const rawParam = this.getPickerDisplayText(first.actionParamOptions || [], first.action_param, 'key', 'label') || first.action_param || first.action_param_type || '';
        const param = this.formatActionParam(rawParam);
        const value = typeof first.actionValue === 'boolean'
          ? (first.actionValue ? '开启' : '关闭')
          : (first.actionValue ?? '');
        return {
          title: this.$t('pages.sceneAutomationEditor.actionType1'),
          subtitle: target || (first.action_type === '11' ? '请选择设备类型' : '请选择设备'),
          detail: [param, value !== '' ? `设为 ${value}` : ''].filter(Boolean).join(' ') || '请完成动作配置'
        };
      },
      formatActionParam(value) {
        const text = String(value || '').trim();
        const leaf = text.includes('/') ? text.split('/').pop() : text;
        const labelMatch = leaf.match(/\(([^()]+)\)$/);
        return labelMatch ? labelMatch[1] : leaf;
      },
      async getDevice(groupId, name) {
          this.queryDevice.group_id = groupId || null;
          this.queryDevice.device_name = name || null;
          const res = await deviceListAll(this.queryDevice);
          this.deviceOptions = res.data;
          // 数据加载完成后强制更新视图，确保回显正确
          this.$nextTick(() => {
            this.$forceUpdate();
          });
      },
      async getDeviceConfig(name) {
          this.queryDeviceConfig.device_config_name = name || '';
          const res = await deviceConfigAll(this.queryDeviceConfig);
          this.deviceConfigOption = res.data || [];
          // 数据加载完成后强制更新视图，确保回显正确
          this.$nextTick(() => {
            this.$forceUpdate();
          });
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
        const res = await getAlarmRules(params);
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
                title: this.$t('pages.sceneAutomationEditor.jsonFormat'),
                icon: 'none'
              });
              instructItem.inputValidationStatus = 'error';
            }
          } catch (e) {
            uni.showToast({
              title: this.$t('pages.sceneAutomationEditor.jsonFormat'),
              icon: 'none'
            });
            instructItem.inputValidationStatus = 'error';
          }
        }
      },
      booleanActionValueChange(event, actionGroupIndex, instructIndex) {
        const instructItem = this.actions[actionGroupIndex].actionInstructList[instructIndex];
        instructItem.actionValue = event.detail.value;
        this.actionValueChange(actionGroupIndex, instructIndex);
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
        const incompleteIndex = this.actions.findIndex(item => !this.isActionComplete(item));
        if (incompleteIndex !== -1) {
          this.startActionEdit(incompleteIndex);
          uni.showToast({ title: '请先完成当前动作配置', icon: 'none' });
          return;
        }
        const actionItemData = JSON.parse(JSON.stringify(this.actionItem));
        this.actions.push(actionItemData);
        this.$nextTick(() => this.startActionEdit(this.actions.length - 1));
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
      // 设备显示文本
      getDeviceDisplayText(deviceId) {
        if (!deviceId) return '';
        const device = this.deviceOptions.find(item => item.id === deviceId || String(item.id) === String(deviceId));
        return device ? device.name : '';
      },
      // 设备类型显示文本
      getDeviceConfigDisplayText(deviceConfigId) {
        if (!deviceConfigId) return '';
        const deviceConfig = this.deviceConfigOption.find(item => item.id === deviceConfigId || String(item.id) === String(deviceConfigId));
        return deviceConfig ? deviceConfig.name : '';
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
        const selectedScene = this.sceneList[index];
        // 使用 Vue.set 确保响应式更新
        actionGroupItem.action_target = selectedScene ? selectedScene.id : null;
        // 触发视图更新和数据同步
        this.$nextTick(() => {
          this.$forceUpdate();
          this.$emit('update:actions', this.actions);
        });
      },
      onAlarmPickerChange(e, actionGroupIndex) {
        const index = e.detail.value;
        const actionGroupItem = this.actions[actionGroupIndex];
        const selectedAlarm = this.alarmList[index];
        // 使用 Vue.set 确保响应式更新
        actionGroupItem.action_target = selectedAlarm ? selectedAlarm.id : null;
        // 触发视图更新和数据同步
        this.$nextTick(() => {
          this.$forceUpdate();
          this.$emit('update:actions', this.actions);
        });
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
	@import '@/features/automation/styles/forms.css';

  .action-group-shell {
    box-sizing: border-box;
    display: block;
    width: 100%;
    margin: 0 0 6px;
  }

  .action-summary-card {
    overflow: visible;
    width: 100%;
    border: 2rpx solid #edf0f3;
    border-radius: 10px 10px 0 0;
    background: #fff;
    box-shadow: 0 1px 4px rgba(34, 46, 66, 0.035);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transition: none;
  }

  .automation-summary {
    box-sizing: border-box;
    display: flex;
    align-items: flex-start;
    gap: 10px;
    min-height: 64px;
    padding: 10px 12px;
  }

  .summary-icon {
    display: flex;
    flex: 0 0 32px;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    margin-top: 1px;
    border-radius: 50%;
    background: #fff7e8;
  }

  .summary-copy { display: flex; flex: 1; min-width: 0; flex-direction: column; gap: 2px; }
  .summary-title,
  .summary-line { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .summary-title { color: #172033; font-size: 14px; font-weight: 600; line-height: 19px; }
  .summary-line { color: #667085; font-size: 12px; line-height: 16px; }
  .summary-menu { display:flex; flex:0 0 44px; align-items:center; justify-content:center; width:44px; height:44px; margin:-6px -10px 0 0; box-sizing:border-box; }
	
	.action-item-card {
		background: #ffffff;
		border: 0;
		border-radius: 0;
    padding: 0 12px;
    margin: 0;
		position: relative;
		box-shadow: none;
	}

  .action-card-controls,
  .action-group-controls {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 22rpx;
    width: 100%;
    min-height: 44px;
    border-top: 1rpx solid #edf0f3;
  }

  .action-group-controls {
    margin: -2rpx 0 0;
    padding: 0 12px;
    border-top: 1rpx solid #edf0f3;
    border: 2rpx solid #edf0f3;
    border-top-width: 1rpx;
    border-radius: 0 0 18rpx 18rpx;
    background: #fff;
  }

  .action-summary-card + .action-group-controls { border-top-color: #e4e7ec; }

  .editor-action { display:flex; flex:0 0 auto; align-items:center; min-height:44px; color:#1677ff; font-size:14px; white-space:nowrap; }
  .editor-action-danger { margin-right: auto; color: #ff3b30; }
  .add-summary-row,
  .empty-add-card {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 44px;
    color: #1677ff;
    font-size: 13px;
    font-weight: 500;
  }
  .empty-add-card { overflow:hidden; border:2rpx solid #edf0f3; border-radius:10px; background:#fff; box-shadow:0 1px 4px rgba(34,46,66,.035); }
  .add-summary-row { flex: 1; min-width: 0; }
  .action-summary-card > .item,
  .action-target-row { padding: 0 12px; }
	
	.action-item-card:not(:last-child)::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 28rpx;
		right: 28rpx;
		height: 1rpx;
		background-color: #edf0f3;
	}
	
	.action-item-card .tp-flex-1 {
		box-sizing: border-box;
		flex: 0 0 100%;
		width: 100%;
		margin-right: 0;
	}
	
	.action-item-card .tp-flex-1:last-child {
		margin-right: 0;
	}
	
	.action-item-card .max-w-30,
	.action-item-card .max-w-40,
	.action-item-card .max-w-60 {
		box-sizing: border-box;
		width: 100%;
		margin-right: 0;
		margin-bottom: 8rpx;
	}
	
	.action-item-card .max-w-30:last-child,
	.action-item-card .max-w-40:last-child,
	.action-item-card .max-w-60:last-child {
		margin-right: 0;
	}
	
  .placeholder {
		color: #98a2b3;
  }

  .automation-json-input { box-sizing:border-box; width:100%; min-height:88px; margin:8px 0; padding:10px 12px; color:#172033; background:#f7f8fa; border:1px solid #e4e7ec; border-radius:8px; font-family:ui-monospace, SFMono-Regular, Consolas, monospace; font-size:13px; line-height:19px; }
  .field-error { display:block; margin:-4px 0 8px; color:#ff3b30; font-size:12px; line-height:17px; }
	
	.picker-wrapper {
		position: relative;
		min-height: 44px;
		border-bottom: 1rpx solid #edf0f3;
	}
	
	.picker-wrapper picker {
		flex: 1;
	}
	
	.picker-wrapper .uni-icons {
		margin-left: 8rpx;
		flex-shrink: 0;
	}

	/* 弹窗样式 */
	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx;
		border-bottom: 2rpx solid #edf0f3;
	}
	
	.popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #172033;
	}
	
	.popup-close {
		padding: 10rpx;
	}
	
	.popup-search {
		padding: 20rpx 30rpx;
		border-bottom: 2rpx solid #edf0f3;
	}
	
	.search-input {
		width: 100%;
		height: 80rpx;
		border: 2rpx solid #dfe4eb;
		border-radius: 16rpx;
		box-sizing: border-box;
		font-size: 28rpx;
		padding-left: 30rpx;
	}
	
	.selectlist {
		padding: 0;
	}
	
	.select_item {
		border-bottom: 2rpx solid #edf0f3;
		font-size: 28rpx;
		color: #172033;
	}
	
	.select_item:active {
		background-color: #f7faff;
	}
	
	.select_item.empty {
		text-align: center;
		color: #98a2b3;
	}

	.scroll-view-equipment {
		max-height: 600rpx;
		padding: 0 30rpx;
		box-sizing: border-box;
	}

  .popup-grabber { width:36px; height:4px; margin:8px auto 2px; background:#d0d5dd; border-radius:2px; }
  .popup-header { box-sizing:border-box; height:44px; padding:0 12px; border-bottom:1px solid #edf0f3; }
  .popup-title { color:#172033; font-size:16px; font-weight:600; }
  .popup-close { display:flex; align-items:center; justify-content:center; width:44px; height:44px; margin-right:-10px; }
  .popup-search { padding:8px 12px; border-bottom:1px solid #edf0f3; }
  .search-input { height:40px; padding:0 10px; color:#172033; font-size:13px; background:#f7f8fa; border:1px solid #e4e7ec; border-radius:8px; }
  .select_item { display:flex; align-items:center; justify-content:flex-start; box-sizing:border-box; min-height:48px; margin-left:16px; padding:0 16px 0 0; color:#172033; border-bottom:1px solid #edf0f3; font-size:14px; font-weight:400; text-align:left; }
  .select_item:active { color:#1677ff; background:#f7faff; }
  .select_item.empty { justify-content:center; margin:0; color:#98a2b3; }
  ::v-deep .uni-popup__wrapper.bottom { overflow:hidden; padding-bottom:env(safe-area-inset-bottom); border-radius:16px 16px 0 0; box-shadow:0 -4px 18px rgba(16,24,40,.08); }
	
	.scroll-view-equipment scroll-view {
		height: 100%;
		box-sizing: border-box;
	}

	::v-deep .search-input .uni-input-input {
		padding: 16rpx 30rpx;
		padding-left: 0;
		height: 80rpx;
		line-height: 80rpx;
		font-size: 28rpx;
		color: #1e293b;
		box-sizing: border-box;
		outline: none;
	}
  </style>
