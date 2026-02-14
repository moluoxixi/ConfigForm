import type { ReactElement } from 'react'
import { DatePicker as ADatePicker } from 'antd'
import dayjs from 'dayjs'

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
  const parsed = value ? dayjs(value) : undefined
  const pickerValue = parsed && parsed.isValid() ? parsed : undefined
  return (
    <ADatePicker
      value={pickerValue}
      onChange={(_date, dateString) => onChange?.(typeof dateString === 'string' ? dateString : '')}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
      style={{ width: '100%' }}
    />
  )
}
