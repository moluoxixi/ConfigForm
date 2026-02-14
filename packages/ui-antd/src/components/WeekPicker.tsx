import type { ReactElement } from 'react'
import { DatePicker } from 'antd'

export interface CfWeekPickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
}

export function WeekPicker({ value, onChange, onFocus, onBlur, disabled, preview, placeholder }: CfWeekPickerProps): ReactElement {
  return (
    <DatePicker
      picker="week"
      value={value as unknown as undefined}
      onChange={(_date: unknown, dateString: string | string[]) => onChange?.(dateString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
    />
  )
}
