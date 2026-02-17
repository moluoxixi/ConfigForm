import type {
  DesignerFieldComponent,
  DesignerFieldType,
  DesignerFieldNode,
  MaterialFieldItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { ISchema } from '@moluoxixi/core'
import type React from 'react'
import { previewValueByNode } from '@moluoxixi/plugin-lower-code-core'
import { PreviewBoundary } from './PreviewBoundary'
import type { RegistrySnapshot } from './registry-shared'
import { SchemaPreview } from './SchemaPreview'
import type { ResolvedLowCodeDesignerRenderers } from './types'

const DEFAULT_SELECT_OPTIONS = [
  { label: '选项一', value: 'option_1' },
  { label: '选项二', value: 'option_2' },
]
const PREVIEW_FIELD_NAME = '__preview__'

function hasComponent(registry: RegistrySnapshot, componentName: string): boolean {
  return registry.components.has(componentName)
}

function resolveFieldPropsByComponent(
  component: DesignerFieldComponent,
  title: string,
  options: Array<{ label: string, value: string }>,
  value: unknown,
  componentProps?: Record<string, unknown>,
): Record<string, unknown> {
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

function splitPreviewProps(
  component: DesignerFieldComponent,
  props: Record<string, unknown>,
): { componentProps: Record<string, unknown>, initialValue: unknown } {
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

function buildPreviewSchema(
  type: DesignerFieldType,
  component: DesignerFieldComponent,
  title: string,
  componentProps: Record<string, unknown>,
  options: Array<{ label: string, value: string }>,
): ISchema {
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

function renderMaterialFieldPreview(
  registry: RegistrySnapshot,
  item: MaterialFieldItem,
): React.ReactElement | null {
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

function renderNodeFieldPreview(
  registry: RegistrySnapshot,
  node: DesignerFieldNode,
): React.ReactElement | null {
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

export function canUseRegistryRenderers(registry: RegistrySnapshot): boolean {
  return registry.components.size > 0
}

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
