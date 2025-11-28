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
                <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                  <picker
                    mode="selector"
                    :range="getIfTypeOptions(ifGroupItem, ifIndex)"
                    range-key="label"
                    :value="getPickerIndex(getIfTypeOptions(ifGroupItem, ifIndex), ifItem.ifType, 'value')"
                    @change="(e) => onIfTypePickerChange(e, ifItem)"
                    class="tp-flex-1"
                  >
                    <view class="uni-input" :class="!ifItem.ifType && 'placeholder'">
                      {{ getPickerDisplayText(getIfTypeOptions(ifGroupItem, ifIndex), ifItem.ifType, 'value', 'label') || $t('pages.sceneRuleDetail.selectConditionType') }}
                    </view>
                  </picker>
                  <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                </view>
                <view v-if="ifItem.ifType === '1'" class="flex-1">
                  <!-- 设备条件类型下拉-->
                  <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                    <picker
                      mode="selector"
                      :range="deviceConditionOptions"
                      range-key="label"
                      :value="getPickerIndex(deviceConditionOptions, ifItem.trigger_conditions_type, 'value')"
                      @change="(e) => onDeviceConditionTypePickerChange(e, ifItem)"
                      class="tp-flex-1"
                    >
                      <view class="uni-input" :class="!ifItem.trigger_conditions_type && 'placeholder'">
                        {{ getPickerDisplayText(deviceConditionOptions, ifItem.trigger_conditions_type, 'value', 'label') || $t('pages.sceneRuleDetail.selectDeviceConditionType') }}
                      </view>
                    </picker>
                    <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '10'">
                    <!-- 选择设备-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @tap="showDevicePopup(ifItem, ifIndex)">
                        <view class="uni-input" :class="!ifItem.trigger_source && 'placeholder'">
                          {{ getDeviceDisplayText(ifItem.trigger_source) || $t('pages.sceneRuleDetail.selectDevice') }}
                        </view>
                      </view>
                      <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                    </view>
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '11'">
                    <!-- 选择设备类型-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <view class="tp-flex-1 tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c" @tap="showDeviceConfigPopup(ifItem, ifIndex)">
                        <view class="uni-input" :class="!ifItem.trigger_source && 'placeholder'">
                          {{ getDeviceConfigDisplayText(ifItem.trigger_source) || $t('pages.sceneRuleDetail.selectDeviceType') }}
                        </view>
                      </view>
                      <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                    </view>
                  </view>
                  <view v-if="ifItem.trigger_source">
                    <!-- 选择触发参数-->
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <picker
                        mode="selector"
                        :range="ifItem.triggerParamFlattenedOptions || []"
                        range-key="fullLabel"
                        :value="getPickerIndex(ifItem.triggerParamFlattenedOptions || [], ifItem.trigger_param_key, 'key')"
                        @change="(e) => onTriggerParamPickerChange(e, ifItem)"
                        class="tp-flex-1"
                      >
                        <view class="uni-input" :class="!ifItem.trigger_param_key && 'placeholder'">
                          {{ getPickerDisplayText(ifItem.triggerParamFlattenedOptions || [], ifItem.trigger_param_key, 'key', 'fullLabel') || $t('pages.sceneRuleDetail.selectParameter') }}
                        </view>
                      </picker>
                      <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                    </view>
                    <view v-if="ifItem.trigger_param_type === 'telemetry' || ifItem.trigger_param_type === 'attributes'">
                      <!-- 选择操作符-->
                      <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                        <picker
                          mode="selector"
                          :range="determineOptions"
                          range-key="label"
                          :value="getPickerIndex(determineOptions, ifItem.trigger_operator, 'value')"
                          @change="(e) => onTriggerOperatorPickerChange(e, ifItem)"
                          class="tp-flex-1"
                        >
                          <view class="uni-input" :class="!ifItem.trigger_operator && 'placeholder'">
                            {{ getPickerDisplayText(determineOptions, ifItem.trigger_operator, 'value', 'label') || $t('pages.sceneRuleDetail.selectOperator') }}
                          </view>
                        </picker>
                        <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                      </view>
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
                  <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                    <picker
                      mode="selector"
                      :range="getTimeConditionOptions(ifGroupItem)"
                      range-key="label"
                      :value="getPickerIndex(getTimeConditionOptions(ifGroupItem), ifItem.trigger_conditions_type, 'value')"
                      @change="(e) => onTimeConditionTypePickerChange(e, ifItem)"
                      class="tp-flex-1"
                    >
                      <view class="uni-input" :class="!ifItem.trigger_conditions_type && 'placeholder'">
                        {{ getPickerDisplayText(getTimeConditionOptions(ifGroupItem), ifItem.trigger_conditions_type, 'value', 'label') || $t('pages.sceneRuleDetail.selectTimeConditionType') }}
                      </view>
                    </picker>
                    <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                  </view>
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
                    <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                      <picker
                        mode="selector"
                        :range="expirationTimeOptions"
                        range-key="label"
                        :value="getPickerIndex(expirationTimeOptions, ifItem.expiration_time, 'value')"
                        @change="(e) => onExpirationTimePickerChange(e, ifItem)"
                        class="tp-flex-1"
                      >
                        <view class="uni-input" :class="!ifItem.expiration_time && 'placeholder'">
                          {{ getPickerDisplayText(expirationTimeOptions, ifItem.expiration_time, 'value', 'label') || $t('pages.sceneRuleDetail.selectExpirationTime') }}
                        </view>
                      </picker>
                      <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                    </view>
                  </view>
                  <view v-if="ifItem.trigger_conditions_type === '21'">
                    <!-- 时间条件下 -> 重复 -> 选择周期 -->
                    <view class="form-item">
                      <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                        <picker
                          mode="selector"
                          :range="cycleOptions"
                          range-key="label"
                          :value="getPickerIndex(cycleOptions, ifItem.task_type, 'value')"
                          @change="(e) => onCyclePickerChange(e, ifItem)"
                          class="tp-flex-1"
                        >
                          <view class="uni-input" :class="!ifItem.task_type && 'placeholder'">
                            {{ getPickerDisplayText(cycleOptions, ifItem.task_type, 'value', 'label') || $t('pages.sceneRuleDetail.selectCycle') }}
                          </view>
                        </picker>
                        <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                      </view>
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
                      <view class="w-full tp-flex tp-flex-row tp-flex-j-r tp-flex-a-c picker-wrapper">
                        <picker
                          mode="selector"
                          :range="monthRangeOptions"
                          range-key="label"
                          :value="getPickerIndex(monthRangeOptions, ifItem.monthChoseValue, 'value')"
                          @change="(e) => onMonthChoseValuePickerChange(e, ifItem)"
                          class="tp-flex-1"
                        >
                          <view class="uni-input" :class="!ifItem.monthChoseValue && 'placeholder'">
                            {{ getPickerDisplayText(monthRangeOptions, ifItem.monthChoseValue, 'value', 'label') || $t('pages.sceneRuleDetail.selectDate') }}
                          </view>
                        </picker>
                        <uni-icons color="#999" type="forward" size="40rpx"></uni-icons>
                      </view>
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
                      <view class="time-range-divider">-</view>
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
                  color="#4CAF50"
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
              color="#4CAF50"
              @click="addIfGroupItem(null)"
            ></uni-icons>
          </view>
        </view>
        <!--
        <view class="tp-box-sizing tp-pd-l-r-30 tp-mg-t-20">
            <button @click.prevent="addIfGroupItem(null)" class="tp-btn">新增条件组</button>
        </view> -->
      </form>
      
      <!-- 设备选择弹窗（带搜索） -->
      <uni-popup ref="devicePopup" type="bottom" backgroundColor="#fff">
        <view class="popup-header">
          <view class="popup-title">{{ $t('pages.sceneRuleDetail.selectDevice') }}</view>
          <view class="popup-close" @tap="closeDevicePopup">
            <uni-icons type="close" size="24" color="#333"></uni-icons>
          </view>
        </view>
        <view class="popup-search">
          <input 
            class="search-input" 
            :placeholder="$t('common.search')" 
            v-model="deviceSearchKeyword"
            @input="onDeviceSearchInput"
          />
        </view>
        <scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '600rpx' }">
          <view class="selectlist">
            <view 
              class="select_item" 
              v-for="(item, index) in filteredDeviceOptions" 
              :key="index"
              @click="onDeviceSelect(item)"
            >
              {{ item.name }}
            </view>
            <view v-if="filteredDeviceOptions.length === 0" class="select_item empty">
              {{ $t('common.noData') }}
            </view>
          </view>
        </scroll-view>
      </uni-popup>
      
      <!-- 设备类型选择弹窗（带搜索） -->
      <uni-popup ref="deviceConfigPopup" type="bottom" backgroundColor="#fff">
        <view class="popup-header">
          <view class="popup-title">{{ $t('pages.sceneRuleDetail.selectDeviceType') }}</view>
          <view class="popup-close" @tap="closeDeviceConfigPopup">
            <uni-icons type="close" size="24" color="#333"></uni-icons>
          </view>
        </view>
        <view class="popup-search">
          <input 
            class="search-input" 
            :placeholder="$t('common.search')" 
            v-model="deviceConfigSearchKeyword"
            @input="onDeviceConfigSearchInput"
          />
        </view>
        <scroll-view :scroll-y="true" scroll-with-animation="true" :style="{ maxHeight: '600rpx' }">
          <view class="selectlist">
            <view 
              class="select_item" 
              v-for="(item, index) in filteredDeviceConfigOptions" 
              :key="index"
              @click="onDeviceConfigSelect(item)"
            >
              {{ item.name }}
            </view>
            <view v-if="filteredDeviceConfigOptions.length === 0" class="select_item empty">
              {{ $t('common.noData') }}
            </view>
          </view>
        </scroll-view>
      </uni-popup>
    </view>
  </template>
  
  <script>
  import {
    configMetricsConditionMenu,
    deviceConfigAll,
    deviceListAll,
    deviceMetricsConditionMenu
  } from '@/service/automation';
  
  export default {
    components: {
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
        // 设备选择弹窗相关
        deviceSearchKeyword: '',
        filteredDeviceOptions: [],
        currentDeviceIfItem: null,
        currentDeviceIfIndex: null,
        // 设备类型选择弹窗相关
        deviceConfigSearchKeyword: '',
        filteredDeviceConfigOptions: [],
        currentDeviceConfigIfItem: null,
        currentDeviceConfigIfIndex: null,
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
        this.deviceConfigDisabled = false;
  
        if (value === '11') {
          this.deviceConfigDisabled = true;
        }
        this.$emit('conditionChose', value);
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
        this.filteredDeviceOptions = [...this.deviceOptions];
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
      handleFocus(ifIndex) {
        this.queryDeviceName[ifIndex].focus();
      },
      async getDeviceConfig(name) {
        this.queryDeviceConfig.device_config_name = name || '';
        const res = await deviceConfigAll(this.queryDeviceConfig);
        this.deviceConfigOption = res.data || [];
        // 更新过滤列表
        this.filteredDeviceConfigOptions = [...this.deviceConfigOption];
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
      // 设备选择弹窗相关方法
      showDevicePopup(ifItem, ifIndex) {
        this.currentDeviceIfItem = ifItem;
        this.currentDeviceIfIndex = ifIndex;
        this.deviceSearchKeyword = '';
        this.filteredDeviceOptions = [...this.deviceOptions];
        this.$refs.devicePopup.open();
      },
      closeDevicePopup() {
        this.$refs.devicePopup.close();
        this.currentDeviceIfItem = null;
        this.currentDeviceIfIndex = null;
        this.deviceSearchKeyword = '';
      },
      onDeviceSelect(device) {
        if (this.currentDeviceIfItem) {
          this.$set(this.currentDeviceIfItem, 'trigger_source', device.id);
          this.triggerSourceChange(this.currentDeviceIfItem, this.currentDeviceIfIndex);
          this.actionParamShow(this.currentDeviceIfItem, true);
          this.$nextTick(() => {
            this.$forceUpdate();
          });
        }
        this.closeDevicePopup();
      },
      onDeviceSearchInput() {
        const keyword = this.deviceSearchKeyword.toLowerCase().trim();
        if (!keyword) {
          this.filteredDeviceOptions = [...this.deviceOptions];
        } else {
          this.filteredDeviceOptions = this.deviceOptions.filter(device => 
            device.name && device.name.toLowerCase().includes(keyword)
          );
        }
      },
      // 设备类型选择弹窗相关方法
      showDeviceConfigPopup(ifItem, ifIndex) {
        this.currentDeviceConfigIfItem = ifItem;
        this.currentDeviceConfigIfIndex = ifIndex;
        this.deviceConfigSearchKeyword = '';
        this.filteredDeviceConfigOptions = [...this.deviceConfigOption];
        this.$refs.deviceConfigPopup.open();
      },
      closeDeviceConfigPopup() {
        this.$refs.deviceConfigPopup.close();
        this.currentDeviceConfigIfItem = null;
        this.currentDeviceConfigIfIndex = null;
        this.deviceConfigSearchKeyword = '';
      },
      onDeviceConfigSelect(deviceConfig) {
        if (this.currentDeviceConfigIfItem) {
          this.$set(this.currentDeviceConfigIfItem, 'trigger_source', deviceConfig.id);
          this.triggerSourceChange(this.currentDeviceConfigIfItem, this.currentDeviceConfigIfIndex);
          this.actionParamShow(this.currentDeviceConfigIfItem, true);
          this.$nextTick(() => {
            this.$forceUpdate();
          });
        }
        this.closeDeviceConfigPopup();
      },
      onDeviceConfigSearchInput() {
        const keyword = this.deviceConfigSearchKeyword.toLowerCase().trim();
        if (!keyword) {
          this.filteredDeviceConfigOptions = [...this.deviceConfigOption];
        } else {
          this.filteredDeviceConfigOptions = this.deviceConfigOption.filter(deviceConfig => 
            deviceConfig.name && deviceConfig.name.toLowerCase().includes(keyword)
          );
        }
      }
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
  
  .placeholder {
    color: #999;
  }
  
  /* 弹窗样式 */
  .popup-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1px solid #eee;
  }
  
  .popup-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }
  
  .popup-close {
    padding: 10rpx;
  }
  
  .popup-search {
    padding: 20rpx 30rpx;
    border-bottom: 1px solid #eee;
  }
  
  .search-input {
    width: 100%;
    padding: 20rpx;
    border: 1px solid #ddd;
    border-radius: 8rpx;
    font-size: 28rpx;
  }
  
  .selectlist {
    padding: 0;
  }
  
  .select_item {
    padding: 30rpx;
    border-bottom: 1px solid #f0f0f0;
    font-size: 28rpx;
    color: #333;
  }
  
  .select_item:active {
    background-color: #f5f5f5;
  }
  
  .select_item.empty {
    text-align: center;
    color: #999;
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
  </style>
