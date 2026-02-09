import type { CfInputProps } from './Input'
import { Input as AInput } from 'antd'
import React from 'react'

export interface CfTextareaProps extends CfInputProps {
  rows?: number
}

export function Textarea({ value, onChange, onFocus, onBlur, placeholder, disabled, preview, rows = 3 }: CfTextareaProps): React.ReactElement {
  return (
    <AInput.TextArea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
    />
  )
}
