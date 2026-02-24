import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { Space as ASpace } from 'antd'

/**
 * Space Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Space.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface SpaceProps {
  size?: number | [number, number]
  direction?: 'horizontal' | 'vertical'
  align?: 'start' | 'end' | 'center' | 'baseline'
  wrap?: boolean
  children: ReactNode
  style?: CSSProperties
}

/**
 * Space：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Space.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  size = 8,
  direction = 'horizontal',
  align = 'center',
  wrap = true,
  children,
  style,
}）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
