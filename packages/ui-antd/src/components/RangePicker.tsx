import type { CSSProperties, ReactElement } from 'react'
import { DatePicker } from 'antd'

const { RangePicker: ARangePicker } = DatePicker

export interface CfRangePickerProps {
  value?: [string, string] | null
  onChange?: (dates: [string, string] | null) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: [string, string]
  format?: string
  style?: CSSProperties
}

export function RangePicker({ value, onChange, onFocus, onBlur, disabled, preview, placeholder, format = 'YYYY-MM-DD', style }: CfRangePickerProps): ReactElement {
  return (
    <ARangePicker
      value={value as unknown as undefined}
      onChange={(_dates: unknown, dateStrings: [string, string]) => onChange?.(dateStrings)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      format={format}
      style={{ width: '100%', ...style }}
    />
  )
}
