import { h, defineComponent } from 'vue';
import type { PropType } from 'vue';
import {
  ElInput,
  ElInputNumber,
  ElSelect,
  ElOption,
  ElSwitch,
  ElCheckboxGroup,
  ElCheckbox,
  ElRadioGroup,
  ElRadio,
  ElDatePicker,
  ElFormItem,
  ElRate,
  ElSlider,
} from 'element-plus';
import type { ValidationFeedback } from '@moluoxixi/validator';
import type { DataSourceItem } from '@moluoxixi/shared';

/* ========== 输入适配 ========== */

export const Input = defineComponent({
  name: 'CfInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    type: { type: String, default: 'text' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElInput, {
      modelValue: String(props.modelValue ?? ''),
      placeholder: props.placeholder,
      disabled: props.disabled,
      readonly: props.readonly,
      type: props.type,
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
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
    return () => h(ElInput, {
      modelValue: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      type: 'password',
      showPassword: true,
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
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
    return () => h(ElInput, {
      modelValue: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      type: 'textarea',
      rows: props.rows,
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
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
    return () => h(ElInputNumber, {
      modelValue: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      min: props.min,
      max: props.max,
      step: props.step,
      style: 'width: 100%',
      controlsPosition: 'right',
      'onUpdate:modelValue': (v: number) => emit('update:modelValue', v),
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
    multiple: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElSelect, {
      modelValue: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      loading: props.loading,
      multiple: props.multiple,
      style: 'width: 100%',
      'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
    }, () => props.dataSource.map((item) =>
      h(ElOption, {
        key: String(item.value),
        label: item.label,
        value: item.value,
        disabled: item.disabled,
      }),
    ));
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
    return () => h(ElRadioGroup, {
      modelValue: props.modelValue,
      disabled: props.disabled,
      'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
    }, () => props.dataSource.map((item) =>
      h(ElRadio, { key: String(item.value), value: item.value }, () => item.label),
    ));
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
    return () => h(ElCheckboxGroup, {
      modelValue: props.modelValue,
      disabled: props.disabled,
      'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', v),
    }, () => props.dataSource.map((item) =>
      h(ElCheckbox, { key: String(item.value), value: item.value }, () => item.label),
    ));
  },
});

/* ========== 开关 ========== */

export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h(ElSwitch, {
      modelValue: props.modelValue,
      disabled: props.disabled,
      'onUpdate:modelValue': (v: boolean) => emit('update:modelValue', v),
    });
  },
});

/* ========== 日期 ========== */

export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => h(ElDatePicker, {
      modelValue: props.modelValue,
      placeholder: props.placeholder,
      disabled: props.disabled,
      style: 'width: 100%',
      valueFormat: 'YYYY-MM-DD',
      'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
      onFocus: () => emit('focus'),
      onBlur: () => emit('blur'),
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
      const errorMsg = props.errors.length > 0 ? props.errors[0].message : '';
      const warningMsg = props.warnings.length > 0 ? props.warnings[0].message : '';

      return h(ElFormItem, {
        label: props.label,
        required: props.required,
        error: errorMsg || undefined,
      }, {
        default: () => [
          slots.default?.(),
          warningMsg ? h('div', { style: 'color: #e6a23c; font-size: 12px; margin-top: 2px;' }, warningMsg) : null,
          props.description && !errorMsg ? h('div', { style: 'color: #909399; font-size: 12px; margin-top: 2px;' }, props.description) : null,
        ],
      });
    };
  },
});
