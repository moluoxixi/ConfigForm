import type { ReactElement } from 'react'
import { DatePicker as ADatePicker } from 'antd'

export interface CfDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
}

export function DatePicker({ value, onChange, onFocus, onBlur, placeholder, disabled, preview }: CfDatePickerProps): ReactElement {
  return (
    <ADatePicker
      value={value || undefined}
      onChange={(_date, dateString) => onChange?.(dateString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      style={{ width: '100%' }}
    />
  )
}
