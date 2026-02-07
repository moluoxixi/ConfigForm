import { Steps as ASteps } from 'antd'
import React from 'react'

export interface LayoutStepsProps {
  current: number
  items: Array<{ title: string; description?: string }>
}

export function LayoutSteps({ current, items }: LayoutStepsProps): React.ReactElement {
  return <ASteps current={current} items={items} style={{ marginBottom: 24 }} />
}
