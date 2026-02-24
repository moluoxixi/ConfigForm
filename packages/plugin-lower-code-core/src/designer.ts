import type { ISchema } from '@moluoxixi/core'
import { cloneDeep } from '@moluoxixi/core'

import {
  COMPONENT_MATERIALS,
  LAYOUT_MATERIALS,
  MATERIALS,
} from './materials'

/**
 * findNodeInList：执行当前位置的功能处理逻辑。
 * 定位：`packages/plugin-lower-code-core/src/designer.ts:12`。
 * 功能：完成参数消化、业务分支处理及上下游结果传递。
 * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
 * @param nodes 参数 nodes 为当前逻辑所需的输入信息。
 * @param nodeId 参数 nodeId 为当前逻辑所需的输入信息。
 * @returns 返回当前分支执行后的结果。
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
 * find Section In List：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * find Container By Section Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * find Node By Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function findNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode | null {
  return findNodeInList(nodes, nodeId)
}

/**
 * find Section By Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function findSectionById(nodes: DesignerNode[], sectionId: string): DesignerSectionNode | null {
  return findSectionInList(nodes, sectionId)
}

/**
 * update Node List：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @param updater 参数 `updater`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * update Section List：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @param updater 参数 `updater`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * update Node By Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @param updater 参数 `updater`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * update Section By Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @param updater 参数 `updater`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * remove Node From List：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * remove Node By Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
export function removeNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const next = removeNodeFromList(cloneNodes(nodes), nodeId)
  const safe = next.length > 0 ? next : defaultNodes()
  return normalizeNodes(safe)
}

/**
 * clone Node With New Ids：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * duplicate Node By Id：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
export function duplicateNodeById(nodes: DesignerNode[], nodeId: string): DesignerNode[] {
  const draft = cloneNodes(nodes)

  /**
   * duplicate In List：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param list 参数 `list`用于提供集合数据，支撑批量遍历与扩展处理。
   * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
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
 * find Container In List：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param containerId 参数 `containerId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * add Section To Container：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param containerId 参数 `containerId`用于提供唯一标识，确保操作可以精确命中对象。
 * @param [title] 参数 `title`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * remove Section From Container：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param containerId 参数 `containerId`用于提供唯一标识，确保操作可以精确命中对象。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * root Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function rootTarget(): DesignerDropTarget {
  return { type: 'root' }
}

/**
 * container Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param containerId 参数 `containerId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function containerTarget(containerId: string): DesignerDropTarget {
  return { type: 'container', containerId }
}

/**
 * section Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param sectionId 参数 `sectionId`用于提供唯一标识，确保操作可以精确命中对象。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function sectionTarget(sectionId: string): DesignerDropTarget {
  return { type: 'section', sectionId }
}

/**
 * target To Key：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
export function targetToKey(target: DesignerDropTarget): string {
  if (target.type === 'root')
    return 'root'
  if (target.type === 'container')
    return `container:${target.containerId}`
  return `section:${target.sectionId}`
}

/**
 * key To Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param key 参数 `key`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * is Same Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param a 参数 `a`用于提供当前函数执行所需的输入信息。
 * @param b 参数 `b`用于提供当前函数执行所需的输入信息。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
 */
function isSameTarget(a: DesignerDropTarget, b: DesignerDropTarget): boolean {
  return targetToKey(a) === targetToKey(b)
}

/**
 * 根据目标位置解析可写的节点列表。
 * 返回 `null` 表示该目标当前不可直接写入（例如分组容器本体）。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * accepted Node Kinds By Container：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param component 参数 `component`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
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
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
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
 * can Drop Node At Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
 */
export function canDropNodeAtTarget(
  nodes: DesignerNode[],
  target: DesignerDropTarget,
  node: DesignerNode,
): boolean {
  return canAcceptNodeByTarget(nodes, target, node)
}

/**
 * insert Node By Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @param newIndex 参数 `newIndex`用于提供位置序号，支撑排序或插入等序列操作。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
 * move Node By Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param fromTarget 参数 `fromTarget`用于提供当前函数执行所需的输入信息。
 * @param toTarget 参数 `toTarget`用于提供当前函数执行所需的输入信息。
 * @param oldIndex 参数 `oldIndex`用于提供位置序号，支撑排序或插入等序列操作。
 * @param newIndex 参数 `newIndex`用于提供位置序号，支撑排序或插入等序列操作。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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

/**
 * Node Location By Target：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface NodeLocationByTarget {
  target: DesignerDropTarget
  index: number
}

/**
 * 根据 nodeId 查找节点当前所在位置（根/容器/分组 + 索引）。
 * 该方式不依赖 DOM 冒泡事件里的临时索引，嵌套拖拽更稳定。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function findNodeLocationByTarget(nodes: DesignerNode[], nodeId: string): NodeLocationByTarget | null {
  const rootIndex = nodes.findIndex(node => node.id === nodeId)
  if (rootIndex >= 0) {
    return {
      target: rootTarget(),
      index: rootIndex,
    }
  }

  /**
   * walk：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param items 参数 `items`用于提供集合数据，支撑批量遍历与扩展处理。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  const /**
         * walk：执行当前功能逻辑。
         *
         * @param items 参数 items 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */
    walk = (items: DesignerNode[]): NodeLocationByTarget | null => {
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
 * move Node By Id To Target：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-core/src/designer.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param nodes 参数 `nodes`用于提供节点数据并定位或更新目标节点。
 * @param nodeId 参数 `nodeId`用于提供节点数据并定位或更新目标节点。
 * @param toTarget 参数 `toTarget`用于提供当前函数执行所需的输入信息。
 * @param newIndex 参数 `newIndex`用于提供位置序号，支撑排序或插入等序列操作。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
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
