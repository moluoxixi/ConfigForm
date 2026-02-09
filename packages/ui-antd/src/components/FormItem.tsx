import type { ValidationFeedback } from '@moluoxixi/core'
import { Form as AForm } from 'antd'
import React from 'react'

export interface CfFormItemProps {
  label?: string
  required?: boolean
  errors?: ValidationFeedback[]
  warnings?: ValidationFeedback[]
  description?: string
  /** 是否显示冒号后缀，默认 true；可通过 decoratorProps.colon 控制 */
  colon?: boolean
  /** 表单模式（editable/readOnly/disabled），readOnly/disabled 时隐藏必填标记 */
  pattern?: 'editable' | 'readOnly' | 'disabled'
  labelPosition?: 'top' | 'left' | 'right'
  labelWidth?: string | number
  children: React.ReactNode
}

/**
 * FormItem 装饰器适配（参考 Formily takeAsterisk）
 *
 * readOnly/disabled 时隐藏必填星号标记
 */
export function FormItem({ label, required, errors = [], warnings = [], description, colon = true, pattern = 'editable', labelPosition, labelWidth, children }: CfFormItemProps): React.ReactElement {
  const validateStatus = errors.length > 0
    ? 'error' as const
    : warnings.length > 0
      ? 'warning' as const
      : undefined

  const helpMsg = errors.length > 0
    ? errors[0].message
    : warnings.length > 0
      ? warnings[0].message
      : description

  /** 参考 Formily takeAsterisk：readOnly/disabled 模式下隐藏必填标记 */
  const showRequired = required && pattern === 'editable'

  const isVertical = labelPosition === 'top'
  const hasLabelWidth = !isVertical && labelWidth !== undefined
  const labelWidthPx = typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth

  /** 冒号由 colon prop 控制，手动追加到 label 文本（绕过 antd 垂直布局 CSS 隐藏） */
  const labelText = label
    ? (colon ? `${label} :` : label)
    : undefined

  return (
    <AForm.Item
      label={labelText}
      required={showRequired}
      colon={false}
      validateStatus={validateStatus}
      help={helpMsg}
      {...(isVertical
        ? { labelCol: { span: 24 }, wrapperCol: { span: 24 } }
        : hasLabelWidth
          ? { labelCol: { style: { width: labelWidthPx, flex: 'none' } }, wrapperCol: { style: { flex: '1' } } }
          : {})}
    >
      {children}
    </AForm.Item>
  )
}
