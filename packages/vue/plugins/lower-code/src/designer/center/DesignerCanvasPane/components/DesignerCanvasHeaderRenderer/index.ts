import { defineComponent, h } from 'vue'

/**
 * Designer Canvas Header Renderer：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/DesignerCanvasPane/components/DesignerCanvasHeaderRenderer/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerCanvasHeaderRenderer = defineComponent({
  name: 'DesignerCanvasHeaderRenderer',
  /**
   * setup：。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/center/DesignerCanvasPane/components/DesignerCanvasHeaderRenderer/index.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @returns 返回处理结果。
   */
  setup() {
    return () => h('div', {
      style: {
        padding: '12px 14px',
        borderBottom: '1px solid #edf2f7',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f5f9ff 100%)',
        fontSize: '13px',
        fontWeight: 700,
      },
    }, '画布')
  },
})
