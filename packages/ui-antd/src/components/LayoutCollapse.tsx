import { Collapse as ACollapse } from 'antd'
import React from 'react'

export interface LayoutCollapseProps {
  activeKey?: string[]
  onChange?: (keys: string[]) => void
  items: Array<{ key: string; label: string; children: React.ReactNode }>
}

export function LayoutCollapse({ activeKey, onChange, items }: LayoutCollapseProps): React.ReactElement {
  return (
    <ACollapse
      activeKey={activeKey}
      onChange={keys => onChange?.(keys as string[])}
      items={items.map(item => ({
        key: item.key,
        label: item.label,
        children: item.children,
      }))}
    />
  )
}
