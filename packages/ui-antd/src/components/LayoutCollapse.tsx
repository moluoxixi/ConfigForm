import { Collapse as ACollapse } from 'antd'
import { useField, useSchemaItems, RecursionField } from '@moluoxixi/react'
import { observer } from '@moluoxixi/reactive-mobx'
import { useState } from 'react'
import type { ReactElement } from 'react'

export interface LayoutCollapseProps {}

/**
 * 折叠面板布局容器
 *
 * 使用框架层 useSchemaItems() 发现子面板，
 * 用 RecursionField 渲染每个面板内容。
 * 默认全部展开。
 */
export const LayoutCollapse = observer((_props: LayoutCollapseProps): ReactElement => {
  const field = useField()
  const items = useSchemaItems()
  const allKeys = items.map((_, i) => String(i))
  const [activeKeys, setActiveKeys] = useState(allKeys)

  return (
    <ACollapse
      activeKey={activeKeys}
      onChange={keys => setActiveKeys(keys as string[])}
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
      }))}
    />
  )
})
