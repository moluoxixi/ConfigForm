import type { PropType, VNodeChild } from 'vue'
import { defineComponent } from 'vue'

/**
 * Designer Properties Slot Renderer：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/components/DesignerPropertiesSlotRenderer/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerPropertiesSlotRenderer = defineComponent({
  name: 'DesignerPropertiesSlotRenderer',
  props: {
    render: {
      type: Function as PropType<() => VNodeChild>,
      required: true,
    },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/right/DesignerPropertiesPane/components/DesignerPropertiesSlotRenderer/index.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props) {
    return () => props.render()
  },
})
