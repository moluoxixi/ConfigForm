import type { CSSProperties, ReactElement } from 'react'
import { DatePicker as ADatePicker } from 'antd'
import dayjs from 'dayjs'

export interface CfDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  style?: CSSProperties
}

/**
 * Date Picker：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Date Picker 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function DatePicker({ value, onChange, onFocus, onBlur, placeholder, disabled, preview, style }: CfDatePickerProps): ReactElement {
  const parsed = value ? dayjs(value) : undefined
  const pickerValue = parsed && parsed.isValid() ? parsed : undefined
  return (
    <ADatePicker
      value={pickerValue}
      onChange={(_date, dateString) => onChange?.(typeof dateString === 'string' ? dateString : '')}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
      style={{ width: '100%', ...style }}
    />
  )
}
