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
