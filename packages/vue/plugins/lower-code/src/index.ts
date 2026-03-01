/**
 * plugin-lower-code-vue 包入口。
 * 该入口导出 Vue 低代码设计器组件、渲染上下文类型与安装初始化方法。
 * 目标是让业务侧仅依赖一个稳定入口完成能力集成。
 */
export { LowCodeDesigner } from './LowCodeDesigner'
export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerDecoratorDefinition,
  LowCodeDesignerDecoratorDefinitions,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerProps,
  LowCodeDesignerRenderContext,
  LowCodeDesignerRenderers,
} from './LowCodeDesigner'
export { setupLowerCodeDesigner } from './setup'
export type { SetupLowerCodeDesignerOptions } from './setup'
