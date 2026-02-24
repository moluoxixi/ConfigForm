import type {
  DesignerContainerComponent,
  DesignerFieldType,
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '../designer'
import type { LowCodeDesignerComponentDefinition, LowCodeDesignerComponentDefinitions } from './types'
import { COMPONENT_MATERIALS, LAYOUT_MATERIALS } from '../materials'

/**
 * Designer Materials：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface DesignerMaterials {
  componentMaterials: MaterialFieldItem[]
  layoutMaterials: MaterialContainerItem[]
  allMaterials: MaterialItem[]
  fieldComponentOptions: string[]
}

/**
 * Resolve Designer Materials Options：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface ResolveDesignerMaterialsOptions {
  internalComponentNames?: Iterable<string>
}

/**
 * BUILTIN FIELD MATERIAL BY COMPONENT：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const BUILTIN_FIELD_MATERIAL_BY_COMPONENT = new Map(
  COMPONENT_MATERIALS.map(item => [item.component, item] as const),
)
/**
 * BUILTIN LAYOUT MATERIAL BY COMPONENT：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const BUILTIN_LAYOUT_MATERIAL_BY_COMPONENT = new Map(
  LAYOUT_MATERIALS.map(item => [item.component, item] as const),
)
/**
 * BUILTIN LAYOUT COMPONENTS：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const BUILTIN_LAYOUT_COMPONENTS = new Set<DesignerContainerComponent>(
  LAYOUT_MATERIALS.map(item => item.component),
)

/**
 * DEFAULT INTERNAL COMPONENT NAMES：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const DEFAULT_INTERNAL_COMPONENT_NAMES = new Set([
  'LowCodeDesigner',
  'LowerCodeDesigner',
  'DesignerMaterialPane',
  'DesignerCanvasPane',
  'DesignerPropertiesPane',
])

/**
 * clone Field Material：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param item 参数 `item`用于提供当前函数执行所需的输入信息。
 * @returns 返回处理结果。
 */
function cloneFieldMaterial(item: MaterialFieldItem): MaterialFieldItem {
  return {
    ...item,
    componentProps: item.componentProps ? { ...item.componentProps } : undefined,
  }
}

/**
 * clone Container Material：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param item 参数 `item`用于提供当前函数执行所需的输入信息。
 * @returns 返回处理结果。
 */
function cloneContainerMaterial(item: MaterialContainerItem): MaterialContainerItem {
  return { ...item }
}

/**
 * clone Default Materials：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回处理结果。
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
 * clone Default Props：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param definition 参数 `definition`用于提供当前函数执行所需的输入信息。
 * @returns 返回对象结构，其字段布局遵循当前模块约定。
 */
function cloneDefaultProps(definition: LowCodeDesignerComponentDefinition | undefined): Record<string, unknown> | undefined {
  if (!definition?.defaultProps)
    return undefined
  return { ...definition.defaultProps }
}

/**
 * infer Field Type By Component Name：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param componentName 参数 `componentName`用于提供当前函数执行所需的输入信息。
 * @returns 返回处理结果。
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
 * create Registry Material Id：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param componentName 参数 `componentName`用于提供当前函数执行所需的输入信息。
 * @param usedIds 参数 `usedIds`用于提供当前函数执行所需的输入信息。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
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
 * normalize Component Names：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registeredComponentNames 参数 `registeredComponentNames`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * create Internal Component Name Set：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param options 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function createInternalComponentNameSet(options: ResolveDesignerMaterialsOptions | undefined): Set<string> {
  if (!options?.internalComponentNames)
    return new Set(DEFAULT_INTERNAL_COMPONENT_NAMES)
  return new Set(options.internalComponentNames)
}

/**
 * resolve Designer Materials：。
 * 所属模块：`packages/plugin-lower-code-core/src/designer-shared/materials.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param registeredComponentNames 参数 `registeredComponentNames`用于提供当前函数执行所需的输入信息。
 * @param [componentDefinitions] 参数 `componentDefinitions`用于提供当前函数执行所需的输入信息。
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回处理结果。
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
