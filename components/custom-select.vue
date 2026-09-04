<template>
  <AutomationSelectSheet
    :model-value="modelValue"
    :options="options"
    :value-key="optionValue"
    :label-key="optionLabel"
    :placeholder="placeholder"
    :title="label || placeholder"
    :searchable="searchable"
    @update:modelValue="$emit('update:modelValue', $event)"
    @change="$emit('change', $event)"
    @open="$emit('click')"
  />
</template>

<script>
import AutomationSelectSheet from '@/features/automation/components/automation-select-sheet.vue';

export default {
  name: 'CustomSelect',
  components: { AutomationSelectSheet },
  props: {
    clearable: { type: Boolean, default: false },
    modelValue: { type: [String, Number], default: '' },
    options: { type: Array, default: () => [] },
    optionValue: { type: String, default: 'value' },
    optionLabel: { type: String, default: 'label' },
    label: { type: String, default: '' },
    placeholder: { type: String, default: '' },
    searchable: { type: Boolean, default: false }
  },
  emits: ['update:modelValue', 'change', 'click']
};
</script>
