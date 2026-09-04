<template>
  <view class="datetime-trigger" @tap="open">
    <text class="datetime-trigger-value" :class="{ placeholder: !modelValue }">{{ displayValue || placeholder }}</text>
    <view class="datetime-trigger-icon">
      <uni-icons type="right" size="16" color="#98A2B3" />
    </view>
  </view>
  <view v-if="visible" class="datetime-sheet-layer" @touchmove.stop.prevent>
    <view class="datetime-sheet-mask" @tap="close" />
    <view class="datetime-sheet" @tap.stop>
      <view class="sheet-grabber" />
      <view class="sheet-header">
        <text class="sheet-action" @tap="close">取消</text>
        <text class="sheet-title">{{ title }}</text>
        <text class="sheet-action confirm" @tap="confirm">确定</text>
      </view>
      <view class="selection-labels">
        <text>日期</text>
        <text>时间</text>
      </view>
      <picker-view class="datetime-picker" :value="pickerValue" indicator-style="height:48px" @change="onPickerChange">
        <picker-view-column>
          <view v-for="year in years" :key="year" class="picker-option">{{ year }} 年</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="month in months" :key="month" class="picker-option">{{ pad(month) }} 月</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="day in days" :key="day" class="picker-option">{{ pad(day) }} 日</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="hour in hours" :key="hour" class="picker-option">{{ pad(hour) }} 时</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="minute in minutes" :key="minute" class="picker-option">{{ pad(minute) }} 分</view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AutomationDatetimeSheet',
  props: {
    modelValue: { type: [Number, String], default: null },
    placeholder: { type: String, default: '请选择日期和时间' },
    title: { type: String, default: '选择日期和时间' }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    const currentYear = new Date().getFullYear();
    return {
      visible: false,
      years: Array.from({ length: 7 }, (_, index) => currentYear - 1 + index),
      months: Array.from({ length: 12 }, (_, index) => index + 1),
      hours: Array.from({ length: 24 }, (_, index) => index),
      minutes: Array.from({ length: 60 }, (_, index) => index),
      year: currentYear,
      month: 1,
      day: 1,
      hour: 0,
      minute: 0
    };
  },
  computed: {
    days() {
      const count = new Date(this.year, this.month, 0).getDate();
      return Array.from({ length: count }, (_, index) => index + 1);
    },
    pickerValue() {
      return [
        Math.max(0, this.years.indexOf(this.year)),
        this.month - 1,
        Math.min(this.day, this.days.length) - 1,
        this.hour,
        this.minute
      ];
    },
    displayValue() {
      if (this.modelValue === null || this.modelValue === undefined || this.modelValue === '') return '';
      const date = new Date(Number(this.modelValue));
      if (Number.isNaN(date.getTime())) return '';
      return `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}-${this.pad(date.getDate())} ${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
    }
  },
  methods: {
    pad(value) { return String(value).padStart(2, '0'); },
    open() {
      const date = this.modelValue ? new Date(Number(this.modelValue)) : new Date();
      this.year = date.getFullYear();
      this.month = date.getMonth() + 1;
      this.day = date.getDate();
      this.hour = date.getHours();
      this.minute = date.getMinutes();
      this.visible = true;
    },
    close() { this.visible = false; },
    onPickerChange(event) {
      const [yearIndex = 0, monthIndex = 0, dayIndex = 0, hourIndex = 0, minuteIndex = 0] = event.detail.value || [];
      this.year = this.years[yearIndex] || this.years[0];
      this.month = monthIndex + 1;
      this.day = Math.min(dayIndex + 1, new Date(this.year, this.month, 0).getDate());
      this.hour = hourIndex;
      this.minute = minuteIndex;
    },
    confirm() {
      const value = new Date(this.year, this.month - 1, this.day, this.hour, this.minute, 0, 0).getTime();
      this.$emit('update:modelValue', value);
      this.$emit('change', value);
      this.close();
    }
  }
};
</script>

<style scoped>
.datetime-trigger { display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; width:100%; min-height:48px; gap:8px; color:#172033; font-size:13px; }
.datetime-trigger-value { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.datetime-trigger-icon { display:flex; flex:0 0 20px; align-items:center; justify-content:flex-end; width:20px; }
.placeholder { color:#98a2b3; }
.datetime-sheet-layer { position:fixed; inset:0; z-index:10020; display:flex; align-items:flex-end; justify-content:center; }
.datetime-sheet-mask { position:absolute; inset:0; background:rgba(16,24,40,.42); }
.datetime-sheet { position:relative; z-index:1; box-sizing:border-box; width:100%; max-width:640px; overflow:hidden; padding-bottom:env(safe-area-inset-bottom); background:#fff; border-radius:12px 12px 0 0; box-shadow:0 -2px 12px rgba(16,24,40,.10); }
.sheet-grabber { width:36px; height:4px; margin:8px auto 4px; background:#d0d5dd; border-radius:2px; }
.sheet-header { display:grid; grid-template-columns:64px 1fr 64px; align-items:center; height:44px; padding:0 12px; border-bottom:1px solid #edf0f3; }
.sheet-title { color:#172033; font-size:16px; font-weight:600; text-align:center; }
.sheet-action { display:flex; align-items:center; min-height:44px; color:#667085; font-size:14px; }
.sheet-action.confirm { justify-content:flex-end; color:#1677ff; font-weight:600; }
.selection-labels { display:grid; grid-template-columns:3fr 2fr; padding:8px 12px 0; color:#667085; font-size:12px; text-align:center; }
.datetime-picker { width:100%; height:240px; }
.picker-option { display:flex; align-items:center; justify-content:center; height:48px; color:#172033; font-size:14px; white-space:nowrap; }
</style>
