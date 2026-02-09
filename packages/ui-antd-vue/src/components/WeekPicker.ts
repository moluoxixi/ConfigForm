import { DatePicker as ADatePicker } from 'ant-design-vue';
import { defineComponent, h } from 'vue';

/** 周选择器适配 — 基于 DatePicker picker="week" */
export const WeekPicker = defineComponent({
  name: 'CfWeekPicker',
  props: {
    modelValue: { type: String, default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      return h(ADatePicker, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'picker': 'week',
        'style': 'width: 100%',
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
      });
    };
  },
});
