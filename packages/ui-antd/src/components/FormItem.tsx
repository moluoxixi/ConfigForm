import type { ValidationFeedback } from '@moluoxixi/validator'
import { Form as AForm } from 'antd'
import React from 'react'

export interface CfFormItemProps {
  label?: string
  required?: boolean
  errors?: ValidationFeedback[]
  warnings?: ValidationFeedback[]
  description?: string
  children: React.ReactNode
}

export function FormItem({ label, required, errors = [], warnings = [], description, children }: CfFormItemProps): React.ReactElement {
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

  return (
    <AForm.Item
      label={label}
      required={required}
      validateStatus={validateStatus}
      help={helpMsg}
    >
      {children}
    </AForm.Item>
  )
}
