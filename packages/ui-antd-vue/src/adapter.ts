import type { DataSourceItem } from '@moluoxixi/shared'
import type { ValidationFeedback } from '@moluoxixi/validator'
import type { PropType } from 'vue'
import {
  Checkbox as ACheckbox,
  DatePicker as ADatePicker,
  FormItem as AFormItem,
  Input as AInput,
  InputNumber as AInputNumber,
  InputPassword as AInputPassword,
  Radio as ARadio,
  Select as ASelect,
  Switch as ASwitch,
  Textarea as ATextarea,
} from 'ant-design-vue'
import { defineComponent, h } from 'vue'

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
    return () => {
      /* 阅读态：显示为纯文本 */
      if (props.readonly) {
        return h('span', null, String(props.modelValue ?? '—'))
      }
      return h(AInput, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})

export const Password = defineComponent({
  name: 'CfPassword',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      /* 阅读态：密码显示为掩码文本 */
      if (props.readonly) {
        return h('span', null, props.modelValue ? '••••••••' : '—')
      }
      return h(AInputPassword, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})

export const Textarea = defineComponent({
  name: 'CfTextarea',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean, rows: { type: Number, default: 3 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      /* 阅读态：显示为纯文本 */
      if (props.readonly) {
        return h('span', { style: 'white-space:pre-wrap' }, String(props.modelValue ?? '—'))
      }
      return h(ATextarea, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'rows': props.rows,
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})

export const InputNumber = defineComponent({
  name: 'CfInputNumber',
  props: { modelValue: { type: Number, default: undefined }, placeholder: String, disabled: Boolean, readonly: Boolean, min: Number, max: Number, step: { type: Number, default: 1 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue !== undefined ? String(props.modelValue) : '—')
      }
      return h(AInputNumber, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'style': 'width: 100%',
        'onUpdate:value': (v: number) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})

/* ========== 选择适配 ========== */

export const Select = defineComponent({
  name: 'CfSelect',
  props: {
    modelValue: { type: [String, Number, Array], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    loading: Boolean,
    mode: String as PropType<'multiple' | 'tags'>,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        /* 阅读态：显示已选值的 label */
        const selectedLabel = props.dataSource.find(item => item.value === props.modelValue)?.label
        return h('span', null, selectedLabel ?? String(props.modelValue ?? '—'))
      }
      return h(ASelect, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'loading': props.loading,
        'mode': props.mode,
        'style': 'width: 100%',
        'options': props.dataSource.map(item => ({
          label: item.label,
          value: item.value,
          disabled: item.disabled,
        })),
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})

export const RadioGroup = defineComponent({
  name: 'CfRadioGroup',
  props: {
    modelValue: { type: [String, Number, Boolean], default: undefined },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        const selectedLabel = props.dataSource.find(item => item.value === props.modelValue)?.label
        return h('span', null, selectedLabel ?? String(props.modelValue ?? '—'))
      }
      return h(ARadio.Group, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value })),
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      })
    }
  },
})

export const CheckboxGroup = defineComponent({
  name: 'CfCheckboxGroup',
  props: {
    modelValue: { type: Array as PropType<unknown[]>, default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        const selectedLabels = (props.modelValue ?? [])
          .map(v => props.dataSource.find(item => item.value === v)?.label ?? String(v))
          .join('、')
        return h('span', null, selectedLabels || '—')
      }
      return h(ACheckbox.Group, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'options': props.dataSource.map(item => ({ label: item.label, value: item.value })),
        'onUpdate:value': (v: unknown) => emit('update:modelValue', v),
      })
    }
  },
})

/* ========== 开关 ========== */

export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue ? '是' : '否')
      }
      return h(ASwitch, {
        'checked': props.modelValue,
        'disabled': props.disabled,
        'onUpdate:checked': (v: boolean) => emit('update:modelValue', v),
      })
    }
  },
})

/* ========== 日期 ========== */

export const DatePicker = defineComponent({
  name: 'CfDatePicker',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, props.modelValue || '—')
      }
      return h(ADatePicker, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'style': 'width: 100%',
        'valueFormat': 'YYYY-MM-DD',
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
      })
    }
  },
})

/* ========== FormItem 装饰器 ========== */

export const FormItem = defineComponent({
  name: 'CfFormItem',
  props: {
    label: String,
    required: Boolean,
    errors: { type: Array as PropType<ValidationFeedback[]>, default: () => [] },
    warnings: { type: Array as PropType<ValidationFeedback[]>, default: () => [] },
    description: String,
    labelPosition: String as PropType<'top' | 'left' | 'right'>,
    labelWidth: { type: [String, Number], default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const validateStatus = props.errors.length > 0
        ? 'error'
        : props.warnings.length > 0
          ? 'warning'
          : undefined
      const helpMsg = props.errors.length > 0
        ? props.errors[0].message
        : props.warnings.length > 0
          ? props.warnings[0].message
          : props.description

      /* 垂直布局：标签独占一行 */
      const isVertical = props.labelPosition === 'top'
      /* 水平布局 + 指定 labelWidth：通过 labelCol.style 控制标签宽度 */
      const lw = props.labelWidth
      const hasLabelWidth = !isVertical && lw !== undefined && lw !== 'auto'
      const labelWidthPx = typeof lw === 'number' ? `${lw}px` : lw

      return h(AFormItem, {
        label: props.label,
        required: props.required,
        validateStatus,
        help: helpMsg,
        ...(isVertical
          ? { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
          : hasLabelWidth
            ? { labelCol: { style: { width: labelWidthPx, flex: 'none' } }, wrapperCol: { style: { flex: '1' } } }
            : {}),
      }, () => slots.default?.())
    }
  },
})
