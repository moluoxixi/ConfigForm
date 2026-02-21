import type { ReactElement } from 'react'
import { TimePicker as ATimePicker } from 'antd'

export interface CfTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  format?: string
}

/**
 * Time Picker：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Time Picker 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function TimePicker({ value, onChange, onFocus, onBlur, placeholder, disabled, format = 'HH:mm:ss' }: CfTimePickerProps): ReactElement {
  return (
    <ATimePicker
      value={(value || undefined) as any}
      onChange={(_time, timeString) => onChange?.(timeString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      format={format}
      style={{ width: '100%' }}
    />
  )
}
