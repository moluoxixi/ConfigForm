import type { CSSProperties, ReactElement } from 'react'
import { DatePicker } from 'antd'

export interface CfMonthPickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
  style?: CSSProperties
}

/**
 * Month Picker：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Month Picker 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function MonthPicker({ value, onChange, onFocus, onBlur, disabled, preview, placeholder, style }: CfMonthPickerProps): ReactElement {
  return (
    <DatePicker
      picker="month"
      value={value as unknown as undefined}
      onChange={(_date: unknown, dateString: string | string[]) => onChange?.(dateString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      format="YYYY-MM"
      style={{ width: '100%', ...style }}
    />
  )
}
