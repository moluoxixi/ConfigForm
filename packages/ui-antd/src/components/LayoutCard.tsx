import { Card as ACard } from 'antd'
import React from 'react'

/**
 * Layout Card Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/LayoutCard.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LayoutCardProps {
  title?: string
  size?: 'default' | 'small'
  children: React.ReactNode
}

/**
 * Layout Card：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/LayoutCard.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ title, size = 'small', children }）用于提供当前函数执行所需的输入信息。
 * @param param1.title 参数 title 的输入说明。
 * @param param1.size 参数 size 的输入说明。
 * @param param1.children 参数 children 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function LayoutCard({ title, size = 'small', children }: LayoutCardProps): React.ReactElement {
  return <ACard title={title} size={size} style={{ marginBottom: 16 }}>{children}</ACard>
}
