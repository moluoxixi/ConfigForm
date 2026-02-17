/// <reference path="./jsoneditor.d.ts" />
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
  defaultNodeFromMaterial,
  duplicateNodeById,
  findNodeById,
  findSectionById,
  insertNodeByTarget,
  keyToTarget,
  moveNodeByTarget,
  nodesToSchema,
  removeNodeById,
  removeSectionFromContainer,
  schemaSignature,
  schemaToNodes,
  updateNodeById,
} from '@moluoxixi/plugin-lower-code-core'
import { ComponentRegistryContext } from '@moluoxixi/react'
import JSONEditor from 'jsoneditor'
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import Sortable from 'sortablejs'
import 'jsoneditor/dist/jsoneditor.css'
import { CanvasPanel } from './designer/canvas/CanvasPanel'
import { DesignerHeader } from './designer/Header'
import { resolveDesignerMaterials } from './designer/materials/registry-materials'
import { MaterialPanel } from './designer/materials/MaterialPanel'
import { PreviewPanel } from './designer/panels/PreviewPanel'
import { PropertiesPanel } from './designer/panels/PropertiesPanel'
import { createMockRenderers } from './designer/renderers/mock'
import {
  canUseRegistryRenderers,
  createRegistryRenderers,
} from './designer/renderers/registry'
import { mergeRenderers } from './designer/renderers/resolve'
import { SchemaPanel } from './designer/panels/SchemaPanel'
import { DESIGNER_CSS } from './designer/styles'
import {
  collectDropTargetKeys,
  collectPreviewFields,
  restoreDraggedDomPosition,
} from './designer/utils'

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

export function LowCodeDesigner({
  value,
  onChange,
  minCanvasHeight = 420,
  previewRenderMode = 'auto',
  renderers: customRenderers,
  componentDefinitions,
}: LowCodeDesignerProps): React.ReactElement {
  const componentRegistry = useContext(ComponentRegistryContext)
  const [nodes, setNodes] = useState<DesignerNode[]>(() => schemaToNodes(value))
  const [selectedId, setSelectedId] = useState<string | null>(nodes[0]?.id ?? null)
  const [enumDraft, setEnumDraft] = useState('')
  const [componentPropsByComponent, setComponentPropsByComponent] = useState<Record<string, Record<string, unknown>>>(
    () => createComponentPropsByComponent(componentDefinitions),
  )

  const materialHostRef = useRef<HTMLDivElement>(null)
  const canvasHostRef = useRef<HTMLDivElement>(null)
  const editorHostRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<JSONEditor | null>(null)
  const componentPropsByComponentRef = useRef(componentPropsByComponent)

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

  const previewFields = useMemo(() => collectPreviewFields(nodes), [nodes])
  const mergedComponentDefinitions = useMemo(
    () => {
      const definitions: Record<string, LowCodeDesignerComponentDefinition> = { ...(componentDefinitions ?? {}) }
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
    [componentDefinitions, componentPropsByComponent],
  )
  const designerMaterials = useMemo(
    () => resolveDesignerMaterials(componentRegistry, mergedComponentDefinitions),
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

  useEffect(() => {
    componentPropsByComponentRef.current = componentPropsByComponent
  }, [componentPropsByComponent])

  useEffect(() => {
    setComponentPropsByComponent((prev) => {
      const next = { ...prev }
      let changed = false

      for (const [componentName, definition] of Object.entries(componentDefinitions ?? {})) {
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
  }, [componentDefinitions])

  useEffect(() => {
    setComponentPropsByComponent((prev) => {
      const next = { ...prev }
      let changed = false

      const visit = (items: DesignerNode[]): void => {
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

  useEffect(() => {
    if (!selectedId) {
      setSelectedId(nodes[0]?.id ?? null)
      return
    }
    const stillExists = Boolean(findNodeById(nodes, selectedId) || findSectionById(nodes, selectedId))
    if (!stillExists)
      setSelectedId(nodes[0]?.id ?? null)
  }, [nodes, selectedId])

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

  useEffect(() => {
    if (valueSignature !== builtSignature)
      onChange?.(builtSchema)
  }, [builtSchema, builtSignature, onChange, valueSignature])

  useEffect(() => {
    if (!selectedField || selectedField.component !== 'Select') {
      setEnumDraft('')
      return
    }
    setEnumDraft(selectedField.enumOptions.map(option => `${option.label}:${option.value}`).join('\n'))
  }, [selectedField])

  useEffect(() => {
    if (!editorHostRef.current || editorRef.current)
      return

    editorRef.current = new JSONEditor(editorHostRef.current, {
      mode: 'view',
      modes: ['view', 'tree', 'code'],
      mainMenuBar: true,
      navigationBar: true,
      statusBar: true,
      search: true,
      onEditable: () => false,
    })

    return () => {
      editorRef.current?.destroy()
      editorRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!editorRef.current)
      return
    try {
      editorRef.current.set(builtSchema)
    }
    catch {
      editorRef.current.set({})
    }
  }, [builtSchema])

  useEffect(() => {
    const sortables: Sortable[] = []
    const toggleDragging = (dragging: boolean): void => {
      if (typeof document === 'undefined')
        return
      document.body.classList.toggle('cf-lc-body-dragging', dragging)
    }

    if (materialHostRef.current) {
      const materialLists = Array.from(materialHostRef.current.querySelectorAll<HTMLElement>('[data-cf-material-list="true"]'))
      for (const materialList of materialLists) {
        sortables.push(Sortable.create(materialList, {
          group: { name: 'configform-lower-code-tree', pull: 'clone', put: false },
          sort: false,
          animation: 90,
          direction: 'vertical',
          forceFallback: true,
          fallbackOnBody: true,
          fallbackTolerance: 0,
          delayOnTouchOnly: true,
          touchStartThreshold: 4,
          removeCloneOnHide: true,
          draggable: '[data-material-id]',
          ghostClass: 'cf-lc-ghost',
          chosenClass: 'cf-lc-chosen',
          dragClass: 'cf-lc-dragging',
          fallbackClass: 'cf-lc-sortable-fallback',
          onStart: () => toggleDragging(true),
          onEnd: () => toggleDragging(false),
          setData: (dataTransfer, dragEl) => {
            dataTransfer.setData('text/plain', dragEl.getAttribute('data-material-id') ?? '')
          },
        }))
      }
    }

    if (canvasHostRef.current) {
      const dropLists = Array.from(canvasHostRef.current.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
      for (const list of dropLists) {
        const targetKey = list.dataset.targetKey
        const escapedTargetKey = (targetKey ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        const draggableSelector = targetKey
          ? `[data-parent-target-key="${escapedTargetKey}"], [data-material-id]`
          : '.cf-lc-node, [data-material-id]'
        sortables.push(Sortable.create(list, {
          group: {
            name: 'configform-lower-code-tree',
            pull: true,
            put: (to, from, dragEl) => {
              const dragNode = dragEl as HTMLElement
              if (dragNode.dataset.materialId)
                return true

              const toTarget = keyToTarget((to.el as HTMLElement).dataset.targetKey)
              const fromTarget = keyToTarget((from.el as HTMLElement).dataset.targetKey)
              if (!toTarget || !fromTarget)
                return true
              if (toTarget.type === 'root')
                return true

              // 防止根级容器在重排时被误拖进其它容器内部。
              if (fromTarget.type === 'root' && !dragNode.classList.contains('cf-lc-node--field'))
                return false
              return true
            },
          },
          animation: 100,
          direction: 'vertical',
          delayOnTouchOnly: true,
          touchStartThreshold: 4,
          removeCloneOnHide: true,
          swapThreshold: 0.35,
          invertSwap: true,
          dragoverBubble: false,
          emptyInsertThreshold: 24,
          scroll: true,
          bubbleScroll: true,
          scrollSensitivity: 80,
          scrollSpeed: 14,
          draggable: draggableSelector,
          handle: '[data-cf-drag-handle="true"]',
          filter: 'button, input, textarea, select, [contenteditable=\"true\"]',
          preventOnFilter: false,
          ghostClass: 'cf-lc-ghost',
          chosenClass: 'cf-lc-chosen',
          dragClass: 'cf-lc-dragging',
          fallbackClass: 'cf-lc-sortable-fallback',
          onStart: () => toggleDragging(true),
          setData: (dataTransfer, dragEl) => {
            dataTransfer.setData('text/plain', dragEl.getAttribute('data-node-id') ?? '')
          },
          onAdd: (event) => {
            const item = event.item as HTMLElement
            const materialId = item.dataset.materialId
            if (!materialId)
              return

            item.remove()
            const targetKey = (event.to as HTMLElement).dataset.targetKey
            const target = keyToTarget(targetKey)
            const material = materialsById.get(materialId)
            if (!target || !material)
              return

            const insertIndex = Math.max(0, Math.min(event.newIndex ?? 0, Number.MAX_SAFE_INTEGER))
            const baseNode = defaultNodeFromMaterial(material, [])
            const nextNode = mergeFieldNodeWithComponentPreset(baseNode, componentPropsByComponentRef.current)
            setNodes(prev => insertNodeByTarget(prev, target, insertIndex, nextNode))
          },
          onEnd: (event) => {
            toggleDragging(false)
            const item = event.item as HTMLElement
            if (item.dataset.materialId)
              return

            const fromTarget = keyToTarget((event.from as HTMLElement).dataset.targetKey)
            const toTarget = keyToTarget((event.to as HTMLElement).dataset.targetKey)
            const oldIndex = event.oldIndex ?? -1
            const newIndex = event.newIndex ?? -1
            if (!fromTarget || !toTarget || oldIndex < 0 || newIndex < 0)
              return

            restoreDraggedDomPosition(event)
            setNodes(prev => moveNodeByTarget(prev, fromTarget, toTarget, oldIndex, newIndex))
            const nodeId = item.dataset.nodeId
            if (nodeId)
              setSelectedId(nodeId)
          },
        }))
      }
    }

    return () => {
      toggleDragging(false)
      sortables.forEach(sortable => sortable.destroy())
    }
  }, [dropTargetSignature, materialsById])

  function updateField(nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode): void {
    setNodes(prev => updateNodeById(prev, nodeId, (node) => {
      if (node.kind !== 'field')
        return node
      return updater(node)
    }))
  }

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

  function updateContainer(nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode): void {
    setNodes(prev => updateNodeById(prev, nodeId, (node) => {
      if (node.kind !== 'container')
        return node
      return updater(node)
    }))
  }

  function handleDuplicateNode(nodeId: string): void {
    setNodes(prev => duplicateNodeById(prev, nodeId))
  }

  function handleRemoveNode(nodeId: string): void {
    setNodes(prev => removeNodeById(prev, nodeId))
    setSelectedId(prev => (prev === nodeId ? null : prev))
  }

  function handleAddSection(containerId: string): void {
    setNodes(prev => addSectionToContainer(prev, containerId))
  }

  function handleRemoveSection(containerId: string, sectionId: string): void {
    setNodes(prev => removeSectionFromContainer(prev, containerId, sectionId))
  }

  return (
    <div className="cf-lc-root">
      <style>{DESIGNER_CSS}</style>
      <DesignerHeader />

      <div className="cf-lc-main-grid">
        <MaterialPanel
          componentMaterials={designerMaterials.componentMaterials}
          layoutMaterials={designerMaterials.layoutMaterials}
          materialHostRef={materialHostRef}
          renderMaterialPreview={resolvedRenderers.renderMaterialPreview}
        />

        <CanvasPanel
          nodes={nodes}
          minCanvasHeight={minCanvasHeight}
          selectedId={selectedId}
          canvasHostRef={canvasHostRef}
          onSelect={setSelectedId}
          onDuplicateNode={handleDuplicateNode}
          onRemoveNode={handleRemoveNode}
          onAddSection={handleAddSection}
          onRemoveSection={handleRemoveSection}
          renderFieldPreviewControl={resolvedRenderers.renderFieldPreviewControl}
        />

        <PropertiesPanel
          nodes={nodes}
          selectedField={selectedField}
          selectedContainer={selectedContainer}
          selectedSection={selectedSection}
          enumDraft={enumDraft}
          setEnumDraft={setEnumDraft}
          onUpdateNodes={setNodes}
          updateField={updateField}
          updateContainer={updateContainer}
          fieldComponentOptions={designerMaterials.fieldComponentOptions}
          componentDefinitions={mergedComponentDefinitions}
          componentPropsByComponent={componentPropsByComponent}
          onUpdateComponentPropByComponentName={updateComponentPropByComponentName}
        />
      </div>

      <div className="cf-lc-bottom-grid">
        <SchemaPanel editorHostRef={editorHostRef} />
        <PreviewPanel
          fields={previewFields}
          renderFieldPreviewControl={resolvedRenderers.renderFieldPreviewControl}
        />
      </div>
    </div>
  )
}
