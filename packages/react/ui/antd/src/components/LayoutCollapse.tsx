import type { ReactElement } from 'react'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'

import { Collapse as ACollapse } from 'antd'
import { useState } from 'react'

/**
 * Layout Collapse Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/LayoutCollapse.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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

  /**
   * get Data Path：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-antd/src/components/LayoutCollapse.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param path 参数 `path`用于提供当前函数执行所需的输入信息。
   * @returns 返回字符串结果，通常用于文本展示或下游拼接。
   */
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
            basePath={basePath}
            onlyRenderProperties
          />
        ),
      }))}
    />
  )
})

