import type {
  DesignerContainerComponent,
  DesignerFieldType,
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '../designer'
import { COMPONENT_MATERIALS, LAYOUT_MATERIALS } from '../materials'
import type { LowCodeDesignerComponentDefinitions, LowCodeDesignerComponentDefinition } from './types'

export interface DesignerMaterials {
  componentMaterials: MaterialFieldItem[]
  layoutMaterials: MaterialContainerItem[]
  allMaterials: MaterialItem[]
  fieldComponentOptions: string[]
}

export interface ResolveDesignerMaterialsOptions {
  internalComponentNames?: Iterable<string>
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

const DEFAULT_INTERNAL_COMPONENT_NAMES = new Set([
  'LowCodeDesigner',
  'LowerCodeDesigner',
  'DesignerMaterialPane',
  'DesignerCanvasPane',
  'DesignerPropertiesPane',
])

function cloneFieldMaterial(item: MaterialFieldItem): MaterialFieldItem {
  return {
    ...item,
    componentProps: item.componentProps ? { ...item.componentProps } : undefined,
  }
}

function cloneContainerMaterial(item: MaterialContainerItem): MaterialContainerItem {
  return { ...item }
}

function cloneDefaultMaterials(): DesignerMaterials {
  const componentMaterials = COMPONENT_MATERIALS.map(cloneFieldMaterial)
  const layoutMaterials = LAYOUT_MATERIALS.map(cloneContainerMaterial)
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

function normalizeComponentNames(registeredComponentNames: Iterable<string>): string[] {
  const names: string[] = []
  const seen = new Set<string>()
  for (const rawName of registeredComponentNames) {
    const name = rawName.trim()
    if (!name || seen.has(name))
      continue
    seen.add(name)
    names.push(name)
  }
  return names
}

function createInternalComponentNameSet(options: ResolveDesignerMaterialsOptions | undefined): Set<string> {
  if (!options?.internalComponentNames)
    return new Set(DEFAULT_INTERNAL_COMPONENT_NAMES)
  return new Set(options.internalComponentNames)
}

export function resolveDesignerMaterials(
  registeredComponentNames: Iterable<string>,
  componentDefinitions?: LowCodeDesignerComponentDefinitions,
  options?: ResolveDesignerMaterialsOptions,
): DesignerMaterials {
  const normalizedNames = normalizeComponentNames(registeredComponentNames)
  if (normalizedNames.length === 0)
    return cloneDefaultMaterials()

  const internalComponentNames = createInternalComponentNameSet(options)
  const componentMaterials: MaterialFieldItem[] = []
  const layoutMaterials: MaterialContainerItem[] = []
  const usedIds = new Set<string>()

  for (const componentName of normalizedNames) {
    if (internalComponentNames.has(componentName))
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

    const definition = componentDefinitions?.[componentName]
    const builtinField = BUILTIN_FIELD_MATERIAL_BY_COMPONENT.get(componentName)
    if (builtinField) {
      componentMaterials.push({
        ...builtinField,
        label: definition?.label ?? builtinField.label,
        description: definition?.description ?? builtinField.description,
        type: definition?.fieldType ?? builtinField.type,
        componentProps: cloneDefaultProps(definition) ?? (builtinField.componentProps ? { ...builtinField.componentProps } : undefined),
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
