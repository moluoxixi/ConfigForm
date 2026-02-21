import type { ReactElement } from 'react'
import { Rate as ARate } from 'antd'

export interface CfRateProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  preview?: boolean
  count?: number
  allowHalf?: boolean
}

/**
 * Rate：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Rate 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function Rate({ value, onChange, disabled, preview, count = 5, allowHalf = false }: CfRateProps): ReactElement {
  return (
    <ARate
      value={value}
      onChange={onChange}
      disabled={disabled || preview}
      count={count}
      allowHalf={allowHalf}
    />
  )
}
