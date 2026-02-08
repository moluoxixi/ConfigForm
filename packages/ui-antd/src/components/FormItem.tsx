import type { ValidationFeedback } from '@moluoxixi/validator'
import { Form as AForm } from 'antd'
import React from 'react'

export interface CfFormItemProps {
  label?: string
  required?: boolean
  errors?: ValidationFeedback[]
  warnings?: ValidationFeedback[]
  description?: string
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
export function FormItem({ label, required, errors = [], warnings = [], description, pattern = 'editable', labelPosition, labelWidth, children }: CfFormItemProps): React.ReactElement {
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

  return (
    <AForm.Item
      label={label}
      required={showRequired}
      colon
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
