import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerContainerNode,
  DesignerFieldNode,
  DesignerNode,
} from '@moluoxixi/plugin-lower-code-core'
import type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerProps,
} from './designer/types'
import {
  addSectionToContainer,
  collectDropTargetKeys,
  createDesignerCanvasPutHandler,
  createDesignerCanvasSortableOptions,
  createDesignerMaterialSortableOptions,
  createDesignerPointerTracker,
  defaultNodeFromMaterial,
  duplicateNodeById,
  findNodeById,
  findSectionById,
  hasMountedDesignerSortables,
  insertNodeByTarget,
  keyToTarget,
  moveNodeByIdToTarget,
  nodesToSchema,
  removeNodeById,
  removeSectionFromContainer,
  resolveDesignerMaterials,
  resolveDesignerSortableInsertIndex,
  resolveDesignerSortableMoveIndices,
  resolveDesignerSortablePointerIndexByTargetKey,
  resolveDesignerSortablePointerIndexByTargetKeyAndPoint,
  resolveDesignerSortablePointerTargetKey,
  resolveDesignerSortablePointerTargetKeyByPoint,
  restoreDraggedDomPosition,
  rootTarget,
  schemaSignature,
  schemaToNodes,
  updateNodeById,
} from '@moluoxixi/plugin-lower-code-core'
import { ComponentRegistryContext, FormProvider, SchemaField, useCreateForm } from '@moluoxixi/react'
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import { DesignerHeader } from './designer/Header'
import { mergeDesignerComponentDefinitions } from './designer/panels/component-definitions'
import { DesignerCanvasPane } from './designer/panes/DesignerCanvasPane'
import { DesignerMaterialPane } from './designer/panes/DesignerMaterialPane'
import { DesignerPropertiesPane } from './designer/panes/DesignerPropertiesPane'
import { createMockRenderers } from './designer/renderers/mock'
import {
  canUseRegistryRenderers,
  createRegistryRenderers,
} from './designer/renderers/registry'
import { mergeRenderers } from './designer/renderers/resolve'
import { DESIGNER_CSS } from './designer/styles'

export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerProps,
  LowCodeDesignerRenderContext,
  LowCodeDesignerRenderers,
  LowCodePreviewRenderMode,
} from './designer/types'

const REACT_INTERNAL_COMPONENT_NAMES = new Set(['LowCodeDesigner', 'LowerCodeDesigner', 'StatusTabs'])

/**
 * 用于扁平对象的浅比较。
 * 这里不做深比较，因为组件可编辑属性约定为一层 key-value。
 */
function shallowEqualRecord(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length)
    return false
  for (const key of aKeys) {
    if (a[key] !== b[key])
      return false
  }
  return true
}

/**
 * 从组件定义里构建“组件默认属性预设表”。
 * 输出结构：{ [componentName]: defaultProps }。
 */
function createComponentPropsByComponent(
  definitions: Record<string, LowCodeDesignerComponentDefinition> | undefined,
): Record<string, Record<string, unknown>> {
  if (!definitions)
    return {}

  const componentPropsByComponent: Record<string, Record<string, unknown>> = {}
  for (const [componentName, definition] of Object.entries(definitions)) {
    if (!definition.defaultProps)
      continue
    componentPropsByComponent[componentName] = { ...definition.defaultProps }
  }
  return componentPropsByComponent
}

/**
 * 给新建字段节点叠加组件级预设属性。
 * 保证“拖入画布”与“右侧属性面板默认值”行为一致。
 */
function mergeFieldNodeWithComponentPreset(
  node: DesignerNode,
  componentPropsByComponent: Record<string, Record<string, unknown>>,
): DesignerNode {
  if (node.kind !== 'field')
    return node
  const presetProps = componentPropsByComponent[node.component]
  if (!presetProps)
    return node
  return {
    ...node,
    componentProps: { ...node.componentProps, ...presetProps },
  }
}

/**
 * 递归更新所有字段节点，同时尽量复用未变化引用。
 * 这样 React 的记忆化渲染可以跳过无意义刷新。
 */
function updateFieldNodesRecursively(
  nodes: DesignerNode[],
  updater: (field: DesignerFieldNode) => DesignerFieldNode,
): DesignerNode[] {
  let changed = false
  const nextNodes = nodes.map((node) => {
    if (node.kind === 'field') {
      const nextField = updater(node)
      if (nextField !== node)
        changed = true
      return nextField
    }

    const nextChildren = updateFieldNodesRecursively(node.children, updater)
    const nextSections = node.sections.map((section) => {
      const nextSectionChildren = updateFieldNodesRecursively(section.children, updater)
      if (nextSectionChildren === section.children)
        return section
      changed = true
      return {
        ...section,
        children: nextSectionChildren,
      }
    })
    const sectionsChanged = nextSections.some((section, index) => section !== node.sections[index])

    if (nextChildren !== node.children || sectionsChanged) {
      changed = true
      return {
        ...node,
        children: nextChildren,
        sections: sectionsChanged ? nextSections : node.sections,
      }
    }

    return node
  })

  return changed ? nextNodes : nodes
}

/**
 * React 低代码设计器入口组件。
 *
 * 负责：
 * 1. 维护节点树与选中态。
 * 2. 在 schema 与节点树之间双向同步。
 * 3. 挂载拖拽能力并驱动左中右三栏联动。
 * 4. 组合预览渲染器与组件默认属性预设。
 *
 * @param props 设计器组件参数对象。
 * @returns 设计器 React 元素。
 */
export function LowCodeDesigner(props: LowCodeDesignerProps): React.ReactElement {
  const {
    value,
    onChange,
    minCanvasHeight = 420,
    previewRenderMode = 'auto',
    renderers: customRenderers,
    componentDefinitions,
  } = props
  // Registry 用于在可用时自动启用真实组件预览渲染器。
  const componentRegistry = useContext(ComponentRegistryContext)
  const [nodes, setNodes] = useState<DesignerNode[]>(() => schemaToNodes(value))
  const [selectedId, setSelectedId] = useState<string | null>(nodes[0]?.id ?? null)
  const [enumDraft, setEnumDraft] = useState('')
  const baseComponentDefinitions = useMemo(
    () => mergeDesignerComponentDefinitions(componentDefinitions),
    [componentDefinitions],
  )
  const [componentPropsByComponent, setComponentPropsByComponent] = useState<Record<string, Record<string, unknown>>>(
    () => createComponentPropsByComponent(baseComponentDefinitions),
  )

  const materialHostRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const designerRootRef = useRef<HTMLDivElement>(null)
  const componentPropsByComponentRef = useRef(componentPropsByComponent)
  const pointerTrackerRef = useRef(createDesignerPointerTracker())
  const dragMetaRef = useRef({ allowCrossTarget: false })
  const designerForm = useCreateForm({}, { resetKey: 'designer' })

  const builtSchema = useMemo(() => nodesToSchema(nodes), [nodes])
  const builtSignature = useMemo(() => schemaSignature(builtSchema), [builtSchema])
  const valueSignature = useMemo(() => schemaSignature(value), [value])
  const lastSeenValueSignature = useRef(valueSignature)

  const selectedNode = useMemo(
    () => (selectedId ? findNodeById(nodes, selectedId) : null),
    [nodes, selectedId],
  )
  const selectedSection = useMemo(
    () => (selectedId ? findSectionById(nodes, selectedId) : null),
    [nodes, selectedId],
  )
  const selectedField = selectedNode && selectedNode.kind === 'field' ? selectedNode : null
  const selectedContainer = selectedNode && selectedNode.kind === 'container' ? selectedNode : null

  const mergedComponentDefinitions = useMemo(
    () => {
      const definitions: Record<string, LowCodeDesignerComponentDefinition> = { ...baseComponentDefinitions }
      for (const [componentName, presetProps] of Object.entries(componentPropsByComponent)) {
        const current = definitions[componentName]
        definitions[componentName] = {
          ...current,
          defaultProps: {
            ...(current?.defaultProps ?? {}),
            ...presetProps,
          },
        }
      }
      return definitions
    },
    [baseComponentDefinitions, componentPropsByComponent],
  )
  const designerMaterials = useMemo(
    () => resolveDesignerMaterials(
      componentRegistry.components.keys(),
      mergedComponentDefinitions,
      { internalComponentNames: REACT_INTERNAL_COMPONENT_NAMES },
    ),
    [componentRegistry, mergedComponentDefinitions],
  )
  const materialsById = useMemo(
    () => new Map(designerMaterials.allMaterials.map(item => [item.id, item] as const)),
    [designerMaterials.allMaterials],
  )
  const dropTargetSignature = useMemo(
    () => collectDropTargetKeys(nodes).sort().join('|'),
    [nodes],
  )

  const resolvedRenderers = useMemo(() => {
    const fallback = createMockRenderers()
    const useRegistry = previewRenderMode === 'registry'
      || (previewRenderMode === 'auto' && canUseRegistryRenderers(componentRegistry))
    const builtin = useRegistry
      ? createRegistryRenderers(componentRegistry, fallback)
      : fallback
    return mergeRenderers({
      mode: useRegistry ? 'registry' : 'mock',
      custom: customRenderers,
      fallback,
      builtin,
    })
  }, [componentRegistry, customRenderers, previewRenderMode])

  const mainGridSchema = useMemo<ISchema>(
    () => ({
      type: 'object',
      properties: {
        materials: {
          type: 'void',
          component: 'DesignerMaterialPane',
          componentProps: {
            componentMaterials: designerMaterials.componentMaterials,
            layoutMaterials: designerMaterials.layoutMaterials,
            materialHostRef,
            renderMaterialPreview: resolvedRenderers.renderMaterialPreview,
          },
        },
        canvas: {
          type: 'void',
          component: 'DesignerCanvasPane',
          componentProps: {
            nodes,
            minCanvasHeight,
            selectedId,
            canvasHostRef,
            onSelect: setSelectedId,
            onDuplicateNode: handleDuplicateNode,
            onRemoveNode: handleRemoveNode,
            onAddSection: handleAddSection,
            onRemoveSection: handleRemoveSection,
            renderFieldPreviewControl: resolvedRenderers.renderFieldPreviewControl,
          },
        },
        properties: {
          type: 'void',
          component: 'DesignerPropertiesPane',
          componentProps: {
            nodes,
            selectedField,
            selectedContainer,
            selectedSection,
            enumDraft,
            setEnumDraft,
            onUpdateNodes: setNodes,
            updateField,
            updateContainer,
            fieldComponentOptions: designerMaterials.fieldComponentOptions,
            componentDefinitions: mergedComponentDefinitions,
            componentPropsByComponent,
            onUpdateComponentPropByComponentName: updateComponentPropByComponentName,
          },
        },
      },
    }),
    [
      canvasHostRef,
      componentPropsByComponent,
      handleAddSection,
      handleDuplicateNode,
      handleRemoveNode,
      handleRemoveSection,
      designerMaterials.componentMaterials,
      designerMaterials.fieldComponentOptions,
      designerMaterials.layoutMaterials,
      enumDraft,
      mergedComponentDefinitions,
      minCanvasHeight,
      nodes,
      selectedContainer,
      selectedField,
      selectedId,
      selectedSection,
      setEnumDraft,
      setNodes,
      updateComponentPropByComponentName,
      updateContainer,
      updateField,
      resolvedRenderers.renderFieldPreviewControl,
      resolvedRenderers.renderMaterialPreview,
    ],
  )

  const mainGridRenderKey = useMemo(
    () => builtSignature,
    [builtSignature],
  )

  // 保持 ref 与状态同步，确保 Sortable 回调拿到最新预设。
  useEffect(() => {
    componentPropsByComponentRef.current = componentPropsByComponent
  }, [componentPropsByComponent])

  // 合并外部组件定义默认值与当前运行态预设。
  useEffect(() => {
    setComponentPropsByComponent((prev) => {
      const next = { ...prev }
      let changed = false

      for (const [componentName, definition] of Object.entries(baseComponentDefinitions)) {
        if (!definition.defaultProps)
          continue

        const current = next[componentName]
        if (!current) {
          next[componentName] = { ...definition.defaultProps }
          changed = true
          continue
        }

        const merged = { ...definition.defaultProps, ...current }
        if (!shallowEqualRecord(merged, current)) {
          next[componentName] = merged
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [baseComponentDefinitions])

  // 从现有节点反向补齐预设，避免已有自定义属性丢失。
  useEffect(() => {
    setComponentPropsByComponent((prev) => {
      const next = { ...prev }
      let changed = false

      /**
       * 递归遍历节点树，把字段上的已存在属性回填到组件预设池。
       *
       * 这样即使数据来自外部 schema，后续同组件新增字段也能继承当前画布里
       * 已经出现过的属性，避免“预设丢失”的体验问题。
       *
       * @param items 当前遍历层级的节点列表。
       */
      const
        visit = (items: DesignerNode[]): void => {
          for (const item of items) {
            if (item.kind === 'field') {
              const currentPreset = next[item.component]
              if (!currentPreset) {
                next[item.component] = { ...item.componentProps }
                changed = true
                continue
              }

              let localChanged = false
              const mergedPreset = { ...currentPreset }
              for (const [propKey, propValue] of Object.entries(item.componentProps)) {
                if (!(propKey in mergedPreset)) {
                  mergedPreset[propKey] = propValue
                  localChanged = true
                }
              }

              if (localChanged) {
                next[item.component] = mergedPreset
                changed = true
              }
              continue
            }

            if (item.children.length > 0)
              visit(item.children)
            if (item.sections.length > 0) {
              for (const section of item.sections)
                visit(section.children)
            }
          }
        }

      visit(nodes)
      return changed ? next : prev
    })
  }, [nodes])

  // 节点删改后校正选中态，避免引用悬空。
  useEffect(() => {
    if (!selectedId) {
      setSelectedId(nodes[0]?.id ?? null)
      return
    }
    const stillExists = Boolean(findNodeById(nodes, selectedId) || findSectionById(nodes, selectedId))
    if (!stillExists)
      setSelectedId(nodes[0]?.id ?? null)
  }, [nodes, selectedId])

  // 父级更新 modelValue 时，同步外部 schema 到内部节点树。
  useEffect(() => {
    if (valueSignature === lastSeenValueSignature.current)
      return
    lastSeenValueSignature.current = valueSignature
    if (valueSignature === builtSignature)
      return
    const nextNodes = schemaToNodes(value)
    setNodes(nextNodes)
    setSelectedId(nextNodes[0]?.id ?? null)
  }, [builtSignature, value, valueSignature])

  // 内部 schema 变化且签名不一致时，向父级发出更新。
  useEffect(() => {
    if (valueSignature !== builtSignature)
      onChange?.(builtSchema)
  }, [builtSchema, builtSignature, onChange, valueSignature])

  // 让枚举文本草稿与当前选中的 Select 字段保持同步。
  useEffect(() => {
    if (!selectedField || selectedField.component !== 'Select') {
      setEnumDraft('')
      return
    }
    setEnumDraft(selectedField.enumOptions.map(option => `${option.label}:${option.value}`).join('\n'))
  }, [selectedField])

  /**
   * 挂载物料区与画布区的 Sortable 实例。
   * 这里是拖拽集成核心，包含：原生捕获选中桥接、物料克隆插入、
   * 节点移动/重排、异步渲染场景下的重试挂载。
   */
  useEffect(() => {
    const sortables: Sortable[] = []
    const retryTimers: ReturnType<typeof setTimeout>[] = []
    let cancelled = false
    let mountObserver: MutationObserver | null = null
    let remountAttempts = 0
    let pendingMount = false
    let canvasSelectionRoot: HTMLElement | null = null
    const canvasPutHandler = createDesignerCanvasPutHandler(keyToTarget)
    /**
     * 切换全局拖拽状态样式。
     *
     * @param dragging 是否处于拖拽中。
     */
    const
      toggleDragging = (dragging: boolean): void => {
        if (dragging)
          pointerTrackerRef.current.start()
        else
          pointerTrackerRef.current.stop()
        if (typeof document === 'undefined')
          return
        document.body.classList.toggle('cf-lc-body-dragging', dragging)
      }
    /**
     * 归一化事件目标为 HTMLElement，便于做 closest 查询。
     */
    const resolveEventElement = (target: EventTarget | null): HTMLElement | null => {
      if (target instanceof HTMLElement)
        return target
      if (target instanceof Node)
        return target.parentElement
      return null
    }
    /**
     * 原生捕获阶段监听：即使被 Sortable 或嵌套遮罩打断，
     * 也能稳定选中节点/分组。
     */
    const handleCanvasClick = (event: Event): void => {
      const element = resolveEventElement(event.target)
      if (!element)
        return
      if (element.closest('[data-cf-toolbar-interactive="true"]'))
        return
      const nodeId = element.closest('[data-node-id]')?.getAttribute('data-node-id')
      if (nodeId) {
        setSelectedId(nodeId)
        return
      }
      const sectionId = element.closest('[data-section-id]')?.getAttribute('data-section-id')
      if (sectionId)
        setSelectedId(sectionId)
    }
    /**
     * 移除画布捕获监听，防止重复绑定和内存泄漏。
     */
    const
      detachCanvasSelection = (): void => {
        if (!canvasSelectionRoot)
          return
        canvasSelectionRoot.removeEventListener('click', handleCanvasClick, true)
        canvasSelectionRoot = null
      }
    /**
     * 在新的画布根节点上安装捕获监听。
     *
     * @param root 当前画布根节点。
     */
    const
      attachCanvasSelection = (root: HTMLElement): void => {
        if (canvasSelectionRoot === root)
          return
        detachCanvasSelection()
        root.addEventListener('click', handleCanvasClick, true)
        canvasSelectionRoot = root
      }

    /**
     * 销毁当前所有已挂载的 Sortable 实例。
     */
    const destroySortables = (): void => {
      while (sortables.length > 0) {
        const sortable = sortables.pop()
        if (!sortable)
          continue
        const el = (sortable as Sortable & { el?: HTMLElement | null }).el
        if (!el)
          continue
        try {
          sortable.destroy()
        }
        catch {
          // Swallow destroy errors when the element is already detached.
        }
        delete (el as HTMLElement & { __cfSortable?: Sortable }).__cfSortable
        el.removeAttribute('data-cf-sortable-mounted')
      }
    }

    /**
     * 执行一次挂载并返回挂载数量统计。
     */
    const mountSortables = (): { materialMounted: number, canvasMounted: number } => {
      destroySortables()
      let materialMounted = 0
      let canvasMounted = 0

      const fallbackRoot = designerRootRef.current
        ?? (typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.cf-lc-root') : null)
      const materialSortableRoot = materialHostRef.current ?? fallbackRoot
      if (materialSortableRoot) {
        const materialLists = Array.from(materialSortableRoot.querySelectorAll<HTMLElement>('[data-cf-material-list="true"]'))
        for (const materialList of materialLists) {
          const materialSortable = Sortable.create(materialList, createDesignerMaterialSortableOptions({
            disabled: false,
            /** 物料拖拽开始，启用拖拽中样式。 */
            onStart: () => toggleDragging(true),
            /** 物料拖拽结束，恢复样式。 */
            onEnd: () => toggleDragging(false),
            /**
             * 写入物料拖拽 payload。
             *
             * @param dataTransfer 浏览器拖拽数据通道。
             * @param dragElement 被拖拽的物料元素。
             */
            setData: (dataTransfer, dragElement) => {
              dataTransfer.setData('text/plain', dragElement.getAttribute('data-material-id') ?? '')
            },
          }) as Sortable.Options)
          sortables.push(materialSortable)
          ;(materialList as HTMLElement & { __cfSortable?: Sortable }).__cfSortable = materialSortable
          materialList.dataset.cfSortableMounted = 'true'
          materialMounted += 1
        }
      }

      const canvasSortableRoot = canvasHostRef.current ?? fallbackRoot
      if (canvasSortableRoot) {
        attachCanvasSelection(canvasSortableRoot)
        const dropLists = Array.from(canvasSortableRoot.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
        for (const list of dropLists) {
          const canvasSortable = Sortable.create(list, createDesignerCanvasSortableOptions({
            disabled: false,
            targetKey: list.dataset.targetKey,
            put: canvasPutHandler,
            /** 画布拖拽开始，启用拖拽中样式。 */
            onStart: (event) => {
              toggleDragging(true)
              const origin = event?.originalEvent?.target
              const originEl = origin instanceof HTMLElement ? origin : null
              dragMetaRef.current.allowCrossTarget = Boolean(
                originEl?.closest('.cf-lc-node-tool--move'),
              )
            },
            /**
             * 写入画布节点拖拽 payload。
             *
             * @param dataTransfer 浏览器拖拽数据通道。
             * @param dragElement 被拖拽的节点元素。
             */
            setData: (dataTransfer, dragElement) => {
              dataTransfer.setData('text/plain', dragElement.getAttribute('data-node-id') ?? '')
            },
            /**
             * 处理“物料克隆进入画布”。
             *
             * @param event Sortable 事件对象。
             */
            onAdd: (event) => {
              // 处理“物料克隆进入画布”，生成真实 schema 节点。
              const item = event.item as HTMLElement
              const pointerSnapshot = pointerTrackerRef.current.getLastPoint() ?? (() => {
                const rect = item.getBoundingClientRect()
                if (!rect || rect.width <= 0 || rect.height <= 0)
                  return null
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
              })()
              const pointerTargetKey = resolveDesignerSortablePointerTargetKeyByPoint(pointerSnapshot)
                ?? resolveDesignerSortablePointerTargetKey(event)
              const toTargetKey = pointerTargetKey ?? (event.to as HTMLElement).dataset.targetKey
              const pointerIndex = resolveDesignerSortablePointerIndexByTargetKeyAndPoint(
                toTargetKey,
                pointerSnapshot,
                item,
              )
              const materialId = item.dataset.materialId
              if (!materialId) {
                const nodeId = item.dataset.nodeId
                if (!nodeId)
                  return
                const toTarget = keyToTarget(toTargetKey)
                if (!toTarget)
                  return
                const insertIndex = pointerIndex ?? resolveDesignerSortableInsertIndex(event, Number.MAX_SAFE_INTEGER)
                item.dataset.cfDragHandled = 'true'
                restoreDraggedDomPosition(event)
                setNodes(prev => moveNodeByIdToTarget(prev, nodeId, toTarget, insertIndex))
                setSelectedId(nodeId)
                return
              }

              item.remove()
              const target = keyToTarget(toTargetKey)
              const material = materialsById.get(materialId)
              if (!target || !material)
                return

              const insertIndex = pointerIndex ?? resolveDesignerSortableInsertIndex(event)
              const baseNode = defaultNodeFromMaterial(material, [])
              const nextNode = mergeFieldNodeWithComponentPreset(baseNode, componentPropsByComponentRef.current)
              setNodes((prev) => {
                const byTarget = insertNodeByTarget(prev, target, insertIndex, nextNode)
                return byTarget === prev
                  ? insertNodeByTarget(prev, rootTarget(), prev.length, nextNode)
                  : byTarget
              })
              setSelectedId(nextNode.id)
            },
            /**
             * 处理“现有节点在画布内移动/重排”。
             *
             * @param event Sortable 事件对象。
             */
            onEnd: (event) => {
              // 处理“已存在节点”的跨列表移动与同列表重排。
              toggleDragging(false)
              const item = event.item as HTMLElement
              const pointerSnapshot = pointerTrackerRef.current.getLastPoint() ?? (() => {
                const rect = item.getBoundingClientRect()
                if (!rect || rect.width <= 0 || rect.height <= 0)
                  return null
                return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
              })()
              const allowCrossTarget = dragMetaRef.current.allowCrossTarget
              dragMetaRef.current.allowCrossTarget = false
              if (item.dataset.materialId)
                return
              if (item.dataset.cfDragHandled) {
                delete item.dataset.cfDragHandled
                return
              }
              const fromTargetKey = (event.from as HTMLElement).dataset.targetKey
              const eventTargetKey = (event.to as HTMLElement).dataset.targetKey
              const pointerTargetKey = resolveDesignerSortablePointerTargetKeyByPoint(pointerSnapshot)
                ?? resolveDesignerSortablePointerTargetKey(event)
              const toTargetKey = pointerTargetKey ?? eventTargetKey
              const parentList = item.parentElement?.closest<HTMLElement>('[data-cf-drop-list="true"]')
              if (parentList && parentList !== event.to && parentList !== event.from)
                return
              // 嵌套 Sortable 会把结束事件冒泡到祖先列表。
              // 仅处理真实来源列表事件，避免重复/错误移动。
              if (item.dataset.parentTargetKey && fromTargetKey !== item.dataset.parentTargetKey)
                return

              const toTarget = keyToTarget(toTargetKey)
              const nodeId = item.dataset.nodeId
              if (!toTarget || !nodeId)
                return

              const reorderWithinTarget = (targetKey: string | undefined): void => {
                if (!targetKey)
                  return
                const target = keyToTarget(targetKey)
                if (!target)
                  return
                const { oldIndex } = resolveDesignerSortableMoveIndices(event)
                const pointerIndex = resolveDesignerSortablePointerIndexByTargetKey(
                  event,
                  targetKey,
                ) ?? resolveDesignerSortablePointerIndexByTargetKeyAndPoint(targetKey, pointerSnapshot, item)
                let newIndex = pointerIndex ?? (oldIndex >= 0 ? oldIndex : Number.MAX_SAFE_INTEGER)
                if (pointerIndex !== null && pointerIndex !== oldIndex)
                  newIndex = pointerIndex
                restoreDraggedDomPosition(event)
                setNodes(prev => moveNodeByIdToTarget(prev, nodeId, target, newIndex))
                setSelectedId(nodeId)
              }

              const actualList = item.parentElement?.closest<HTMLElement>('[data-cf-drop-list="true"]')
              const actualTargetKey = actualList?.dataset?.targetKey
              const preferPointerTarget = Boolean(pointerTargetKey) && pointerTargetKey !== actualTargetKey
              if (actualTargetKey && actualTargetKey !== fromTargetKey && !preferPointerTarget) {
                if (!allowCrossTarget) {
                  reorderWithinTarget(fromTargetKey)
                  return
                }
                const actualTarget = keyToTarget(actualTargetKey)
                if (!actualTarget)
                  return
                const actualIndex = Array.from(actualList.children)
                  .filter((child) => {
                    if (!(child instanceof HTMLElement))
                      return false
                    return child.hasAttribute('data-node-id') || child.hasAttribute('data-material-id')
                  })
                  .indexOf(item)
                restoreDraggedDomPosition(event)
                setNodes(prev => moveNodeByIdToTarget(
                  prev,
                  nodeId,
                  actualTarget,
                  actualIndex >= 0 ? actualIndex : Number.MAX_SAFE_INTEGER,
                ))
                setSelectedId(nodeId)
                return
              }

              if (event.from !== event.to) {
                if (fromTargetKey !== toTargetKey && !allowCrossTarget) {
                  reorderWithinTarget(fromTargetKey)
                  return
                }
                const crossTarget = keyToTarget(toTargetKey)
                if (!crossTarget)
                  return
                const pointerIndex = resolveDesignerSortablePointerIndexByTargetKeyAndPoint(
                  toTargetKey,
                  pointerSnapshot,
                  item,
                )
                const insertIndex = pointerIndex ?? resolveDesignerSortableInsertIndex(event, Number.MAX_SAFE_INTEGER)
                restoreDraggedDomPosition(event)
                setNodes(prev => moveNodeByIdToTarget(prev, nodeId, crossTarget, insertIndex))
                setSelectedId(nodeId)
                return
              }

              const { oldIndex } = resolveDesignerSortableMoveIndices(event)
              const pointerIndex = resolveDesignerSortablePointerIndexByTargetKeyAndPoint(
                toTargetKey,
                pointerSnapshot,
                item,
              )
              let newIndex = resolveDesignerSortableInsertIndex(event, Number.MAX_SAFE_INTEGER)
              if (pointerIndex !== null && pointerIndex !== oldIndex)
                newIndex = pointerIndex
              restoreDraggedDomPosition(event)
              setNodes(prev => moveNodeByIdToTarget(prev, nodeId, toTarget, newIndex))
              setSelectedId(nodeId)
            },
          }) as Sortable.Options)
          sortables.push(canvasSortable)
          ;(list as HTMLElement & { __cfSortable?: Sortable }).__cfSortable = canvasSortable
          list.dataset.cfSortableMounted = 'true'
          canvasMounted += 1
        }
      }

      return { materialMounted, canvasMounted }
    }

    /**
     * DOM 尚未稳定时的重试挂载策略。
     */
    const scheduleMount = (delay = 80): void => {
      if (cancelled || pendingMount)
        return
      pendingMount = true
      retryTimers.push(setTimeout(() => {
        pendingMount = false
        if (cancelled)
          return
        const mounted = mountSortables()
        if (hasMountedDesignerSortables(mounted) || remountAttempts >= 12)
          return
        remountAttempts += 1
        scheduleMount(120)
      }, delay))
    }

    const detectMissingSortables = (): boolean => {
      const fallbackRoot = designerRootRef.current
        ?? (typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.cf-lc-root') : null)
      const materialRoot = materialHostRef.current ?? fallbackRoot
      const canvasRoot = canvasHostRef.current ?? fallbackRoot
      const materialLists = materialRoot
        ? Array.from(materialRoot.querySelectorAll<HTMLElement>('[data-cf-material-list="true"]'))
        : []
      const dropLists = canvasRoot
        ? Array.from(canvasRoot.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
        : []
      if (materialLists.length === 0 || dropLists.length === 0)
        return true
      const lists = [...materialLists, ...dropLists]
      return lists.some(list => !list.dataset.cfSortableMounted || !(list as HTMLElement & { __cfSortable?: Sortable }).__cfSortable)
    }

    const initialMounted = mountSortables()
    if (!hasMountedDesignerSortables(initialMounted)) {
      remountAttempts = 0
      scheduleMount(80)
    }

    if (typeof MutationObserver !== 'undefined') {
      const observeRoot = designerRootRef.current
        ?? (typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.cf-lc-root') : null)
        ?? (typeof document !== 'undefined' ? document.body : null)
      if (observeRoot) {
        mountObserver = new MutationObserver(() => {
          if (cancelled)
            return
          if (detectMissingSortables()) {
            remountAttempts = 0
            scheduleMount(30)
          }
        })
        mountObserver.observe(observeRoot, { childList: true, subtree: true })
      }
    }

    return () => {
      cancelled = true
      if (mountObserver) {
        mountObserver.disconnect()
        mountObserver = null
      }
      retryTimers.forEach(timer => clearTimeout(timer))
      toggleDragging(false)
      detachCanvasSelection()
      destroySortables()
      pointerTrackerRef.current.stop()
    }
  }, [builtSignature, dropTargetSignature, materialsById])

  /**
   * 字段节点更新助手（仅作用于 field）。
   */
  function updateField(nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode): void {
    setNodes(prev => updateNodeById(prev, nodeId, (node) => {
      if (node.kind !== 'field')
        return node
      return updater(node)
    }))
  }

  /**
   * 更新某个组件类型的预设属性，并同步到所有同组件字段节点。
   */
  function updateComponentPropByComponentName(
    componentName: string,
    propKey: string,
    value: unknown,
  ): void {
    setComponentPropsByComponent((prev) => {
      const currentPreset = prev[componentName] ?? {}
      if (value === undefined && !(propKey in currentPreset))
        return prev
      if (value !== undefined && currentPreset[propKey] === value)
        return prev

      const nextPreset = { ...currentPreset }
      if (value === undefined)
        delete nextPreset[propKey]
      else
        nextPreset[propKey] = value

      const next = { ...prev }
      if (Object.keys(nextPreset).length === 0)
        delete next[componentName]
      else
        next[componentName] = nextPreset
      return next
    })

    setNodes(prev => updateFieldNodesRecursively(prev, (field) => {
      if (field.component !== componentName)
        return field

      const nextComponentProps = { ...field.componentProps }
      if (value === undefined)
        delete nextComponentProps[propKey]
      else
        nextComponentProps[propKey] = value

      if (shallowEqualRecord(nextComponentProps, field.componentProps))
        return field

      return {
        ...field,
        componentProps: nextComponentProps,
      }
    }))
  }

  /**
   * 容器节点更新助手（仅作用于 container）。
   */
  function updateContainer(nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode): void {
    setNodes(prev => updateNodeById(prev, nodeId, (node) => {
      if (node.kind !== 'container')
        return node
      return updater(node)
    }))
  }

  /**
   * 复制指定节点。
   */
  function handleDuplicateNode(nodeId: string): void {
    setNodes(prev => duplicateNodeById(prev, nodeId))
  }

  /**
   * 删除节点；若当前选中项正好是该节点则清空选中态。
   */
  function handleRemoveNode(nodeId: string): void {
    setNodes(prev => removeNodeById(prev, nodeId))
    setSelectedId(prev => (prev === nodeId ? null : prev))
  }

  /**
   * 为分组型容器（Tabs/Collapse）新增分组。
   */
  function handleAddSection(containerId: string): void {
    setNodes(prev => addSectionToContainer(prev, containerId))
  }

  /**
   * 删除分组型容器中的某个分组。
   */
  function handleRemoveSection(containerId: string, sectionId: string): void {
    setNodes(prev => removeSectionFromContainer(prev, containerId, sectionId))
  }

  const DesignerRoot = useCallback(({ children }: { children?: React.ReactNode }) => (
    <div ref={designerRootRef} className="cf-lc-root">
      <style>{DESIGNER_CSS}</style>
      {children}
    </div>
  ), [])

  const DesignerMainGrid = useCallback(() => (
    <div className="cf-lc-main-grid">
      <SchemaField key={mainGridRenderKey} schema={mainGridSchema} />
    </div>
  ), [mainGridRenderKey, mainGridSchema])

  const designerSchema = useMemo<ISchema>(() => ({
    type: 'object',
    properties: {
      root: {
        type: 'void',
        component: 'DesignerRoot',
        properties: {
          header: {
            type: 'void',
            component: 'DesignerHeader',
          },
          main: {
            type: 'void',
            component: 'DesignerMainGrid',
            properties: {
              materials: {
                type: 'void',
                component: 'DesignerMaterialPane',
                componentProps: {
                  componentMaterials: designerMaterials.componentMaterials,
                  layoutMaterials: designerMaterials.layoutMaterials,
                  materialHostRef,
                  renderMaterialPreview: resolvedRenderers.renderMaterialPreview,
                },
              },
              canvas: {
                type: 'void',
                component: 'DesignerCanvasPane',
                componentProps: {
                  nodes,
                  minCanvasHeight,
                  selectedId,
                  canvasHostRef,
                  onSelect: setSelectedId,
                  onDuplicateNode: handleDuplicateNode,
                  onRemoveNode: handleRemoveNode,
                  onAddSection: handleAddSection,
                  onRemoveSection: handleRemoveSection,
                  renderFieldPreviewControl: resolvedRenderers.renderFieldPreviewControl,
                },
              },
              properties: {
                type: 'void',
                component: 'DesignerPropertiesPane',
                componentProps: {
                  nodes,
                  selectedField,
                  selectedContainer,
                  selectedSection,
                  enumDraft,
                  setEnumDraft,
                  onUpdateNodes: setNodes,
                  updateField,
                  updateContainer,
                  fieldComponentOptions: designerMaterials.fieldComponentOptions,
                  componentDefinitions: mergedComponentDefinitions,
                  componentPropsByComponent,
                  onUpdateComponentPropByComponentName: updateComponentPropByComponentName,
                },
              },
            },
          },
        },
      },
    },
  }), [
    componentPropsByComponent,
    handleAddSection,
    handleDuplicateNode,
    handleRemoveNode,
    handleRemoveSection,
    designerMaterials.componentMaterials,
    designerMaterials.fieldComponentOptions,
    designerMaterials.layoutMaterials,
    enumDraft,
    mergedComponentDefinitions,
    minCanvasHeight,
    nodes,
    resolvedRenderers.renderFieldPreviewControl,
    resolvedRenderers.renderMaterialPreview,
    selectedContainer,
    selectedField,
    selectedId,
    selectedSection,
    setEnumDraft,
    setNodes,
    updateComponentPropByComponentName,
    updateContainer,
    updateField,
  ])

  const designerComponents = useMemo(() => ({
    DesignerRoot,
    DesignerHeader,
    DesignerMainGrid,
    DesignerMaterialPane,
    DesignerCanvasPane,
    DesignerPropertiesPane,
  }), [
    DesignerRoot,
    DesignerMainGrid,
  ])

  return (
    <FormProvider form={designerForm} components={designerComponents}>
      <SchemaField schema={designerSchema} />
    </FormProvider>
  )
}
