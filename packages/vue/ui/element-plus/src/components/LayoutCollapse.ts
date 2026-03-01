import { RecursionField, useField, useForm, useSchemaItems } from '@moluoxixi/vue'
import { ElCollapse, ElCollapseItem } from 'element-plus'
import { defineComponent, h, ref } from 'vue'

/**
 * Collapse Component：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-element-plus/src/components/LayoutCollapse.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const CollapseComponent = ElCollapse as any
/**
 * Collapse Item Component：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-element-plus/src/components/LayoutCollapse.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const CollapseItemComponent = ElCollapseItem as any

/**
 * 折叠面板布局容器（Schema 感知模式）
 */
export const LayoutCollapse = defineComponent({
  name: 'CfLayoutCollapse',
  /**
   * setup：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-element-plus/src/components/LayoutCollapse.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup() {
    const field = useField()
    const form = useForm()
    const items = useSchemaItems()
    const activeKeys = ref(items.map(item => item.name))

    /**
     * get Data Path：封装该模块的核心渲染与交互逻辑。
     * 所属模块：`packages/ui-element-plus/src/components/LayoutCollapse.ts`。
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

    return () => h(CollapseComponent, {
      'modelValue': activeKeys.value,
      /**
       * onUpdate:modelValue：执行当前功能逻辑。
       *
       * @param keys 参数 keys 的输入说明。
       */

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

