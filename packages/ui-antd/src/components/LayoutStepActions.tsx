import { Button as AButton } from 'antd'
import React from 'react'

/**
 * Layout Step Actions Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/LayoutStepActions.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LayoutStepActionsProps {
  current: number
  total: number
  loading?: boolean
  onPrev?: () => void
  onNext?: () => void
}

/**
 * Layout Step Actions：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/LayoutStepActions.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ current, total, loading, onPrev, onNext }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function LayoutStepActions({ current, total, loading, onPrev, onNext }: LayoutStepActionsProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
      <div>{current > 0 && <AButton onClick={onPrev}>上一步</AButton>}</div>
      {current < total - 1 && <AButton type="primary" loading={loading} onClick={onNext}>下一步</AButton>}
    </div>
  )
}
