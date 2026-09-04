<template>
  <view class="time-trigger" @tap="open">
    <text class="time-trigger-value" :class="{ placeholder: !modelValue }">{{ displayValue || placeholder }}</text>
    <view class="time-trigger-icon">
      <uni-icons type="right" size="16" color="#98A2B3" />
    </view>
  </view>
  <view v-if="visible" class="time-sheet-layer" @touchmove.stop.prevent>
    <view class="time-sheet-mask" @tap="close" />
    <view class="time-sheet" @tap.stop>
      <view class="time-grabber" />
      <view class="time-header">
        <text class="time-action" @tap="close">取消</text>
        <text class="time-title">{{ title }}</text>
        <text class="time-action confirm" @tap="confirm">确定</text>
      </view>
      <picker-view class="time-picker" :value="pickerValue" indicator-style="height:48px" @change="onPickerChange">
        <picker-view-column v-if="!minuteOnly">
          <view v-for="hour in hours" :key="hour" class="time-option">{{ pad(hour) }} 时</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="minute in minutes" :key="minute" class="time-option">{{ pad(minute) }} 分</view>
        </picker-view-column>
      </picker-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AutomationTimeSheet',
  props: {
    modelValue: { type: [Number, String], default: null },
    placeholder: { type: String, default: '请选择时间' },
    title: { type: String, default: '选择时间' },
    minuteOnly: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'change'],
  data() {
    return { hours: Array.from({ length: 24 }, (_, i) => i), minutes: Array.from({ length: 60 }, (_, i) => i), hour: 0, minute: 0, visible: false };
  },
  computed: {
    pickerValue() { return this.minuteOnly ? [this.minute] : [this.hour, this.minute]; },
    displayValue() {
      if (this.modelValue === null || this.modelValue === undefined || this.modelValue === '') return '';
      const date = new Date(Number(this.modelValue));
      return this.minuteOnly ? `${date.getMinutes()} 分钟` : `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}`;
    }
  },
  methods: {
    pad(value) { return String(value).padStart(2, '0'); },
    open() {
      const date = this.modelValue ? new Date(Number(this.modelValue)) : new Date();
      this.hour = date.getHours(); this.minute = date.getMinutes(); this.visible = true;
    },
    close() { this.visible = false; },
    onPickerChange(event) {
      const values = event.detail.value || [];
      if (this.minuteOnly) this.minute = values[0] || 0;
      else { this.hour = values[0] || 0; this.minute = values[1] || 0; }
    },
    confirm() {
      const date = this.modelValue ? new Date(Number(this.modelValue)) : new Date();
      date.setSeconds(0, 0); date.setHours(this.minuteOnly ? 0 : this.hour, this.minute);
      const value = date.getTime();
      this.$emit('update:modelValue', value); this.$emit('change', value); this.close();
    }
  }
};
</script>

<style scoped>
.time-trigger { display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; width:100%; min-height:48px; gap:8px; color:#172033; font-size:13px; }
.time-trigger-value { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.time-trigger-icon { display:flex; flex:0 0 20px; align-items:center; justify-content:flex-end; width:20px; }
.placeholder { color:#98a2b3; }
.time-sheet-layer { position:fixed; inset:0; z-index:10020; display:flex; align-items:flex-end; justify-content:center; }
.time-sheet-mask { position:absolute; inset:0; background:rgba(16,24,40,.42); }
.time-sheet { position:relative; z-index:1; box-sizing:border-box; width:100%; max-width:640px; overflow:hidden; padding-bottom:env(safe-area-inset-bottom); background:#fff; border-radius:12px 12px 0 0; box-shadow:0 -2px 12px rgba(16,24,40,.10); }
.time-grabber { width:36px; height:4px; margin:8px auto 4px; background:#d0d5dd; border-radius:2px; }
.time-header { display:grid; grid-template-columns:64px 1fr 64px; align-items:center; height:44px; padding:0 12px; border-bottom:1px solid #edf0f3; }
.time-title { color:#172033; font-size:16px; font-weight:600; text-align:center; }
.time-action { display:flex; align-items:center; min-height:44px; color:#667085; font-size:14px; }
.time-action.confirm { justify-content:flex-end; color:#1677ff; font-weight:500; }
.time-picker { width:100%; height:216px; }
.time-option { display:flex; align-items:center; justify-content:center; height:48px; color:#172033; font-size:16px; }
</style>
