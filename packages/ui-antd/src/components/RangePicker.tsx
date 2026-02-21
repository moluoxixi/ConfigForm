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

/**
 * Range Picker：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Range Picker 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
