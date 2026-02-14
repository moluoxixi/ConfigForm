import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { Collapse as ACollapse, CollapsePanel as ACollapsePanel } from 'ant-design-vue'
import { defineComponent, h, ref } from 'vue'

const CollapseComponent = ACollapse as any
const CollapsePanelComponent = ACollapsePanel as any

/**
 * 折叠面板布局容器（Schema 感知模式）
 *
 * 使用框架层 useSchemaItems() 发现子面板，默认全部展开。
 */
export const LayoutCollapse = defineComponent({
  name: 'CfLayoutCollapse',
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const activeKeys = ref(items.map(item => item.name))

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

    return () => h(CollapseComponent, {
      'activeKey': activeKeys.value,
      'onUpdate:activeKey': (keys: unknown) => {
        if (Array.isArray(keys)) {
          activeKeys.value = keys.map(k => String(k))
          return
        }
        activeKeys.value = keys === undefined ? [] : [String(keys)]
      },
    }, () => items.map(item =>
      h(CollapsePanelComponent, { key: item.name, header: item.title }, () =>
        h(RecursionField, {
          schema: item.schema,
          name: item.name,
          basePath,
          onlyRenderProperties: true,
        })),
    ))
  },
})
