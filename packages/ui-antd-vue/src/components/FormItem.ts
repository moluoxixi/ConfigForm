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
    /** 表单模式（editable/readOnly/disabled），readOnly/disabled 时隐藏必填标记 */
    pattern: { type: String as PropType<'editable' | 'readOnly' | 'disabled'>, default: 'editable' },
  },
  setup(props, { slots }) {
    return () => {
      const validateStatus = props.errors.length > 0 ? 'error' : props.warnings.length > 0 ? 'warning' : undefined
      const helpMsg = props.errors.length > 0 ? props.errors[0].message : props.warnings.length > 0 ? props.warnings[0].message : props.description

      const isVertical = props.labelPosition === 'top'
      const lw = props.labelWidth
      const hasLabelWidth = !isVertical && lw !== undefined && lw !== 'auto'
      const labelWidthPx = typeof lw === 'number' ? `${lw}px` : lw

      /**
       * 参考 Formily takeAsterisk：readOnly/disabled 模式下隐藏必填标记
       *
       * 冒号处理：antd-vue 的 colon 通过 CSS ::after 伪元素渲染，
       * 垂直布局（labelCol.span=24）会触发 .ant-form-vertical 样式隐藏冒号。
       * 为保持一致性，禁用 antd 内置冒号，改为手动追加到 label 文本。
       */
      const showRequired = props.required && props.pattern === 'editable'

      return h(AFormItem, {
        label: props.label ? `${props.label} :` : undefined,
        required: showRequired,
        colon: false,
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
