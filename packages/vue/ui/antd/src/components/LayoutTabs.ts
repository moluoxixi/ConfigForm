import type { ISchema } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'
import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { Badge as ABadge, TabPane as ATabPane, Tabs as ATabs } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

const TabsComponent = ATabs as any
const TabPaneComponent = ATabPane as any
const BadgeComponent = ABadge as any

/**
 * 标签页布局容器（Ant Design Vue）
 *
 * 功能：
 * - 每个 Tab 页签显示该面板下的验证错误数量（Badge）
 * - 提交失败时自动跳转到第一个有错误的 Tab
 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const activeKey = ref(items.length > 0 ? items[0].name : '')

    /**
     * getDataPath?????????????????
     * ???`packages/ui-antd-vue/src/components/LayoutTabs.ts:41`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param path ?? path ????????????
     * @returns ?????????????
     */
    const /**
           * getDataPath：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
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
     * ???`packages/ui-antd-vue/src/components/LayoutTabs.ts:65`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param schema ?? schema ????????????
     * @param parentPath ?? parentPath ????????????
     * @param output ?? output ????????????
     */
    const /**
           * collectDataPaths：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
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

    /** 统计某个面板下的验证错误数量 */
    const getErrorCount = (itemName: string): number => {
      const patterns = itemPatterns.get(itemName) ?? []
      if (patterns.length === 0)
        return 0
      return form.errors.filter(e =>
        patterns.some(pattern => FormPath.match(pattern, e.path)),
      ).length
    }

    /** 提交失败时自动跳转到第一个有错误的 Tab */
    watch(() => form.errors.length, () => {
      if (form.errors.length === 0)
        return
      const currentItem = items.find(item => item.name === activeKey.value)
      if (currentItem && getErrorCount(currentItem.name) > 0)
        return

      const firstErrorItem = items.find(item => getErrorCount(item.name) > 0)
      if (firstErrorItem && firstErrorItem.name !== activeKey.value) {
        activeKey.value = firstErrorItem.name
      }
    })

    return () => h(TabsComponent, {
      'activeKey': activeKey.value,
      /**
       * onUpdate:activeKey：处理当前分支的交互与状态同步。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @param k 参数 k 为当前功能所需的输入信息。
       */
      'onUpdate:activeKey': (k: unknown) => { activeKey.value = String(k ?? '') },
    }, () => items.map((item) => {
      const errorCount = getErrorCount(item.name)

      /** Tab 标题：带错误 Badge */
      const tabLabel = errorCount > 0
        ? h('span', { style: 'display: inline-flex; align-items: center; gap: 4px' }, [
            item.title,
            h(BadgeComponent, { count: errorCount, size: 'small' }),
          ])
        : item.title

      return h(TabPaneComponent, { key: item.name, tab: tabLabel, forceRender: true }, () =>
        h(RecursionField, {
          schema: item.schema,
          basePath,
          onlyRenderProperties: true,
        }))
    }))
  },
})
