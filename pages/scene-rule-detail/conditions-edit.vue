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
                    <text class="tag-class">{{ '并且' }}</text>
                </view>
                <!-- 条件类型下拉-->
                <CustomSelect
                  v-model="ifItem.ifType"
                  :options="getIfTypeOptions(ifGroupItem, ifIndex)"
                  option-value="value"
                  option-label="label"
                  placeholder="请选择条件类型"
                  @change="(value) => ifTypeChange(ifItem, value)"
                />
                <view v-if="ifItem.ifType === '1'" class="flex-1">
                  <!-- 设备条件类型下拉-->
                  <CustomSelect
                    v-model="ifItem.trigger_conditions_type"
                    :options="deviceConditionOptions"
                    option-value="value"
                    option-label="label"
                    placeholder="请选择设备条件类型"
                    @change="(value) => triggerConditionsTypeChange(ifItem, value)"
                  />
                  <view v-if="ifItem.trigger_conditions_type === '10'">
                    <!-- 选择设备-->
                    <CustomSelect
                      v-model="ifItem.trigger_source"
                      :options="deviceOptions"
                      option-value="id"
                      option-label="name"
                      placeholder="请选择设备"
                      @change="(value) => { ifItem.trigger_source = value; triggerSourceChange(ifItem, ifIndex); }"
                    />
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '11'">
                    <!-- 选择设备类型-->
                    <CustomSelect
                      v-model="ifItem.trigger_source"
                      :options="deviceConfigOption"
                      option-value="id"
                      option-label="name"
                      placeholder="请选择设备类型"
                      @change="(value) => { ifItem.trigger_source = value; triggerSourceChange(ifItem, ifIndex); }"
                    />
                  </view>
                  <view v-if="ifItem.trigger_source">
                    <!-- 选择触发参数-->
                    <CustomSelect
                      v-model="ifItem.trigger_param_key"
                      :options="ifItem.triggerParamFlattenedOptions"
                      option-value="key"
                      option-label="fullLabel"
                      placeholder="请选择参数"
                      @change="(value) => triggerParamChange(ifItem, value)"
                      @click="() => actionParamShow(ifItem, true)"
                    />
                    <view v-if="ifItem.trigger_param_type === 'telemetry' || ifItem.trigger_param_type === 'attributes'">
                      <!-- 选择操作符-->
                      <CustomSelect
                        v-model="ifItem.trigger_operator"
                        :options="determineOptions"
                        option-value="value"
                        option-label="label"
                        placeholder="请选择操作符"
                      />
                      <view v-if="ifItem.trigger_operator === 'in'">
                        <!-- 输入范围值-->
                        <input v-model="ifItem.trigger_value" placeholder="用逗号分隔多个值" class="uni-input" />
                      </view>
                      <view v-else-if="ifItem.trigger_operator == 'between'">
                        <!-- 输入最小值和最大值-->
                        <input v-model="ifItem.minValue" placeholder="最小值" class="uni-input" />
                        <input v-model="ifItem.maxValue" placeholder="最大值" class="uni-input" />
                      </view>
                      <view v-else>
                        <!-- 输入目标值-->
                        <input v-model="ifItem.trigger_value" placeholder="值" class="uni-input" />
                      </view>
                    </view>
                    <view v-if="ifItem.trigger_param_type === 'event'">
                      <!-- 输入事件参数-->
                      <input v-model="ifItem.trigger_value" placeholder="参数，如：{'param1':1}" class="uni-input" @blur="() => actionValueChange(ifItem)" />
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
                    placeholder="请选择时间条件类型"
                    @change="(value) => { ifItem.trigger_conditions_type = value; ifItem.task_type = null; this.$forceUpdate(); }"
                  />
                  <view v-if="ifItem.trigger_conditions_type === '20'">
                    <uni-datetime-picker
                      v-model="ifItem.onceTimeValue"
                      type="datetime"
                      return-type="timestamp"
                      format="yyyy-MM-dd HH:mm"
                      :clear-icon="false"
                      placeholder="请选择日期和时间"
                      :fields="['year', 'month', 'day', 'hour', 'minute']"
                      :hide-second="true"
                    />
                    <!-- 过期时间-->
                    <CustomSelect
                      v-model="ifItem.expiration_time"
                      :options="expirationTimeOptions"
                      option-value="value"
                      option-label="label"
                      placeholder="请选择过期时间"
                    />
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '21'">
                    <!-- 时间条件下 -> 重复 -> 选择周期 -->
                    <view class="form-item">
                      <CustomSelect
                        v-model="ifItem.task_type"
                        :options="cycleOptions"
                        placeholder="请选择周期"
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
                        <view class="uni-input">{{ formatMinuteTime(ifItem.hourTimeValue) || '请选择分钟' }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        placeholder="请选择过期时间"
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
                        <view class="uni-input">{{ formatTime(ifItem.dayTimeValue) || '请选择时间' }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        placeholder="请选择过期时间"
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
                        <view class="uni-input">{{ formatTime(ifItem.weekTimeValue) || '请选择时间' }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        placeholder="请选择过期时间"
                      />
                    </view>

                    <!-- 每月 -> 选择日期和时间 -->
                    <view v-if="ifItem.task_type === 'MONTH'" class="form-item">
                      <CustomSelect
                        v-model="ifItem.monthChoseValue"
                        :value="ifItem.monthChoseValue"
                        :options="monthRangeOptions"
                        placeholder="请选择日期"
                      />
                      <picker
                        mode="time"
                        v-model="ifItem.monthTimeValue"
                        :value="formatTime(ifItem.monthTimeValue)"
                        @change="(e) => onMonthTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.monthTimeValue) || '请选择时间' }}</view>
                      </picker>
                      <CustomSelect
                        v-model="ifItem.expiration_time"
                        :options="expirationTimeOptions"
                        placeholder="请选择过期时间"
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
                        <view class="uni-input">{{ formatTime(ifItem.startTimeValue) || '请选择开始时间' }}</view>
                      </picker>
                      -
                      <picker
                        mode="time"
                        v-model="ifItem.endTimeValue"
                        :value="formatTime(ifItem.endTimeValue)"
                        @change="(e) => onEndTimeChange(e, ifItem)"
                      >
                        <view class="uni-input">{{ formatTime(ifItem.endTimeValue) || '请选择结束时间' }}</view>
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
            message: '请选择',
            trigger: 'change'
          },
          trigger_conditions_type: {
            required: true,
            message: '请选择',
            trigger: 'change'
          },
          trigger_source: {
            required: true,
            message: '请选择',
            trigger: 'change'
          },
          trigger_param: {
            required: true,
            message: '请选择',
            trigger: 'change'
          },
          trigger_operator: {
            required: true,
            message: '请选择',
            trigger: 'change'
          },
          trigger_value: {
            required: true,
            message: '请输入',
            trigger: 'blur'
          },
          minValue: {
            required: true,
            message: '请输入',
            trigger: 'blur'
          },
          maxValue: {
            required: true,
            message: '请输入',
            trigger: 'blur'
          },
          onceTimeValue: {
            required: true,
            message: '请选择'
          },
          expiration_time: {
            required: true,
            message: '请选择'
          },
          task_type: {
            required: true,
            message: '请选择',
            trigger: 'change'
          },
          hourTimeValue: {
            required: true,
            message: '请选择'
          },
          dayTimeValue: {
            required: true,
            message: '请选择'
          },
          weekChoseValue: {
            required: true,
            message: '请选择'
          },
          weekTimeValue: {
            required: true,
            message: '请选择'
          },
          monthChoseValue: {
            required: true,
            message: '请选择'
          },
          monthTimeValue: {
            required: true,
            message: '请选择'
          },
          startTimeValue: {
            required: true,
            message: '请选择'
          },
          endTimeValue: {
            required: true,
            message: '请选择'
          },
          weatherValue: {
            required: true,
            message: '请选择',
            trigger: 'change'
          }
        },
        deviceConditionOptions: [
          {
            label: '单个设备',
            value: '10'
          },
          {
            label: '单类设备',
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
            label: '等于',
            value: '='
          },
          {
            label: '不等于',
            value: '!='
          },
          {
            label: '大于',
            value: '>'
          },
          {
            label: '小于',
            value: '<'
          },
          {
            label: '大于等于',
            value: '>='
          },
          {
            label: '小于等于',
            value: '<='
          },
          {
            label: '介于',
            value: 'between'
          },
          {
            label: '包含在',
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
            label: '单次',
            value: '20'
          },
          {
            label: '重复',
            value: '21'
          },
          {
            label: '时间范围',
            value: '22'
          }
        ],
        expirationTimeOptions: [
          {
            label: '5分钟',
            value: 5
          },
          {
            label: '10分钟',
            value: 10
          },
          {
            label: '30分钟',
            value: 30
          },
          {
            label: '1小时',
            value: 60
          },
          {
            label: '1天',
            value: 1140
          }
        ],
        cycleOptions: [
          { label: '每小时', value: 'HOUR' },
          { label: '每天', value: 'DAY' },
          { label: '每周', value: 'WEEK' },
          { label: '每月', value: 'MONTH' },
        ],
        weekOptions: [
          { label: '星期一', value: '1' },
          { label: '星期二', value: '2' },
          { label: '星期三', value: '3' },
          { label: '星期四', value: '4' },
          { label: '星期五', value: '5' },
          { label: '星期六', value: '6' },
          { label: '星期日', value: '7' },
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
            label: '设备条件',
            value: '1',
            disabled: ifGroup.some(item => {
              return (item.trigger_conditions_type === '20' || item.trigger_conditions_type === '21') && ifIndex > 0;
            })
          },
          {
            label: '时间条件',
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
            label: 'status(状态)',
            options: [
              {
                value: 'On-line',
                label: 'On-line(上线)',
                key: 'On-line'
              },
              {
                value: 'Off-line',
                label: 'Off-line(下线)',
                key: 'Off-line'
              },
              {
                value: 'All',
                label: 'All(全部)',
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
      triggerParamChange(ifItem, fullLabel) {
        const flattenedOptions = ifItem.triggerParamFlattenedOptions;
        const selectedOption = flattenedOptions.find(option => option.fullLabel === fullLabel);
        if (selectedOption) {
          const group = ifItem.triggerParamOptions[selectedOption.value.groupIndex];
          const item = group.options[selectedOption.value.itemIndex];
          ifItem.trigger_param_type = group.value;
          ifItem.trigger_param = item.key;
          ifItem.trigger_param_key = fullLabel;
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
                title: '请输入JSON格式',
                icon: 'none'
              });
              ifItem.inputValidationStatus = 'error';
            }
          } catch (e) {
            uni.showToast({
              title: '请输入JSON格式',
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
            label: '单次',
            value: '20'
          },
          {
            label: '重复',
            value: '21'
          },
          {
            label: '时间范围',
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
  