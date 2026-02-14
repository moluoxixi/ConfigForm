import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { FormPath } from '@moluoxixi/core'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'

import { Steps as ASteps, Button } from 'antd'
import { useEffect, useState } from 'react'

export interface LayoutStepsProps {}

/**
 * 分步布局容器
 *
 * 使用框架层 useSchemaItems() 发现步骤面板，
 * 一次只显示当前步骤，自动渲染上一步/下一步按钮。
 *
 * 功能：
 * - 每个步骤显示验证错误状态（status="error"）
 * - 提交失败时自动跳转到第一个有错误的步骤
 */
export const LayoutSteps = observer((_props: LayoutStepsProps): ReactElement => {
  const field = useField()
  const form = useForm()
  const items = useSchemaItems()
  const [current, setCurrent] = useState(0)

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

  const collectDataPaths = (schema: ISchema, parentPath: string, output: Set<string>): void => {
    if (!schema.properties)
      return
    for (const [name, childSchema] of Object.entries(schema.properties)) {
      if (childSchema.type === 'void') {
        collectDataPaths(childSchema, parentPath, output)
        continue
      }

      const nextPath = parentPath ? `${parentPath}.${name}` : name
      output.add(nextPath)

      if (childSchema.properties)
        collectDataPaths(childSchema, nextPath, output)

      if (childSchema.items) {
        const itemPath = `${nextPath}.*`
        output.add(itemPath)
        collectDataPaths(childSchema.items, itemPath, output)
      }
    }
  }

  const basePath = getDataPath(field.path)
  const itemPatterns = new Map(items.map((item) => {
    const paths = new Set<string>()
    collectDataPaths(item.schema, basePath, paths)
    return [item.name, Array.from(paths)] as const
  }))

  /** 统计某个步骤下的验证错误数量 */
  const getErrorCount = (itemName: string): number => {
    const patterns = itemPatterns.get(itemName) ?? []
    if (patterns.length === 0)
      return 0
    return form.errors.filter(e =>
      patterns.some(pattern => FormPath.match(pattern, e.path)),
    ).length
  }

  /** 提交失败时自动跳转到第一个有错误的步骤 */
  useEffect(() => {
    if (form.errors.length === 0)
      return

    const currentItem = items[current]
    if (currentItem && getErrorCount(currentItem.name) > 0)
      return

    const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
    if (firstErrorIndex >= 0 && firstErrorIndex !== current) {
      setCurrent(firstErrorIndex)
    }
  }, [form.errors.length])

  return (
    <div>
      <ASteps
        current={current}
        items={items.map(item => ({
          title: item.title,
          status: getErrorCount(item.name) > 0 ? 'error' as const : undefined,
        }))}
        style={{ marginBottom: 24 }}
      />
      <div>
        {items.map((item, index) => (
          <div key={item.name} style={{ display: index === current ? 'block' : 'none' }}>
            <RecursionField
              schema={item.schema}
              name={item.name}
              basePath={basePath}
              onlyRenderProperties
            />
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {current > 0 && (
          <Button onClick={() => setCurrent(current - 1)}>上一步</Button>
        )}
        {current < items.length - 1 && (
          <Button type="primary" onClick={() => setCurrent(current + 1)}>下一步</Button>
        )}
      </div>
    </div>
  )
})
