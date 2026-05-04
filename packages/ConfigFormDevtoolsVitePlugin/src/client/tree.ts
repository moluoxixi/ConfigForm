import type { FormDevtoolsNode } from '../types'
import type {
  ChildNodesByParentId,
  DevtoolsRenderState,
  DevtoolsStore,
  RootGroup,
  StoredNode,
} from './types'
import {
  compareElementsByDocumentPosition,
  elementArea,
  elementHasEnabledBox,
  elementViewportScore,
  selectEarlierElement,
} from './geometry'

export function resolveNodeKindIcon(node: FormDevtoolsNode): 'C' | 'F' {
  return node.kind === 'component' ? 'C' : 'F'
}

export function resolveNodeDisplayName(node: FormDevtoolsNode): string {
  if (node.kind === 'component')
    return node.component ?? node.kind

  return node.field ?? node.component ?? node.kind
}

function compareRootGroups(first: RootGroup, second: RootGroup): number {
  if (first.element && second.element) {
    const elementOrder = compareElementsByDocumentPosition(first.element, second.element)
    if (elementOrder !== 0)
      return elementOrder
  }

  return first.registrationOrder - second.registrationOrder
}

function nodeHasEnabledElement(node: StoredNode): boolean {
  if (!node.element)
    return false

  return elementHasEnabledBox(node.element)
}

function nodeViewportScore(node: StoredNode): number {
  if (!node.element)
    return 0

  return elementViewportScore(node.element)
}

/** 按 ConfigForm 实例聚合扁平节点，并计算导航所需元数据。 */
export function collectRootGroups(store: DevtoolsStore): RootGroup[] {
  const groups = new Map<string, RootGroup>()

  for (const node of store.nodes.values()) {
    const group = groups.get(node.formId)
    if (group) {
      group.formLabel ??= node.formLabel
      group.element = selectEarlierElement(group.element, node.element)
      group.hasInspectableElement = group.hasInspectableElement || Boolean(node.element)
      group.hasEnabledElement = group.hasEnabledElement || nodeHasEnabledElement(node)
      group.viewportScore = Math.max(group.viewportScore, nodeViewportScore(node))
      if (!node.parentId)
        group.nodes.push(node)
      continue
    }

    groups.set(node.formId, {
      element: node.element ?? undefined,
      formId: node.formId,
      formLabel: node.formLabel,
      hasEnabledElement: nodeHasEnabledElement(node),
      hasInspectableElement: Boolean(node.element),
      nodes: node.parentId ? [] : [node],
      registrationOrder: node.registrationOrder,
      viewportScore: nodeViewportScore(node),
    })
  }

  return [...groups.values()]
    .sort(compareRootGroups)
    .map(group => ({
      ...group,
      nodes: group.nodes.sort((a, b) => a.order - b.order),
    }))
}

export function nodeTreeDepth(store: DevtoolsStore, node: StoredNode): number {
  let depth = 0
  let parentId = node.parentId

  while (parentId) {
    const parent = store.nodes.get(parentId)
    if (!parent)
      break

    depth += 1
    parentId = parent.parentId
  }

  return depth
}

export function comparePickNodes(store: DevtoolsStore, first: StoredNode, second: StoredNode): number {
  if (first.element && second.element && first.element !== second.element) {
    if (first.element.contains(second.element))
      return 1
    if (second.element.contains(first.element))
      return -1

    const areaDiff = elementArea(first.element) - elementArea(second.element)
    if (areaDiff !== 0)
      return areaDiff
  }

  const depthDiff = nodeTreeDepth(store, second) - nodeTreeDepth(store, first)
  if (depthDiff !== 0)
    return depthDiff

  return first.order - second.order
}

export function resolvePickedNode(store: DevtoolsStore, target: Node): StoredNode | undefined {
  return [...store.nodes.values()]
    .filter((node) => {
      const element = node.element
      return Boolean(element && element.contains(target) && elementHasEnabledBox(element))
    })
    .sort((first, second) => comparePickNodes(store, first, second))[0]
}

export function groupIsDisabled(group: RootGroup): boolean {
  return group.hasInspectableElement && !group.hasEnabledElement
}

/** 选出当前视口中可见强度最高的可用表单。 */
export function resolveViewportActiveGroup(groups: RootGroup[]): RootGroup | undefined {
  return groups.reduce<RootGroup | undefined>((best, group) => {
    if (groupIsDisabled(group) || group.viewportScore <= 0)
      return best
    if (!best || group.viewportScore > best.viewportScore)
      return group
    return best
  }, undefined)
}

/**
 * 解析当前应渲染的表单。
 *
 * 用户手动选择会保持到外部上下文变化；没有手动选择时由视口可见强度决定。
 */
export function resolveActiveGroup(groups: RootGroup[], state: DevtoolsRenderState): RootGroup | undefined {
  const enabledGroups = groups.filter(group => !groupIsDisabled(group))

  if (enabledGroups.length === 0) {
    state.activeFormId = undefined
    state.activeFormSelectedByUser = false
    state.selectedNodeId = undefined
    return undefined
  }

  const activeGroup = enabledGroups.find(group => group.formId === state.activeFormId)
  if (state.activeFormSelectedByUser && activeGroup)
    return activeGroup

  const viewportActiveGroup = resolveViewportActiveGroup(enabledGroups)
  state.activeFormSelectedByUser = false
  return viewportActiveGroup ?? activeGroup ?? enabledGroups[0]
}

/** 为当前快照建立父子索引，避免搜索和渲染递归时每层重复扫描全量节点。 */
export function createChildNodesByParentId(store: DevtoolsStore): ChildNodesByParentId {
  const childNodesByParentId: ChildNodesByParentId = new Map()
  for (const node of store.nodes.values()) {
    if (!node.parentId)
      continue

    const siblings = childNodesByParentId.get(node.parentId)
    if (siblings) {
      siblings.push(node)
      continue
    }

    childNodesByParentId.set(node.parentId, [node])
  }

  for (const siblings of childNodesByParentId.values())
    siblings.sort((a, b) => a.order - b.order)

  return childNodesByParentId
}

export function collectOrderedTreeNodes(childNodesByParentId: ChildNodesByParentId, roots: StoredNode[]): StoredNode[] {
  const nodes: StoredNode[] = []

  function visit(node: StoredNode) {
    nodes.push(node)
    for (const child of childNodesByParentId.get(node.id) ?? [])
      visit(child)
  }

  for (const root of roots)
    visit(root)

  return nodes
}

export function collectSourceNodes(childNodesByParentId: ChildNodesByParentId, roots: StoredNode[]): StoredNode[] {
  return collectOrderedTreeNodes(childNodesByParentId, roots).filter(node => node.source)
}
