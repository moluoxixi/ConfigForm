import { Input as AInput } from 'antd'
import React from 'react'

export interface CfInputProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
}

export function Input({ value, onChange, onFocus, onBlur, placeholder, disabled, preview }: CfInputProps): React.ReactElement {
  return (
    <AInput
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
    />
  )
}
