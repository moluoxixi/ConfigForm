import type { DesignerFieldType } from '../designer'

/**
 * Low Code Designer Render Context：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerRenderContext {
  phase: 'material' | 'canvas' | 'preview'
  readonly: boolean
}

/**
 * Low Code Designer Editable Prop Editor：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type LowCodeDesignerEditablePropEditor = 'text' | 'textarea' | 'number' | 'switch' | 'select'

/**
 * Low Code Designer Editable Prop Option：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerEditablePropOption {
  label: string
  value: string
}

/**
 * Low Code Designer Editable Prop：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerEditableProp {
  key: string
  label: string
  editor?: LowCodeDesignerEditablePropEditor
  options?: LowCodeDesignerEditablePropOption[]
  defaultValue?: unknown
  description?: string
}

/**
 * Low Code Designer Component Definition：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface LowCodeDesignerComponentDefinition {
  label?: string
  description?: string
  fieldType?: DesignerFieldType
  defaultProps?: Record<string, unknown>
  editableProps?: LowCodeDesignerEditableProp[]
}

/**
 * Low Code Designer Decorator Definition：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述装饰器在右侧属性面板中的配置定义。
 */
export interface LowCodeDesignerDecoratorDefinition {
  label?: string
  description?: string
  defaultProps?: Record<string, unknown>
  editableProps?: LowCodeDesignerEditableProp[]
}

/**
 * Low Code Designer Component Definitions：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type LowCodeDesignerComponentDefinitions = Record<string, LowCodeDesignerComponentDefinition>

/**
 * Low Code Designer Decorator Definitions：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/types.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type LowCodeDesignerDecoratorDefinitions = Record<string, LowCodeDesignerDecoratorDefinition>
