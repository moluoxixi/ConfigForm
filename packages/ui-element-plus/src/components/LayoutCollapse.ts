import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { ElCollapse, ElCollapseItem } from 'element-plus'
import { defineComponent, h, ref } from 'vue'

const CollapseComponent = ElCollapse as any
const CollapseItemComponent = ElCollapseItem as any

/**
 * 折叠面板布局容器（Schema 感知模式）
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
      'modelValue': activeKeys.value,
      'onUpdate:modelValue': (keys: unknown) => {
        if (Array.isArray(keys)) {
          activeKeys.value = keys.map(k => String(k))
          return
        }
        activeKeys.value = keys === undefined ? [] : [String(keys)]
      },
    }, () => items.map(item =>
      h(CollapseItemComponent, { key: item.name, name: item.name, title: item.title }, () =>
        h(RecursionField, {
          schema: item.schema,
          basePath,
          onlyRenderProperties: true,
        })),
    ))
  },
})
