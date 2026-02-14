import type { ValidationFeedback } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { useField, useFormLayout } from '@moluoxixi/vue'
import { ElFormItem } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * FormItem 装饰器适配
 *
 * 与 antd-vue 版行为对齐：
 * - label 默认右对齐（通过 CSS 覆盖）
 * - label 默认带冒号后缀
 * - 支持 labelPosition（top 时标签独占一行、左对齐）和 labelWidth
 */
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
      const hasErrors = props.hasErrors ?? props.errors.length > 0
      const fieldPath = props.fieldPath ?? fieldPathFromContext
      const labelPosition = props.labelPosition ?? layout?.value.labelPosition
      const labelWidth = props.labelWidth ?? layout?.value.labelWidth
      const colon = props.colon ?? layout?.value.colon ?? true

      const errorMsg = hasErrors ? props.errors[0]?.message ?? '' : ''
      const warningMsg = props.warnings.length > 0 ? props.warnings[0].message : ''

      /* 计算 labelWidth：top 模式不限宽，其他模式使用配置值 */
      const isVertical = labelPosition === 'top'
      const lw = labelWidth
      const computedLabelWidth = isVertical ? 'auto' : (typeof lw === 'number' ? `${lw}px` : lw)

      /** 标签文本：追加冒号后缀（对齐 antd-vue 行为） */
      const labelText = props.label
        ? (colon ? `${props.label} :` : props.label)
        : undefined

      /**
       * 标签右对齐样式（非 top 模式时）
       * Element Plus 的 ElFormItem 默认 label 左对齐，通过 CSS 覆盖为右对齐
       */
      const alignStyle = !isVertical
        ? '--el-form-label-text-align: right; --el-form-item-label-text-align: right;'
        : ''

      /** 参考 Formily takeAsterisk：preview/disabled 模式下隐藏必填标记 */
      const showRequired = props.required && props.pattern === 'editable'

      return h('div', {
        'role': 'group',
        'data-field-path': fieldPath,
        'data-field-error': hasErrors ? 'true' : undefined,
        'aria-invalid': hasErrors ? 'true' : undefined,
        'aria-required': showRequired ? 'true' : undefined,
      }, [
        h(ElFormItem, {
          label: labelText,
          required: showRequired,
          error: errorMsg || undefined,
          labelWidth: computedLabelWidth,
          style: `${isVertical ? 'display: block;' : ''} ${alignStyle}`.trim() || undefined,
          class: !isVertical ? 'cf-form-item--right' : undefined,
        }, {
          default: () => [
            slots.default?.(),
            warningMsg
              ? h('div', {
                  style: 'color: #e6a23c; font-size: 12px; margin-top: 2px; flex-basis: 100%; width: 100%;',
                }, warningMsg)
              : null,
            props.description && !errorMsg
              ? h('div', {
                  style: 'color: #909399; font-size: 12px; margin-top: 2px; flex-basis: 100%; width: 100%;',
                }, props.description)
              : null,
          ],
        }),
      ])
    }
  },
})
