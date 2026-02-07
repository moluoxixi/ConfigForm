import type { ValidationFeedback } from '@moluoxixi/validator'
import type { PropType } from 'vue'
import { ElFormItem } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * FormItem 装饰器组件适配
 */
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
      const errorMsg = props.errors.length > 0 ? props.errors[0].message : ''
      const warningMsg = props.warnings.length > 0 ? props.warnings[0].message : ''

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
      })
    }
  },
})
