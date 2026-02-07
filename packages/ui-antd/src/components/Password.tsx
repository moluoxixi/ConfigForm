import { Input as AInput } from 'antd'
import React from 'react'
import type { CfInputProps } from './Input'

export function Password({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly }: CfInputProps): React.ReactElement {
  return (
    <AInput.Password
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
    />
  )
}
