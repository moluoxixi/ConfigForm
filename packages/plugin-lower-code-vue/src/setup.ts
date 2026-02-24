import type { RegisterComponentOptions } from '@moluoxixi/vue'
import { registerComponent } from '@moluoxixi/vue'
import { LowCodeDesigner } from './LowCodeDesigner'

/**
 * Setup Lower Code Designer Options：。
 * 所属模块：`packages/plugin-lower-code-vue/src/setup.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface SetupLowerCodeDesignerOptions {
  /** 注册到 schema.component 的名称，默认 LowCodeDesigner */
  name?: string
  /** 透传注册选项 */
  registerOptions?: RegisterComponentOptions
}

/**
 * 一键注册低代码设计器组件
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
 */
export function setupLowerCodeDesigner(options: SetupLowerCodeDesignerOptions = {}): void {
  registerComponent(options.name ?? 'LowCodeDesigner', LowCodeDesigner, options.registerOptions)
}
