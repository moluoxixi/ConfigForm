import { InputNumber as AInputNumber } from 'antd'
import React from 'react'

export interface CfInputNumberProps {
  value?: number
  onChange?: (value: number) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  min?: number
  max?: number
  step?: number
}

export function InputNumber({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly, min, max, step = 1 }: CfInputNumberProps): React.ReactElement {
  return (
    <AInputNumber
      value={value}
      onChange={v => onChange?.(v as number)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || readOnly}
      min={min}
      max={max}
      step={step}
      style={{ width: '100%' }}
    />
  )
}
