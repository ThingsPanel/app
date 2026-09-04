<template>
  <view class="range-trigger" @tap="open">
    <view class="range-boundary">
      <text class="range-label">{{ startLabel }}</text>
      <text class="range-value" :class="{ placeholder: !startValue }">{{ formatTime(startValue) || startPlaceholder }}</text>
    </view>
    <text class="range-separator">至</text>
    <view class="range-boundary">
      <text class="range-label">{{ endLabel }}</text>
      <text class="range-value" :class="{ placeholder: !endValue }">{{ formatTime(endValue) || endPlaceholder }}</text>
    </view>
    <view class="range-arrow">
      <uni-icons type="right" size="16" color="#98A2B3" />
    </view>
  </view>

  <view v-if="visible" class="range-sheet-layer" @touchmove.stop.prevent>
    <view class="range-sheet-mask" @tap="close" />
    <view class="range-sheet" @tap.stop>
      <view class="range-grabber" />
      <view class="range-header">
        <text class="range-action" @tap="close">取消</text>
        <text class="range-title">时间范围</text>
        <text class="range-action confirm" @tap="confirm">确定</text>
      </view>

      <view class="range-tabs">
        <view class="range-tab" :class="{ active: activeBoundary === 'start' }" @tap="activeBoundary = 'start'">
          <text class="range-tab-label">{{ startLabel }}</text>
          <text class="range-tab-value">{{ formatDraftTime(draftStart) }}</text>
        </view>
        <view class="range-tab" :class="{ active: activeBoundary === 'end' }" @tap="activeBoundary = 'end'">
          <text class="range-tab-label">{{ endLabel }}</text>
          <text class="range-tab-value">{{ formatDraftTime(draftEnd) }}</text>
        </view>
      </view>

      <picker-view class="range-picker" :value="pickerValue" indicator-style="height:48px" @change="onPickerChange">
        <picker-view-column>
          <view v-for="hour in hours" :key="hour" class="range-option">{{ pad(hour) }} 时</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="minute in minutes" :key="minute" class="range-option">{{ pad(minute) }} 分</view>
        </picker-view-column>
        <picker-view-column>
          <view v-for="second in seconds" :key="second" class="range-option">{{ pad(second) }} 秒</view>
        </picker-view-column>
      </picker-view>
      <text class="range-hint">结束时间早于起始时间时，按跨天时间范围执行</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AutomationTimeRangeSheet',
  props: {
    startValue: { type: [Number, String], default: null },
    endValue: { type: [Number, String], default: null },
    startLabel: { type: String, default: '起始时间' },
    endLabel: { type: String, default: '结束时间' },
    startPlaceholder: { type: String, default: '请选择' },
    endPlaceholder: { type: String, default: '请选择' }
  },
  emits: ['update:startValue', 'update:endValue', 'change'],
  data() {
    return {
      hours: Array.from({ length: 24 }, (_, index) => index),
      minutes: Array.from({ length: 60 }, (_, index) => index),
      seconds: Array.from({ length: 60 }, (_, index) => index),
      activeBoundary: 'start',
      draftStart: { hour: 0, minute: 0, second: 0 },
      draftEnd: { hour: 0, minute: 0, second: 0 },
      visible: false
    };
  },
  computed: {
    activeDraft() {
      return this.activeBoundary === 'start' ? this.draftStart : this.draftEnd;
    },
    pickerValue() {
      return [this.activeDraft.hour, this.activeDraft.minute, this.activeDraft.second];
    }
  },
  methods: {
    pad(value) {
      return String(value).padStart(2, '0');
    },
    toDraft(value) {
      const date = value ? new Date(Number(value)) : new Date();
      return { hour: date.getHours(), minute: date.getMinutes(), second: date.getSeconds() };
    },
    formatDraftTime(value) {
      return `${this.pad(value.hour)}:${this.pad(value.minute)}:${this.pad(value.second)}`;
    },
    formatTime(value) {
      if (value === null || value === undefined || value === '') return '';
      const date = new Date(Number(value));
      return `${this.pad(date.getHours())}:${this.pad(date.getMinutes())}:${this.pad(date.getSeconds())}`;
    },
    open() {
      this.draftStart = this.toDraft(this.startValue);
      this.draftEnd = this.toDraft(this.endValue);
      this.activeBoundary = 'start';
      this.visible = true;
    },
    close() {
      this.visible = false;
    },
    onPickerChange(event) {
      const values = event.detail.value || [];
      const draft = {
        hour: values[0] || 0,
        minute: values[1] || 0,
        second: values[2] || 0
      };
      if (this.activeBoundary === 'start') this.draftStart = draft;
      else this.draftEnd = draft;
    },
    buildTimestamp(baseValue, draft) {
      const date = baseValue ? new Date(Number(baseValue)) : new Date();
      date.setHours(draft.hour, draft.minute, draft.second, 0);
      return date.getTime();
    },
    confirm() {
      const startValue = this.buildTimestamp(this.startValue, this.draftStart);
      const endValue = this.buildTimestamp(this.endValue, this.draftEnd);
      this.$emit('update:startValue', startValue);
      this.$emit('update:endValue', endValue);
      this.$emit('change', { startValue, endValue });
      this.close();
    }
  }
};
</script>

<style scoped>
.range-trigger { display:grid; grid-template-columns:minmax(0,1fr) 20px minmax(0,1fr) 20px; align-items:center; box-sizing:border-box; min-height:58px; gap:4px; }
.range-boundary { display:flex; min-width:0; flex-direction:column; gap:2px; }
.range-label { color:#667085; font-size:11px; line-height:16px; }
.range-value { overflow:hidden; color:#172033; font-size:13px; line-height:20px; text-overflow:ellipsis; white-space:nowrap; }
.range-value.placeholder { color:#98a2b3; }
.range-separator { color:#667085; font-size:12px; text-align:center; }
.range-arrow { display:flex; align-items:center; justify-content:flex-end; width:20px; }
.range-sheet-layer { position:fixed; inset:0; z-index:10020; display:flex; align-items:flex-end; justify-content:center; }
.range-sheet-mask { position:absolute; inset:0; background:rgba(16,24,40,.42); }
.range-sheet { position:relative; z-index:1; box-sizing:border-box; width:100%; max-width:640px; overflow:hidden; padding-bottom:calc(10px + env(safe-area-inset-bottom)); background:#fff; border-radius:12px 12px 0 0; box-shadow:0 -2px 12px rgba(16,24,40,.10); }
.range-grabber { width:36px; height:4px; margin:8px auto 4px; background:#d0d5dd; border-radius:2px; }
.range-header { display:grid; grid-template-columns:64px 1fr 64px; align-items:center; height:44px; padding:0 12px; border-bottom:1px solid #edf0f3; }
.range-title { color:#172033; font-size:16px; font-weight:600; text-align:center; }
.range-action { display:flex; align-items:center; min-height:44px; color:#667085; font-size:14px; }
.range-action.confirm { justify-content:flex-end; color:#1677ff; font-weight:500; }
.range-tabs { display:grid; grid-template-columns:1fr 1fr; margin:8px 12px 0; padding:3px; gap:4px; background:#f2f4f7; border-radius:8px; }
.range-tab { display:flex; min-height:48px; flex-direction:column; align-items:center; justify-content:center; gap:1px; color:#667085; border-radius:6px; }
.range-tab.active { color:#1677ff; background:#fff; box-shadow:0 1px 3px rgba(16,24,40,.08); }
.range-tab-label { font-size:11px; line-height:16px; }
.range-tab-value { font-size:14px; font-weight:500; line-height:20px; }
.range-picker { width:100%; height:216px; }
.range-option { display:flex; align-items:center; justify-content:center; height:48px; color:#172033; font-size:16px; }
.range-hint { display:block; padding:0 16px; color:#667085; font-size:11px; line-height:18px; text-align:center; }
</style>
