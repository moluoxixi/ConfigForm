import type { DesignerFieldType } from '../designer'

export interface LowCodeDesignerRenderContext {
  phase: 'material' | 'canvas' | 'preview'
  readonly: boolean
}

export type LowCodeDesignerEditablePropEditor = 'text' | 'textarea' | 'number' | 'switch' | 'select'

export interface LowCodeDesignerEditablePropOption {
  label: string
  value: string
}

export interface LowCodeDesignerEditableProp {
  key: string
  label: string
  editor?: LowCodeDesignerEditablePropEditor
  options?: LowCodeDesignerEditablePropOption[]
  defaultValue?: unknown
  description?: string
}

export interface LowCodeDesignerComponentDefinition {
  label?: string
  description?: string
  fieldType?: DesignerFieldType
  defaultProps?: Record<string, unknown>
  editableProps?: LowCodeDesignerEditableProp[]
}

export type LowCodeDesignerComponentDefinitions = Record<string, LowCodeDesignerComponentDefinition>
