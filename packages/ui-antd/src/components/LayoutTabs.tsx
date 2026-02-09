import { Tabs as ATabs } from 'antd'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/react'
import { observer } from '@moluoxixi/reactive-mobx'
import { useState } from 'react'
import type { ReactElement } from 'react'

export interface LayoutTabsProps {}

/**
 * 标签页布局容器
 *
 * 使用框架层 useSchemaItems() 发现子面板，
 * 用 RecursionField 渲染每个面板内容。
 */
export const LayoutTabs = observer((_props: LayoutTabsProps): ReactElement => {
  const field = useField()
  const items = useSchemaItems()
  const [activeKey, setActiveKey] = useState('0')

  return (
    <ATabs
      activeKey={activeKey}
      onChange={setActiveKey}
      items={items.map((item, index) => ({
        key: String(index),
        label: item.title,
        children: (
          <RecursionField
            schema={item.schema}
            name={item.name}
            basePath={field.path}
            onlyRenderProperties
          />
        ),
        forceRender: true,
      }))}
    />
  )
})
