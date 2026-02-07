import { Card as ACard } from 'antd'
import React from 'react'

export interface LayoutCardProps {
  title?: string
  size?: 'default' | 'small'
  children: React.ReactNode
}

export function LayoutCard({ title, size = 'small', children }: LayoutCardProps): React.ReactElement {
  return <ACard title={title} size={size} style={{ marginBottom: 16 }}>{children}</ACard>
}
