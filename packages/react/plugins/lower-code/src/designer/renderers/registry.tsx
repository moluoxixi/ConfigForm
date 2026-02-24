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

const PREVIEW_FIELD_NAME = '__preview_field__'
const DEFAULT_SELECT_OPTIONS: Array<{ label: string, value: string }> = [
  { label: 'Option A', value: 'A' },
  { label: 'Option B', value: 'B' },
]
const UNSAFE_REGISTRY_PREVIEW_COMPONENTS = new Set<DesignerFieldComponent>()

function hasComponent(registry: RegistrySnapshot, component: DesignerFieldComponent): boolean {
  return registry.components.has(component)
}

function resolveFieldPropsByComponent(
  component: DesignerFieldComponent,
  _title: string,
  options: Array<{ label: string, value: string }>,
  value: unknown,
  componentProps?: Record<string, unknown>,
): Record<string, unknown> {
  const nextProps: Record<string, unknown> = { ...(componentProps ?? {}) }
  let nextValue = value

  if (component === 'Select' || component === 'RadioGroup' || component === 'CheckboxGroup') {
    nextProps.dataSource = Array.isArray(componentProps?.dataSource)
      ? componentProps?.dataSource
      : options
  }

  if (nextValue === undefined) {
    if (component === 'Switch') {
      nextValue = false
    }
    else if (component === 'CheckboxGroup') {
      nextValue = []
    }
    else if (component === 'Select' || component === 'RadioGroup') {
      nextValue = options[0]?.value ?? ''
    }
    else {
      nextValue = ''
    }
  }

  return {
    ...nextProps,
    value: nextValue,
  }
}

function splitPreviewProps(
  _component: DesignerFieldComponent,
  props: Record<string, unknown>,
): { componentProps: Record<string, unknown>, initialValue: unknown } {
  const { value, ...componentProps } = props
  return { componentProps, initialValue: value }
}

/**
 * buildPreviewSchema：处理当前分支的交互与状态同步。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * @param type 参数 type 为当前逻辑所需的输入信息。
 * @param component 参数 component 为当前逻辑所需的输入信息。
 * @param title 参数 title 为当前逻辑所需的输入信息。
 * @param componentProps 参数 componentProps 为当前逻辑所需的输入信息。
 * @param options 参数 options 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
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
 * render Material Field Preview：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param item 参数 `item`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * render Node Field Preview：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * can Use Registry Renderers：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
 */
export function canUseRegistryRenderers(registry: RegistrySnapshot): boolean {
  return registry.components.size > 0
}

/**
 * create Registry Renderers：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registry 参数 `registry`用于提供当前函数执行所需的输入信息。
 * @param fallback 参数 `fallback`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function createRegistryRenderers(
  registry: RegistrySnapshot,
  fallback: ResolvedLowCodeDesignerRenderers,
): ResolvedLowCodeDesignerRenderers {
  return {
    /**
     * renderMaterialPreview：执行当前功能逻辑。
     *
     * @param item 参数 item 的输入说明。
     * @param context 参数 context 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

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
    /**
     * renderFieldPreviewControl：执行当前功能逻辑。
     *
     * @param node 参数 node 的输入说明。
     * @param context 参数 context 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

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
