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
  style?: React.CSSProperties
}

/**
 * Input：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Input 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function Input({ value, onChange, onFocus, onBlur, placeholder, disabled, preview, style }: CfInputProps): React.ReactElement {
  return (
    <AInput
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
      style={{ width: '100%', ...style }}
    />
  )
}
