<template>
  <view class="automation-select-trigger" @tap="open">
    <text class="automation-select-value" :class="{ placeholder: !displayValue }">{{ displayValue || placeholder }}</text>
    <view class="automation-select-icon">
      <uni-icons type="right" size="16" color="#98A2B3" />
    </view>
  </view>
  <view v-if="visible" class="automation-sheet-layer" @touchmove.stop.prevent>
    <view class="automation-sheet-mask" @tap="cancel" />
    <view class="automation-sheet" @tap.stop>
      <view class="sheet-grabber" />
      <view class="sheet-header">
        <text class="sheet-action" @tap="cancel">取消</text>
        <text class="sheet-title">{{ title || placeholder }}</text>
        <text class="sheet-action sheet-confirm" @tap="confirm">确定</text>
      </view>
      <view v-if="searchable" class="sheet-search">
        <uni-icons type="search" size="16" color="#98A2B3" />
        <input v-model.trim="keyword" placeholder="搜索" confirm-type="search" />
      </view>
      <text v-if="isTruncated" class="sheet-hint">请输入名称搜索，当前显示前 {{ maxVisibleOptions }} 项</text>
      <scroll-view scroll-y class="sheet-list">
        <view
          v-for="(option, index) in filteredOptions"
          :key="String(optionValue(option, index))"
          class="sheet-option"
          :class="{ selected: isSelected(option), disabled: option.disabled }"
          @tap="choose(option)"
        >
          <text class="sheet-option-label">{{ optionLabel(option) }}</text>
          <uni-icons v-if="isSelected(option)" type="checkmarkempty" size="18" color="#1677FF" />
        </view>
        <view v-if="filteredOptions.length === 0" class="sheet-empty">暂无可选项</view>
      </scroll-view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AutomationSelectSheet',
  props: {
    modelValue: { type: [String, Number, Boolean, Array], default: '' },
    options: { type: Array, default: () => [] },
    valueKey: { type: String, default: 'value' },
    labelKey: { type: String, default: 'label' },
    placeholder: { type: String, default: '请选择' },
    title: { type: String, default: '' },
    searchable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    maxVisibleOptions: { type: Number, default: 100 }
  },
  emits: ['update:modelValue', 'change', 'open'],
  data() {
    return { draftValue: this.modelValue, keyword: '', visible: false };
  },
  computed: {
    displayValue() {
      const selected = this.options.filter(item => this.isValueSelected(this.optionValue(item)));
      return selected.map(item => this.optionLabel(item)).join('、');
    },
    filteredOptions() {
      const keyword = this.keyword.toLowerCase();
      const matches = keyword
        ? this.options.filter(item => this.optionLabel(item).toLowerCase().includes(keyword))
        : this.options;
      return matches.slice(0, this.maxVisibleOptions);
    },
    isTruncated() {
      const keyword = this.keyword.toLowerCase();
      const matchCount = keyword
        ? this.options.filter(item => this.optionLabel(item).toLowerCase().includes(keyword)).length
        : this.options.length;
      return this.searchable && matchCount > this.maxVisibleOptions;
    }
  },
  watch: {
    modelValue(value) { this.draftValue = Array.isArray(value) ? [...value] : value; }
  },
  methods: {
    optionValue(option, index) { return option && typeof option === 'object' ? option[this.valueKey] : (option ?? index); },
    optionLabel(option) { return String(option && typeof option === 'object' ? option[this.labelKey] : option); },
    isValueSelected(value) {
      return this.multiple
        ? Array.isArray(this.modelValue) && this.modelValue.some(item => String(item) === String(value))
        : String(this.modelValue ?? '') === String(value ?? '');
    },
    isSelected(option) {
      const value = this.optionValue(option);
      return this.multiple
        ? Array.isArray(this.draftValue) && this.draftValue.some(item => String(item) === String(value))
        : String(this.draftValue ?? '') === String(value ?? '');
    },
    open() {
      this.draftValue = Array.isArray(this.modelValue) ? [...this.modelValue] : this.modelValue;
      this.keyword = '';
      this.$emit('open');
      this.visible = true;
    },
    choose(option) {
      if (option.disabled) return;
      const value = this.optionValue(option);
      if (this.multiple) {
        const values = Array.isArray(this.draftValue) ? [...this.draftValue] : [];
        const index = values.findIndex(item => String(item) === String(value));
        index >= 0 ? values.splice(index, 1) : values.push(value);
        this.draftValue = values;
      } else {
        this.draftValue = value;
      }
    },
    cancel() { this.visible = false; },
    confirm() {
      const value = Array.isArray(this.draftValue) ? [...this.draftValue] : this.draftValue;
      this.$emit('update:modelValue', value);
      this.$emit('change', value);
      this.visible = false;
    }
  }
};
</script>

<style scoped>
.automation-select-trigger { display:flex; align-items:center; justify-content:space-between; width:100%; min-height:48px; gap:8px; }
.automation-select-value { flex:1; min-width:0; overflow:hidden; color:#172033; font-size:13px; line-height:18px; text-overflow:ellipsis; white-space:nowrap; }
.automation-select-value.placeholder { color:#98a2b3; }
.automation-select-icon { display:flex; flex:0 0 20px; align-items:center; justify-content:flex-end; width:20px; }
.automation-sheet-layer { position:fixed; inset:0; z-index:10020; display:flex; align-items:flex-end; justify-content:center; }
.automation-sheet-mask { position:absolute; inset:0; background:rgba(16,24,40,.42); }
.automation-sheet { position:relative; z-index:1; box-sizing:border-box; width:100%; max-width:640px; overflow:hidden; padding-bottom:env(safe-area-inset-bottom); background:#fff; border-radius:12px 12px 0 0; box-shadow:0 -2px 12px rgba(16,24,40,.10); }
.sheet-grabber { width:36px; height:4px; margin:8px auto 4px; background:#d0d5dd; border-radius:2px; }
.sheet-header { display:grid; grid-template-columns:64px 1fr 64px; align-items:center; height:44px; padding:0 12px; border-bottom:1px solid #edf0f3; }
.sheet-title { overflow:hidden; color:#172033; font-size:16px; font-weight:600; text-align:center; text-overflow:ellipsis; white-space:nowrap; }
.sheet-action { display:flex; align-items:center; min-height:44px; color:#667085; font-size:14px; }
.sheet-confirm { justify-content:flex-end; color:#1677ff; font-weight:500; }
.sheet-search { display:flex; align-items:center; height:40px; margin:8px 12px; padding:0 10px; gap:8px; background:#f7f8fa; border:1px solid #dfe4eb; border-radius:8px; }
.sheet-search input { flex:1; height:38px; color:#172033; font-size:13px; }
.sheet-hint { display:block; padding:0 12px 6px; color:#667085; font-size:12px; line-height:18px; }
.sheet-list { height:min(55vh,420px); }
.sheet-option { display:flex; align-items:center; justify-content:space-between; box-sizing:border-box; min-height:48px; margin-left:16px; padding:0 16px 0 0; border-bottom:1px solid #edf0f3; }
.sheet-option-label { color:#172033; font-size:14px; line-height:20px; }
.sheet-option.selected .sheet-option-label { color:#1677ff; font-weight:500; }
.sheet-option.disabled { opacity:.4; }
.sheet-empty { padding:32px 16px; color:#98a2b3; font-size:13px; text-align:center; }
</style>
