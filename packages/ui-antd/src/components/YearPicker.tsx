import { DatePicker } from 'antd'
import type { ReactElement } from 'react'

export interface CfYearPickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
}

export function YearPicker({ value, onChange, onFocus, onBlur, disabled, preview, placeholder }: CfYearPickerProps): ReactElement {
  return (
    <DatePicker
      picker="year"
      value={value as unknown as undefined}
      onChange={(_date: unknown, dateString: string | string[]) => onChange?.(dateString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      format="YYYY"
    />
  )
}
