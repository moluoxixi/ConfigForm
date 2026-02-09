import { DatePicker as ADatePicker } from 'ant-design-vue';
import { defineComponent, h } from 'vue';

/** 年份选择器适配 — 基于 DatePicker picker="year"，值格式 YYYY */
export const YearPicker = defineComponent({
  name: 'CfYearPicker',
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
        'picker': 'year',
        'valueFormat': 'YYYY',
        'style': 'width: 100%',
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
      });
    };
  },
});
