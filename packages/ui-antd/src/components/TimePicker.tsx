import type { ReactElement } from 'react'
import { TimePicker as ATimePicker } from 'antd'

export interface CfTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  format?: string
}

export function TimePicker({ value, onChange, onFocus, onBlur, placeholder, disabled, format = 'HH:mm:ss' }: CfTimePickerProps): ReactElement {
  return (
    <ATimePicker
      value={(value || undefined) as any}
      onChange={(_time, timeString) => onChange?.(timeString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      format={format}
      style={{ width: '100%' }}
    />
  )
}
