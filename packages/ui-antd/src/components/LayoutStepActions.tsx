import { Button as AButton } from 'antd'
import React from 'react'

export interface LayoutStepActionsProps {
  current: number
  total: number
  loading?: boolean
  onPrev?: () => void
  onNext?: () => void
}

/**
 * Layout Step Actions：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Layout Step Actions 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function LayoutStepActions({ current, total, loading, onPrev, onNext }: LayoutStepActionsProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
      <div>{current > 0 && <AButton onClick={onPrev}>上一步</AButton>}</div>
      {current < total - 1 && <AButton type="primary" loading={loading} onClick={onNext}>下一步</AButton>}
    </div>
  )
}
