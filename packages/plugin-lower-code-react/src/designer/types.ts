import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerFieldType,
  DesignerFieldNode,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { ReactNode } from 'react'

export type LowCodePreviewRenderMode = 'auto' | 'mock' | 'registry'

export interface LowCodeDesignerRenderContext {
  /**
   * 预览渲染阶段：
   * - material: 左侧物料区
   * - canvas: 中间画布节点预览
   * - preview: 底部实时预览面板
   */
  phase: 'material' | 'canvas' | 'preview'
  readonly: boolean
}

export interface LowCodeDesignerRenderers {
  /**
   * 渲染物料/节点预览（字段与布局容器都走这里）。
   * 返回 undefined 时会回退到内置渲染器。
   */
  renderMaterialPreview?: (item: MaterialItem, context: LowCodeDesignerRenderContext) => ReactNode | undefined
  /**
   * 渲染底部实时预览的字段控件。
   * 返回 undefined 时会回退到内置渲染器。
   */
  renderFieldPreviewControl?: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => ReactNode | undefined
}

export type LowCodeDesignerEditablePropEditor = 'text' | 'textarea' | 'number' | 'switch' | 'select'

export interface LowCodeDesignerEditablePropOption {
  label: string
  value: string
}

export interface LowCodeDesignerEditableProp {
  /**
   * componentProps 的 key。
   */
  key: string
  /**
   * 属性面板显示名称。
   */
  label: string
  /**
   * 编辑器类型，默认 text。
   */
  editor?: LowCodeDesignerEditablePropEditor
  /**
   * select 选项。
   */
  options?: LowCodeDesignerEditablePropOption[]
  /**
   * 默认值。
   */
  defaultValue?: unknown
  /**
   * 辅助提示。
   */
  description?: string
}

export interface LowCodeDesignerComponentDefinition {
  /**
   * 左侧物料名称。
   */
  label?: string
  /**
   * 左侧物料描述。
   */
  description?: string
  /**
   * 该组件对应字段类型（影响默认值和类型切换）。
   */
  fieldType?: DesignerFieldType
  /**
   * 新建节点默认 componentProps。
   */
  defaultProps?: Record<string, unknown>
  /**
   * 右侧属性面板的组件专属可编辑配置。
   */
  editableProps?: LowCodeDesignerEditableProp[]
}

export interface LowCodeDesignerProps {
  value?: unknown
  onChange?: (value: ISchema) => void
  minCanvasHeight?: number
  /**
   * 预览渲染模式：
   * - auto: 有可用注册组件时优先真实组件，否则回退 mock
   * - registry: 强制真实组件渲染（缺失时按单项回退）
   * - mock: 强制使用轻量 mock 预览
   */
  previewRenderMode?: LowCodePreviewRenderMode
  /**
   * 可选渲染器覆盖，用于 UI 层定制物料/预览表现。
   */
  renderers?: LowCodeDesignerRenderers
  /**
   * 组件声明（可选覆盖）：
   * - 按组件名声明字段类型、默认 props、右侧可编辑属性。
   * - 仅在设计器插件内生效，不依赖 React 核心注册表扩展字段。
   */
  componentDefinitions?: Record<string, LowCodeDesignerComponentDefinition>
}
