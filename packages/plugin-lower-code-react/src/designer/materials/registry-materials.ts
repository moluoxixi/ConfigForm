import type {
  DesignerContainerComponent,
  DesignerFieldType,
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import {
  COMPONENT_MATERIALS,
  LAYOUT_MATERIALS,
} from '@moluoxixi/plugin-lower-code-core'
import type { LowCodeDesignerComponentDefinition } from '../types'
import type { RegistrySnapshot } from '../renderers/registry-shared'

export interface DesignerMaterials {
  componentMaterials: MaterialFieldItem[]
  layoutMaterials: MaterialContainerItem[]
  allMaterials: MaterialItem[]
  fieldComponentOptions: string[]
}

const BUILTIN_FIELD_MATERIAL_BY_COMPONENT = new Map(
  COMPONENT_MATERIALS.map(item => [item.component, item] as const),
)
const BUILTIN_LAYOUT_MATERIAL_BY_COMPONENT = new Map(
  LAYOUT_MATERIALS.map(item => [item.component, item] as const),
)
const BUILTIN_LAYOUT_COMPONENTS = new Set<DesignerContainerComponent>(
  LAYOUT_MATERIALS.map(item => item.component),
)
const INTERNAL_COMPONENT_NAMES = new Set(['LowCodeDesigner', 'LowerCodeDesigner'])

function cloneDefaultMaterials(): DesignerMaterials {
  const componentMaterials = COMPONENT_MATERIALS.map(item => ({ ...item }))
  const layoutMaterials = LAYOUT_MATERIALS.map(item => ({ ...item }))
  return {
    componentMaterials,
    layoutMaterials,
    allMaterials: [...componentMaterials, ...layoutMaterials],
    fieldComponentOptions: componentMaterials.map(item => item.component),
  }
}

function cloneDefaultProps(definition: LowCodeDesignerComponentDefinition | undefined): Record<string, unknown> | undefined {
  if (!definition?.defaultProps)
    return undefined
  return { ...definition.defaultProps }
}

function inferFieldTypeByComponentName(componentName: string): DesignerFieldType {
  switch (componentName) {
    case 'InputNumber':
    case 'Rate':
    case 'Slider':
      return 'number'
    case 'Switch':
      return 'boolean'
    case 'DatePicker':
    case 'TimePicker':
    case 'MonthPicker':
    case 'WeekPicker':
    case 'YearPicker':
    case 'RangePicker':
      return 'date'
    default:
      return 'string'
  }
}

function createRegistryMaterialId(componentName: string, usedIds: Set<string>): string {
  const baseName = componentName
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'component'

  let suffix = 0
  let candidate = `registry-${baseName}`
  while (usedIds.has(candidate)) {
    suffix += 1
    candidate = `registry-${baseName}-${suffix}`
  }
  usedIds.add(candidate)
  return candidate
}

export function resolveDesignerMaterials(
  registry: RegistrySnapshot,
  componentDefinitions?: Record<string, LowCodeDesignerComponentDefinition>,
): DesignerMaterials {
  if (registry.components.size === 0)
    return cloneDefaultMaterials()

  const componentMaterials: MaterialFieldItem[] = []
  const layoutMaterials: MaterialContainerItem[] = []
  const usedIds = new Set<string>()

  for (const componentName of registry.components.keys()) {
    if (INTERNAL_COMPONENT_NAMES.has(componentName))
      continue

    if (BUILTIN_LAYOUT_COMPONENTS.has(componentName as DesignerContainerComponent)) {
      const builtin = BUILTIN_LAYOUT_MATERIAL_BY_COMPONENT.get(componentName as DesignerContainerComponent)
      if (builtin) {
        const definition = componentDefinitions?.[componentName]
        layoutMaterials.push({
          ...builtin,
          label: definition?.label ?? builtin.label,
          description: definition?.description ?? builtin.description,
        })
        usedIds.add(builtin.id)
      }
      continue
    }

    const builtinField = BUILTIN_FIELD_MATERIAL_BY_COMPONENT.get(componentName)
    const definition = componentDefinitions?.[componentName]
    if (builtinField) {
      componentMaterials.push({
        ...builtinField,
        label: definition?.label ?? builtinField.label,
        description: definition?.description ?? builtinField.description,
        type: definition?.fieldType ?? builtinField.type,
        componentProps: cloneDefaultProps(definition) ?? builtinField.componentProps,
      })
      usedIds.add(builtinField.id)
      continue
    }

    componentMaterials.push({
      id: createRegistryMaterialId(componentName, usedIds),
      kind: 'field',
      label: definition?.label ?? componentName,
      description: definition?.description ?? '注册组件',
      type: definition?.fieldType ?? inferFieldTypeByComponentName(componentName),
      component: componentName,
      componentProps: cloneDefaultProps(definition),
    })
  }

  if (componentMaterials.length === 0 && layoutMaterials.length === 0)
    return cloneDefaultMaterials()

  return {
    componentMaterials,
    layoutMaterials,
    allMaterials: [...componentMaterials, ...layoutMaterials],
    fieldComponentOptions: componentMaterials.map(item => item.component),
  }
}
