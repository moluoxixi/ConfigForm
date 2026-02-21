import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { Space as ASpace } from 'antd'

export interface SpaceProps {
  size?: number | [number, number]
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  children: ReactNode
  style?: CSSProperties
}

/**
 * Space：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Space 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function Space({
  size = 8,
  direction = 'horizontal',
  align = 'center',
  wrap = true,
  children,
  style,
}: SpaceProps): ReactElement {
  return (
    <ASpace
      size={size}
      direction={direction}
      align={align}
      wrap={wrap && direction === 'horizontal'}
      style={style}
    >
      {children}
    </ASpace>
  )
}
