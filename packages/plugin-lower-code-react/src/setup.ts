import type { RegisterComponentOptions } from '@moluoxixi/react'
import type { LowCodeDesignerProps } from './designer/types'
import { registerComponent } from '@moluoxixi/react'
import { createElement } from 'react'
import { LowCodeDesigner } from './LowCodeDesigner'

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
