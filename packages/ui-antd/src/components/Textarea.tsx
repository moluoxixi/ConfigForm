import { Input as AInput } from 'antd'
import React from 'react'
import type { CfInputProps } from './Input'

export interface CfTextareaProps extends CfInputProps {
  rows?: number
}

export function Textarea({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly, rows = 3 }: CfTextareaProps): React.ReactElement {
  return (
    <AInput.TextArea
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      rows={rows}
    />
  )
}
