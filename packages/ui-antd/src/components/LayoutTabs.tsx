import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { FormPath } from '@moluoxixi/core'
import { observer, RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/react'

import { Tabs as ATabs, Badge } from 'antd'
import { useEffect, useState } from 'react'

/**
 * LayoutTabsProps??????
 * ???`packages/ui-antd/src/components/LayoutTabs.tsx:9`?
 * ??????????????????????????????
 */
export interface LayoutTabsProps {}

/**
 * 标签页布局容器
 *
 * 使用框架层 useSchemaItems() 发现子面板，
 * 用 RecursionField 渲染每个面板内容。
 *
 * 功能：
 * - 每个 Tab 页签显示该面板下的验证错误数量（Badge）
 * - 提交失败时自动跳转到第一个有错误的 Tab
 */
export const LayoutTabs = observer((_props: LayoutTabsProps): ReactElement => {
  const field = useField()
  const form = useForm()
  const items = useSchemaItems()
  const [activeKey, setActiveKey] = useState('0')

  /**
   * getDataPath?????????????????
   * ???`packages/ui-antd/src/components/LayoutTabs.tsx:35`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param path ?? path ????????????
   * @returns ?????????????
   */
  const /**
         * getDataPath：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutTabs.tsx:27`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param path 参数 path 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
    getDataPath = (path: string): string => {
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

  /**
   * collectDataPaths?????????????????
   * ???`packages/ui-antd/src/components/LayoutTabs.tsx:59`?
   * ?????????????????????????????????
   * ??????????????????????????
   * @param schema ?? schema ????????????
   * @param parentPath ?? parentPath ????????????
   * @param output ?? output ????????????
   */
  const /**
         * collectDataPaths：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd/src/components/LayoutTabs.tsx:42`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param schema 参数 schema 为当前功能所需的输入信息。
         * @param parentPath 参数 parentPath 为当前功能所需的输入信息。
         * @param output 参数 output 为当前功能所需的输入信息。
         */
    collectDataPaths = (schema: ISchema, parentPath: string, output: Set<string>): void => {
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

  /**
   * 统计某个面板下的验证错误数量
   *
   * 遍历 form.errors，按字段 path 的前缀匹配到对应面板。
   * 面板的字段路径前缀为 `{field.path}.{item.name}.`
   */
  const getErrorCount = (itemName: string): number => {
    const patterns = itemPatterns.get(itemName) ?? []
    if (patterns.length === 0)
      return 0
    return form.errors.filter(e =>
      patterns.some(pattern => FormPath.match(pattern, e.path)),
    ).length
  }

  /**
   * 提交验证失败时自动跳转到第一个有错误的 Tab
   *
   * 监听 form.errors 变化，如果当前 Tab 无错误，
   * 且其他 Tab 有错误，则跳转到第一个有错误的 Tab。
   */
  useEffect(() => {
    if (form.errors.length === 0)
      return

    const currentIndex = Number(activeKey)
    const currentItem = items[currentIndex]
    if (currentItem && getErrorCount(currentItem.name) > 0)
      return

    /* 找到第一个有错误的 Tab */
    const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
    if (firstErrorIndex >= 0 && firstErrorIndex !== currentIndex) {
      setActiveKey(String(firstErrorIndex))
    }
  }, [form.errors.length])

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
              {errorCount > 0 && (
                <Badge count={errorCount} size="small" />
              )}
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
