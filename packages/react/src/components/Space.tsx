import type { CSSProperties, ReactElement, ReactNode } from 'react'
import React from 'react'

export interface SpaceProps {
  /** 间距大小（px），默认 8 */
  size?: number | [number, number]
  /** 方向：水平或垂直 */
  direction?: 'horizontal' | 'vertical'
  /** 对齐方式 */
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  /** 是否自动换行（仅水平方向有效） */
  wrap?: boolean
  children: ReactNode
}

/**
 * Space — 间距组件
 *
 * 使用 Flexbox 控制子元素间距，避免手动写 margin/gap。
 * 可作为布局组件注册到 Schema 中。
 *
 * @example
 * ```tsx
 * <Space size={16} direction="horizontal">
 *   <Input />
 *   <Select />
 * </Space>
 * ```
 */
export function Space({
  size = 8,
  direction = 'horizontal',
  align = 'center',
  wrap = true,
  children,
}: SpaceProps): ReactElement {
  const [rowGap, columnGap] = Array.isArray(size) ? size : [size, size]

  const style: CSSProperties = {
    display: 'inline-flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    alignItems: align === 'start' ? 'flex-start'
      : align === 'end' ? 'flex-end'
        : align,
    flexWrap: wrap && direction === 'horizontal' ? 'wrap' : 'nowrap',
    gap: `${rowGap}px ${columnGap}px`,
  }

  return <div style={style}>{children}</div>
}
