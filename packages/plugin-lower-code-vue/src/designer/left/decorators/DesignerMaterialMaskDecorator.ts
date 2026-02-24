import { defineComponent, h } from 'vue'

/**
 * Designer Material Mask Decorator：。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/decorators/DesignerMaterialMaskDecorator.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerMaterialMaskDecorator = defineComponent({
  name: 'DesignerMaterialMaskDecorator',
  inheritAttrs: false,
  /**
   * setup：。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/decorators/DesignerMaterialMaskDecorator.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param _ 参数 `_`用于提供当前函数执行所需的输入信息。
   * @param context 组件上下文对象，包含具名插槽与 attrs 等运行时信息。
   * @param context.slots 当前组件可用的具名插槽集合。
   * @returns 返回处理结果。
   */
  setup(_, context) {
    const { slots } = context
    return () => h('div', { class: 'cf-lc-mask-layer cf-lc-mask-layer--material cf-lc-mask-layer--locked' }, [
      h('div', { class: 'cf-lc-mask-layer-content' }, slots.default?.()),
      h('span', { 'class': 'cf-lc-mask-layer-overlay', 'aria-hidden': 'true' }),
    ])
  },
})
