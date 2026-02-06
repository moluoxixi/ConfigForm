import { h, defineComponent } from 'vue';
import type { PropType, Component } from 'vue';
import {
  Input as AInput,
  InputNumber as AInputNumber,
  InputPassword as AInputPassword,
  Textarea as ATextarea,
  Select as ASelect,
  Switch as ASwitch,
  Checkbox as ACheckbox,
  Radio as ARadio,
  DatePicker as ADatePicker,
  RangePicker as ARangePicker,
  FormItem as AFormItem,
  Rate as ARate,
  Slider as ASlider,
  TimePicker as ATimePicker,
} from 'ant-design-vue';
import type { ValidationFeedback } from '@moluoxixi/validator';
import type { DataSourceItem } from '@moluoxixi/shared';

/* ========== 输入适配 ========== */

/** 文本输入 — 桥接 v-model → modelValue + update:modelValue */
export const Input = defineComponent({
  name: 'CfInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(AInput, {
      value: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      readonly: props.readonly,
      'onUpdate:value': (v: string) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
    });
  },
});

export const Password = defineComponent({
  name: 'CfPassword',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(AInputPassword, {
      value: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      'onUpdate:value': (v: string) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
    });
  },
});

export const Textarea = defineComponent({
  name: 'CfTextarea',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, rows: { type: Number, default: 3 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ATextarea, {
      value: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      rows: props.rows,
      'onUpdate:value': (v: string) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
    });
  },
});

export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  props: { modelValue: { type: Number, default: undefined }, placeholder: String, disabled: Boolean, min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(AInputNumber, {
      value: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      min: props.min,
      max: props.max,
      step: props.step,
      style: 'width: 100%',
      'onUpdate:value': (v: number) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
    });
  },
});

/* ========== 选择适配 ========== */

export const Select = defineComponent({
  name: 'CfSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    loading: Boolean,
    mode: String as PropType<'multiple' | 'tags'>,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ASelect, {
      value: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      loading: props.loading,
      mode: props.mode,
      style: 'width: 100%',
      options: props.dataSource.map((item) => ({
        label: item.label,
        value: item.value,
        disabled: item.disabled,
      })),
      'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
    });
  },
});

export const RadioGroup = defineComponent({
  name: 'CfRadioGroup',
  props: {
    modelValue: { type: [String, Number, Boolean], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(ARadio.Group, {
      value: props.modelValue,
      disabled: props.disabled,
      options: props.dataSource.map((item) => ({ label: item.label, value: item.value })),
      'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
    });
  },
});

export const CheckboxGroup = defineComponent({
  name: 'CfCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(ACheckbox.Group, {
      value: props.modelValue,
      disabled: props.disabled,
      options: props.dataSource.map((item) => ({ label: item.label, value: item.value })),
      'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
    });
  },
});

/* ========== 开关 ========== */

export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(ASwitch, {
      checked: props.modelValue,
      disabled: props.disabled,
      'onUpdate:checked': (v: boolean) => emit('update:modelValue', v),
    });
  },
});

/* ========== 日期 ========== */

export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ADatePicker, {
      value: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      style: 'width: 100%',
      valueFormat: 'YYYY-MM-DD',
      'onUpdate:value': (v: string) => emit('update:modelValue', v),
    });
  },
});

/* ========== FormItem 装饰器 ========== */

export const FormItem = defineComponent({
  name: 'CfFormItem',
  props: {
    label: String,
    required: Boolean,
    errors: { type: Array as PropType<ValidationFeedback[]>, default: () => [] },
    warnings: { type: Array as PropType<ValidationFeedback[]>, default: () => [] },
    description: String,
  },
  setup(props, { slots }) {
    return () => {
      const validateStatus = props.errors.length > 0
        ? 'error'
        : props.warnings.length > 0
          ? 'warning'
          : undefined;
      const helpMsg = props.errors.length > 0
        ? props.errors[0].message
        : props.warnings.length > 0
          ? props.warnings[0].message
          : props.description;

      return h(AFormItem, {
        label: props.label,
        required: props.required,
        validateStatus,
        help: helpMsg,
      }, () => slots.default?.());
    };
  },
});
