import type { RegisterComponentOptions } from '@moluoxixi/vue'
import { registerComponent } from '@moluoxixi/vue'
import { LowCodeDesigner } from './LowCodeDesigner'

export interface SetupLowerCodeDesignerOptions {
  /** 注册到 schema.component 的名称，默认 LowCodeDesigner */
  name?: string
  /** 透传注册选项 */
  registerOptions?: RegisterComponentOptions
}

/**
 * 一键注册低代码设计器组件
 */
export function setupLowerCodeDesigner(options: SetupLowerCodeDesignerOptions = {}): void {
  registerComponent(options.name ?? 'LowCodeDesigner', LowCodeDesigner, options.registerOptions)
}
