/// <reference path="./jsoneditor.d.ts" />
import type {
  DesignerContainerNode,
  DesignerFieldNode,
  DesignerNode,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { Component, PropType, VNodeChild } from 'vue'
import type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerRenderers,
} from './designer/types'
import { cloneDeep } from '@moluoxixi/core'
import {
  addSectionToContainer,
  collectDropTargetKeys,
  collectPreviewFields,
  defaultNodeFromMaterial,
  duplicateNodeById,
  findNodeById,
  findSectionById,
  insertNodeByTarget,
  keyToTarget,
  moveNodeByTarget,
  nodesToSchema,
  previewValueByNode,
  resolveDesignerMaterials,
  restoreDraggedDomPosition,
  rootTarget,
  removeNodeById,
  removeSectionFromContainer,
  schemaSignature,
  schemaToNodes,
  updateNodeById,
} from '@moluoxixi/plugin-lower-code-core'
import { ComponentRegistrySymbol } from '@moluoxixi/vue'
import JSONEditor from 'jsoneditor'
import Sortable from 'sortablejs'
import { computed, defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import 'jsoneditor/dist/jsoneditor.css'
import { DesignerCanvasPane } from './designer/center/DesignerCanvasPane'
import { DesignerMaterialPane } from './designer/left/DesignerMaterialPane'
import { DesignerPropertiesPane } from './designer/right/DesignerPropertiesPane'
import { mergeDesignerComponentDefinitions } from './designer/right/component-definitions'

export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerRenderContext,
  LowCodeDesignerRenderers,
} from './designer/types'

export interface LowCodeDesignerProps {
  modelValue?: unknown
  disabled?: boolean
  preview?: boolean
  minCanvasHeight?: number
  renderers?: LowCodeDesignerRenderers
  componentDefinitions?: Record<string, LowCodeDesignerComponentDefinition>
}

const DESIGNER_CSS = `
.cf-lc-mask-layer {
  position: relative;
  width: 100%;
  min-height: inherit;
  border-radius: inherit;
  overflow: visible;
}

.cf-lc-mask-layer-content {
  width: 100%;
  min-height: inherit;
  margin: 0;
  padding: 0;
  gap: 0;
  box-sizing: border-box;
}

.cf-lc-mask-layer--locked .cf-lc-mask-layer-content,
.cf-lc-mask-layer--locked .cf-lc-mask-layer-content * {
  pointer-events: none !important;
}

.cf-lc-mask-layer--material > .cf-lc-mask-layer-content {
  width: 100%;
  min-height: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-mask-layer-overlay {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: transparent;
  pointer-events: none;
}

.cf-lc-mask-layer-actions {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(42%, -58%);
  z-index: 30;
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
}

.cf-lc-material-list-hidden {
  display: none !important;
}

.cf-lc-pane-configform-shell,
.cf-lc-pane-configform-shell > form,
.cf-lc-pane-configform-shell > form > div {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.cf-lc-pane-configform-shell > form {
  margin: 0;
}

.cf-lc-material-pane .ant-tabs,
.cf-lc-material-pane .el-tabs {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.cf-lc-material-pane .ant-tabs-content-holder,
.cf-lc-material-pane .ant-tabs-content,
.cf-lc-material-pane .ant-tabs-tabpane,
.cf-lc-material-pane .el-tabs__content,
.cf-lc-material-pane .el-tab-pane {
  min-height: 0;
  height: 100%;
}

.cf-lc-material-pane .ant-tabs-tabpane,
.cf-lc-material-pane .el-tab-pane {
  min-height: 0;
}

.cf-lc-material-pane .ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden),
.cf-lc-material-pane .el-tab-pane.is-active {
  display: flex;
  flex-direction: column;
}

.cf-lc-ghost {
  opacity: 0.25;
  border: 1px dashed #1677ff !important;
}

.cf-lc-chosen {
  box-shadow: 0 0 0 2px #dbeafe;
}

.cf-lc-dragging {
  opacity: 0.95;
}

.cf-lc-sortable-fallback {
  pointer-events: none;
  opacity: 0.96;
  margin: 0 !important;
  border-color: #60a5fa !important;
  box-shadow: 0 10px 24px rgba(37, 99, 235, 0.2);
}

.cf-lc-body-dragging,
.cf-lc-body-dragging * {
  cursor: grabbing !important;
  user-select: none !important;
}

.cf-lc-drop-list.sortable-over {
  border-color: #60a5fa !important;
  box-shadow: 0 0 0 2px #dbeafe inset;
}

.cf-lc-real-preview-wrap {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
  pointer-events: none;
  box-sizing: border-box;
}

.cf-lc-real-preview-wrap > form {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin: 0;
  box-sizing: border-box;
}

.cf-lc-real-preview-wrap--material {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  max-height: 120px;
  overflow: hidden;
}

.cf-lc-node-toolbar {
  position: static;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.14);
  opacity: 0;
  transform: translateY(-2px) scale(0.98);
  pointer-events: none;
  transition: opacity .12s ease, transform .12s ease, border-color .12s ease;
}

.cf-lc-node--selected .cf-lc-node-toolbar {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
  border-color: #93c5fd;
}

.cf-lc-node-tool {
  width: 22px;
  height: 22px;
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.98);
  color: #64748b;
  font-size: 12px;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  transition: border-color .14s ease, color .14s ease, background-color .14s ease;
}

.cf-lc-node-tool--move {
  cursor: grab;
}

.cf-lc-node-tool--move:active {
  cursor: grabbing;
}

.cf-lc-node-tool:hover {
  border-color: #93c5fd;
  color: #1d4ed8;
}

.cf-lc-node-tool--primary {
  border-color: #bfdbfe;
  background: #eff6ff;
  color: #2563eb;
}

.cf-lc-node-tool--danger {
  border-color: #fecaca;
  background: #fff5f5;
  color: #dc2626;
}

.cf-lc-canvas-wrap {
  padding: 12px;
  height: 100%;
  min-height: 0;
  overflow: auto;
  box-sizing: border-box;
}

.cf-lc-drop-list {
  border: 1px dashed #d4dee9;
  border-radius: 12px;
  background:
    linear-gradient(180deg, #fcfdff 0%, #f7fafe 100%),
    repeating-linear-gradient(45deg, rgba(148, 163, 184, 0.06) 0, rgba(148, 163, 184, 0.06) 4px, transparent 4px, transparent 10px);
  display: grid;
  gap: 8px;
}

.cf-lc-drop-list--nested {
  border-style: dashed;
  border-color: #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
}

.cf-lc-empty {
  color: #94a3b8;
  font-size: 12px;
}

.cf-lc-node {
  position: relative;
  z-index: 0;
  width: 100%;
  box-sizing: border-box;
  border-radius: 10px;
  border: 1px solid transparent;
  background: #ffffff;
  padding: 0;
  overflow: visible;
  user-select: none;
  touch-action: none;
  transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease, transform .16s ease;
}

.cf-lc-node::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) top / 7px 1px repeat-x,
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) bottom / 7px 1px repeat-x,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) left / 1px 7px repeat-y,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) right / 1px 7px repeat-y;
  pointer-events: none;
  opacity: 0;
  transition: opacity .12s ease;
}

.cf-lc-node--field {
  display: block;
}

.cf-lc-node--selected {
  border-color: #bfdbfe;
  box-shadow: 0 0 0 1px #dbeafe;
  background: #f8fbff;
  z-index: 8;
}

.cf-lc-node--selected.cf-lc-node--container > .cf-lc-mask-layer > .cf-lc-mask-layer-content,
.cf-lc-node--selected.cf-lc-node--field > .cf-lc-node-preview > .cf-lc-material-preview > .cf-lc-mask-layer > .cf-lc-mask-layer-content {
  padding: 2px;
}

.cf-lc-node--selected::after {
  opacity: 1;
}

.cf-lc-container-body {
  padding-top: 0;
  display: grid;
  gap: 8px;
  background: transparent;
}

.cf-lc-node-preview {
  margin-top: 0;
  padding-top: 0;
}

.cf-lc-node-preview .cf-lc-material-preview {
  min-height: auto;
  border: 0;
  background: transparent;
  box-shadow: none;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-node-preview--container .cf-lc-material-preview {
  border: 0;
}

.cf-lc-node--field .cf-lc-mask-layer-content {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cf-lc-layout-card-shell {
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
}

.cf-lc-layout-card-head {
  padding: 10px 12px;
  border-bottom: 1px solid #e6edf7;
  background: linear-gradient(180deg, #fbfdff 0%, #f5f9ff 100%);
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.cf-lc-layout-card-shell > .cf-lc-drop-list {
  border: 0;
  border-radius: 0 0 12px 12px;
  background: #ffffff;
}

.cf-lc-layout-tabs-shell {
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #ffffff;
  overflow: hidden;
}

.cf-lc-layout-tabs-nav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e6edf7;
  background: #f8fbff;
  padding: 4px 8px 0;
}

.cf-lc-layout-tabs-tab {
  border: 1px solid transparent;
  border-bottom: 0;
  border-radius: 8px 8px 0 0;
  background: transparent;
  color: #64748b;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  cursor: pointer;
}

.cf-lc-layout-tabs-tab.is-active {
  color: #1d4ed8;
  border-color: #bfdbfe;
  background: #ffffff;
}

.cf-lc-layout-tabs-panels {
  display: grid;
  gap: 8px;
  padding: 8px;
}

.cf-lc-layout-collapse-shell {
  display: grid;
  gap: 8px;
}

.cf-lc-section {
  position: relative;
  z-index: 0;
  border: 1px solid transparent;
  border-radius: 9px;
  background: #ffffff;
  padding: 8px;
  overflow: visible;
}

.cf-lc-section::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background:
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) top / 7px 1px repeat-x,
    linear-gradient(90deg, #60a5fa 0 4px, transparent 4px 7px) bottom / 7px 1px repeat-x,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) left / 1px 7px repeat-y,
    linear-gradient(0deg, #60a5fa 0 4px, transparent 4px 7px) right / 1px 7px repeat-y;
  pointer-events: none;
  opacity: 0;
  transition: opacity .12s ease;
}

.cf-lc-section--tabs {
  border-style: dashed;
  background: #fbfdff;
}

.cf-lc-section--collapse {
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.cf-lc-section--selected {
  border-color: #bfdbfe;
  box-shadow: 0 0 0 1px #dbeafe;
  background: rgba(239, 246, 255, 0.56);
  z-index: 6;
}

.cf-lc-section--selected::after {
  opacity: 1;
}

.cf-lc-section-head {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
  padding-right: 28px;
  margin-bottom: 8px;
}

.cf-lc-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.cf-lc-section-title.is-selected {
  color: #1d4ed8;
}

.cf-lc-section-action {
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(46%, -54%);
  border: 1px solid #d5e2f3;
  border-radius: 999px;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.98);
  color: #64748b;
  font-size: 12px;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity .12s ease, border-color .12s ease, color .12s ease;
}

.cf-lc-section--selected .cf-lc-section-action {
  opacity: 1;
  pointer-events: auto;
}

.cf-lc-section-action:hover {
  border-color: #fecaca;
  color: #dc2626;
}
`

const VUE_INTERNAL_COMPONENT_NAMES = new Set([
  'LowCodeDesigner',
  'LowerCodeDesigner',
  'DesignerMaterialPane',
  'DesignerCanvasPane',
  'DesignerPropertiesPane',
])

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

function mapToRecord<T>(map: Map<string, T> | undefined): Record<string, T> {
  const record: Record<string, T> = {}
  if (!map)
    return record
  for (const [key, value] of map.entries())
    record[key] = value
  return record
}

function parseMaterialPayload(raw: string | undefined): MaterialItem | null {
  if (!raw)
    return null
  try {
    const payload = JSON.parse(raw) as Partial<MaterialItem>
    if (!payload || typeof payload !== 'object')
      return null
    if (payload.kind !== 'field' && payload.kind !== 'container')
      return null
    if (typeof payload.id !== 'string' || typeof payload.component !== 'string')
      return null
    return payload as MaterialItem
  }
  catch {
    return null
  }
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

function renderFallbackFieldPreview(node: DesignerFieldNode): VNodeChild {
  const inputStyle = {
    width: '100%',
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    padding: '6px 8px',
    fontSize: '12px',
    background: '#fff',
    boxSizing: 'border-box',
  } as const

  if (node.component === 'Textarea')
    return h('textarea', { rows: 3, disabled: true, placeholder: `请输入${node.title}`, style: { ...inputStyle, resize: 'vertical', minHeight: '72px' } })
  if (node.component === 'Select')
    return h('select', { disabled: true, style: inputStyle }, node.enumOptions.map(option => h('option', { key: option.value, value: option.value }, option.label)))
  if (node.component === 'InputNumber')
    return h('input', { type: 'number', disabled: true, readonly: true, value: String(previewValueByNode(node)), style: inputStyle })
  if (node.component === 'Switch')
    return h('label', { style: { display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#555' } }, [h('input', { type: 'checkbox', disabled: true, checked: Boolean(previewValueByNode(node)) }), '开关'])
  if (node.component === 'DatePicker')
    return h('input', { type: 'date', disabled: true, readonly: true, value: String(previewValueByNode(node)), style: inputStyle })
  return h('input', { type: 'text', disabled: true, readonly: true, value: String(previewValueByNode(node)), placeholder: `请输入${node.title}`, style: inputStyle })
}

function renderFallbackContainerPreview(node: DesignerNode): VNodeChild {
  if (node.kind !== 'container')
    return null
  return h('div', {
    style: {
      border: '1px dashed #dbe4f0',
      borderRadius: '8px',
      padding: '8px',
      color: '#64748b',
      fontSize: '12px',
      background: '#f8fbff',
    },
  }, `${node.component}（未注册）`)
}

export const LowCodeDesigner = defineComponent({
  name: 'LowerCodeDesigner',
  props: {
    modelValue: { type: Object as PropType<unknown>, default: undefined },
    disabled: { type: Boolean, default: false },
    preview: { type: Boolean, default: false },
    minCanvasHeight: { type: Number, default: 420 },
    renderers: { type: Object as PropType<LowCodeDesignerRenderers>, default: undefined },
    componentDefinitions: {
      type: Object as PropType<Record<string, LowCodeDesignerComponentDefinition> | undefined>,
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const readonly = computed(() => Boolean(props.disabled || props.preview))
    const nodes = ref<DesignerNode[]>(schemaToNodes(props.modelValue))
    const selectedId = ref<string | null>(nodes.value[0]?.id ?? null)
    const enumDraft = ref('')
    const resolvedComponentDefinitions = computed(() =>
      mergeDesignerComponentDefinitions(props.componentDefinitions))
    const componentPropsByComponent = ref<Record<string, Record<string, unknown>>>(
      createComponentPropsByComponent(resolvedComponentDefinitions.value),
    )

    const designerRoot = ref<HTMLElement | null>(null)
    const materialHost = ref<HTMLElement | null>(null)
    const canvasHost = ref<HTMLElement | null>(null)
    const editorHost = ref<HTMLElement | null>(null)
    const editor = ref<JSONEditor | null>(null)
    const sortables = ref<Sortable[]>([])
    let remountTimer: ReturnType<typeof setTimeout> | null = null
    let remountAttempts = 0

    const injectedRegistry = inject(ComponentRegistrySymbol, null)
    const previewComponents = computed<Record<string, Component>>(() =>
      mapToRecord(injectedRegistry?.value?.components as Map<string, Component> | undefined))
    const setMaterialHost = (element: HTMLElement | null): void => {
      materialHost.value = element
    }
    const setCanvasHost = (element: HTMLElement | null): void => {
      canvasHost.value = element
    }

    const registeredComponentNames = computed(() =>
      Array.from(injectedRegistry?.value?.components.keys() ?? []))
    const designerMaterials = computed(() =>
      resolveDesignerMaterials(
        registeredComponentNames.value,
        resolvedComponentDefinitions.value,
        { internalComponentNames: VUE_INTERNAL_COMPONENT_NAMES },
      ))
    const materialsById = computed(() =>
      new Map(designerMaterials.value.allMaterials.map(item => [item.id, item] as const)))

    const builtSchema = computed(() => nodesToSchema(nodes.value))
    const builtSignature = computed(() => schemaSignature(builtSchema.value))
    const valueSignature = computed(() => schemaSignature(props.modelValue))
    const lastSeenValueSignature = ref(valueSignature.value)

    const selectedNode = computed(
      () => (selectedId.value ? findNodeById(nodes.value, selectedId.value) : null),
    )
    const selectedSection = computed(
      () => (selectedId.value ? findSectionById(nodes.value, selectedId.value) : null),
    )
    const selectedField = computed(() =>
      (selectedNode.value?.kind === 'field' ? selectedNode.value : null))
    const selectedContainer = computed(() =>
      (selectedNode.value?.kind === 'container' ? selectedNode.value : null))

    const previewFields = computed(() => collectPreviewFields(nodes.value))
    const dropTargetSignature = computed(() => collectDropTargetKeys(nodes.value).sort().join('|'))
    const materialSignature = computed(() => designerMaterials.value.allMaterials.map(item => item.id).join('|'))

    watch(resolvedComponentDefinitions, (definitions) => {
      componentPropsByComponent.value = (() => {
        const prev = componentPropsByComponent.value
        const next = { ...prev }
        let changed = false

        for (const [componentName, definition] of Object.entries(definitions)) {
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
      })()
    }, { immediate: true, deep: true })

    watch(nodes, (nextNodes) => {
      componentPropsByComponent.value = (() => {
        const prev = componentPropsByComponent.value
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

        visit(nextNodes)
        return changed ? next : prev
      })()
    }, { deep: true, immediate: true })

    watch(valueSignature, (nextSignature) => {
      if (nextSignature === lastSeenValueSignature.value)
        return
      lastSeenValueSignature.value = nextSignature
      if (nextSignature === builtSignature.value)
        return
      const nextNodes = schemaToNodes(props.modelValue)
      nodes.value = nextNodes
      selectedId.value = nextNodes[0]?.id ?? null
    })

    watch(builtSchema, (schema) => {
      if (valueSignature.value !== builtSignature.value)
        emit('update:modelValue', schema)
    }, { deep: true })

    watch([nodes, selectedId], () => {
      if (!selectedId.value) {
        selectedId.value = nodes.value[0]?.id ?? null
        return
      }
      if (!findNodeById(nodes.value, selectedId.value) && !findSectionById(nodes.value, selectedId.value))
        selectedId.value = nodes.value[0]?.id ?? null
    }, { deep: true })

    watch(selectedField, (field) => {
      if (!field || field.component !== 'Select') {
        enumDraft.value = ''
        return
      }
      enumDraft.value = field.enumOptions.map(option => `${option.label}:${option.value}`).join('\n')
    }, { immediate: true })

    function destroySortables(): void {
      sortables.value.forEach(sortable => sortable.destroy())
      sortables.value = []
    }

    function toggleDraggingCursor(dragging: boolean): void {
      if (typeof document === 'undefined')
        return
      document.body.classList.toggle('cf-lc-body-dragging', dragging)
    }

    async function mountSortables(): Promise<number> {
      await nextTick()
      destroySortables()

      const materialSortableRoot = materialHost.value ?? designerRoot.value
      if (materialSortableRoot) {
        const materialLists = Array.from(materialSortableRoot.querySelectorAll<HTMLElement>('[data-cf-material-list="true"]'))
        for (const materialList of materialLists) {
          sortables.value.push(Sortable.create(materialList, {
            group: { name: 'configform-lower-code-tree', pull: 'clone', put: false },
            sort: false,
            animation: 90,
            direction: 'vertical',
            forceFallback: true,
            fallbackOnBody: true,
            fallbackTolerance: 0,
            removeCloneOnHide: true,
            disabled: readonly.value,
            draggable: '[data-material-id]',
            handle: '[data-material-id]',
            ghostClass: 'cf-lc-ghost',
            chosenClass: 'cf-lc-chosen',
            dragClass: 'cf-lc-dragging',
            fallbackClass: 'cf-lc-sortable-fallback',
            onStart: () => toggleDraggingCursor(true),
            onEnd: () => toggleDraggingCursor(false),
            setData: (dataTransfer, dragElement) => {
              dataTransfer.setData('text/plain', dragElement.getAttribute('data-material-id') ?? '')
            },
          }))
        }
      }

      const canvasSortableRoot = canvasHost.value ?? designerRoot.value
      if (!canvasSortableRoot)
        return sortables.value.length

      const dropLists = Array.from(canvasSortableRoot.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
      for (const list of dropLists) {
        const targetKey = list.dataset.targetKey
        const escapedTargetKey = (targetKey ?? '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        const draggableSelector = targetKey
          ? `[data-parent-target-key="${escapedTargetKey}"], [data-material-id]`
          : '.cf-lc-node, [data-material-id]'
        sortables.value.push(Sortable.create(list, {
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
          forceFallback: true,
          fallbackOnBody: true,
          disabled: readonly.value,
          draggable: draggableSelector,
          handle: '[data-cf-drag-handle="true"], [data-material-id]',
          ghostClass: 'cf-lc-ghost',
          chosenClass: 'cf-lc-chosen',
          dragClass: 'cf-lc-dragging',
          fallbackClass: 'cf-lc-sortable-fallback',
          onStart: () => toggleDraggingCursor(true),
          setData: (dataTransfer, dragElement) => {
            dataTransfer.setData('text/plain', dragElement.getAttribute('data-node-id') ?? '')
          },
          onAdd: (event) => {
            const item = event.item as HTMLElement
            const materialId = item.dataset.materialId
            if (!materialId)
              return

            item.remove()
            const target = keyToTarget((event.to as HTMLElement).dataset.targetKey)
            const materialByPayload = parseMaterialPayload(item.dataset.materialPayload)
            const material = materialsById.value.get(materialId)
              ?? materialByPayload
              ?? designerMaterials.value.allMaterials.find(item => item.id === materialId)
            if (!target || !material)
              return

            const insertIndex = Math.max(0, Math.min(event.newIndex ?? 0, Number.MAX_SAFE_INTEGER))
            const baseNode = defaultNodeFromMaterial(material, [])
            const nextNode = mergeFieldNodeWithComponentPreset(baseNode, componentPropsByComponent.value)
            const previousNodes = nodes.value
            const byTarget = insertNodeByTarget(previousNodes, target, insertIndex, nextNode)
            const nextNodes = byTarget === previousNodes
              ? insertNodeByTarget(previousNodes, rootTarget(), previousNodes.length, nextNode)
              : byTarget
            if (nextNodes === previousNodes)
              return

            nodes.value = nextNodes
            selectedId.value = nextNode.id
          },
          onEnd: (event) => {
            toggleDraggingCursor(false)
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
            nodes.value = moveNodeByTarget(nodes.value, fromTarget, toTarget, oldIndex, newIndex)
            const nodeId = item.dataset.nodeId
            if (nodeId)
              selectedId.value = nodeId
          },
        }))
      }

      return sortables.value.length
    }

    function scheduleMountSortables(resetAttempts = true): void {
      if (remountTimer)
        clearTimeout(remountTimer)
      if (resetAttempts)
        remountAttempts = 0
      remountTimer = setTimeout(() => {
        remountTimer = null
        void (async () => {
          const mountedCount = await mountSortables()
          if (mountedCount > 0 || remountAttempts >= 8)
            return
          remountAttempts += 1
          scheduleMountSortables(false)
        })()
      }, 80)
    }

    watch([readonly, dropTargetSignature, materialSignature, selectedId], () => {
      scheduleMountSortables()
    }, { immediate: true })

    onMounted(async () => {
      if (editorHost.value) {
        editor.value = new JSONEditor(editorHost.value, {
          mode: 'view',
          modes: ['view', 'tree', 'code'],
          mainMenuBar: true,
          navigationBar: true,
          statusBar: true,
          search: true,
          onEditable: () => false,
        })
        try {
          editor.value.set(cloneDeep(builtSchema.value))
        }
        catch {
          editor.value.set({})
        }
      }
      scheduleMountSortables()
    })

    watch(builtSchema, (schema) => {
      if (!editor.value)
        return
      try {
        editor.value.set(cloneDeep(schema))
      }
      catch {
        editor.value.set({})
      }
    }, { immediate: true, deep: true })

    onBeforeUnmount(() => {
      if (remountTimer)
        clearTimeout(remountTimer)
      toggleDraggingCursor(false)
      destroySortables()
      editor.value?.destroy()
      editor.value = null
    })

    function updateField(nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode): void {
      nodes.value = updateNodeById(nodes.value, nodeId, node => (node.kind === 'field' ? updater(node) : node))
    }

    function updateContainer(nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode): void {
      nodes.value = updateNodeById(nodes.value, nodeId, node => (node.kind === 'container' ? updater(node) : node))
    }

    function handleDuplicateNode(nodeId: string): void {
      nodes.value = duplicateNodeById(nodes.value, nodeId)
    }

    function handleRemoveNode(nodeId: string): void {
      nodes.value = removeNodeById(nodes.value, nodeId)
      if (selectedId.value === nodeId)
        selectedId.value = null
    }

    function handleAddSection(containerId: string): void {
      nodes.value = addSectionToContainer(nodes.value, containerId)
    }

    function handleRemoveSection(containerId: string, sectionId: string): void {
      nodes.value = removeSectionFromContainer(nodes.value, containerId, sectionId)
    }

    function updateNodes(updater: (prev: DesignerNode[]) => DesignerNode[]): void {
      nodes.value = updater(nodes.value)
    }

    function updateComponentPropByComponentName(
      componentName: string,
      propKey: string,
      value: unknown,
    ): void {
      const currentPreset = componentPropsByComponent.value[componentName] ?? {}
      if (value === undefined && !(propKey in currentPreset))
        return
      if (value !== undefined && currentPreset[propKey] === value)
        return

      const nextPreset = { ...currentPreset }
      if (value === undefined)
        delete nextPreset[propKey]
      else
        nextPreset[propKey] = value

      const next = { ...componentPropsByComponent.value }
      if (Object.keys(nextPreset).length === 0)
        delete next[componentName]
      else
        next[componentName] = nextPreset
      componentPropsByComponent.value = next

      nodes.value = updateFieldNodesRecursively(nodes.value, (field) => {
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
      })
    }

    function buildPreviewComponentProps(node: DesignerFieldNode): Record<string, unknown> {
      const componentProps = { ...node.componentProps }
      if (node.enumOptions.length > 0 && !('dataSource' in componentProps) && !('options' in componentProps)) {
        componentProps.dataSource = node.enumOptions.map(option => ({
          label: option.label,
          value: option.value,
        }))
      }
      return componentProps
    }

    function renderNodeByRegistry(node: DesignerNode, phase: 'material' | 'canvas' | 'preview'): VNodeChild {
      if (node.kind !== 'field')
        return renderFallbackContainerPreview(node)

      const registeredComponent = previewComponents.value[node.component]
      if (!registeredComponent)
        return renderFallbackFieldPreview(node)

      return h('div', {
        class: `cf-lc-real-preview-wrap cf-lc-real-preview-wrap--${phase}`,
      }, [
        h(registeredComponent, buildPreviewComponentProps(node)),
      ])
    }

    function renderMaterialPreview(item: MaterialItem): VNodeChild {
      const customPreview = props.renderers?.renderMaterialPreview?.(item, {
        phase: 'material',
        readonly: readonly.value,
      })
      if (customPreview !== undefined)
        return customPreview
      const node = mergeFieldNodeWithComponentPreset(defaultNodeFromMaterial(item, []), componentPropsByComponent.value)
      return renderNodeByRegistry(node, 'material')
    }

    function renderFieldPreviewControl(
      node: DesignerFieldNode,
      phase: 'canvas' | 'preview',
    ): VNodeChild {
      const customPreview = props.renderers?.renderFieldPreviewControl?.(node, {
        phase,
        readonly: readonly.value,
      })
      if (customPreview !== undefined)
        return customPreview
      return renderNodeByRegistry(node, phase)
    }

    return () => h('div', {
      ref: designerRoot,
      style: {
        border: '1px solid #d7e0ef',
        borderRadius: '16px',
        overflow: 'hidden',
        background: '#f8fbff',
        boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      },
    }, [
      h('style', undefined, DESIGNER_CSS),
      h('div', {
        style: {
          padding: '14px 18px',
          borderBottom: '1px solid #d5e2f3',
          background: 'linear-gradient(112deg, #0f172a 0%, #1e3a8a 58%, #0d9488 120%)',
          color: '#f8fafc',
        },
      }, [
        h('div', { style: { fontSize: '15px', fontWeight: 700 } }, '低代码设计器'),
        h('div', { style: { marginTop: '4px', fontSize: '12px', color: '#dbeafe' } }, '左侧物料、中间画布、右侧属性全部由 ConfigForm 组合渲染。'),
      ]),

      h('div', {
        class: 'cf-lc-main-grid',
        style: {
          padding: '12px',
          minHeight: 0,
        },
      }, [
        h('div', {
          style: {
            display: 'flex',
            alignItems: 'stretch',
            gap: '12px',
            width: '100%',
            minWidth: 0,
            minHeight: 0,
            height: 'clamp(360px, 55vh, 640px)',
            overflow: 'hidden',
          },
        }, [
          h(DesignerMaterialPane, {
            componentMaterials: designerMaterials.value.componentMaterials,
            layoutMaterials: designerMaterials.value.layoutMaterials,
            setMaterialHost,
            readonly: readonly.value,
            renderMaterialPreview,
          }),
          h(DesignerCanvasPane, {
            nodes: nodes.value,
            minCanvasHeight: props.minCanvasHeight,
            selectedId: selectedId.value,
            readonly: readonly.value,
            setCanvasHost,
            onSelect: (id: string) => { selectedId.value = id },
            onDuplicateNode: handleDuplicateNode,
            onRemoveNode: handleRemoveNode,
            onAddSection: handleAddSection,
            onRemoveSection: handleRemoveSection,
            renderFieldPreviewControl: (node: DesignerFieldNode) => renderFieldPreviewControl(node, 'canvas'),
          }),
          h(DesignerPropertiesPane, {
            nodes: nodes.value,
            readonly: readonly.value,
            selectedField: selectedField.value,
            selectedContainer: selectedContainer.value,
            selectedSection: selectedSection.value,
            enumDraft: enumDraft.value,
            setEnumDraft: (value: string) => { enumDraft.value = value },
            onUpdateNodes: updateNodes,
            updateField,
            updateContainer,
            fieldComponentOptions: designerMaterials.value.fieldComponentOptions,
            componentDefinitions: resolvedComponentDefinitions.value,
            componentPropsByComponent: componentPropsByComponent.value,
            onUpdateComponentPropByComponentName: updateComponentPropByComponentName,
          }),
        ]),
      ]),

      h('div', {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          padding: '0 12px 12px',
        },
      }, [
        h('section', {
          style: {
            border: '1px solid #dbe4f0',
            borderRadius: '12px',
            background: '#fff',
            overflow: 'hidden',
          },
        }, [
          h('div', {
            style: {
              margin: 0,
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              borderBottom: '1px solid #edf2f8',
              background: 'linear-gradient(180deg, #f8fbff 0%, #f6fafb 100%)',
            },
          }, 'Schema（JSONEditor）'),
          h('div', { ref: editorHost, style: { minHeight: '280px' } }),
        ]),
        h('section', {
          style: {
            border: '1px solid #dbe4f0',
            borderRadius: '12px',
            background: '#fff',
            overflow: 'hidden',
          },
        }, [
          h('div', {
            style: {
              margin: 0,
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 700,
              borderBottom: '1px solid #edf2f8',
              background: 'linear-gradient(180deg, #f8fbff 0%, #f6fafb 100%)',
            },
          }, '实时预览'),
          h('div', {
            style: {
              borderTop: '1px solid #f0f0f0',
              padding: '12px',
              display: 'grid',
              gap: '10px',
            },
          }, [
            ...previewFields.value.map(item => h('div', {
              key: item.id,
              style: {
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '10px',
                background: '#fff',
              },
            }, [
              h('div', { style: { fontSize: '12px', color: '#666', marginBottom: '6px', fontWeight: 600 } }, [
                `${item.required ? '* ' : ''}${item.title} `,
                h('span', { style: { color: '#9ca3af', fontWeight: 400 } }, `(${item.name})`),
              ]),
              renderFieldPreviewControl(item, 'preview'),
            ])),
            previewFields.value.length === 0
              ? h('div', { style: { color: '#9ca3af', fontSize: '12px' } }, '暂无字段，请从左侧物料区拖拽组件到画布。')
              : null,
          ]),
        ]),
      ]),
    ])
  },
})
