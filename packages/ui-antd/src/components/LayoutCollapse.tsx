import type { ReactElement } from 'react'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'

import { Collapse as ACollapse } from 'antd'
import { useState } from 'react'

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
  const form = useForm()
  const items = useSchemaItems()
  const allKeys = items.map((_, i) => String(i))
  const [activeKeys, setActiveKeys] = useState(allKeys)

  const getDataPath = (path: string): string => {
    if (!path)
      return ''
    const segments = path.split('.')
    const dataSegments: string[] = []
    let currentPath = ''
    for (const seg of segments) {
      currentPath = currentPath ? `${currentPath}.${seg}` : seg
      if (form.getAllVoidFields().has(currentPath))
        continue
      dataSegments.push(seg)
    }
    return dataSegments.join('.')
  }

  const basePath = getDataPath(field.path)

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
            basePath={basePath}
            onlyRenderProperties
          />
        ),
      }))}
    />
  )
})
