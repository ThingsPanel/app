<template>
    <view class="mt-1 w-100%">
      <!-- 表单部分 -->
      <form
        ref="premiseFormRef"
        @submit.prevent
        @keydown.enter="onKeydownEnter"
        class="w-100%"
      >
        <view v-for="(ifGroupItem, ifGroupIndex) in premiseForm.ifGroups"
          :key="ifGroupIndex"
          class="w-100% tp-flex">
          <view class="mb-2 w-100% tp-flex-1">
            <view
              v-for="(ifItem, ifIndex) in ifGroupItem"
              :key="ifIndex"
              class="ifGroupItem-class mb-2 w-100% tp-mg-10 tp-flex tp-panel"
              :class="{ 'has-relation': ifIndex !== 0 }"
            >
              <view v-if="ifIndex !== 0" class="relation-divider"><text>{{ $t('pages.sceneAutomationEditor.and') }}</text></view>
              <view
                v-if="!isConditionEditing(ifGroupIndex, ifIndex)"
                class="automation-summary"
                @tap="startConditionEdit(ifGroupIndex, ifIndex)"
              >
                <view class="summary-icon" :class="ifItem.ifType === '2' ? 'summary-icon-time' : 'summary-icon-device'">
                  <uni-icons :type="ifItem.ifType === '2' ? 'calendar' : 'gear'" size="22" :color="ifItem.ifType === '2' ? '#1677FF' : '#12B76A'" />
                </view>
                <view class="summary-copy">
                  <text class="summary-title">{{ getConditionSummary(ifItem).title }}</text>
                  <text class="summary-line">{{ getConditionSummary(ifItem).subtitle }}</text>
                  <text class="summary-line">{{ getConditionSummary(ifItem).detail }}</text>
                </view>
                <view class="summary-menu"><uni-icons type="more-filled" size="18" color="#172033" /></view>
              </view>
              <view v-show="isConditionEditing(ifGroupIndex, ifIndex)" class="condition-form-fields tp-flex-1 tp-flex">
              <view class="tp-flex-1">
                <!-- 条件类型下拉-->
                <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                  <CustomSelect v-model="ifItem.ifType" :options="getIfTypeOptions(ifGroupItem, ifIndex)" :placeholder="$t('pages.sceneAutomationEditor.selectConditionType')" @change="ifTypeChange(ifItem, $event)" />
                </view>
                <view v-if="ifItem.ifType === '1'" class="flex-1">
                  <!-- 设备条件类型下拉-->
                  <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                    <CustomSelect v-model="ifItem.trigger_conditions_type" :options="deviceConditionOptions" :placeholder="$t('pages.sceneAutomationEditor.selectDeviceConditionType')" @change="triggerConditionsTypeChange(ifItem, $event)" />
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '10'">
                    <!-- 选择设备-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <CustomSelect v-model="ifItem.trigger_source" :options="deviceOptions" option-value="id" option-label="name" searchable :placeholder="$t('pages.sceneAutomationEditor.selectDevice')" @change="triggerSourceChanged(ifItem, ifIndex)" />
                    </view>
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '11'">
                    <!-- 选择设备类型-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <CustomSelect v-model="ifItem.trigger_source" :options="deviceConfigOption" option-value="id" option-label="name" searchable :placeholder="$t('pages.sceneAutomationEditor.selectDeviceType')" @change="triggerSourceChanged(ifItem, ifIndex)" />
                    </view>
                  </view>
                  <view v-if="ifItem.trigger_source">
                    <!-- 选择触发参数-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <CustomSelect v-model="ifItem.trigger_param_key" :options="ifItem.triggerParamFlattenedOptions || []" option-value="key" option-label="fullLabel" :placeholder="$t('pages.sceneAutomationEditor.selectParameter')" @change="triggerParamChange(ifItem, $event)" />
                    </view>
                    <view v-if="ifItem.trigger_param_type === 'telemetry' || ifItem.trigger_param_type === 'attributes'">
                      <!-- 选择操作符-->
                      <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                        <CustomSelect v-model="ifItem.trigger_operator" :options="determineOptions" :placeholder="$t('pages.sceneAutomationEditor.selectOperator')" />
                      </view>
                      <view v-if="ifItem.trigger_operator === 'in'">
                        <!-- 输入范围值-->
                        <input v-model="ifItem.trigger_value" :placeholder="$t('pages.sceneAutomationEditor.commaSeparatedValues')" class="uni-input" />
                      </view>
                      <view v-else-if="ifItem.trigger_operator == 'between'">
                        <!-- 输入最小值和最大值-->
                        <input v-model="ifItem.minValue" :placeholder="$t('pages.sceneAutomationEditor.minValue')" class="uni-input" />
                        <input v-model="ifItem.maxValue" :placeholder="$t('pages.sceneAutomationEditor.maxValue')" class="uni-input" />
                      </view>
                      <view v-else>
                        <!-- 输入目标值-->
                        <input v-model="ifItem.trigger_value" :placeholder="$t('pages.sceneAutomationEditor.value')" class="uni-input" />
                      </view>
                    </view>
                    <view v-if="ifItem.trigger_param_type === 'event'">
                      <!-- 输入事件参数-->
                      <textarea v-model="ifItem.trigger_value" :placeholder="$t('pages.sceneAutomationEditor.eventParamExample')" class="automation-json-input" auto-height @blur="() => actionValueChange(ifItem)" />
                      <text v-if="ifItem.inputFeedback" class="field-error">{{ ifItem.inputFeedback }}</text>
                    </view>
                  </view>
                </view>
                <!-- 时间条件 -->
                <view v-if="ifItem.ifType === '2'" class="flex-1">
                  <!-- 时间条件类型下拉-->
                  <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                    <CustomSelect v-model="ifItem.trigger_conditions_type" :options="getTimeConditionOptions(ifGroupItem)" :placeholder="$t('pages.sceneAutomationEditor.selectTimeConditionType')" @change="triggerConditionsTypeChange(ifItem, $event)" />
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '20'">
                    <view class="datetime-form-row">
                      <text class="datetime-label">执行时间</text>
                      <view class="datetime-control">
                        <AutomationDatetimeSheet
                          v-model="ifItem.onceTimeValue"
                          :placeholder="$t('pages.sceneAutomationEditor.selectDateTime')"
                        />
                      </view>
                    </view>
                    <!-- 过期时间-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <CustomSelect v-model="ifItem.expiration_time" :options="expirationTimeOptions" :placeholder="$t('pages.sceneAutomationEditor.selectExpirationTime')" />
                    </view>
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '21'">
                    <!-- 时间条件下 -> 重复 -> 选择周期 -->
                    <view class="form-item">
                      <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                        <CustomSelect v-model="ifItem.task_type" :options="cycleOptions" :placeholder="$t('pages.sceneAutomationEditor.selectCycle')" @change="cycleChange(ifItem, $event)" />
                      </view>
                    </view>

                    <!-- 每小时 -> 选择分 -->
                    <view v-if="ifItem.task_type === 'HOUR'" class="form-item">
                      <AutomationTimeSheet v-model="ifItem.hourTimeValue" minute-only :placeholder="$t('pages.sceneAutomationEditor.selectMinute')" title="选择分钟" />
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneAutomationEditor.selectExpirationTime')"
                      />
                    </view>

                    <!-- 每天 -> 选择时分秒 -->
                    <view v-if="ifItem.task_type === 'DAY'" class="form-item">
                      <AutomationTimeSheet v-model="ifItem.dayTimeValue" :placeholder="$t('pages.sceneAutomationEditor.selectTime')" />
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneAutomationEditor.selectExpirationTime')"
                      />
                    </view>

                    <!-- 每周 -> 选择星期和时间 -->
                    <view v-if="ifItem.task_type === 'WEEK'" class="form-item">
                      <checkbox-group @change="(e) => onWeekChoseValueChange(e, ifItem)" class="tp-mg-l-20">
                        <view class="checkbox-space">
                          <label
                            v-for="(weekItem, weekIndex) in weekOptions"
                            :key="weekIndex"
                            class="checkbox-label"
                          >
                            <checkbox
                              :value="weekItem.value"
                              :checked="ifItem.weekChoseValue.includes(weekItem.value)"
                            />
                            <text>{{ weekItem.label }}</text>
                          </label>
                        </view>
                      </checkbox-group>
                      <AutomationTimeSheet v-model="ifItem.weekTimeValue" :placeholder="$t('pages.sceneAutomationEditor.selectTime')" />
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneAutomationEditor.selectExpirationTime')"
                      />
                    </view>

                    <!-- 每月 -> 选择日期和时间 -->
                    <view v-if="ifItem.task_type === 'MONTH'" class="form-item">
                      <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                        <CustomSelect v-model="ifItem.monthChoseValue" :options="monthRangeOptions" :placeholder="$t('pages.sceneAutomationEditor.selectDate')" />
                      </view>
                      <AutomationTimeSheet v-model="ifItem.monthTimeValue" :placeholder="$t('pages.sceneAutomationEditor.selectTime')" />
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneAutomationEditor.selectExpirationTime')"
                      />
                    </view>
                  </view>

                  <!-- 时间条件下 -> 范围 -> 选择星期和时间周期 -->
                  <view v-if="ifItem.trigger_conditions_type === '22'">
                    <!-- <checkbox-group v-model="ifItem.weekChoseValue" class="checkbox-group">
                      <checkbox
                        v-for="(weekItem, index) in weekOptions"
                        :key="index"
                        :value="weekItem.value"
                        :label="weekItem.label"
                      />
                    </checkbox-group> -->
                    <checkbox-group @change="(e) => onWeekChoseValueChange(e, ifItem)" class="tp-mg-l-20">
                      <view class="checkbox-space">
                        <label
                          v-for="(weekItem, weekIndex) in weekOptions"
                          :key="weekIndex"
                          class="checkbox-label"
                        >
                          <checkbox
                            :value="weekItem.value"
                            :checked="ifItem.weekChoseValue.includes(weekItem.value)"
                          />
                          <text>{{ weekItem.label }}</text>
                        </label>
                      </view>
                    </checkbox-group>

                    <view class="time-range">
                      <AutomationTimeSheet v-model="ifItem.startTimeValue" :placeholder="$t('pages.sceneAutomationEditor.selectStartTime')" title="开始时间" />
                      <view class="time-range-divider">-</view>
                      <AutomationTimeSheet v-model="ifItem.endTimeValue" :placeholder="$t('pages.sceneAutomationEditor.selectEndTime')" title="结束时间" />
                    </view>
                  </view>
                  <!-- 其他时间条件类型的处理，省略 -->
                </view>
              </view>
              </view>
              <view
                v-if="isConditionEditing(ifGroupIndex, ifIndex) || ifIndex === ifGroupItem.length - 1"
                class="condition-card-controls tp-flex"
              >
                <!-- 条件数量大于1条时才允许删除 -->
                <text
                  v-if="isConditionEditing(ifGroupIndex, ifIndex) && ifIndex !== 0"
                  class="editor-action editor-action-danger"
                  @click="deleteIfGroupsSubItem(ifGroupIndex, ifIndex)"
                >{{ $t('common.delete') }}</text>
                
                <!-- 仅最后一个显示新增 -->
                <text v-if="isConditionEditing(ifGroupIndex, ifIndex)" class="editor-action" @click="finishConditionEdit">{{ $t('common.confirm') }}</text>
                <view
                  v-else
                  class="add-summary-row"
                  @click.stop="addIfGroupsSubItem(ifGroupIndex)"
                >＋ 添加条件</view>
              </view>
              <!-- 操作按钮 
              <view class="button-group">
                <button v-if="ifIndex === 0"
                    @click.prevent="addIfGroupsSubItem(ifGroupIndex)"
                    style="width: 50%; margin-right: 15px;"
                    class="tp-btn">新增条件</button>
                <button v-if="ifIndex !== 0"
                    @click.prevent="deleteIfGroupsSubItem(ifGroupIndex, ifIndex)"
                    style="width: 50%; margin-right: 15px;"
                    class="tp-btn uni-button--warn">删除条件</button>
              </view> -->
            </view>
          </view>
          <!-- <view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-20">
            <button v-if="ifGroupIndex > 0" @click.prevent="deleteIfGroupsItem(ifGroupIndex)" class="tp-btn uni-button--warn">删除条件组</button>
          </view> -->
        </view>
        <view v-if="premiseForm.ifGroups.length === 0" class="empty-add-card" @click="addIfGroupItem(null)">＋ 添加条件</view>
        <!--
        <view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-20">
            <button @click.prevent="addIfGroupItem(null)" class="tp-btn">新增条件组</button>
        </view> -->
      </form>
      
    </view>
  </template>
  
  <script>
  import {
    configMetricsConditionMenu,
    deviceConfigAll,
    deviceListAll,
    deviceMetricsConditionMenu
  } from '@/api/modules/automation';
  import CustomSelect from '@/components/custom-select.vue';
  import AutomationTimeSheet from './automation-time-sheet.vue';
  import AutomationDatetimeSheet from './automation-datetime-sheet.vue';
  
  export default {
    components: { CustomSelect, AutomationTimeSheet, AutomationDatetimeSheet },
    data() {
      return {
        editingConditionKey: '',
        premiseFormRef: null,
        premiseForm: {
          ifGroups: []
        },
        premiseFormRules: {
          ifType: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          },
          trigger_conditions_type: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          },
          trigger_source: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          },
          trigger_param: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          },
          trigger_operator: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          },
          trigger_value: {
            required: true,
            message: this.$t('common.pleaseInput'),
            trigger: 'blur'
          },
          minValue: {
            required: true,
            message: this.$t('common.pleaseInput'),
            trigger: 'blur'
          },
          maxValue: {
            required: true,
            message: this.$t('common.pleaseInput'),
            trigger: 'blur'
          },
          onceTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          expiration_time: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          task_type: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          },
          hourTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          dayTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          weekChoseValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          weekTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          monthChoseValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          monthTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          startTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          endTimeValue: {
            required: true,
            message: this.$t('common.pleaseSelect')
          },
          weatherValue: {
            required: true,
            message: this.$t('common.pleaseSelect'),
            trigger: 'change'
          }
        },
        deviceConditionOptions: [
          {
            label: this.$t('pages.sceneAutomationEditor.singleDevice'),
            value: '10'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.singleDeviceType'),
            value: '11'
          }
        ],
        deviceConfigDisabled: false,
        deviceGroupOptions: [],
        deviceOptions: [],
        queryDevice: {
          group_id: null,
          device_name: null,
          bind_config: 0
        },
        btnloading: false,
        selectInstRef: {},
        queryDeviceName: [],
        deviceConfigOption: [],
        queryDeviceConfig: {
          device_config_name: ''
        },
        determineOptions: [
          {
            label: this.$t('pages.sceneAutomationEditor.equal'),
            value: '='
          },
          {
            label: this.$t('pages.sceneAutomationEditor.notEqual'),
            value: '!='
          },
          {
            label: this.$t('pages.sceneAutomationEditor.greaterThan'),
            value: '>'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.lessThan'),
            value: '<'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.greaterThanOrEqual'),
            value: '>='
          },
          {
            label: this.$t('pages.sceneAutomationEditor.lessThanOrEqual'),
            value: '<='
          },
          {
            label: this.$t('pages.sceneAutomationEditor.between'),
            value: 'between'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.in'),
            value: 'in'
          }
        ],
        // 其他数据属性
        judgeItem: {
          ifType: null,
          trigger_conditions_type: null,
          trigger_source: null,
          trigger_param_type: null,
          trigger_param: null,
          trigger_param_key: null,
          trigger_operator: null,
          trigger_value: null,
          minValue: null,
          maxValue: null,
          onceTimeValue: null,
          expiration_time: null,
          task_type: null,
          hourTimeValue: null,
          dayTimeValue: null,
          weekTimeValue: null,
          monthTimeValue: null,
          weekChoseValue: [],
          monthChoseValue: null,
          startTimeValue: null,
          endTimeValue: null,
          weatherValue: null,
          deviceGroupId: null,
          triggerParamOptions: []
        },
        message: null,
        // 时间条件类型下选项2使用的下拉
        timeConditionOptions: [
          {
            label: this.$t('pages.sceneAutomationEditor.singleTime'),
            value: '20'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.repeat'),
            value: '21'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.timeRange'),
            value: '22'
          }
        ],
        expirationTimeOptions: [
          {
            label: this.$t('pages.sceneAutomationEditor.fiveMinutes'),
            value: 5
          },
          {
            label: this.$t('pages.sceneAutomationEditor.tenMinutes'),
            value: 10
          },
          {
            label: this.$t('pages.sceneAutomationEditor.thirtyMinutes'),
            value: 30
          },
          {
            label: this.$t('pages.sceneAutomationEditor.oneHour'),
            value: 60
          },
          {
            label: this.$t('pages.sceneAutomationEditor.oneDay'),
            value: 1440
          }
        ],
        cycleOptions: [
          { label: this.$t('pages.sceneAutomationEditor.everyHour'), value: 'HOUR' },
          { label: this.$t('pages.sceneAutomationEditor.everyDay'), value: 'DAY' },
          { label: this.$t('pages.sceneAutomationEditor.everyWeek'), value: 'WEEK' },
          { label: this.$t('pages.sceneAutomationEditor.everyMonth'), value: 'MONTH' },
        ],
        weekOptions: [
          { label: this.$t('pages.sceneAutomationEditor.monday'), value: '1' },
          { label: this.$t('pages.sceneAutomationEditor.tuesday'), value: '2' },
          { label: this.$t('pages.sceneAutomationEditor.wednesday'), value: '3' },
          { label: this.$t('pages.sceneAutomationEditor.thursday'), value: '4' },
          { label: this.$t('pages.sceneAutomationEditor.friday'), value: '5' },
          { label: this.$t('pages.sceneAutomationEditor.saturday'), value: '6' },
          { label: this.$t('pages.sceneAutomationEditor.sunday'), value: '7' },
        ],
        monthRangeOptions: Array.from({ length: 31 }, (_, i) => ({
          label: String(i + 1),
          value: String(i + 1),
        })),
      };
    },
    computed: {
      // 计算过滤后的设备选项
    },
    props: {
      conditionData: {
        type: Array,
        default: function() {
          return [];
        }
      },
      device_id: {
        type: String,
        default: ''
      },
      device_config_id: {
        type: String,
        default: ''
      }
    },
    methods: {
      conditionKey(groupIndex, itemIndex) {
        return `${groupIndex}-${itemIndex}`;
      },
      isConditionEditing(groupIndex, itemIndex) {
        return this.editingConditionKey === this.conditionKey(groupIndex, itemIndex);
      },
      startConditionEdit(groupIndex, itemIndex) {
        this.editingConditionKey = this.conditionKey(groupIndex, itemIndex);
      },
      finishConditionEdit() {
        this.editingConditionKey = '';
      },
      getConditionSummary(item) {
        if (!item || !item.ifType) {
          return {
            title: this.$t('pages.sceneAutomationEditor.selectConditionType'),
            subtitle: '点击配置触发条件',
            detail: '设备、时间或状态变化'
          };
        }
        if (item.ifType === '2') {
          return this.getTimeConditionSummary(item);
        }
        const source = item.trigger_conditions_type === '11'
          ? this.getDeviceConfigDisplayText(item.trigger_source)
          : this.getDeviceDisplayText(item.trigger_source);
        const rawParam = this.getPickerDisplayText(
          item.triggerParamFlattenedOptions || [],
          item.trigger_param_key,
          'key',
          'fullLabel'
        ) || item.trigger_param || '请选择参数';
        const param = this.formatConditionParam(rawParam);
        const operator = this.getPickerDisplayText(this.determineOptions, item.trigger_operator, 'value', 'label');
        let value = item.trigger_value ?? '';
        if (item.trigger_operator === 'between') value = `${item.minValue ?? ''} - ${item.maxValue ?? ''}`;
        return {
          title: item.trigger_param_type === 'event' ? '设备事件' : this.$t('pages.sceneAutomationEditor.deviceCondition'),
          subtitle: source || (item.trigger_conditions_type === '11' ? '请选择设备类型' : '请选择设备'),
          detail: [param, operator, value].filter(Boolean).join('  ') || '请完成条件配置'
        };
      },
      formatConditionParam(value) {
        const text = String(value || '').trim();
        const leaf = text.includes('/') ? text.split('/').pop() : text;
        const labelMatch = leaf.match(/\(([^()]+)\)$/);
        return labelMatch ? labelMatch[1] : leaf;
      },
      getTimeConditionSummary(item) {
        const expiration = this.getPickerDisplayText(this.expirationTimeOptions, item.expiration_time, 'value', 'label');
        if (item.trigger_conditions_type === '20') {
          const date = item.onceTimeValue ? new Date(item.onceTimeValue) : null;
          return {
            title: this.$t('pages.sceneAutomationEditor.singleTime'),
            subtitle: date ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : '请选择日期',
            detail: [date ? this.formatTime(item.onceTimeValue) : '', expiration].filter(Boolean).join(' · ') || '请完成时间配置'
          };
        }
        if (item.trigger_conditions_type === '22') {
          return {
            title: this.$t('pages.sceneAutomationEditor.timeRange'),
            subtitle: this.formatWeekSummary(item.weekChoseValue),
            detail: `${this.formatTime(item.startTimeValue) || '--:--'} - ${this.formatTime(item.endTimeValue) || '--:--'}`
          };
        }
        const cycle = this.getPickerDisplayText(this.cycleOptions, item.task_type, 'value', 'label') || this.$t('pages.sceneAutomationEditor.repeat');
        let time = '';
        if (item.task_type === 'HOUR') time = item.hourTimeValue ? `第 ${this.formatMinuteTime(item.hourTimeValue)} 分钟` : '';
        if (item.task_type === 'DAY') time = this.formatTime(item.dayTimeValue);
        if (item.task_type === 'WEEK') time = `${this.formatWeekSummary(item.weekChoseValue)} ${this.formatTime(item.weekTimeValue)}`.trim();
        if (item.task_type === 'MONTH') time = item.monthChoseValue ? `每月 ${item.monthChoseValue} 日 ${this.formatTime(item.monthTimeValue)}` : '';
        return {
          title: this.$t('pages.sceneAutomationEditor.repeat'),
          subtitle: cycle,
          detail: [time, expiration].filter(Boolean).join(' · ') || '请完成时间配置'
        };
      },
      formatWeekSummary(values = []) {
        if (!Array.isArray(values) || values.length === 0) return '请选择星期';
        const normalized = values.map(String).sort();
        if (normalized.join('') === '12345') return '周一至周五';
        if (normalized.join('') === '1234567') return '每天';
        return normalized.map(value => {
          const option = this.weekOptions.find(item => String(item.value) === value);
          return option ? option.label : value;
        }).join('、');
      },
      getIfTypeOptions(ifGroup, ifIndex) {
        const options = [
          {
            label: this.$t('pages.sceneAutomationEditor.deviceCondition'),
            value: '1',
            disabled: ifGroup.some(item => {
              return (item.trigger_conditions_type === '20' || item.trigger_conditions_type === '21') && ifIndex > 0;
            })
          },
          {
            label: this.$t('pages.sceneAutomationEditor.timeCondition'),
            value: '2'
          }
        ];
        return options;
      },
      ifTypeChange(ifItem, value) {
        // 重置相关字段
        ifItem.trigger_conditions_type = null;
        ifItem.trigger_source = null;
        ifItem.trigger_param_type = null;
        ifItem.trigger_param = null;
        ifItem.trigger_param_key = null;
        ifItem.trigger_operator = null;
        ifItem.trigger_value = null;
        ifItem.minValue = null;
        ifItem.maxValue = null;
        ifItem.ifType = value;
        this.$forceUpdate();
      },
      triggerConditionsTypeChange(ifItem, value) {
        ifItem.trigger_conditions_type = value;
        ifItem.trigger_source = null;
        ifItem.trigger_param_type = null;
        ifItem.trigger_param = null;
        ifItem.trigger_param_key = null;
        ifItem.trigger_operator = null;
        ifItem.trigger_value = null;
        ifItem.minValue = null;
        ifItem.maxValue = null;
        ifItem.task_type = null;
        this.deviceConfigDisabled = false;
  
        if (value === '11') {
          this.deviceConfigDisabled = true;
        }
        this.$emit('conditionChose', value);
        this.$forceUpdate();
      },
      cycleChange(ifItem, value) {
        this.handleCycleChange(ifItem, value);
        ifItem.task_type = value;
        this.$forceUpdate();
      },
      async getDevice(groupId, name) {
        this.queryDevice.group_id = groupId || null;
        this.queryDevice.device_name = name || null;
        this.btnloading = false;
        this.deviceOptions = [];
        const res = await deviceListAll(this.queryDevice);
        this.btnloading = true;
        this.deviceOptions = res.data || [];
        // 更新过滤列表
        // 数据加载完成后强制更新视图，确保回显正确
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      },
      triggerSourceChange(ifItem, ifIndex) {
        ifItem.trigger_param_type = null;
        ifItem.trigger_param = null;
        ifItem.trigger_param_key = null;
        ifItem.trigger_operator = null;
        ifItem.trigger_value = null;
        ifItem.minValue = null;
        ifItem.maxValue = null;
        this.selectInstRef[ifIndex] = false;
      },
      triggerSourceChanged(ifItem, ifIndex) {
        this.triggerSourceChange(ifItem, ifIndex);
        this.actionParamShow(ifItem, true);
      },
      handleFocus(ifIndex) {
        this.queryDeviceName[ifIndex].focus();
      },
      async getDeviceConfig(name) {
        this.queryDeviceConfig.device_config_name = name || '';
        const res = await deviceConfigAll(this.queryDeviceConfig);
        this.deviceConfigOption = res.data || [];
        // 更新过滤列表
        // 数据加载完成后强制更新视图，确保回显正确
        this.$nextTick(() => {
          this.$forceUpdate();
        });
      },
      async actionParamShow(ifItem, data) {
        if (data === true && ifItem.trigger_source) {
          ifItem.triggerParamOptions = [];
          let res = null;
          if (ifItem.trigger_conditions_type === '10') {
            res = await deviceMetricsConditionMenu({
              device_id: ifItem.trigger_source
            });
          } else if (ifItem.trigger_conditions_type === '11') {
            res = await configMetricsConditionMenu({
              device_config_id: ifItem.trigger_source
            });
          }
          if (res.data) {
            res.data.map(item => {
              item.value = item.data_source_type;
              item.label = `${item.data_source_type}${item.label ? `(${item.label})` : ''}`;
              item.options.map(subItem => {
                subItem.value = `${item.value}/${subItem.key}`;
                subItem.label = `${subItem.key}${subItem.label ? `(${subItem.label})` : ''}`;
              });
            });
            ifItem.triggerParamOptions = res.data;
          }
          const statusData = {
            value: 'status',
            label: this.$t('pages.sceneAutomationEditor.status'),
            options: [
              {
                value: 'On-line',
                label: this.$t('pages.sceneAutomationEditor.online'),
                key: 'On-line'
              },
              {
                value: 'Off-line',
                label: this.$t('pages.sceneAutomationEditor.offline'),
                key: 'Off-line'
              },
              {
                value: 'All',
                label: this.$t('pages.sceneAutomationEditor.all'),
                key: 'All'
              }
            ]
          };
          ifItem.triggerParamOptions.push(statusData);
          ifItem.triggerParamFlattenedOptions = this.flattenTriggerParamOptions(ifItem.triggerParamOptions);
          this.$forceUpdate();
        }
      },
      flattenTriggerParamOptions(options) {
        const flattened = [];
        options.forEach((group, groupIndex) => {
          group.options.forEach((item, itemIndex) => {
            flattened.push({
              fullLabel: `${group.label}/${item.label}`,
              key: `${group.value}/${item.key}`,
              value: { groupIndex, itemIndex }
            });
          });
        });
        return flattened;
      },
      triggerParamChange(ifItem, key) {
        const flattenedOptions = ifItem.triggerParamFlattenedOptions;
        const selectedOption = flattenedOptions.find(option => option.key === key);
        if (selectedOption) {
          const group = ifItem.triggerParamOptions[selectedOption.value.groupIndex];
          const item = group.options[selectedOption.value.itemIndex];
          ifItem.trigger_param_type = group.value;
          ifItem.trigger_param = item.key;
          ifItem.trigger_param_key = key;
        }
        this.$forceUpdate();
      },
      formatMinuteTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const minutes = date.getMinutes().toString();
        return `${minutes}`;
      },
      onHourTimeChange(e, ifItem) {
        // 在这里处理时间改变的逻辑
        // 可能需要将选择的时间字符串转回时间戳
        const [hours, minutes] = e.detail.value.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        ifItem.hourTimeValue = date.getTime();
        this.$forceUpdate();
      },
      formatTime(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      },
      onDayTimeChange(e, ifItem) {
        const [hours, minutes] = e.detail.value.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        ifItem.dayTimeValue = date.getTime();
        this.$forceUpdate();
      },
      onWeekTimeChange(e, ifItem) {
        const [hours, minutes] = e.detail.value.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        ifItem.weekTimeValue = date.getTime();
        this.$forceUpdate();
      },
      onMonthTimeChange(e, ifItem) {
        const [hours, minutes] = e.detail.value.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        ifItem.monthTimeValue = date.getTime();
        this.$forceUpdate();
      },
      onStartTimeChange(e, ifItem, typeStr) {
        const [hours, minutes] = e.detail.value.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        ifItem.startTimeValue = date.getTime();
        this.$forceUpdate();
      },
      onEndTimeChange(e, ifItem, typeStr) {
        const [hours, minutes] = e.detail.value.split(':');
        const date = new Date();
        date.setHours(hours);
        date.setMinutes(minutes);
        ifItem.endTimeValue = date.getTime();
        this.$forceUpdate();
      },
      handleCycleChange(ifItem, value) {
        this.clearTaskValues(ifItem);
        this.$forceUpdate();
      },
      clearTaskValues(ifItem) {
        ifItem.hourTimeValue = null;
        ifItem.expiration_time = null;
        ifItem.dayTimeValue = null;
        ifItem.weekTimeValue = null;
        ifItem.monthChoseValue = null;
        ifItem.weekChoseValue = [];
        ifItem.monthTimeValue = null;
      },
      actionValueChange(ifItem) {
        if (ifItem.trigger_param_type === 'event') {
          try {
            JSON.parse(ifItem.trigger_value);
            if (typeof JSON.parse(ifItem.trigger_value) === 'object') {
              ifItem.inputFeedback = '';
              ifItem.inputValidationStatus = undefined;
            } else {
              uni.showToast({
                title: this.$t('pages.sceneAutomationEditor.jsonFormat'),
                icon: 'none'
              });
              ifItem.inputValidationStatus = 'error';
              ifItem.inputFeedback = this.$t('pages.sceneAutomationEditor.jsonFormat');
            }
          } catch (e) {
            uni.showToast({
              title: this.$t('pages.sceneAutomationEditor.jsonFormat'),
              icon: 'none'
            });
            ifItem.inputValidationStatus = 'error';
            ifItem.inputFeedback = this.$t('pages.sceneAutomationEditor.jsonFormat');
          }
        }
      },
      addIfGroupsSubItem(ifGroupIndex) {
        this.premiseForm.ifGroups[ifGroupIndex].push(JSON.parse(JSON.stringify(this.judgeItem)));
        this.$nextTick(() => this.startConditionEdit(ifGroupIndex, this.premiseForm.ifGroups[ifGroupIndex].length - 1));
      },
      deleteIfGroupsSubItem(ifGroupIndex, ifIndex) {
        this.premiseForm.ifGroups[ifGroupIndex].splice(ifIndex, 1);
      },
      deleteIfGroupsItem(ifIndex) {
        // create a new group which delete ifIndex item in ifGroups
        const newGroup = this.premiseForm.ifGroups.filter((item, index) => index !== ifIndex);
        this.premiseForm.ifGroups = newGroup; // .splice(ifIndex, 1);
      },
      addIfGroupItem(data) {
        const groupObj = [];
        if (!data) {
          groupObj.push(JSON.parse(JSON.stringify(this.judgeItem)));
          this.premiseForm.ifGroups.push(groupObj);
        } else {
          groupObj.push(data);
          this.premiseForm.ifGroups.push(groupObj);
        }
        this.$nextTick(() => this.startConditionEdit(this.premiseForm.ifGroups.length - 1, 0));
      },
      onWeekChoseValueChange(e, ifItem) {
        ifItem.weekChoseValue = e.detail.value;
      },
      onTapInput(item, ifIndex) {
        if (item.group_id || item.device_name) {
          this.getDevice(item.group_id, item.device_name);
        } else {
          this.selectInstRef[ifIndex] = true;
        }
      },
      onDeviceKeydownEnter(e, ifIndex) {
        this.selectInstRef[ifIndex] = true;
        e.preventDefault();
        return false;
      },
      onKeydownEnter(e) {
        e.preventDefault();
        return false;
      },
      getTimeConditionOptions(ifGroup) {
        return [
          {
            label: this.$t('pages.sceneAutomationEditor.singleTime'),
            value: '20'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.repeat'),
            value: '21'
          },
          {
            label: this.$t('pages.sceneAutomationEditor.timeRange'),
            value: '22'
          }
        ];
      },
      ifGroupsData() {
        return this.premiseForm.ifGroups;
      },
      isConditionComplete(item) {
        if (!item || !item.ifType || !item.trigger_conditions_type) return false;
        if (item.ifType === '1') {
          if (!item.trigger_source || !item.trigger_param_type || !item.trigger_param) return false;
          if (item.trigger_param_type === 'status') return true;
          if (item.trigger_param_type === 'event') {
            try {
              const eventValue = JSON.parse(String(item.trigger_value || ''));
              return eventValue !== null && typeof eventValue === 'object';
            } catch (_error) {
              return false;
            }
          }
          if (!item.trigger_operator) return false;
          if (item.trigger_operator === 'between') {
            return item.minValue !== null && item.minValue !== '' && item.maxValue !== null && item.maxValue !== '';
          }
          return item.trigger_value !== null && item.trigger_value !== undefined && item.trigger_value !== '';
        }
        if (item.trigger_conditions_type === '20') {
          return Boolean(item.onceTimeValue && item.expiration_time);
        }
        if (item.trigger_conditions_type === '21') {
          if (!item.task_type || !item.expiration_time) return false;
          if (item.task_type === 'HOUR') return Boolean(item.hourTimeValue);
          if (item.task_type === 'DAY') return Boolean(item.dayTimeValue);
          if (item.task_type === 'WEEK') return Boolean(item.weekChoseValue?.length && item.weekTimeValue);
          if (item.task_type === 'MONTH') return Boolean(item.monthChoseValue && item.monthTimeValue);
          return false;
        }
        if (item.trigger_conditions_type === '22') {
          return Boolean(item.weekChoseValue?.length && item.startTimeValue && item.endTimeValue);
        }
        return false;
      },
      validateConditions() {
        const groups = this.premiseForm.ifGroups;
        if (!Array.isArray(groups) || groups.length === 0) return '请至少添加一个条件';
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
          const group = groups[groupIndex];
          if (!Array.isArray(group) || group.length === 0) return `请完成第 ${groupIndex + 1} 组条件`;
          const invalidIndex = group.findIndex(item => !this.isConditionComplete(item));
          if (invalidIndex !== -1) {
            this.startConditionEdit(groupIndex, invalidIndex);
            return `请完成第 ${groupIndex + 1} 组第 ${invalidIndex + 1} 个条件`;
          }
          if (group.every(item => item.trigger_conditions_type === '22')) {
            return '同一条件组不能全部为时间范围';
          }
        }
        return true;
      },
      // Picker 相关方法
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
          if (itemValue === value) {
            return true;
          }
          if (String(itemValue) === String(value)) {
            return true;
          }
          const numItem = Number(itemValue);
          const numValue = Number(value);
          if (!isNaN(numItem) && !isNaN(numValue) && numItem === numValue) {
            return true;
          }
          return false;
        });
        return index >= 0 ? index : 0;
      },
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
          if (itemValue === value) {
            return true;
          }
          if (String(itemValue) === String(value)) {
            return true;
          }
          const numItem = Number(itemValue);
          const numValue = Number(value);
          if (!isNaN(numItem) && !isNaN(numValue) && numItem === numValue) {
            return true;
          }
          return false;
        });
        return option && option[labelKey] !== undefined && option[labelKey] !== null ? String(option[labelKey]) : '';
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
      // Picker change 事件处理
      onIfTypePickerChange(e, ifItem) {
        const index = e.detail.value;
        // 找到包含当前 ifItem 的组
        let ifGroupItem = null;
        let ifIndex = -1;
        for (let i = 0; i < this.premiseForm.ifGroups.length; i++) {
          const group = this.premiseForm.ifGroups[i];
          const itemIndex = group.findIndex(item => item === ifItem);
          if (itemIndex >= 0) {
            ifGroupItem = group;
            ifIndex = itemIndex;
            break;
          }
        }
        const options = this.getIfTypeOptions(ifGroupItem, ifIndex);
        const selectedValue = options[index] ? options[index].value : null;
        this.ifTypeChange(ifItem, selectedValue);
      },
      onDeviceConditionTypePickerChange(e, ifItem) {
        const index = e.detail.value;
        const selectedValue = this.deviceConditionOptions[index] ? this.deviceConditionOptions[index].value : null;
        this.triggerConditionsTypeChange(ifItem, selectedValue);
      },
      onTriggerParamPickerChange(e, ifItem) {
        const index = e.detail.value;
        const selectedValue = ifItem.triggerParamFlattenedOptions[index] ? ifItem.triggerParamFlattenedOptions[index].key : null;
        this.triggerParamChange(ifItem, selectedValue);
        this.actionParamShow(ifItem, true);
      },
      onTriggerOperatorPickerChange(e, ifItem) {
        const index = e.detail.value;
        const selectedValue = this.determineOptions[index] ? this.determineOptions[index].value : null;
        ifItem.trigger_operator = selectedValue;
        this.$forceUpdate();
      },
      onTimeConditionTypePickerChange(e, ifItem) {
        const index = e.detail.value;
        // 找到包含当前 ifItem 的组
        let ifGroupItem = null;
        for (let i = 0; i < this.premiseForm.ifGroups.length; i++) {
          const group = this.premiseForm.ifGroups[i];
          if (group.includes(ifItem)) {
            ifGroupItem = group;
            break;
          }
        }
        const options = this.getTimeConditionOptions(ifGroupItem);
        const selectedValue = options[index] ? options[index].value : null;
        ifItem.trigger_conditions_type = selectedValue;
        ifItem.task_type = null;
        this.$forceUpdate();
      },
      onExpirationTimePickerChange(e, ifItem) {
        const index = e.detail.value;
        const selectedValue = this.expirationTimeOptions[index] ? this.expirationTimeOptions[index].value : null;
        ifItem.expiration_time = selectedValue;
        this.$forceUpdate();
      },
      onCyclePickerChange(e, ifItem) {
        const index = e.detail.value;
        const selectedValue = this.cycleOptions[index] ? this.cycleOptions[index].value : null;
        this.handleCycleChange(ifItem, selectedValue);
        ifItem.task_type = selectedValue;
        this.$forceUpdate();
      },
      onMonthChoseValuePickerChange(e, ifItem) {
        const index = e.detail.value;
        const selectedValue = this.monthRangeOptions[index] ? this.monthRangeOptions[index].value : null;
        ifItem.monthChoseValue = selectedValue;
        this.$forceUpdate();
      },
    },
    watch: {
      conditionData(newValue) {
        console.log('valuechanged conditionData', newValue);
        if (newValue) {
          this.premiseForm.ifGroups = this.conditionData;
          // 确保设备列表加载完成后，触发参数显示
          this.$nextTick(() => {
            this.conditionData.forEach((group, index) => {
              group.forEach((item, subIndex) => {
                if(item.ifType === '1') {
                  this.actionParamShow(item, true);
                }
              });
            });
            this.$forceUpdate();
          });
        }
      }
    },
    async created() {
      this.message = this.$message;
      // this.configId = this.$route.query.id || null;
      console.log('created conditionData', this.conditionData);
      
      // 先加载设备列表和设备类型列表
      await Promise.all([
        this.getDevice(null, null),
        this.getDeviceConfig('')
      ]);
      
      if (!this.conditionData || this.conditionData.length === 0) {
        const judgeItemData = JSON.parse(JSON.stringify(this.judgeItem));
        if (this.device_id) {
          judgeItemData.ifType = '1';
          judgeItemData.trigger_conditions_type = '10';
          judgeItemData.trigger_source = this.device_id;
        } else if (this.device_config_id) {
          judgeItemData.ifType = '1';
          judgeItemData.trigger_conditions_type = '11';
          judgeItemData.trigger_source = this.device_config_id;
          this.deviceConfigDisabled = true;
        }
        this.$emit('conditionChose', judgeItemData.trigger_conditions_type);
        this.addIfGroupItem(judgeItemData);
      } else {
        this.premiseForm.ifGroups = this.conditionData;
        // 等待设备列表加载完成后再触发参数显示
        this.$nextTick(() => {
          this.conditionData.forEach((group, index) => {
            group.forEach((item, subIndex) => {
              if(item.ifType === '1') {
                this.actionParamShow(item, true);
              }
            });
          });
          this.$forceUpdate();
        });
      }
    }
  };
  </script>
  
  <style>
  @import '@/features/automation/styles/forms.css';
  .ifGroupItem-class {
    position: relative;
    display: block !important;
    margin: 0 0 6px !important;
    padding: 0 !important;
    overflow: visible;
    border: 2rpx solid #edf0f3;
    border-radius: 10px;
    box-shadow: 0 1px 4px rgba(34, 46, 66, 0.035);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    transition: none;
  }

  .ifGroupItem-class.has-relation { margin-top: 36px !important; }
  .relation-divider {
    position: absolute;
    left: 0;
    right: 0;
    top: -28px;
    display: flex;
    align-items: center;
    gap: 18rpx;
    color: #667085;
    font-size: 13px;
  }
  .relation-divider::before,
  .relation-divider::after { content: ''; flex: 1; height: 1rpx; background: #d0d5dd; }

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
  }

  .summary-icon-time { background: #eef5ff; }
  .summary-icon-device { background: #eaf9f3; }

  .summary-copy {
    display: flex;
    flex: 1;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .summary-title,
  .summary-line {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .summary-title { color: #172033; font-size: 14px; font-weight: 600; line-height: 19px; }
  .summary-line { color: #667085; font-size: 12px; line-height: 16px; }
  .summary-menu { display:flex; flex:0 0 44px; align-items:center; justify-content:center; width:44px; height:44px; margin:-6px -10px 0 0; box-sizing:border-box; }

  .condition-form-fields { padding: 0 12px; }

  form > .tp-flex { flex-direction: column; }

  .condition-card-controls {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    gap: 32rpx;
    width: 100%;
    min-height: 44px;
  }

  .condition-card-controls {
    padding: 0 10px;
    border-top: 1rpx solid #edf0f3;
  }

  .editor-action { display:flex; align-items:center; min-height:44px; color:#1677ff; font-size:14px; }
  .editor-action-danger { color: #ff3b30; }
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
  
  .tag-class {
    position: absolute;
    top: 5px;
  }
  
  .picker {
    padding: 10px;
    border: 2rpx solid #dfe4eb;
    border-radius: 16rpx;
  }
  
  .button-group {
    margin-top: 10px;
  }
  
  .uni-button--warn {
    background-color: #ff3b30;
    color: #fff;
  }
  
  .picker-wrapper {
    position: relative;
    min-height: 44px;
    border-bottom: 1rpx solid #edf0f3;
  }

  .datetime-form-row { display:flex; align-items:center; box-sizing:border-box; width:100%; min-height:48px; padding:0 2px; gap:8px; border-bottom:1px solid #edf0f3; }
  .datetime-label { flex:0 0 78px; color:#172033; font-size:13px; font-weight:500; line-height:18px; }
  .datetime-control { flex:1; min-width:0; }
  .automation-json-input { box-sizing:border-box; width:100%; min-height:88px; margin:8px 0; padding:10px 12px; color:#172033; background:#f7f8fa; border:1px solid #e4e7ec; border-radius:8px; font-family:ui-monospace, SFMono-Regular, Consolas, monospace; font-size:13px; line-height:19px; }
  .field-error { display:block; margin:-4px 0 8px; color:#ff3b30; font-size:12px; line-height:17px; }
  
  .picker-wrapper picker {
    flex: 1;
  }
  
  .picker-wrapper .uni-icons {
    margin-left: 8rpx;
    flex-shrink: 0;
  }
  
  .placeholder {
    color: #98a2b3;
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

.checkbox-space {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 12rpx;
  row-gap: 16rpx;
  width: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: #1e293b;
}

.checkbox-label checkbox {
  transform: scale(0.82);
  margin-right: 12rpx;
}

.time-range {
  display: flex;
  align-items: center;
  column-gap: 20rpx;
}

.time-range-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40rpx;
  color: #1e293b;
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

.scroll-view-equipment {
  max-height: 600rpx;
  padding: 0 30rpx;
  box-sizing: border-box;
}

.scroll-view-equipment scroll-view {
  height: 100%;
  box-sizing: border-box;
}

  </style>
