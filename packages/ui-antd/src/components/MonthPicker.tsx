import { DatePicker } from 'antd'
import type { ReactElement } from 'react'

export interface CfMonthPickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: string
}

export function MonthPicker({ value, onChange, onFocus, onBlur, disabled, readOnly, placeholder }: CfMonthPickerProps): ReactElement {
  return (
    <DatePicker
      picker="month"
      value={value as unknown as undefined}
      onChange={(_date: unknown, dateString: string | string[]) => onChange?.(dateString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || readOnly}
      placeholder={placeholder}
      format="YYYY-MM"
    />
  )
}
