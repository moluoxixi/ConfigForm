import { Tabs as ATabs } from 'antd'
import React from 'react'

export interface LayoutTabsProps {
  activeKey?: string
  onChange?: (key: string) => void
  items: Array<{ key: string, label: string, children: React.ReactNode }>
}

export function LayoutTabs({ activeKey, onChange, items }: LayoutTabsProps): React.ReactElement {
  return (
    <ATabs
      activeKey={activeKey}
      onChange={onChange}
      items={items.map(item => ({
        key: item.key,
        label: item.label,
        children: item.children,
      }))}
    />
  )
}
