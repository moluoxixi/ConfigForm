import type { ValidationFeedback } from '@moluoxixi/validator'
import type { PropType } from 'vue'
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
    labelPosition: String as PropType<'top' | 'left' | 'right'>,
    labelWidth: { type: [String, Number], default: undefined },
  },
  setup(props, { slots }) {
    return () => {
      const validateStatus = props.errors.length > 0 ? 'error' : props.warnings.length > 0 ? 'warning' : undefined
      const helpMsg = props.errors.length > 0 ? props.errors[0].message : props.warnings.length > 0 ? props.warnings[0].message : props.description

      const isVertical = props.labelPosition === 'top'
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
