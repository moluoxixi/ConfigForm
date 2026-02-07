import type { ReactElement } from 'react'
import { InputNumber as AInputNumber } from 'antd'

export interface CfInputNumberProps {
  value?: number
  onChange?: (value?: number) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
  min?: number
  max?: number
  step?: number
}

/**
 * InputNumber 适配组件
 *
 * Ant Design 的 InputNumber.onChange 传入 number | null，
 * 清空时传 null，统一转为 undefined 传递给表单字段。
 */
export function InputNumber({ value, onChange, onFocus, onBlur, placeholder, disabled, readOnly, min, max, step = 1 }: CfInputNumberProps): ReactElement {
  if (readOnly) {
    return <span>{value != null ? String(value) : '—'}</span>
  }

  return (
    <AInputNumber
      value={value}
      onChange={v => onChange?.(v ?? undefined)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      style={{ width: '100%' }}
    />
  )
}
