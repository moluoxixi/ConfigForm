/**
 * plugin-lower-code-react 包入口。
 * 本入口对外暴露 React 低代码设计器组件、配套类型以及初始化注册方法。
 * 调用方通过该文件即可完成完整接入，不需要感知内部目录结构。
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
} from './LowCodeDesigner'
export { setupLowerCodeDesigner } from './setup'
export type { SetupLowerCodeDesignerOptions } from './setup'
