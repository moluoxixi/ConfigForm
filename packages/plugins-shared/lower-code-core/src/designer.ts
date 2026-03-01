import type {
  DataSourceConfig,
  DataSourceItem,
  FieldPattern,
  ISchema,
  ReactionRule,
  SchemaDecoratorName,
  ValidationRule,
  ValidationTrigger,
} from '@moluoxixi/core'
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
  description?: string
  defaultValue?: unknown
  dataSource?: DataSourceItem[] | DataSourceConfig
  rules?: ValidationRule[]
  validateTrigger?: ValidationTrigger | ValidationTrigger[]
  reactions?: ReactionRule[]
  visible?: boolean
  disabled?: boolean
  preview?: boolean
  pattern?: FieldPattern
  displayFormat?: string
  inputParse?: string
  submitTransform?: string
  submitPath?: string
  excludeWhenHidden?: boolean
  decorator?: SchemaDecoratorName
  decoratorProps?: Record<string, unknown>
  span?: number
  order?: number
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

export interface DesignerFormConfig {
  labelPosition: 'top' | 'left' | 'right'
  labelWidth?: number | string
  pattern: 'default' | FieldPattern
  validateTrigger: 'default' | ValidationTrigger
  layoutType: 'default' | 'grid' | 'inline'
  layoutColumns?: number
  layoutGutter?: number
  layoutGap?: number
  actionsAlign: 'left' | 'center' | 'right'
  showSubmit: boolean
  showReset: boolean
  submitText?: string
  resetText?: string
}

export function createDefaultDesignerFormConfig(): DesignerFormConfig {
  return {
    labelPosition: 'top',
    pattern: 'default',
    validateTrigger: 'default',
    layoutType: 'default',
    actionsAlign: 'center',
    showSubmit: false,
    showReset: false,
    submitText: '',
    resetText: '',
  }
}

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
 * 生成设计器节点的临时唯一标识。
 *
 * 该 ID 主要用于前端内存态编排（拖拽、选中、增删改）；
 * 不用于安全场景，也不保证跨进程强唯一。
 *
 * @param prefix 标识前缀，用于区分 node / section 等实体类型。
 * @returns 形如 `node_xxxxxxx` 的短 ID。
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
 * 基于给定基础名生成同级唯一字段名。
 *
 * 规则：
 * 1. 基础名未占用时直接使用。
 * 2. 已占用时按 `_1`、`_2`... 递增后缀寻找可用值。
 * 3. 命中的名称会立即写入 `usedNames`，保证后续调用不冲突。
 *
 * @param baseName 候选基础名称。
 * @param usedNames 当前作用域已占用名称集合。
 * @returns 去重后的可用名称。
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
 * 判断容器组件是否采用“分组（sections）”作为直接子结构。
 *
 * 目前 Tabs / Collapse 通过 `sections[].children` 挂载字段，
 * Card 则直接使用 `children`。
 *
 * @param component 容器组件名称。
 * @returns `true` 表示该容器必须通过 sections 管理子节点。
 */
export function containerUsesSections(component: DesignerContainerComponent): boolean {
  return component === 'LayoutTabs' || component === 'LayoutCollapse'
}

/**
 * 根据字段值类型返回默认渲染组件。
 *
 * 用于：
 * - 物料拖入后自动补全 component。
 * - schema 中缺失 component 时兜底。
 *
 * @param type 字段值类型。
 * @returns 对应的默认组件名。
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
 * 返回某字段类型允许切换的组件候选列表。
 *
 * 该函数用于属性面板“组件类型”下拉选项约束，
 * 防止选择与字段类型不兼容的组件。
 *
 * @param type 字段值类型。
 * @returns 允许的组件名称列表。
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
 * 深拷贝节点树，避免调用方直接修改原始数据。
 *
 * 设计器中的插入、移动、删除都基于“先克隆再修改”的不可变思路，
 * 便于状态回溯与框架层变更检测。
 *
 * @param nodes 节点树。
 * @returns 与入参结构等价的新对象树。
 */
export function cloneNodes(nodes: DesignerNode[]): DesignerNode[] {
  return cloneDeep(nodes)
}

/**
 * 创建一个空分组节点。
 *
 * 主要用于 Tabs / Collapse 容器的初始分组和动态“新增分组”操作。
 *
 * @param title 分组标题。
 * @returns 初始化后的分组节点（含新 ID 与空 children）。
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
 * 根据容器类型生成默认分组集合。
 *
 * - Tabs：预置两个标签页，便于开箱即用演示。
 * - Collapse：预置一个折叠面板。
 * - 其他容器：不生成分组。
 *
 * @param component 容器组件名称。
 * @returns 对应容器的默认分组数组。
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
  const decoratorProps = normalizeComponentProps(field.decoratorProps)
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
    decoratorProps: Object.keys(decoratorProps).length > 0 ? decoratorProps : undefined,
    description: typeof field.description === 'string' ? field.description : undefined,
    defaultValue: field.defaultValue,
    dataSource: field.dataSource,
    rules: Array.isArray(field.rules) ? field.rules : undefined,
    validateTrigger: field.validateTrigger,
    reactions: Array.isArray(field.reactions) ? field.reactions : undefined,
    visible: typeof field.visible === 'boolean' ? field.visible : undefined,
    disabled: typeof field.disabled === 'boolean' ? field.disabled : undefined,
    preview: typeof field.preview === 'boolean' ? field.preview : undefined,
    pattern: field.pattern,
    displayFormat: typeof field.displayFormat === 'string' ? field.displayFormat : undefined,
    inputParse: typeof field.inputParse === 'string' ? field.inputParse : undefined,
    submitTransform: typeof field.submitTransform === 'string' ? field.submitTransform : undefined,
    submitPath: typeof field.submitPath === 'string' ? field.submitPath : undefined,
    excludeWhenHidden: typeof field.excludeWhenHidden === 'boolean' ? field.excludeWhenHidden : undefined,
    decorator: field.decorator,
    span: typeof field.span === 'number' ? field.span : undefined,
    order: typeof field.order === 'number' ? field.order : undefined,
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
    description: material.description,
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
 * 按物料定义创建节点，并按同级节点进行标准化。
 *
 * 标准化会处理名称去重、标题兜底、组件属性清洗等规则，
 * 保证新拖入节点可直接参与后续编排与序列化。
 *
 * @param material 物料项定义。
 * @param siblings 同级已有节点，用于名称冲突检测。
 * @returns 可直接挂载到画布的数据节点。
 */
export function defaultNodeFromMaterial(material: MaterialItem, siblings: DesignerNode[]): DesignerNode {
  const rawNode = material.kind === 'field' ? createFieldNode(material) : createContainerNode(material)
  return normalizeNode(rawNode, siblings)
}

/**
 * 生成设计器初始示例节点。
 *
 * 默认结构：
 * - 顶层一个输入框字段。
 * - 顶层一个卡片容器，容器内预置一个数字字段。
 *
 * @returns 可用于空白设计器首屏展示的节点树。
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
    description: typeof schema.description === 'string' ? schema.description : undefined,
    defaultValue: schema.default,
    dataSource: Array.isArray(schema.dataSource) || isRecord(schema.dataSource)
      ? (schema.dataSource as DataSourceItem[] | DataSourceConfig)
      : undefined,
    rules: Array.isArray(schema.rules) ? (schema.rules as ValidationRule[]) : undefined,
    validateTrigger: schema.validateTrigger as ValidationTrigger | ValidationTrigger[] | undefined,
    reactions: Array.isArray(schema.reactions) ? (schema.reactions as ReactionRule[]) : undefined,
    visible: typeof schema.visible === 'boolean' ? schema.visible : undefined,
    disabled: typeof schema.disabled === 'boolean' ? schema.disabled : undefined,
    preview: typeof schema.preview === 'boolean' ? schema.preview : undefined,
    pattern: schema.pattern as FieldPattern | undefined,
    displayFormat: typeof schema.displayFormat === 'string' ? schema.displayFormat : undefined,
    inputParse: typeof schema.inputParse === 'string' ? schema.inputParse : undefined,
    submitTransform: typeof schema.submitTransform === 'string' ? schema.submitTransform : undefined,
    submitPath: typeof schema.submitPath === 'string' ? schema.submitPath : undefined,
    excludeWhenHidden: typeof schema.excludeWhenHidden === 'boolean' ? schema.excludeWhenHidden : undefined,
    decorator: schema.decorator as SchemaDecoratorName | undefined,
    decoratorProps: normalizeComponentProps(schema.decoratorProps),
    span: typeof schema.span === 'number' ? schema.span : undefined,
    order: typeof schema.order === 'number' ? schema.order : undefined,
  }
}

/**
 * 将外部 schema 解析为设计器节点树。
 *
 * 解析失败或 schema 结构不完整时，会回退到 `defaultNodes()`，
 * 确保设计器始终有可编辑内容，避免空白态阻断操作。
 *
 * @param schemaLike 任意输入 schema。
 * @returns 解析后的节点数组。
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
  if (node.description)
    schema.description = node.description
  if (node.defaultValue !== undefined)
    schema.default = node.defaultValue
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
  if (node.dataSource)
    schema.dataSource = node.dataSource
  if (node.rules && node.rules.length > 0)
    schema.rules = node.rules
  if (node.validateTrigger)
    schema.validateTrigger = node.validateTrigger
  if (node.reactions && node.reactions.length > 0)
    schema.reactions = node.reactions
  if (typeof node.visible === 'boolean')
    schema.visible = node.visible
  if (typeof node.disabled === 'boolean')
    schema.disabled = node.disabled
  if (typeof node.preview === 'boolean')
    schema.preview = node.preview
  if (node.pattern)
    schema.pattern = node.pattern
  if (node.displayFormat)
    schema.displayFormat = node.displayFormat
  if (node.inputParse)
    schema.inputParse = node.inputParse
  if (node.submitTransform)
    schema.submitTransform = node.submitTransform
  if (node.submitPath)
    schema.submitPath = node.submitPath
  if (typeof node.excludeWhenHidden === 'boolean')
    schema.excludeWhenHidden = node.excludeWhenHidden
  if (typeof node.span === 'number')
    schema.span = node.span
  if (typeof node.order === 'number')
    schema.order = node.order
  if (node.decorator)
    schema.decorator = node.decorator
  if (node.decoratorProps && Object.keys(node.decoratorProps).length > 0)
    schema.decoratorProps = node.decoratorProps
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
 * 将设计器节点树导出为 ConfigForm schema。
 *
 * 导出时会统一设置表单级 `labelPosition='top'`，
 * 并递归展开容器/分组结构生成 `properties`。
 *
 * @param nodes 设计器节点树。
 * @returns 可直接用于渲染的 schema 对象。
 */
export function nodesToSchema(nodes: DesignerNode[]): ISchema {
  return {
    type: 'object',
    decoratorProps: { labelPosition: 'top' },
    properties: buildProperties(nodes),
  }
}

export function extractDesignerFormConfig(schemaLike: unknown): DesignerFormConfig {
  const config = createDefaultDesignerFormConfig()
  if (!isRecord(schemaLike))
    return config

  const decoratorProps = isRecord(schemaLike.decoratorProps) ? schemaLike.decoratorProps : {}
  const labelPosition = decoratorProps.labelPosition
  if (labelPosition === 'top' || labelPosition === 'left' || labelPosition === 'right')
    config.labelPosition = labelPosition

  if (typeof decoratorProps.labelWidth === 'string' || typeof decoratorProps.labelWidth === 'number')
    config.labelWidth = decoratorProps.labelWidth

  const rawPattern = schemaLike.pattern ?? decoratorProps.pattern
  if (rawPattern === 'editable' || rawPattern === 'preview' || rawPattern === 'disabled')
    config.pattern = rawPattern

  const rawTrigger = schemaLike.validateTrigger ?? decoratorProps.validateTrigger
  if (rawTrigger === 'change' || rawTrigger === 'blur' || rawTrigger === 'submit')
    config.validateTrigger = rawTrigger

  const rawLayout = isRecord(schemaLike.layout) ? schemaLike.layout : {}
  if (rawLayout.type === 'grid') {
    config.layoutType = 'grid'
    if (typeof rawLayout.columns === 'number')
      config.layoutColumns = rawLayout.columns
    if (typeof rawLayout.gutter === 'number')
      config.layoutGutter = rawLayout.gutter
  }
  else if (rawLayout.type === 'inline' || decoratorProps.direction === 'inline') {
    config.layoutType = 'inline'
    if (typeof rawLayout.gap === 'number')
      config.layoutGap = rawLayout.gap
  }

  const actions = isRecord(decoratorProps.actions) ? decoratorProps.actions : null
  if (actions) {
    config.showSubmit = actions.submit !== false
    config.showReset = actions.reset !== false
    if (typeof actions.submit === 'string')
      config.submitText = actions.submit
    if (typeof actions.reset === 'string')
      config.resetText = actions.reset
    if (actions.align === 'left' || actions.align === 'center' || actions.align === 'right')
      config.actionsAlign = actions.align
  }

  return config
}

export function applyDesignerFormConfig(schema: ISchema, formConfig: DesignerFormConfig): ISchema {
  const nextSchema: ISchema = { ...schema }
  const decoratorProps = isRecord(schema.decoratorProps) ? { ...schema.decoratorProps } : {}

  decoratorProps.labelPosition = formConfig.labelPosition
  if (formConfig.labelWidth === undefined || formConfig.labelWidth === '') {
    delete decoratorProps.labelWidth
  }
  else {
    decoratorProps.labelWidth = formConfig.labelWidth
  }

  if (formConfig.layoutType === 'inline') {
    decoratorProps.direction = 'inline'
  }
  else if (decoratorProps.direction === 'inline') {
    delete decoratorProps.direction
  }

  const actions = isRecord(decoratorProps.actions) ? { ...decoratorProps.actions } : {}
  if (formConfig.showSubmit) {
    if (formConfig.submitText && formConfig.submitText.trim())
      actions.submit = formConfig.submitText.trim()
    else
      delete actions.submit
  }
  else {
    actions.submit = false
  }

  if (formConfig.showReset) {
    if (formConfig.resetText && formConfig.resetText.trim())
      actions.reset = formConfig.resetText.trim()
    else
      delete actions.reset
  }
  else {
    actions.reset = false
  }

  if (formConfig.actionsAlign && formConfig.actionsAlign !== 'center') {
    actions.align = formConfig.actionsAlign
  }
  else {
    delete actions.align
  }

  const hasActionOverrides = formConfig.showSubmit || formConfig.showReset
    || formConfig.actionsAlign !== 'center'
  const hasExtraActions = Object.keys(actions).some(key => !['submit', 'reset', 'align'].includes(key))

  if (hasActionOverrides || hasExtraActions) {
    decoratorProps.actions = actions
  }
  else {
    delete decoratorProps.actions
  }

  if (Object.keys(decoratorProps).length > 0)
    nextSchema.decoratorProps = decoratorProps
  else
    delete nextSchema.decoratorProps

  if (formConfig.layoutType === 'grid') {
    nextSchema.layout = {
      type: 'grid',
      columns: formConfig.layoutColumns ?? 1,
      gutter: formConfig.layoutGutter ?? 16,
    }
  }
  else if (formConfig.layoutType === 'inline') {
    nextSchema.layout = {
      type: 'inline',
      gap: formConfig.layoutGap ?? 16,
    }
  }
  else {
    delete nextSchema.layout
  }

  if (formConfig.pattern === 'default')
    delete nextSchema.pattern
  else
    nextSchema.pattern = formConfig.pattern

  if (formConfig.validateTrigger === 'default')
    delete nextSchema.validateTrigger
  else
    nextSchema.validateTrigger = formConfig.validateTrigger

  return nextSchema
}

/**
 * 计算 schema 的字符串签名。
 *
 * 主要用于“变更检测”与“是否需要重建预览”的快速比较。
 * 若输入存在循环引用导致序列化失败，返回空字符串。
 *
 * @param schemaLike 任意 schema 值。
 * @returns 可比较的签名字符串。
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
 * 为字段节点生成预览值。
 *
 * 用于设计器中的“组件预览渲染”，确保每种字段在无真实数据时也能展示合理形态。
 *
 * @param node 字段节点。
 * @returns 对应字段类型的默认示例值。
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
 * 深拷贝单个节点并为整棵子树重建 ID。
 *
 * 复制容器时会递归处理 `children` 与 `sections.children`，
 * 防止复制结果与原节点发生 ID 冲突。
 *
 * @param node 待复制节点。
 * @returns 具有全新 ID 的节点副本。
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
 * 按节点 ID 在原位置后方插入一个副本。
 *
 * 复制操作支持任意嵌套层级；
 * 若未命中目标节点，则返回原数据保持幂等。
 *
 * @param nodes 当前节点树。
 * @param nodeId 要复制的目标节点 ID。
 * @returns 复制后的节点树。
 */
export function duplicateNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const draft = cloneNodes(nodes)

  /**
   * 在当前列表及其后代中递归执行复制。
   *
   * 命中后立即返回，避免同一次操作复制多个同 ID 节点。
   *
   * @param list 当前递归列表。
   * @returns 是否已成功复制目标节点。
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
 * 向支持分组的容器追加一个分组节点。
 *
 * 仅 Tabs / Collapse 可新增分组；其他容器直接返回原数据。
 * 分组标题为空时自动生成“分组N”。
 *
 * @param nodes 当前节点树。
 * @param containerId 目标容器 ID。
 * @param title 可选分组标题。
 * @returns 追加分组后的节点树。
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
 * 创建“根画布”拖拽目标描述对象。
 * @returns 根目标对象。
 */
export function rootTarget(): DesignerDropTarget {
  return { type: 'root' }
}

/**
 * 创建“容器 children 区域”拖拽目标描述对象。
 *
 * @param containerId 目标容器 ID。
 * @returns 容器目标对象。
 */
export function containerTarget(containerId: string): DesignerDropTarget {
  return { type: 'container', containerId }
}

/**
 * 创建“分组 children 区域”拖拽目标描述对象。
 *
 * @param sectionId 目标分组 ID。
 * @returns 分组目标对象。
 */
export function sectionTarget(sectionId: string): DesignerDropTarget {
  return { type: 'section', sectionId }
}

/**
 * 将拖拽目标对象转换为稳定字符串键。
 *
 * 该键用于缓存映射、列表检索与跨层比较（如 `isSameTarget`）。
 *
 * @param target 拖拽目标对象。
 * @returns 目标唯一键字符串。
 */
export function targetToKey(target: DesignerDropTarget): string {
  if (target.type === 'root')
    return 'root'
  if (target.type === 'container')
    return `container:${target.containerId}`
  return `section:${target.sectionId}`
}

/**
 * 将目标键反向解析为拖拽目标对象。
 *
 * 可处理 `root`、`container:xxx`、`section:xxx` 三种格式；
 * 非法键返回 `null` 供调用方兜底。
 *
 * @param key 目标键字符串。
 * @returns 拖拽目标对象或 null。
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
 * 返回容器允许接收的节点类型集合。
 *
 * 目前三类布局容器都允许放入字段与子容器；
 * 保留该函数作为未来做“容器能力差异化”时的单一扩展点。
 *
 * @param component 容器组件名称。
 * @returns 可接收的节点类型列表。
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
