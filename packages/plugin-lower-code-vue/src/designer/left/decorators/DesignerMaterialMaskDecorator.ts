import { defineComponent, h } from 'vue'

/**
 * Designer Material Mask Decorator：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/decorators/DesignerMaterialMaskDecorator.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerMaterialMaskDecorator = defineComponent({
  name: 'DesignerMaterialMaskDecorator',
  inheritAttrs: false,
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/decorators/DesignerMaterialMaskDecorator.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param _ 参数 `_`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ slots }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(_, { slots }) {
    return () => h('div', { class: 'cf-lc-mask-layer cf-lc-mask-layer--material cf-lc-mask-layer--locked' }, [
      h('div', { class: 'cf-lc-mask-layer-content' }, slots.default?.()),
      h('span', { 'class': 'cf-lc-mask-layer-overlay', 'aria-hidden': 'true' }),
    ])
  },
})
