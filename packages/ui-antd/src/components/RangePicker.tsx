import { DatePicker } from 'antd'
import type { ReactElement } from 'react'

const { RangePicker: ARangePicker } = DatePicker

export interface CfRangePickerProps {
  value?: [string, string] | null
  onChange?: (dates: [string, string] | null) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  readOnly?: boolean
  placeholder?: [string, string]
  format?: string
}

export function RangePicker({ value, onChange, onFocus, onBlur, disabled, readOnly, placeholder, format = 'YYYY-MM-DD' }: CfRangePickerProps): ReactElement {
  return (
    <ARangePicker
      value={value as unknown as undefined}
      onChange={(_dates: unknown, dateStrings: [string, string]) => onChange?.(dateStrings)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || readOnly}
      placeholder={placeholder}
      format={format}
    />
  )
}
