import type { CfInputProps } from './Input'
import { Input as AInput } from 'antd'
import React from 'react'

/**
 * Password：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Password.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, placeholder, disabled, preview }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Password({ value, onChange, onFocus, onBlur, placeholder, disabled, preview }: CfInputProps): React.ReactElement {
  return (
    <AInput.Password
      value={value}
      onChange={e => onChange?.(e.target.value)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
    />
  )
}
