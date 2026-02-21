import type {
  DesignerContainerComponent,
  DesignerFieldType,
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '../designer'
import type { LowCodeDesignerComponentDefinition, LowCodeDesignerComponentDefinitions } from './types'
import { COMPONENT_MATERIALS, LAYOUT_MATERIALS } from '../materials'

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

/**
 * clone Field Material：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Field Material 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneFieldMaterial(item: MaterialFieldItem): MaterialFieldItem {
  return {
    ...item,
    componentProps: item.componentProps ? { ...item.componentProps } : undefined,
  }
}

/**
 * clone Container Material：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Container Material 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneContainerMaterial(item: MaterialContainerItem): MaterialContainerItem {
  return { ...item }
}

/**
 * clone Default Materials：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Default Materials 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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

/**
 * clone Default Props：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Default Props 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneDefaultProps(definition: LowCodeDesignerComponentDefinition | undefined): Record<string, unknown> | undefined {
  if (!definition?.defaultProps)
    return undefined
  return { ...definition.defaultProps }
}

/**
 * infer Field Type By Component Name：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 infer Field Type By Component Name 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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

/**
 * create Registry Material Id：负责“创建create Registry Material Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Registry Material Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function createRegistryMaterialId(componentName: string, usedIds: Set<string>): string {
  const baseName = componentName
    .replace(/[^a-z0-9]+/gi, '-')
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

/**
 * normalize Component Names：负责“规范化normalize Component Names”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Component Names 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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

/**
 * create Internal Component Name Set：负责“创建create Internal Component Name Set”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Internal Component Name Set 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function createInternalComponentNameSet(options: ResolveDesignerMaterialsOptions | undefined): Set<string> {
  if (!options?.internalComponentNames)
    return new Set(DEFAULT_INTERNAL_COMPONENT_NAMES)
  return new Set(options.internalComponentNames)
}

/**
 * resolve Designer Materials：负责“解析resolve Designer Materials”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Designer Materials 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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
