import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  MaterialFieldItem,
} from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { RegistrySnapshot } from './registry-shared'
import type { ResolvedLowCodeDesignerRenderers } from './types'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import { PreviewBoundary } from './PreviewBoundary'
import { SchemaPreview } from './SchemaPreview'

const DEFAULT_SELECT_OPTIONS = [
  { label: '选项一', value: 'option_1' },
  { label: '选项二', value: 'option_2' },
]
const PREVIEW_FIELD_NAME = '__preview__'
/**
 * 这里列出的组件不走 registry 真实预览。
 * 原因：在预览态可能触发副作用或上下文递归渲染。
 */
const UNSAFE_REGISTRY_PREVIEW_COMPONENTS = new Set(['StatusTabs'])

/**
 * has Component：负责“判断has Component”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 has Component 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function hasComponent(registry: RegistrySnapshot, componentName: string): boolean {
  return registry.components.has(componentName)
}

/**
 * resolve Field Props By Component：负责“解析resolve Field Props By Component”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Field Props By Component 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveFieldPropsByComponent(
  component: DesignerFieldComponent,
  title: string,
  options: Array<{ label: string, value: string }>,
  value: unknown,
  componentProps?: Record<string, unknown>,
): Record<string, unknown> {
  // 按组件类型构建“保守且稳定”的预览属性。
  const base = {
    disabled: false,
    preview: false,
  }

  switch (component) {
    case 'Textarea': {
      const resolved = {
        ...base,
        value: String(value ?? ''),
        placeholder: `请输入${title}`,
        rows: 3,
      }
      return { ...resolved, ...componentProps }
    }
    case 'Select': {
      const resolved = {
        ...base,
        value: value ?? '',
        placeholder: `请选择${title}`,
        dataSource: options.length > 0 ? options : DEFAULT_SELECT_OPTIONS,
      }
      return { ...resolved, ...componentProps }
    }
    case 'InputNumber': {
      const resolved = {
        ...base,
        value: typeof value === 'number' ? value : 0,
        placeholder: `请输入${title}`,
      }
      return { ...resolved, ...componentProps }
    }
    case 'Switch': {
      const resolved = {
        ...base,
        value: Boolean(value),
      }
      return { ...resolved, ...componentProps }
    }
    case 'DatePicker': {
      const resolved = {
        ...base,
        value: typeof value === 'string' ? value : '',
        placeholder: `请选择${title}`,
      }
      return { ...resolved, ...componentProps }
    }
    case 'Input':
    default:
    {
      const resolved = {
        ...base,
        checked: Boolean(value),
        value: value ?? '',
        placeholder: `请输入${title}`,
      }
      return { ...resolved, ...componentProps }
    }
  }
}

/**
 * split Preview Props：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 split Preview Props 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function splitPreviewProps(
  component: DesignerFieldComponent,
  props: Record<string, unknown>,
): { componentProps: Record<string, unknown>, initialValue: unknown } {
  // ConfigForm 的字段值在 form state，不应留在 componentProps。
  const nextComponentProps = { ...props }
  let initialValue: unknown

  if (component === 'Switch') {
    initialValue = Boolean(nextComponentProps.value ?? nextComponentProps.checked)
  }
  else {
    initialValue = nextComponentProps.value
  }

  delete nextComponentProps.value
  delete nextComponentProps.checked

  return {
    componentProps: nextComponentProps,
    initialValue,
  }
}

/**
 * build Preview Schema：负责“构建build Preview Schema”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 build Preview Schema 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function buildPreviewSchema(
  type: DesignerFieldType,
  component: DesignerFieldComponent,
  title: string,
  componentProps: Record<string, unknown>,
  options: Array<{ label: string, value: string }>,
): ISchema {
  // 构建最小单字段 schema，用于独立组件预览。
  const fieldSchema: ISchema = {
    type,
    title,
    component,
    decorator: '',
    componentProps,
  }

  if (component === 'Select') {
    fieldSchema.enum = options.map(option => ({
      label: option.label,
      value: option.value,
    }))
  }

  return {
    type: 'object',
    decoratorProps: {
      labelPosition: 'top',
    },
    properties: {
      [PREVIEW_FIELD_NAME]: fieldSchema,
    },
  }
}

/**
 * render Material Field Preview：负责“渲染render Material Field Preview”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Material Field Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function renderMaterialFieldPreview(
  registry: RegistrySnapshot,
  item: MaterialFieldItem,
): React.ReactElement | null {
  // 物料预览使用空值/默认值，展示组件基线形态。
  if (UNSAFE_REGISTRY_PREVIEW_COMPONENTS.has(item.component))
    return null
  if (!hasComponent(registry, item.component))
    return null
  const props = resolveFieldPropsByComponent(
    item.component,
    item.label,
    DEFAULT_SELECT_OPTIONS,
    '',
    item.componentProps,
  )
  const { componentProps, initialValue } = splitPreviewProps(item.component, props)
  const schema = buildPreviewSchema(
    item.type,
    item.component,
    item.label,
    componentProps,
    DEFAULT_SELECT_OPTIONS,
  )

  return (
    <SchemaPreview
      schema={schema}
      registry={registry}
      initialValues={{ [PREVIEW_FIELD_NAME]: initialValue }}
      className="cf-lc-real-preview-wrap"
    />
  )
}

/**
 * render Node Field Preview：负责“渲染render Node Field Preview”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Node Field Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function renderNodeFieldPreview(
  registry: RegistrySnapshot,
  node: DesignerFieldNode,
): React.ReactElement | null {
  // 节点预览使用当前节点值和选项，尽量贴近画布语义。
  if (UNSAFE_REGISTRY_PREVIEW_COMPONENTS.has(node.component))
    return null
  if (!hasComponent(registry, node.component))
    return null
  const options = node.enumOptions.map(option => ({ label: option.label, value: option.value }))
  const value = previewValueByNode(node)
  const props = resolveFieldPropsByComponent(node.component, node.title, options, value, node.componentProps)
  const { componentProps, initialValue } = splitPreviewProps(node.component, props)
  const schema = buildPreviewSchema(
    node.type,
    node.component,
    node.title,
    componentProps,
    options,
  )
  return (
    <SchemaPreview
      schema={schema}
      registry={registry}
      initialValues={{ [PREVIEW_FIELD_NAME]: initialValue }}
      className="cf-lc-real-preview-wrap"
    />
  )
}

/**
 * can Use Registry Renderers：负责“判断can Use Registry Renderers”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 can Use Registry Renderers 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function canUseRegistryRenderers(registry: RegistrySnapshot): boolean {
  return registry.components.size > 0
}

/**
 * create Registry Renderers：负责“创建create Registry Renderers”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Registry Renderers 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function createRegistryRenderers(
  registry: RegistrySnapshot,
  fallback: ResolvedLowCodeDesignerRenderers,
): ResolvedLowCodeDesignerRenderers {
  return {
    renderMaterialPreview: (item, context) => {
      // 容器预览统一走轻量 mock，规避 LayoutTabs/LayoutCollapse 在设计态引起的渲染副作用。
      if (item.kind === 'container')
        return fallback.renderMaterialPreview(item, context)

      const fallbackNode = fallback.renderMaterialPreview(item, context)
      const registryNode = renderMaterialFieldPreview(registry, item)
      if (!registryNode)
        return fallbackNode

      return (
        <PreviewBoundary
          key={`material:${item.id}:${context.phase}`}
          fallback={fallbackNode}
        >
          {registryNode}
        </PreviewBoundary>
      )
    },
    renderFieldPreviewControl: (node, context) => {
      const fallbackNode = fallback.renderFieldPreviewControl(node, context)
      const registryNode = renderNodeFieldPreview(registry, node)
      if (!registryNode)
        return fallbackNode
      return (
        <PreviewBoundary
          key={`field:${node.id}:${context.phase}`}
          fallback={fallbackNode}
        >
          {registryNode}
        </PreviewBoundary>
      )
    },
  }
}
