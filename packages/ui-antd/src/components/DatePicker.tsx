import { DatePicker as ADatePicker } from 'antd'
import React from 'react'

export interface CfDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}

export function DatePicker({ value, onChange, placeholder, disabled, readOnly }: CfDatePickerProps): React.ReactElement {
  return (
    <ADatePicker
      value={value || undefined}
      onChange={(_date, dateString) => onChange?.(dateString as string)}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      style={{ width: '100%' }}
    />
  )
}
