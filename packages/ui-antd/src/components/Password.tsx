import type { CfInputProps } from './Input'
import { Input as AInput } from 'antd'
import React from 'react'

export function Password({ value, onChange, onFocus, onBlur, placeholder, disabled, preview }: CfInputProps): React.ReactElement {
  return (
    <AInput.Password
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}
