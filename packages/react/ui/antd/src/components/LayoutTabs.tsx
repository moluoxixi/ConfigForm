import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { FormPath } from '@moluoxixi/core'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'
import { Badge, Tabs as ATabs } from 'antd'
import { useEffect, useState } from 'react'

export interface LayoutTabsProps {}

export const LayoutTabs = observer((_props: LayoutTabsProps): ReactElement => {
  const field = useField()
  const form = useForm()
  const items = useSchemaItems()
  const [activeKey, setActiveKey] = useState('0')

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

  const getErrorCount = (itemName: string): number => {
    const patterns = itemPatterns.get(itemName) ?? []
    if (patterns.length === 0)
      return 0
    return form.errors.filter(e => patterns.some(pattern => FormPath.match(pattern, e.path))).length
  }

  useEffect(() => {
    if (form.errors.length === 0)
      return
    const currentIndex = Number(activeKey)
    const currentItem = items[currentIndex]
    if (currentItem && getErrorCount(currentItem.name) > 0)
      return
    const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
    if (firstErrorIndex >= 0 && firstErrorIndex !== currentIndex) {
      setActiveKey(String(firstErrorIndex))
    }
  }, [activeKey, form.errors.length, items])

  return (
    <ATabs
      activeKey={activeKey}
      onChange={setActiveKey}
      items={items.map((item, index) => {
        const errorCount = getErrorCount(item.name)
        return {
          key: String(index),
          label: (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              {item.title}
              {errorCount > 0 && <Badge count={errorCount} size="small" />}
            </span>
          ),
          children: (
            <RecursionField
              schema={item.schema}
              basePath={basePath}
              onlyRenderProperties
            />
          ),
          forceRender: true,
        }
      })}
    />
  )
})
