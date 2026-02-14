import type { ValidationFeedback } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { useField, useFormLayout } from '@moluoxixi/vue'
import { FormItem as AFormItem } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** FormItem 装饰器适配 */
export const FormItem = defineComponent({
  name: 'CfFormItem',
  props: {
    label: String,
    required: Boolean,
    errors: { type: Array as PropType<ValidationFeedback[]>, default: () => [] },
    warnings: { type: Array as PropType<ValidationFeedback[]>, default: () => [] },
    description: String,
    fieldPath: String,
    hasErrors: { type: Boolean as PropType<boolean | undefined>, default: undefined },
    labelPosition: String as PropType<'top' | 'left' | 'right'>,
    labelWidth: { type: [String, Number], default: undefined },
    /** 是否显示冒号后缀（未设置时继承 FormLayout，再兜底 true） */
    colon: { type: null as unknown as PropType<boolean | undefined>, default: undefined },
    /** 表单模式（editable/preview/disabled），preview/disabled 时隐藏必填标记 */
    pattern: { type: String as PropType<'editable' | 'preview' | 'disabled'>, default: 'editable' },
  },
  setup(props, { slots }) {
    const layout = useFormLayout()
    let fieldPathFromContext: string | undefined
    try {
      fieldPathFromContext = useField().path
    }
    catch {
      fieldPathFromContext = undefined
    }

    return () => {
      const labelPosition = props.labelPosition ?? layout?.value.labelPosition
      const labelWidth = props.labelWidth ?? layout?.value.labelWidth
      const colon = props.colon ?? layout?.value.colon ?? true

      const hasErrors = props.hasErrors ?? props.errors.length > 0
      const fieldPath = props.fieldPath ?? fieldPathFromContext
      const validateStatus = hasErrors ? 'error' : props.warnings.length > 0 ? 'warning' : undefined
      const helpMsg = props.errors.length > 0 ? props.errors[0].message : props.warnings.length > 0 ? props.warnings[0].message : props.description

      const isVertical = labelPosition === 'top'
      const lw = labelWidth
      const hasLabelWidth = !isVertical && lw !== undefined && lw !== 'auto'
      const labelWidthPx = typeof lw === 'number' ? `${lw}px` : lw

      /**
       * 参考 Formily takeAsterisk：preview/disabled 模式下隐藏必填标记
       *
       * 冒号处理：antd-vue 的 colon 通过 CSS ::after 伪元素渲染，
       * 垂直布局（labelCol.span=24）会触发 .ant-form-vertical 样式隐藏冒号。
       * 为保持一致性，禁用 antd 内置冒号，改为手动追加到 label 文本。
       */
      const showRequired = props.required && props.pattern === 'editable'

      /** 冒号由 colon prop 控制，手动追加到 label 文本（绕过 antd 垂直布局 CSS 隐藏） */
      const labelText = props.label
        ? (colon ? `${props.label} :` : props.label)
        : undefined

      return h('div', {
        'role': 'group',
        'data-field-path': fieldPath,
        'data-field-error': hasErrors ? 'true' : undefined,
        'aria-invalid': hasErrors ? 'true' : undefined,
        'aria-required': showRequired ? 'true' : undefined,
      }, [
        h(AFormItem, {
          label: labelText,
          required: showRequired,
          colon: false,
          validateStatus,
          help: helpMsg,
          ...(isVertical
            ? { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
            : hasLabelWidth
              ? { labelCol: { style: { width: labelWidthPx, flex: 'none' } }, wrapperCol: { style: { flex: '1' } } }
              : {}),
        }, () => slots.default?.()),
      ])
    }
  },
})
