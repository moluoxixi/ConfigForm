import type { ISchema } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'
import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { ElBadge, ElTabPane, ElTabs } from 'element-plus'
import { defineComponent, h, ref, watch } from 'vue'

const TabsComponent = ElTabs as any
const TabPaneComponent = ElTabPane as any
const BadgeComponent = ElBadge as any

/**
 * 标签页布局容器（Element Plus）
 *
 * 功能：
 * - 每个 Tab 页签显示该面板下的验证错误数量（Badge）
 * - 提交失败时自动跳转到第一个有错误的 Tab
 */
export const LayoutTabs = defineComponent({
  name: 'CfLayoutTabs',
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:20`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const activeKey = ref(items.length > 0 ? items[0].name : '')

    /**
     * getDataPath?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutTabs.ts:41`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param path ?? path ????????????
     * @returns ?????????????
     */
    const /**
           * getDataPath：执行当前位置的功能逻辑。
           * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:26`。
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
     * ???`packages/ui-element-plus/src/components/LayoutTabs.ts:65`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param schema ?? schema ????????????
     * @param parentPath ?? parentPath ????????????
     * @param output ?? output ????????????
     */
    const /**
           * collectDataPaths：执行当前位置的功能逻辑。
           * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:41`。
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
     * getErrorCount?????????????????
     * ???`packages/ui-element-plus/src/components/LayoutTabs.ts:103`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param itemName ?? itemName ????????????
     * @returns ?????????????
     */
    const /**
           * getErrorCount：执行当前位置的功能逻辑。
           * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:71`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @param itemName 参数 itemName 为当前功能所需的输入信息。
           * @returns 返回当前分支执行后的处理结果。
           */
      getErrorCount = (itemName: string): number => {
        const patterns = itemPatterns.get(itemName) ?? []
        if (patterns.length === 0)
          return 0
        return form.errors.filter(e =>
          patterns.some(pattern => FormPath.match(pattern, e.path)),
        ).length
      }

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
      'modelValue': activeKey.value,
      /**
       * onUpdate:modelValue：执行当前位置的功能逻辑。
       * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:95`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @param k 参数 k 为当前功能所需的输入信息。
       */
      'onUpdate:modelValue': (k: unknown) => { activeKey.value = String(k ?? '') },
    }, () => items.map((item) => {
      const errorCount = getErrorCount(item.name)

      const tabLabel = errorCount > 0
        ? h('span', { style: 'display: inline-flex; align-items: center; gap: 4px' }, [
            item.title,
            h(BadgeComponent, { value: errorCount, type: 'danger' }),
          ])
        : item.title

      return h(TabPaneComponent, { key: item.name, name: item.name }, {
        /**
         * default：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:107`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        default: () => h(RecursionField, {
          schema: item.schema,
          basePath,
          onlyRenderProperties: true,
        }),
        /**
         * label：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/LayoutTabs.ts:112`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        label: () => tabLabel,
      })
    }))
  },
})
