import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { defineComponent } from 'vue'

/**
 * Designer Material Preview Renderer：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/renderers/DesignerMaterialPreviewRenderer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerMaterialPreviewRenderer = defineComponent({
  name: 'DesignerMaterialPreviewRenderer',
  props: {
    item: { type: Object as PropType<MaterialItem>, required: true },
    render: { type: Function as PropType<(item: MaterialItem) => VNodeChild>, required: true },
  },
  /**
   * setup：。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/renderers/DesignerMaterialPreviewRenderer.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回处理结果。
   */
  setup(props) {
    return () => props.render(props.item)
  },
})
