import type { RegisterComponentOptions } from '@moluoxixi/react'
import type { LowCodeDesignerProps } from './designer/types'
import { registerComponent } from '@moluoxixi/react'
import { createElement } from 'react'
import { LowCodeDesigner } from './LowCodeDesigner'

/**
 * Setup Lower Code Designer Options：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/setup.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface SetupLowerCodeDesignerOptions {
  /** 注册到 schema.component 的名称，默认 LowCodeDesigner */
  name?: string
  /** 透传注册选项 */
  registerOptions?: RegisterComponentOptions
  /** 默认透传到 LowCodeDesigner 的 props（schema 中可按需覆盖） */
  designerProps?: Omit<LowCodeDesignerProps, 'value' | 'onChange'>
}

/**
 * 一键注册低代码设计器组件
 *
 * @example
 * ```ts
 * setupLowerCodeDesigner()
 * // schema: { component: 'LowCodeDesigner' }
 * ```
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
 */
export function setupLowerCodeDesigner(options: SetupLowerCodeDesignerOptions = {}): void {
  const Designer = options.designerProps
    ? (props: LowCodeDesignerProps) => createElement(LowCodeDesigner, {
        ...options.designerProps,
        ...props,
      })
    : LowCodeDesigner
  registerComponent(options.name ?? 'LowCodeDesigner', Designer, options.registerOptions)
}
