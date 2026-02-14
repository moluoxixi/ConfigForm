import type { ISchema } from '@moluoxixi/core'
import { FormPath } from '@moluoxixi/core'
import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { Button as AButton, Step as AStep, Steps as ASteps } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

/**
 * 分步布局容器（Ant Design Vue）
 *
 * 功能：
 * - 每个步骤显示验证错误状态（status="error"）
 * - 提交失败时自动跳转到第一个有错误的步骤
 */
export const LayoutSteps = defineComponent({
  name: 'CfLayoutSteps',
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const current = ref(0)

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
    watch(() => form.errors.length, () => {
      if (form.errors.length === 0)
        return
      const currentItem = items[current.value]
      if (currentItem && getErrorCount(currentItem.name) > 0)
        return

      const firstErrorIndex = items.findIndex(item => getErrorCount(item.name) > 0)
      if (firstErrorIndex >= 0 && firstErrorIndex !== current.value) {
        current.value = firstErrorIndex
      }
    })

    return () => h('div', null, [
      h(ASteps, { current: current.value, style: 'margin-bottom: 24px' }, () =>
        items.map(item => h(AStep, {
          title: item.title,
          status: getErrorCount(item.name) > 0 ? 'error' : undefined,
        }))),
      ...items.map((item, index) =>
        h('div', { key: item.name, style: { display: index === current.value ? 'block' : 'none' } }, h(RecursionField, {
          schema: item.schema,
          name: item.name,
          basePath,
          onlyRenderProperties: true,
        })),
      ),
      h('div', { style: 'margin-top: 16px; display: flex; gap: 8px' }, [
        current.value > 0
          ? h(AButton, { onClick: () => { current.value-- } }, () => '上一步')
          : null,
        current.value < items.length - 1
          ? h(AButton, { type: 'primary', onClick: () => { current.value++ } }, () => '下一步')
          : null,
      ]),
    ])
  },
})
