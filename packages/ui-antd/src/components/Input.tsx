import { Input as AInput } from 'antd'
import React from 'react'

/**
 * Cf Input Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Input.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
 * Input：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Input.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, placeholder, disabled, preview, style }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
