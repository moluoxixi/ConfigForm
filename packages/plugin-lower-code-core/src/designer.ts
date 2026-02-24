import type { ISchema } from '@moluoxixi/core'
import { cloneDeep } from '@moluoxixi/core'

import {
  COMPONENT_MATERIALS,
  LAYOUT_MATERIALS,
  MATERIALS,
} from './materials'

export type DesignerFieldType = 'string' | 'number' | 'boolean' | 'date'
export type DesignerFieldComponent = string
export type DesignerContainerComponent = 'LayoutCard' | 'LayoutTabs' | 'LayoutCollapse'
export type DesignerComponent = DesignerFieldComponent | DesignerContainerComponent

export interface EnumOption {
  label: string
  value: string
}

export interface DesignerNodeBase {
  id: string
  name: string
  title: string
}

export interface DesignerFieldNode extends DesignerNodeBase {
  kind: 'field'
  type: DesignerFieldType
  component: DesignerFieldComponent
  required: boolean
  enumOptions: EnumOption[]
  componentProps: Record<string, unknown>
}

export interface DesignerSectionNode extends DesignerNodeBase {
  kind: 'section'
  children: DesignerNode[]
}

export interface DesignerContainerNode extends DesignerNodeBase {
  kind: 'container'
  component: DesignerContainerComponent
  children: DesignerNode[]
  sections: DesignerSectionNode[]
}

export type DesignerNode = DesignerFieldNode | DesignerContainerNode

export interface MaterialFieldItem {
  id: string
  kind: 'field'
  label: string
  description: string
  type: DesignerFieldType
  component: DesignerFieldComponent
  componentProps?: Record<string, unknown>
}

export interface MaterialContainerItem {
  id: string
  kind: 'container'
  label: string
  description: string
  component: DesignerContainerComponent
}

export type MaterialItem = MaterialFieldItem | MaterialContainerItem

export interface DesignerDropRoot {
  type: 'root'
}

export interface DesignerDropContainer {
  type: 'container'
  containerId: string
}

export interface DesignerDropSection {
  type: 'section'
  sectionId: string
}

export type DesignerDropTarget = DesignerDropRoot | DesignerDropContainer | DesignerDropSection
type DesignerDropNodeKind = DesignerNode['kind']

const DEFAULT_SELECT_OPTIONS: EnumOption[] = [
  { label: '选项一', value: 'option_1' },
  { label: '选项二', value: 'option_2' },
]

export { COMPONENT_MATERIALS, LAYOUT_MATERIALS, MATERIALS }

/**
 * uid：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 uid 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * is Record：负责“判断is Record”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Record 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * normalize Name：负责“规范化normalize Name”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Name 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeName(value: string, fallback: string): string {
  const trimmed = value.trim().replace(/[^\w$]/g, '_')
  const normalized = trimmed || fallback
  if (/^\d/.test(normalized))
    return `f_${normalized}`
  return normalized
}

/**
 * normalize Title：负责“规范化normalize Title”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Title 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeTitle(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed || fallback
}

/**
 * ensure Unique Name：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 ensure Unique Name 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function ensureUniqueName(baseName: string, usedNames: Set<string>): string {
  if (!usedNames.has(baseName)) {
    usedNames.add(baseName)
    return baseName
  }
  let index = 1
  while (usedNames.has(`${baseName}_${index}`)) {
    index += 1
  }
  const next = `${baseName}_${index}`
  usedNames.add(next)
  return next
}

/**
 * normalize Enum Options：负责“规范化normalize Enum Options”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Enum Options 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeEnumOptions(options: EnumOption[]): EnumOption[] {
  const next: EnumOption[] = []
  for (const option of options) {
    const label = (option.label ?? '').trim()
    const value = (option.value ?? '').trim()
    if (!label && !value)
      continue
    next.push({
      label: label || value,
      value: value || label,
    })
  }
  return next
}

/**
 * normalize Component Props：负责“规范化normalize Component Props”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Component Props 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeComponentProps(props: unknown): Record<string, unknown> {
  if (!isRecord(props))
    return {}
  return cloneDeep(props)
}

/**
 * is Field Node：负责“判断is Field Node”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Field Node 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isFieldNode(node: DesignerNode): node is DesignerFieldNode {
  return node.kind === 'field'
}

/**
 * is Container Node：负责“判断is Container Node”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Container Node 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isContainerNode(node: DesignerNode): node is DesignerContainerNode {
  return node.kind === 'container'
}

/**
 * container Uses Sections：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 container Uses Sections 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function containerUsesSections(component: DesignerContainerComponent): boolean {
  return component === 'LayoutTabs' || component === 'LayoutCollapse'
}

/**
 * default Component For Type：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 default Component For Type 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function defaultComponentForType(type: DesignerFieldType): DesignerFieldComponent {
  switch (type) {
    case 'number':
      return 'InputNumber'
    case 'boolean':
      return 'Switch'
    case 'date':
      return 'DatePicker'
    case 'string':
    default:
      return 'Input'
  }
}

/**
 * allowed Components：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 allowed Components 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function allowedComponents(type: DesignerFieldType): DesignerFieldComponent[] {
  switch (type) {
    case 'string':
      return ['Input', 'Textarea', 'Select']
    case 'number':
      return ['InputNumber']
    case 'boolean':
      return ['Switch']
    case 'date':
      return ['DatePicker']
    default:
      return ['Input']
  }
}

/**
 * clone Nodes：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Nodes 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function cloneNodes(nodes: DesignerNode[]): DesignerNode[] {
  return cloneDeep(nodes)
}

/**
 * default Section：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 default Section 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function defaultSection(title: string): DesignerSectionNode {
  return {
    id: uid('section'),
    kind: 'section',
    name: normalizeName(title, 'section'),
    title,
    children: [],
  }
}

/**
 * default Sections By Container：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 default Sections By Container 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function defaultSectionsByContainer(component: DesignerContainerComponent): DesignerSectionNode[] {
  if (component === 'LayoutTabs')
    return [defaultSection('基础信息'), defaultSection('扩展信息')]
  if (component === 'LayoutCollapse')
    return [defaultSection('折叠面板')]
  return []
}

/**
 * normalize Section：负责“规范化normalize Section”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Section 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeSection(section: DesignerSectionNode, usedNames: Set<string>): DesignerSectionNode {
  const name = ensureUniqueName(normalizeName(section.name, 'section'), usedNames)
  return {
    ...section,
    name,
    title: normalizeTitle(section.title, name),
    children: normalizeNodes(section.children),
  }
}

/**
 * normalize Container：负责“规范化normalize Container”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Container 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeContainer(container: DesignerContainerNode, usedNames: Set<string>): DesignerContainerNode {
  const component = container.component
  const name = ensureUniqueName(normalizeName(container.name, 'group'), usedNames)

  if (containerUsesSections(component)) {
    const sections = container.sections.length > 0 ? container.sections : defaultSectionsByContainer(component)
    const sectionNames = new Set<string>()
    return {
      ...container,
      name,
      title: normalizeTitle(container.title, name),
      component,
      children: [],
      sections: sections.map(section => normalizeSection(section, sectionNames)),
    }
  }

  return {
    ...container,
    name,
    title: normalizeTitle(container.title, name),
    component,
    children: normalizeNodes(container.children),
    sections: [],
  }
}

/**
 * normalize Field：负责“规范化normalize Field”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Field 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function normalizeField(field: DesignerFieldNode, usedNames: Set<string>): DesignerFieldNode {
  const type = field.type
  const component = typeof field.component === 'string' && field.component.trim()
    ? field.component.trim()
    : defaultComponentForType(type)
  const name = ensureUniqueName(normalizeName(field.name, 'field'), usedNames)
  const enumOptions = component === 'Select'
    ? normalizeEnumOptions(field.enumOptions)
    : []
  return {
    ...field,
    name,
    title: normalizeTitle(field.title, name),
    type,
    component,
    enumOptions: component === 'Select'
      ? (enumOptions.length > 0 ? enumOptions : [...DEFAULT_SELECT_OPTIONS])
      : [],
    componentProps: normalizeComponentProps(field.componentProps),
  }
}

/**
 * normalize Node：负责“规范化normalize Node”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Node 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function normalizeNode(node: DesignerNode, siblings: DesignerNode[]): DesignerNode {
  const used = new Set(
    siblings
      .filter(item => item.id !== node.id)
      .map(item => item.name),
  )
  if (node.kind === 'field')
    return normalizeField(node, used)
  return normalizeContainer(node, used)
}

/**
 * normalize Nodes：负责“规范化normalize Nodes”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 normalize Nodes 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function normalizeNodes(nodes: DesignerNode[]): DesignerNode[] {
  const used = new Set<string>()
  const result: DesignerNode[] = []
  for (const node of nodes) {
    result.push(node.kind === 'field' ? normalizeField(node, used) : normalizeContainer(node, used))
  }
  return result
}

/**
 * create Field Node：负责“创建create Field Node”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Field Node 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function createFieldNode(material: MaterialFieldItem): DesignerFieldNode {
  return {
    id: uid('node'),
    kind: 'field',
    name: normalizeName(material.id, 'field'),
    title: material.label,
    type: material.type,
    component: material.component,
    required: false,
    enumOptions: material.component === 'Select' ? [...DEFAULT_SELECT_OPTIONS] : [],
    componentProps: normalizeComponentProps(material.componentProps),
  }
}

/**
 * create Container Node：负责“创建create Container Node”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Container Node 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function createContainerNode(material: MaterialContainerItem): DesignerContainerNode {
  return {
    id: uid('node'),
    kind: 'container',
    name: normalizeName(material.id, 'group'),
    title: material.label,
    component: material.component,
    children: [],
    sections: defaultSectionsByContainer(material.component),
  }
}

/**
 * default Node From Material：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 default Node From Material 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function defaultNodeFromMaterial(material: MaterialItem, siblings: DesignerNode[]): DesignerNode {
  const rawNode = material.kind === 'field' ? createFieldNode(material) : createContainerNode(material)
  return normalizeNode(rawNode, siblings)
}

/**
 * default Nodes：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 default Nodes 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function defaultNodes(): DesignerNode[] {
  const inputMaterial = MATERIALS.find(item => item.id === 'input')!
  const cardMaterial = MATERIALS.find(item => item.id === 'layout-card')!
  const numberMaterial = MATERIALS.find(item => item.id === 'number')!

  const first = defaultNodeFromMaterial(inputMaterial, [])
  const second = defaultNodeFromMaterial(cardMaterial, [first])

  if (second.kind === 'container') {
    second.children = [
      defaultNodeFromMaterial(numberMaterial, second.children),
    ]
  }

  return normalizeNodes([first, second])
}

/**
 * resolve Type：负责“解析resolve Type”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Type 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveType(schema: Record<string, unknown>, component: DesignerFieldComponent): DesignerFieldType {
  if (schema.type === 'number')
    return 'number'
  if (schema.type === 'boolean')
    return 'boolean'
  if (schema.type === 'date')
    return 'date'
  if (component === 'InputNumber')
    return 'number'
  if (component === 'Switch')
    return 'boolean'
  if (component === 'DatePicker')
    return 'date'
  return 'string'
}

/**
 * parse Enum Options：负责“解析parse Enum Options”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse Enum Options 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function parseEnumOptions(schema: Record<string, unknown>): EnumOption[] {
  if (!Array.isArray(schema.enum))
    return []
  const options: EnumOption[] = []
  for (const item of schema.enum) {
    if (isRecord(item)) {
      const label = typeof item.label === 'string' ? item.label : String(item.value ?? '')
      const value = typeof item.value === 'string' ? item.value : String(item.value ?? '')
      if (label || value)
        options.push({ label: label || value, value: value || label })
      continue
    }
    if (typeof item === 'string' || typeof item === 'number') {
      const value = String(item)
      options.push({ label: value, value })
    }
  }
  return options
}

/**
 * resolve Container Component：负责“解析resolve Container Component”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Container Component 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveContainerComponent(schema: Record<string, unknown>): DesignerContainerComponent | null {
  const raw = typeof schema.component === 'string' ? schema.component : ''
  if (raw === 'LayoutTabs' || raw === 'Tabs')
    return 'LayoutTabs'
  if (raw === 'LayoutCollapse' || raw === 'Collapse')
    return 'LayoutCollapse'
  if (raw === 'LayoutCard' || raw === 'Card')
    return 'LayoutCard'
  if (schema.type === 'void' && isRecord(schema.properties))
    return 'LayoutCard'
  return null
}

/**
 * parse Title：负责“解析parse Title”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse Title 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function parseTitle(schema: Record<string, unknown>, fallback: string): string {
  const props = isRecord(schema.componentProps) ? schema.componentProps : null
  const propsTitle = props && typeof props.title === 'string' ? props.title : ''
  const title = typeof schema.title === 'string' ? schema.title : ''
  return normalizeTitle(propsTitle || title, fallback)
}

/**
 * parse Properties As Nodes：负责“解析parse Properties As Nodes”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse Properties As Nodes 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function parsePropertiesAsNodes(
  properties: Record<string, unknown>,
  requiredSet?: Set<string>,
): DesignerNode[] {
  const rawNodes: DesignerNode[] = []
  for (const [name, rawSchema] of Object.entries(properties)) {
    if (!isRecord(rawSchema))
      continue
    const node = parseSchemaNode(name, rawSchema, requiredSet?.has(name) ?? false)
    if (node)
      rawNodes.push(node)
  }
  return normalizeNodes(rawNodes)
}

/**
 * parse Schema Node：负责“解析parse Schema Node”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse Schema Node 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function parseSchemaNode(name: string, schema: Record<string, unknown>, requiredHint: boolean): DesignerNode | null {
  const containerComponent = resolveContainerComponent(schema)
  if (containerComponent) {
    if (containerUsesSections(containerComponent)) {
      const sectionRawMap = isRecord(schema.properties) ? schema.properties : {}
      const sectionList: DesignerSectionNode[] = []
      const usedNames = new Set<string>()
      for (const [sectionName, rawSection] of Object.entries(sectionRawMap)) {
        if (!isRecord(rawSection))
          continue
        const sectionProperties = isRecord(rawSection.properties) ? rawSection.properties : {}
        const section: DesignerSectionNode = {
          id: uid('section'),
          kind: 'section',
          name: sectionName,
          title: parseTitle(rawSection, sectionName),
          children: parsePropertiesAsNodes(sectionProperties),
        }
        sectionList.push(normalizeSection(section, usedNames))
      }
      const safeSections = sectionList.length > 0 ? sectionList : defaultSectionsByContainer(containerComponent)
      return {
        id: uid('node'),
        kind: 'container',
        name,
        title: parseTitle(schema, name),
        component: containerComponent,
        children: [],
        sections: safeSections,
      }
    }

    const properties = isRecord(schema.properties) ? schema.properties : {}
    return {
      id: uid('node'),
      kind: 'container',
      name,
      title: parseTitle(schema, name),
      component: containerComponent,
      children: parsePropertiesAsNodes(properties),
      sections: [],
    }
  }

  const rawComponent = schema.component
  const component: DesignerFieldComponent
    = typeof rawComponent === 'string' && rawComponent.trim()
      ? rawComponent.trim()
      : defaultComponentForType(
          typeof schema.type === 'string'
            ? (schema.type as DesignerFieldType)
            : 'string',
        )

  return {
    id: uid('node'),
    kind: 'field',
    name,
    title: parseTitle(schema, name),
    type: resolveType(schema, component),
    component,
    required: typeof schema.required === 'boolean' ? schema.required : requiredHint,
    enumOptions: component === 'Select' ? parseEnumOptions(schema) : [],
    componentProps: normalizeComponentProps(schema.componentProps),
  }
}

/**
 * schema To Nodes：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 schema To Nodes 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function schemaToNodes(schemaLike: unknown): DesignerNode[] {
  if (!isRecord(schemaLike))
    return defaultNodes()
  const properties = isRecord(schemaLike.properties) ? schemaLike.properties : null
  if (!properties)
    return defaultNodes()

  const requiredSet = Array.isArray(schemaLike.required)
    ? new Set(schemaLike.required.filter(item => typeof item === 'string') as string[])
    : undefined
  const nodes = parsePropertiesAsNodes(properties, requiredSet)
  return nodes.length > 0 ? nodes : defaultNodes()
}

/**
 * build Field Schema：负责“构建build Field Schema”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 build Field Schema 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function buildFieldSchema(node: DesignerFieldNode): ISchema {
  const schema: ISchema = {
    type: node.type,
    title: node.title,
    required: node.required,
    component: node.component,
  }
  const componentProps = normalizeComponentProps(node.componentProps)
  if (node.component === 'Input') {
    if (typeof componentProps.placeholder !== 'string')
      componentProps.placeholder = `请输入${node.title}`
  }
  if (node.component === 'Textarea') {
    if (typeof componentProps.rows !== 'number')
      componentProps.rows = 3
    if (typeof componentProps.placeholder !== 'string')
      componentProps.placeholder = `请输入${node.title}`
  }
  if (node.component === 'Select') {
    schema.enum = node.enumOptions.map(option => ({
      label: option.label,
      value: option.value,
    }))
  }
  if (Object.keys(componentProps).length > 0)
    schema.componentProps = componentProps
  return schema
}

/**
 * build Properties：负责“构建build Properties”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 build Properties 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function buildProperties(nodes: DesignerNode[]): Record<string, ISchema> {
  const properties: Record<string, ISchema> = {}
  for (const node of normalizeNodes(nodes)) {
    if (node.kind === 'field') {
      properties[node.name] = buildFieldSchema(node)
      continue
    }
    if (containerUsesSections(node.component)) {
      const sectionProperties: Record<string, ISchema> = {}
      for (const section of node.sections) {
        sectionProperties[section.name] = {
          type: 'void',
          componentProps: { title: section.title },
          properties: buildProperties(section.children),
        }
      }
      properties[node.name] = {
        type: 'void',
        title: node.title,
        component: node.component,
        componentProps: { title: node.title },
        properties: sectionProperties,
      }
      continue
    }
    properties[node.name] = {
      type: 'void',
      title: node.title,
      component: node.component,
      componentProps: { title: node.title },
      properties: buildProperties(node.children),
    }
  }
  return properties
}

/**
 * nodes To Schema：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 nodes To Schema 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function nodesToSchema(nodes: DesignerNode[]): ISchema {
  return {
    type: 'object',
    decoratorProps: { labelPosition: 'top' },
    properties: buildProperties(nodes),
  }
}

/**
 * schema Signature：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 schema Signature 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function schemaSignature(schemaLike: unknown): string {
  try {
    return JSON.stringify(schemaLike ?? null)
  }
  catch {
    return ''
  }
}

export function reorder<T>(items: T[], oldIndex: number, newIndex: number): T[] {
  if (oldIndex < 0 || oldIndex >= items.length || newIndex < 0 || newIndex >= items.length)
    return items
  if (oldIndex === newIndex)
    return items
  const next = [...items]
  const [target] = next.splice(oldIndex, 1)
  next.splice(newIndex, 0, target)
  return next
}

/**
 * parse Enum Draft：负责“解析parse Enum Draft”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse Enum Draft 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function parseEnumDraft(text: string): EnumOption[] {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
  const options: EnumOption[] = []
  for (const line of lines) {
    const [labelRaw, valueRaw] = line.split(':')
    const label = (labelRaw ?? '').trim()
    const value = (valueRaw ?? labelRaw ?? '').trim()
    if (!label && !value)
      continue
    options.push({ label: label || value, value: value || label })
  }
  return options
}

/**
 * preview Value By Node：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 preview Value By Node 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function previewValueByNode(node: DesignerFieldNode): unknown {
  switch (node.type) {
    case 'number':
      return 0
    case 'boolean':
      return false
    case 'date':
      return ''
    case 'string':
    default:
      if (node.component === 'Select')
        return node.enumOptions[0]?.value ?? ''
      return ''
  }
}

/**
 * find Node In List：负责“查找find Node In List”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 find Node In List 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function findNodeInList(nodes: DesignerNode[], nodeId: string): DesignerNode | null {
  for (const node of nodes) {
    if (node.id === nodeId)
      return node
    if (node.kind === 'container') {
      const inChildren = findNodeInList(node.children, nodeId)
      if (inChildren)
        return inChildren
      for (const section of node.sections) {
        const inSection = findNodeInList(section.children, nodeId)
        if (inSection)
          return inSection
      }
    }
  }
  return null
}

/**
 * find Section In List：负责“查找find Section In List”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 find Section In List 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function findSectionInList(nodes: DesignerNode[], sectionId: string): DesignerSectionNode | null {
  for (const node of nodes) {
    if (node.kind !== 'container')
      continue
    for (const section of node.sections) {
      if (section.id === sectionId)
        return section
      const inSection = findSectionInList(section.children, sectionId)
      if (inSection)
        return inSection
    }
    const inChildren = findSectionInList(node.children, sectionId)
    if (inChildren)
      return inChildren
  }
  return null
}

/**
 * find Container By Section Id：负责“查找find Container By Section Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 find Container By Section Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function findContainerBySectionId(nodes: DesignerNode[], sectionId: string): DesignerContainerNode | null {
  for (const node of nodes) {
    if (node.kind !== 'container')
      continue
    if (node.sections.some(section => section.id === sectionId))
      return node

    const inChildren = findContainerBySectionId(node.children, sectionId)
    if (inChildren)
      return inChildren

    for (const section of node.sections) {
      const inSection = findContainerBySectionId(section.children, sectionId)
      if (inSection)
        return inSection
    }
  }
  return null
}

/**
 * find Node By Id：负责“查找find Node By Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 find Node By Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function findNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode | null {
  return findNodeInList(nodes, nodeId)
}

/**
 * find Section By Id：负责“查找find Section By Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 find Section By Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function findSectionById(nodes: DesignerNode[], sectionId: string): DesignerSectionNode | null {
  return findSectionInList(nodes, sectionId)
}

/**
 * update Node List：负责“更新update Node List”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 update Node List 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function updateNodeList(
  nodes: DesignerNode[],
  nodeId: string,
  updater: (node: DesignerNode) => DesignerNode,
): DesignerNode[] {
  let changed = false
  const next = nodes.map((node) => {
    if (node.id === nodeId) {
      changed = true
      return updater(node)
    }
    if (node.kind !== 'container')
      return node

    const nextChildren = updateNodeList(node.children, nodeId, updater)
    const nextSections = node.sections.map((section) => {
      const nextSectionChildren = updateNodeList(section.children, nodeId, updater)
      if (nextSectionChildren === section.children)
        return section
      changed = true
      return { ...section, children: nextSectionChildren }
    })

    if (nextChildren === node.children && nextSections.every((section, index) => section === node.sections[index]))
      return node
    changed = true
    return {
      ...node,
      children: nextChildren,
      sections: nextSections,
    }
  })
  return changed ? next : nodes
}

/**
 * update Section List：负责“更新update Section List”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 update Section List 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function updateSectionList(
  nodes: DesignerNode[],
  sectionId: string,
  updater: (section: DesignerSectionNode) => DesignerSectionNode,
): DesignerNode[] {
  let changed = false
  const next = nodes.map((node) => {
    if (node.kind !== 'container')
      return node

    const nextChildren = updateSectionList(node.children, sectionId, updater)
    const nextSections = node.sections.map((section) => {
      if (section.id === sectionId) {
        changed = true
        return updater(section)
      }
      const childSections = updateSectionList(section.children, sectionId, updater)
      if (childSections === section.children)
        return section
      changed = true
      return { ...section, children: childSections }
    })

    if (nextChildren === node.children && nextSections.every((section, index) => section === node.sections[index]))
      return node
    changed = true
    return { ...node, children: nextChildren, sections: nextSections }
  })
  return changed ? next : nodes
}

/**
 * update Node By Id：负责“更新update Node By Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 update Node By Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function updateNodeById(
  nodes: DesignerNode[],
  nodeId: string,
  updater: (node: DesignerNode) => DesignerNode,
): DesignerNode[] {
  const next = updateNodeList(cloneNodes(nodes), nodeId, updater)
  return normalizeNodes(next)
}

/**
 * update Section By Id：负责“更新update Section By Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 update Section By Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function updateSectionById(
  nodes: DesignerNode[],
  sectionId: string,
  updater: (section: DesignerSectionNode) => DesignerSectionNode,
): DesignerNode[] {
  const next = updateSectionList(cloneNodes(nodes), sectionId, updater)
  return normalizeNodes(next)
}

/**
 * remove Node From List：负责“移除remove Node From List”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 remove Node From List 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function removeNodeFromList(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const next: DesignerNode[] = []
  let removed = false
  for (const node of nodes) {
    if (node.id === nodeId) {
      removed = true
      continue
    }
    if (node.kind !== 'container') {
      next.push(node)
      continue
    }
    const nextChildren = removeNodeFromList(node.children, nodeId)
    const nextSections = node.sections.map(section => ({
      ...section,
      children: removeNodeFromList(section.children, nodeId),
    }))
    const sectionChildrenChanged = nextSections.some(
      (section, index) => section.children !== node.sections[index].children,
    )
    if (nextChildren !== node.children || sectionChildrenChanged)
      removed = true
    next.push({
      ...node,
      children: nextChildren,
      sections: nextSections,
    })
  }
  return removed ? next : nodes
}

/**
 * remove Node By Id：负责“移除remove Node By Id”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 remove Node By Id 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function removeNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const next = removeNodeFromList(cloneNodes(nodes), nodeId)
  const safe = next.length > 0 ? next : defaultNodes()
  return normalizeNodes(safe)
}

/**
 * clone Node With New Ids：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 clone Node With New Ids 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function cloneNodeWithNewIds(node: DesignerNode): DesignerNode {
  if (node.kind === 'field') {
    return {
      ...cloneDeep(node),
      id: uid('node'),
    }
  }
  const cloned = cloneDeep(node) as DesignerContainerNode
  return {
    ...cloned,
    id: uid('node'),
    children: cloned.children.map(child => cloneNodeWithNewIds(child)),
    sections: cloned.sections.map(section => ({
      ...section,
      id: uid('section'),
      children: section.children.map(child => cloneNodeWithNewIds(child)),
    })),
  }
}

/**
 * duplicate Node By Id：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 duplicate Node By Id 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function duplicateNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const draft = cloneNodes(nodes)

  /**
   * duplicate In List：负责该函数职责对应的主流程编排。
   * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
   * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
   *
   * 说明：该函数聚焦于 duplicate In List 的单一职责，调用方可通过函数名快速理解输入输出语义。
   */
  function duplicateInList(list: DesignerNode[]): boolean {
    const index = list.findIndex(item => item.id === nodeId)
    if (index >= 0) {
      const duplicated = cloneNodeWithNewIds(list[index])
      list.splice(index + 1, 0, duplicated)
      return true
    }
    for (const node of list) {
      if (node.kind !== 'container')
        continue
      if (duplicateInList(node.children))
        return true
      for (const section of node.sections) {
        if (duplicateInList(section.children))
          return true
      }
    }
    return false
  }

  const matched = duplicateInList(draft)
  if (!matched)
    return nodes
  return normalizeNodes(draft)
}

/**
 * find Container In List：负责“查找find Container In List”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 find Container In List 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function findContainerInList(nodes: DesignerNode[], containerId: string): DesignerContainerNode | null {
  for (const node of nodes) {
    if (node.kind !== 'container')
      continue
    if (node.id === containerId)
      return node
    const inChildren = findContainerInList(node.children, containerId)
    if (inChildren)
      return inChildren
    for (const section of node.sections) {
      const inSection = findContainerInList(section.children, containerId)
      if (inSection)
        return inSection
    }
  }
  return null
}

/**
 * add Section To Container：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 add Section To Container 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function addSectionToContainer(nodes: DesignerNode[], containerId: string, title?: string): DesignerNode[] {
  const draft = cloneNodes(nodes)
  const container = findContainerInList(draft, containerId)
  if (!container || !containerUsesSections(container.component))
    return nodes
  container.sections.push(defaultSection(title?.trim() || `分组${container.sections.length + 1}`))
  return normalizeNodes(draft)
}

/**
 * remove Section From Container：负责“移除remove Section From Container”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 remove Section From Container 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function removeSectionFromContainer(nodes: DesignerNode[], containerId: string, sectionId: string): DesignerNode[] {
  const draft = cloneNodes(nodes)
  const container = findContainerInList(draft, containerId)
  if (!container || !containerUsesSections(container.component))
    return nodes
  container.sections = container.sections.filter(section => section.id !== sectionId)
  if (container.sections.length === 0)
    container.sections = defaultSectionsByContainer(container.component)
  return normalizeNodes(draft)
}

/**
 * root Target：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 root Target 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function rootTarget(): DesignerDropTarget {
  return { type: 'root' }
}

/**
 * container Target：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 container Target 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function containerTarget(containerId: string): DesignerDropTarget {
  return { type: 'container', containerId }
}

/**
 * section Target：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 section Target 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function sectionTarget(sectionId: string): DesignerDropTarget {
  return { type: 'section', sectionId }
}

/**
 * target To Key：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 target To Key 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function targetToKey(target: DesignerDropTarget): string {
  if (target.type === 'root')
    return 'root'
  if (target.type === 'container')
    return `container:${target.containerId}`
  return `section:${target.sectionId}`
}

/**
 * key To Target：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 key To Target 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function keyToTarget(key: string | undefined): DesignerDropTarget | null {
  if (!key)
    return null
  if (key === 'root')
    return rootTarget()
  if (key.startsWith('container:')) {
    const containerId = key.slice('container:'.length)
    return containerId ? containerTarget(containerId) : null
  }
  if (key.startsWith('section:')) {
    const sectionId = key.slice('section:'.length)
    return sectionId ? sectionTarget(sectionId) : null
  }
  return null
}

/**
 * is Same Target：负责“判断is Same Target”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Same Target 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isSameTarget(a: DesignerDropTarget, b: DesignerDropTarget): boolean {
  return targetToKey(a) === targetToKey(b)
}

/**
 * 根据目标位置解析可写的节点列表。
 * 返回 `null` 表示该目标当前不可直接写入（例如分组容器本体）。
 */
function getListByTarget(nodes: DesignerNode[], target: DesignerDropTarget): DesignerNode[] | null {
  if (target.type === 'root')
    return nodes
  if (target.type === 'container') {
    const container = findContainerInList(nodes, target.containerId)
    if (!container || containerUsesSections(container.component))
      return null
    return container.children
  }
  const section = findSectionInList(nodes, target.sectionId)
  return section ? section.children : null
}

/**
 * accepted Node Kinds By Container：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 accepted Node Kinds By Container 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function acceptedNodeKindsByContainer(component: DesignerContainerComponent): DesignerDropNodeKind[] {
  switch (component) {
    case 'LayoutCard':
      return ['field', 'container']
    case 'LayoutTabs':
    case 'LayoutCollapse':
      return ['field', 'container']
    default:
      return ['field', 'container']
  }
}

/**
 * 结构层面的落位校验。
 * 这里只判断“目标类型是否接收该节点类型”，祖先循环校验由 `targetBelongsToNode` 负责。
 */
function canAcceptNodeByTarget(nodes: DesignerNode[], target: DesignerDropTarget, node: DesignerNode): boolean {
  if (target.type === 'root')
    return true

  if (target.type === 'container') {
    const container = findContainerInList(nodes, target.containerId)
    if (!container || containerUsesSections(container.component))
      return false
    return acceptedNodeKindsByContainer(container.component).includes(node.kind)
  }

  const ownerContainer = findContainerBySectionId(nodes, target.sectionId)
  if (!ownerContainer)
    return false
  return acceptedNodeKindsByContainer(ownerContainer.component).includes(node.kind)
}

/**
 * 判断目标是否位于节点自身子树内。
 * 用于阻止“容器拖进自己或后代”这类非法操作。
 */
function targetBelongsToNode(node: DesignerNode, target: DesignerDropTarget): boolean {
  if (target.type === 'root')
    return false
  if (node.kind !== 'container')
    return false
  if (target.type === 'container' && target.containerId === node.id)
    return true
  for (const child of node.children) {
    if (targetBelongsToNode(child, target))
      return true
  }
  for (const section of node.sections) {
    if (target.type === 'section' && target.sectionId === section.id)
      return true
    for (const child of section.children) {
      if (targetBelongsToNode(child, target))
        return true
    }
  }
  return false
}

/**
 * can Drop Node At Target：负责“判断can Drop Node At Target”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 can Drop Node At Target 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function canDropNodeAtTarget(
  nodes: DesignerNode[],
  target: DesignerDropTarget,
  node: DesignerNode,
): boolean {
  return canAcceptNodeByTarget(nodes, target, node)
}

/**
 * insert Node By Target：负责“插入insert Node By Target”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 insert Node By Target 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function insertNodeByTarget(
  nodes: DesignerNode[],
  target: DesignerDropTarget,
  newIndex: number,
  node: DesignerNode,
): DesignerNode[] {
  // 在草稿上操作，保持入参不可变并便于失败回滚。
  const draft = cloneNodes(nodes)
  if (!canAcceptNodeByTarget(draft, target, node))
    return nodes
  const list = getListByTarget(draft, target)
  if (!list)
    return nodes
  const insertIndex = Math.max(0, Math.min(newIndex, list.length))
  list.splice(insertIndex, 0, cloneNodeWithNewIds(node))
  return normalizeNodes(draft)
}

/**
 * move Node By Target：负责“移动move Node By Target”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 move Node By Target 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function moveNodeByTarget(
  nodes: DesignerNode[],
  fromTarget: DesignerDropTarget,
  toTarget: DesignerDropTarget,
  oldIndex: number,
  newIndex: number,
): DesignerNode[] {
  // 旧版索引移动 API，保留用于兼容历史调用。
  const draft = cloneNodes(nodes)
  const fromList = getListByTarget(draft, fromTarget)
  if (!fromList || oldIndex < 0 || oldIndex >= fromList.length)
    return nodes
  const movingNode = fromList[oldIndex]
  if (!movingNode)
    return nodes
  if (!canAcceptNodeByTarget(draft, toTarget, movingNode))
    return nodes
  if (!isSameTarget(fromTarget, toTarget) && targetBelongsToNode(movingNode, toTarget))
    return nodes
  const [moved] = fromList.splice(oldIndex, 1)
  if (!moved)
    return nodes

  const toList = isSameTarget(fromTarget, toTarget)
    ? fromList
    : getListByTarget(draft, toTarget)
  if (!toList) {
    fromList.splice(Math.max(0, Math.min(oldIndex, fromList.length)), 0, moved)
    return normalizeNodes(draft)
  }

  const insertIndex = Math.max(0, Math.min(newIndex, toList.length))
  toList.splice(insertIndex, 0, moved)
  return normalizeNodes(draft)
}

interface NodeLocationByTarget {
  target: DesignerDropTarget
  index: number
}

/**
 * 根据 nodeId 查找节点当前所在位置（根/容器/分组 + 索引）。
 * 该方式不依赖 DOM 冒泡事件里的临时索引，嵌套拖拽更稳定。
 */
function findNodeLocationByTarget(nodes: DesignerNode[], nodeId: string): NodeLocationByTarget | null {
  const rootIndex = nodes.findIndex(node => node.id === nodeId)
  if (rootIndex >= 0) {
    return {
      target: rootTarget(),
      index: rootIndex,
    }
  }

  const walk = (items: DesignerNode[]): NodeLocationByTarget | null => {
    for (const node of items) {
      if (node.kind !== 'container')
        continue

      const containerIndex = node.children.findIndex(child => child.id === nodeId)
      if (containerIndex >= 0) {
        return {
          target: containerTarget(node.id),
          index: containerIndex,
        }
      }

      for (const section of node.sections) {
        const sectionIndex = section.children.findIndex(child => child.id === nodeId)
        if (sectionIndex >= 0) {
          return {
            target: sectionTarget(section.id),
            index: sectionIndex,
          }
        }
      }

      const inChildren = walk(node.children)
      if (inChildren)
        return inChildren

      for (const section of node.sections) {
        const inSection = walk(section.children)
        if (inSection)
          return inSection
      }
    }
    return null
  }

  return walk(nodes)
}

/**
 * move Node By Id To Target：负责“移动move Node By Id To Target”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 move Node By Id To Target 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function moveNodeByIdToTarget(
  nodes: DesignerNode[],
  nodeId: string,
  toTarget: DesignerDropTarget,
  newIndex: number,
): DesignerNode[] {
  /**
   * 统一节点移动 API：
   * 1) 通过 nodeId 找到真实来源位置
   * 2) 校验目标约束与反循环规则
   * 3) 从来源移除并插入目标列表
   */
  const draft = cloneNodes(nodes)
  const location = findNodeLocationByTarget(draft, nodeId)
  if (!location)
    return nodes

  const fromList = getListByTarget(draft, location.target)
  if (!fromList || location.index < 0 || location.index >= fromList.length)
    return nodes
  const movingNode = fromList[location.index]
  if (!movingNode)
    return nodes
  if (!canAcceptNodeByTarget(draft, toTarget, movingNode))
    return nodes
  if (!isSameTarget(location.target, toTarget) && targetBelongsToNode(movingNode, toTarget))
    return nodes

  const [moved] = fromList.splice(location.index, 1)
  if (!moved)
    return nodes

  const toList = isSameTarget(location.target, toTarget)
    ? fromList
    : getListByTarget(draft, toTarget)
  if (!toList) {
    fromList.splice(Math.max(0, Math.min(location.index, fromList.length)), 0, moved)
    return normalizeNodes(draft)
  }

  const safeIndex = Number.isInteger(newIndex) && newIndex >= 0 ? newIndex : toList.length
  const insertIndex = Math.max(0, Math.min(safeIndex, toList.length))
  toList.splice(insertIndex, 0, moved)
  return normalizeNodes(draft)
}
