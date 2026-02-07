import type { ValidationFeedback } from '@moluoxixi/validator'
import type { PropType } from 'vue'
import { ElFormItem } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * FormItem 装饰器适配
 *
 * 支持 labelPosition（top 时标签独占一行）和 labelWidth。
 * 与 antd-vue 版行为对齐。
 */
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
      const errorMsg = props.errors.length > 0 ? props.errors[0].message : ''
      const warningMsg = props.warnings.length > 0 ? props.warnings[0].message : ''

      /* 计算 labelWidth：top 模式不限宽，其他模式使用配置值 */
      const isVertical = props.labelPosition === 'top'
      const lw = props.labelWidth
      const computedLabelWidth = isVertical ? 'auto' : (typeof lw === 'number' ? `${lw}px` : lw)

      return h(ElFormItem, {
        label: props.label,
        required: props.required,
        error: errorMsg || undefined,
        labelWidth: computedLabelWidth,
        style: isVertical ? 'display: block' : undefined,
      }, {
        default: () => [
          slots.default?.(),
          warningMsg
            ? h('div', { style: 'color: #e6a23c; font-size: 12px; margin-top: 2px;' }, warningMsg)
            : null,
          props.description && !errorMsg
            ? h('div', { style: 'color: #909399; font-size: 12px; margin-top: 2px;' }, props.description)
            : null,
        ],
      })
    }
  },
})
