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
            >
              <view class="tp-flex-1 tp-flex">
              <view class="tp-flex-1">
                <view v-if="ifIndex !== 0" class="tp-box-sizing tp-mg-t-30 tp-mg-b-15 tp-mg-l-r-20  uni-bold">
                    <text class="tag-class">{{ $t('pages.sceneRuleDetail.and') }}</text>
                </view>
                <!-- 条件类型下拉-->
                <CustomSelect
                  v-model="ifItem.ifType"
                  :options="getIfTypeOptions(ifGroupItem, ifIndex)"
                  option-value="value"
                  option-label="label"
                  :placeholder="$t('pages.sceneRuleDetail.selectConditionType')"
                  @change="(value) => ifTypeChange(ifItem, value)"
                />
                <view v-if="ifItem.ifType === '1'" class="flex-1">
                  <!-- 设备条件类型下拉-->
                  <CustomSelect
                    v-model="ifItem.trigger_conditions_type"
                    :options="deviceConditionOptions"
                    option-value="value"
                    option-label="label"
                    :placeholder="$t('pages.sceneRuleDetail.selectDeviceConditionType')"
                    @change="(value) => triggerConditionsTypeChange(ifItem, value)"
                  />
                  <view v-if="ifItem.trigger_conditions_type === '10'">
                    <!-- 选择设备-->
                    <CustomSelect
                      v-model="ifItem.trigger_source"
                      :options="deviceOptions"
                      option-value="id"
                      option-label="name"
                      :placeholder="$t('pages.sceneRuleDetail.selectDevice')"
                      @change="(value) => { ifItem.trigger_source = value; triggerSourceChange(ifItem, ifIndex); actionParamShow(ifItem, true); }"
                    />
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '11'">
                    <!-- 选择设备类型-->
                    <CustomSelect
                      v-model="ifItem.trigger_source"
                      :options="deviceConfigOption"
                      option-value="id"
                      option-label="name"
                      :placeholder="$t('pages.sceneRuleDetail.selectDeviceType')"
                      @change="(value) => { ifItem.trigger_source = value; triggerSourceChange(ifItem, ifIndex); actionParamShow(ifItem, true); }"
                    />
                  </view>
                  <view v-if="ifItem.trigger_source">
                    <!-- 选择触发参数-->
                    <CustomSelect
                      v-model="ifItem.trigger_param_key"
                      :options="ifItem.triggerParamFlattenedOptions"
                      option-value="key"
                      option-label="fullLabel"
                      :placeholder="$t('pages.sceneRuleDetail.selectParameter')"
                      @change="(value) => { triggerParamChange(ifItem, value); actionParamShow(ifItem, true); } "
                    />
                    <view v-if="ifItem.trigger_param_type === 'telemetry' || ifItem.trigger_param_type === 'attributes'">
                      <!-- 选择操作符-->
                      <CustomSelect
                        v-model="ifItem.trigger_operator"
                        :options="determineOptions"
                        option-value="value"
                        option-label="label"
                        :placeholder="$t('pages.sceneRuleDetail.selectOperator')"
                      />
                      <view v-if="ifItem.trigger_operator === 'in'">
                        <!-- 输入范围值-->
                        <input v-model="ifItem.trigger_value" :placeholder="$t('pages.sceneRuleDetail.commaSeparatedValues')" class="uni-input" />
                      </view>
                      <view v-else-if="ifItem.trigger_operator == 'between'">
                        <!-- 输入最小值和最大值-->
                        <input v-model="ifItem.minValue" :placeholder="$t('pages.sceneRuleDetail.minValue')" class="uni-input" />
                        <input v-model="ifItem.maxValue" :placeholder="$t('pages.sceneRuleDetail.maxValue')" class="uni-input" />
                      </view>
                      <view v-else>
                        <!-- 输入目标值-->
                        <input v-model="ifItem.trigger_value" :placeholder="$t('pages.sceneRuleDetail.value')" class="uni-input" />
                      </view>
                    </view>
                    <view v-if="ifItem.trigger_param_type === 'event'">
                      <!-- 输入事件参数-->
                      <input v-model="ifItem.trigger_value" :placeholder="$t('pages.sceneRuleDetail.eventParamExample')" class="uni-input" @blur="() => actionValueChange(ifItem)" />
                    </view>
                  </view>
                </view>
                <!-- 时间条件 -->
                <view v-if="ifItem.ifType === '2'" class="flex-1">
                  <!-- 时间条件类型下拉-->
                  <CustomSelect
                    v-model="ifItem.trigger_conditions_type"
                    :options="getTimeConditionOptions(ifGroupItem)"
                    option-value="value"
                    option-label="label"
                    :placeholder="$t('pages.sceneRuleDetail.selectTimeConditionType')"
                    @change="(value) => { ifItem.trigger_conditions_type = value; ifItem.task_type = null; this.$forceUpdate(); }"
                  />
                  <view v-if="ifItem.trigger_conditions_type === '20'">
                    <uni-datetime-picker
                      v-model="ifItem.onceTimeValue"
                      type="datetime"
                      return-type="timestamp"
                      format="yyyy-MM-dd HH:mm"
                      :clear-icon="false"
                      :placeholder="$t('pages.sceneRuleDetail.selectDateTime')"
                      :fields="['year', 'month', 'day', 'hour', 'minute']"
                      :hide-second="true"
                    />
                    <!-- 过期时间-->
                    <CustomSelect
                      v-model="ifItem.expiration_time"
                      :options="expirationTimeOptions"
                      option-value="value"
                      option-label="label"
                      :placeholder="$t('pages.sceneRuleDetail.selectExpirationTime')"
                    />
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '21'">
                    <!-- 时间条件下 -> 重复 -> 选择周期 -->
                    <view class="form-item">
                      <CustomSelect
                        v-model="ifItem.task_type"
                        :options="cycleOptions"
                        :placeholder="$t('pages.sceneRuleDetail.selectCycle')"
                        @change="(value) => handleCycleChange(ifItem, value)"
                      />
                    </view>

                    <!-- 每小时 -> 选择分 -->
                    <view v-if="ifItem.task_type === 'HOUR'" class="form-item">
                      <picker
                        mode="time"
                        v-model="ifItem.hourTimeValue"
                        :value="formatMinuteTime(ifItem.hourTimeValue)"
                        @change="(e) => onHourTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatMinuteTime(ifItem.hourTimeValue) || $t('pages.sceneRuleDetail.selectMinute') }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneRuleDetail.selectExpirationTime')"
                      />
                    </view>

                    <!-- 每天 -> 选择时分秒 -->
                    <view v-if="ifItem.task_type === 'DAY'" class="form-item">
                      <picker
                        mode="time"
                        v-model="ifItem.dayTimeValue"
                        :value="formatTime(ifItem.dayTimeValue)"
                        @change="(e) => onDayTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.dayTimeValue) || $t('pages.sceneRuleDetail.selectTime') }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneRuleDetail.selectExpirationTime')"
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
                      <picker
                        mode="time"
                        v-model="ifItem.weekTimeValue"
                        :value="formatTime(ifItem.weekTimeValue)"
                        @change="(e) => onWeekTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.weekTimeValue) || $t('pages.sceneRuleDetail.selectTime') }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneRuleDetail.selectExpirationTime')"
                      />
                    </view>

                    <!-- 每月 -> 选择日期和时间 -->
                    <view v-if="ifItem.task_type === 'MONTH'" class="form-item">
                      <CustomSelect
                        v-model="ifItem.monthChoseValue"
                        :value="ifItem.monthChoseValue"
                        :options="monthRangeOptions"
                        :placeholder="$t('pages.sceneRuleDetail.selectDate')"
                      />
                      <picker
                        mode="time"
                        v-model="ifItem.monthTimeValue"
                        :value="formatTime(ifItem.monthTimeValue)"
                        @change="(e) => onMonthTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.monthTimeValue) || $t('pages.sceneRuleDetail.selectTime') }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        :placeholder="$t('pages.sceneRuleDetail.selectExpirationTime')"
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
                      <picker
                        mode="time"
                        v-model="ifItem.startTimeValue"
                        :value="formatTime(ifItem.startTimeValue)"
                        @change="(e) => onStartTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.startTimeValue) || $t('pages.sceneRuleDetail.selectStartTime') }}</view>
                      </picker>
                      -
                      <picker
                        mode="time"
                        v-model="ifItem.endTimeValue"
                        :value="formatTime(ifItem.endTimeValue)"
                        @change="(e) => onEndTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.endTimeValue) || $t('pages.sceneRuleDetail.selectEndTime') }}</view>
                      </picker>
                    </view>
                  </view>
                  <!-- 其他时间条件类型的处理，省略 -->
                </view>
              </view>
              </view>
              <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
                <!-- 条件数量大于1条时才允许删除 -->
                <uni-icons 
                  v-if="ifIndex !== 0"
                  class="tp-mg-t-b-10"
                  type="minus" 
                  size="40rpx" 
                  color="red"
                  @click="deleteIfGroupsSubItem(ifGroupIndex, ifIndex)"
                ></uni-icons>
                
                <!-- 仅最后一个显示新增 -->
                <uni-icons
                  v-if="ifIndex === ifGroupItem.length - 1"
                  class="tp-mg-t-b-10"
                  type="plus" 
                  size="40rpx"
                  color="#2979ff"
                  @click="addIfGroupsSubItem(ifGroupIndex)"
                ></uni-icons>
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
          <view style="width:64rpx" class="tp-flex tp-flex-col tp-flex-j-c tp-mg-l-10">
            <!-- 条件数量大于1条时才允许删除 -->
            <uni-icons 
              v-if="premiseForm.ifGroups.length > 1"
              class="tp-mg-t-b-10"
              type="minus" 
              size="40rpx" 
              color="red"
              @click="deleteIfGroupsItem(ifGroupIndex)"
            ></uni-icons>
            
            <!-- 仅最后一个显示新增 -->
            <uni-icons
              v-if="ifGroupIndex === premiseForm.ifGroups.length - 1"
              class="tp-mg-t-b-10"
              type="plus" 
              size="40rpx"
              color="#2979ff"
              @click="addIfGroupItem(null)"
            ></uni-icons>
          </view>
        </view>
        <!--
        <view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-20">
            <button @click.prevent="addIfGroupItem(null)" class="tp-btn">新增条件组</button>
        </view> -->
      </form>
    </view>
  </template>
  
  <script>
  import CustomSelect from '@/components/custom-select.vue';
  import {
    configMetricsConditionMenu,
    deviceConfigAll,
    deviceListAll,
    deviceMetricsConditionMenu
  } from '@/service/automation';
  
  export default {
    components: {
      CustomSelect
    },
    data() {
      return {
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
            label: this.$t('pages.sceneRuleDetail.singleDevice'),
            value: '10'
          },
          {
            label: this.$t('pages.sceneRuleDetail.singleDeviceType'),
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
            label: this.$t('pages.sceneRuleDetail.equal'),
            value: '='
          },
          {
            label: this.$t('pages.sceneRuleDetail.notEqual'),
            value: '!='
          },
          {
            label: this.$t('pages.sceneRuleDetail.greaterThan'),
            value: '>'
          },
          {
            label: this.$t('pages.sceneRuleDetail.lessThan'),
            value: '<'
          },
          {
            label: this.$t('pages.sceneRuleDetail.greaterThanOrEqual'),
            value: '>='
          },
          {
            label: this.$t('pages.sceneRuleDetail.lessThanOrEqual'),
            value: '<='
          },
          {
            label: this.$t('pages.sceneRuleDetail.between'),
            value: 'between'
          },
          {
            label: this.$t('pages.sceneRuleDetail.in'),
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
            label: this.$t('pages.sceneRuleDetail.singleTime'),
            value: '20'
          },
          {
            label: this.$t('pages.sceneRuleDetail.repeat'),
            value: '21'
          },
          {
            label: this.$t('pages.sceneRuleDetail.timeRange'),
            value: '22'
          }
        ],
        expirationTimeOptions: [
          {
            label: this.$t('pages.sceneRuleDetail.fiveMinutes'),
            value: 5
          },
          {
            label: this.$t('pages.sceneRuleDetail.tenMinutes'),
            value: 10
          },
          {
            label: this.$t('pages.sceneRuleDetail.thirtyMinutes'),
            value: 30
          },
          {
            label: this.$t('pages.sceneRuleDetail.oneHour'),
            value: 60
          },
          {
            label: this.$t('pages.sceneRuleDetail.oneDay'),
            value: 1140
          }
        ],
        cycleOptions: [
          { label: this.$t('pages.sceneRuleDetail.everyHour'), value: 'HOUR' },
          { label: this.$t('pages.sceneRuleDetail.everyDay'), value: 'DAY' },
          { label: this.$t('pages.sceneRuleDetail.everyWeek'), value: 'WEEK' },
          { label: this.$t('pages.sceneRuleDetail.everyMonth'), value: 'MONTH' },
        ],
        weekOptions: [
          { label: this.$t('pages.sceneRuleDetail.monday'), value: '1' },
          { label: this.$t('pages.sceneRuleDetail.tuesday'), value: '2' },
          { label: this.$t('pages.sceneRuleDetail.wednesday'), value: '3' },
          { label: this.$t('pages.sceneRuleDetail.thursday'), value: '4' },
          { label: this.$t('pages.sceneRuleDetail.friday'), value: '5' },
          { label: this.$t('pages.sceneRuleDetail.saturday'), value: '6' },
          { label: this.$t('pages.sceneRuleDetail.sunday'), value: '7' },
        ],
        monthRangeOptions: Array.from({ length: 31 }, (_, i) => ({
          label: String(i + 1),
          value: String(i + 1),
        })),
      };
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
      getIfTypeOptions(ifGroup, ifIndex) {
        const options = [
          {
            label: this.$t('pages.sceneRuleDetail.deviceCondition'),
            value: '1',
            disabled: ifGroup.some(item => {
              return (item.trigger_conditions_type === '20' || item.trigger_conditions_type === '21') && ifIndex > 0;
            })
          },
          {
            label: this.$t('pages.sceneRuleDetail.timeCondition'),
            value: '2'
          }
        ];
        return options;
      },
      ifTypeChange(ifItem, value) {
        ifItem.trigger_conditions_type = null;
        // eslint-disable-next-line no-param-reassign
        ifItem = this.judgeItem;
        ifItem.ifType = value;
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
        this.deviceConfigDisabled = false;
  
        if (value === '11') {
          this.deviceConfigDisabled = true;
        }
        this.$emit('conditionChose', value);
      },
      async getDevice(groupId, name) {
        this.queryDevice.group_id = groupId || null;
        this.queryDevice.device_name = name || null;
        this.btnloading = false;
        this.deviceOptions = [];
        const res = await deviceListAll(this.queryDevice);
        this.btnloading = true;
        this.deviceOptions = res.data || [];
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
      handleFocus(ifIndex) {
        this.queryDeviceName[ifIndex].focus();
      },
      async getDeviceConfig(name) {
        this.queryDeviceConfig.device_config_name = name || '';
        const res = await deviceConfigAll(this.queryDeviceConfig);
        this.deviceConfigOption = res.data || [];
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
            label: this.$t('pages.sceneRuleDetail.status'),
            options: [
              {
                value: 'On-line',
                label: this.$t('pages.sceneRuleDetail.online'),
                key: 'On-line'
              },
              {
                value: 'Off-line',
                label: this.$t('pages.sceneRuleDetail.offline'),
                key: 'Off-line'
              },
              {
                value: 'All',
                label: this.$t('pages.sceneRuleDetail.all'),
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
                title: this.$t('pages.sceneRuleDetail.jsonFormat'),
                icon: 'none'
              });
              ifItem.inputValidationStatus = 'error';
            }
          } catch (e) {
            uni.showToast({
              title: this.$t('pages.sceneRuleDetail.jsonFormat'),
              icon: 'none'
            });
            ifItem.inputValidationStatus = 'error';
          }
        }
      },
      addIfGroupsSubItem(ifGroupIndex) {
        this.premiseForm.ifGroups[ifGroupIndex].push(JSON.parse(JSON.stringify(this.judgeItem)));
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
            label: this.$t('pages.sceneRuleDetail.singleTime'),
            value: '20'
          },
          {
            label: this.$t('pages.sceneRuleDetail.repeat'),
            value: '21'
          },
          {
            label: this.$t('pages.sceneRuleDetail.timeRange'),
            value: '22'
          }
        ];
      },
      ifGroupsData() {
        return this.premiseForm.ifGroups;
      }
    },
    watch: {
      conditionData(newValue) {
        console.log('valuechanged conditionData', newValue);
        if (newValue) {
          this.premiseForm.ifGroups = this.conditionData;
          this.$forceUpdate();
        }
      }
    },
    created() {
      this.message = this.$message;
      // this.configId = this.$route.query.id || null;
      console.log('created conditionData', this.conditionData);
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
        this.conditionData.forEach((group, index) => {
            group.forEach((item, subIndex) => {
              if(item.ifType === '1') {
                this.actionParamShow(item, true);
              }
            });
        });
      }
      this.getDevice(null, null);
      this.getDeviceConfig('');
    }
  };
  </script>
  
  <style>
  @import '@/common/alert-strategy.css';
  .ifGroupItem-class {
    position: relative;
  }
  
  .tag-class {
    position: absolute;
    top: 5px;
  }
  
  .picker {
    padding: 10px;
    border: 1px solid #ccc;
  }
  
  .button-group {
    margin-top: 10px;
  }
  
  .uni-button--warn {
    background-color: #f56c6c;
    color: #fff;
  }
  </style>
