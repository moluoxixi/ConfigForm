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

function uid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeName(value: string, fallback: string): string {
  const trimmed = value.trim().replace(/[^\w$]/g, '_')
  const normalized = trimmed || fallback
  if (/^\d/.test(normalized))
    return `f_${normalized}`
  return normalized
}

function normalizeTitle(value: string, fallback: string): string {
  const trimmed = value.trim()
  return trimmed || fallback
}

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

function normalizeComponentProps(props: unknown): Record<string, unknown> {
  if (!isRecord(props))
    return {}
  return cloneDeep(props)
}

export function isFieldNode(node: DesignerNode): node is DesignerFieldNode {
  return node.kind === 'field'
}

export function isContainerNode(node: DesignerNode): node is DesignerContainerNode {
  return node.kind === 'container'
}

export function containerUsesSections(component: DesignerContainerComponent): boolean {
  return component === 'LayoutTabs' || component === 'LayoutCollapse'
}

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

export function cloneNodes(nodes: DesignerNode[]): DesignerNode[] {
  return cloneDeep(nodes)
}

function defaultSection(title: string): DesignerSectionNode {
  return {
    id: uid('section'),
    kind: 'section',
    name: normalizeName(title, 'section'),
    title,
    children: [],
  }
}

function defaultSectionsByContainer(component: DesignerContainerComponent): DesignerSectionNode[] {
  if (component === 'LayoutTabs')
    return [defaultSection('基础信息'), defaultSection('扩展信息')]
  if (component === 'LayoutCollapse')
    return [defaultSection('折叠面板')]
  return []
}

function normalizeSection(section: DesignerSectionNode, usedNames: Set<string>): DesignerSectionNode {
  const name = ensureUniqueName(normalizeName(section.name, 'section'), usedNames)
  return {
    ...section,
    name,
    title: normalizeTitle(section.title, name),
    children: normalizeNodes(section.children),
  }
}

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

export function normalizeNodes(nodes: DesignerNode[]): DesignerNode[] {
  const used = new Set<string>()
  const result: DesignerNode[] = []
  for (const node of nodes) {
    result.push(node.kind === 'field' ? normalizeField(node, used) : normalizeContainer(node, used))
  }
  return result
}

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

export function defaultNodeFromMaterial(material: MaterialItem, siblings: DesignerNode[]): DesignerNode {
  const rawNode = material.kind === 'field' ? createFieldNode(material) : createContainerNode(material)
  return normalizeNode(rawNode, siblings)
}

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

function parseTitle(schema: Record<string, unknown>, fallback: string): string {
  const props = isRecord(schema.componentProps) ? schema.componentProps : null
  const propsTitle = props && typeof props.title === 'string' ? props.title : ''
  const title = typeof schema.title === 'string' ? schema.title : ''
  return normalizeTitle(propsTitle || title, fallback)
}

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

export function nodesToSchema(nodes: DesignerNode[]): ISchema {
  return {
    type: 'object',
    decoratorProps: { labelPosition: 'top' },
    properties: buildProperties(nodes),
  }
}

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

export function findNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode | null {
  return findNodeInList(nodes, nodeId)
}

export function findSectionById(nodes: DesignerNode[], sectionId: string): DesignerSectionNode | null {
  return findSectionInList(nodes, sectionId)
}

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

export function updateNodeById(
  nodes: DesignerNode[],
  nodeId: string,
  updater: (node: DesignerNode) => DesignerNode,
): DesignerNode[] {
  const next = updateNodeList(cloneNodes(nodes), nodeId, updater)
  return normalizeNodes(next)
}

export function updateSectionById(
  nodes: DesignerNode[],
  sectionId: string,
  updater: (section: DesignerSectionNode) => DesignerSectionNode,
): DesignerNode[] {
  const next = updateSectionList(cloneNodes(nodes), sectionId, updater)
  return normalizeNodes(next)
}

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

export function removeNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const next = removeNodeFromList(cloneNodes(nodes), nodeId)
  const safe = next.length > 0 ? next : defaultNodes()
  return normalizeNodes(safe)
}

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

export function duplicateNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const draft = cloneNodes(nodes)

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

export function addSectionToContainer(nodes: DesignerNode[], containerId: string, title?: string): DesignerNode[] {
  const draft = cloneNodes(nodes)
  const container = findContainerInList(draft, containerId)
  if (!container || !containerUsesSections(container.component))
    return nodes
  container.sections.push(defaultSection(title?.trim() || `分组${container.sections.length + 1}`))
  return normalizeNodes(draft)
}

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

export function rootTarget(): DesignerDropTarget {
  return { type: 'root' }
}

export function containerTarget(containerId: string): DesignerDropTarget {
  return { type: 'container', containerId }
}

export function sectionTarget(sectionId: string): DesignerDropTarget {
  return { type: 'section', sectionId }
}

export function targetToKey(target: DesignerDropTarget): string {
  if (target.type === 'root')
    return 'root'
  if (target.type === 'container')
    return `container:${target.containerId}`
  return `section:${target.sectionId}`
}

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

function isSameTarget(a: DesignerDropTarget, b: DesignerDropTarget): boolean {
  return targetToKey(a) === targetToKey(b)
}

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

export function canDropNodeAtTarget(
  nodes: DesignerNode[],
  target: DesignerDropTarget,
  node: DesignerNode,
): boolean {
  return canAcceptNodeByTarget(nodes, target, node)
}

export function insertNodeByTarget(
  nodes: DesignerNode[],
  target: DesignerDropTarget,
  newIndex: number,
  node: DesignerNode,
): DesignerNode[] {
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

export function moveNodeByTarget(
  nodes: DesignerNode[],
  fromTarget: DesignerDropTarget,
  toTarget: DesignerDropTarget,
  oldIndex: number,
  newIndex: number,
): DesignerNode[] {
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

