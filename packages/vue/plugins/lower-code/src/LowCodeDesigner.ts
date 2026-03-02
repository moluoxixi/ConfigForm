import type { ISchema } from '@moluoxixi/core'
import type {
  DesignerContainerNode,
  DesignerFieldNode,
  DesignerFormConfig,
  DesignerNode,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { Component, PropType, VNodeChild, VNodeRef } from 'vue'
import type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerDecoratorDefinition,
  LowCodeDesignerRenderers,
} from './designer/types'
import {
  addSectionToContainer,
  applyDesignerFormConfig,
  collectDropTargetKeys,
  createDesignerCanvasPutHandler,
  createDesignerCanvasSortableOptions,
  createDesignerMaterialSortableOptions,
  createDesignerPointerTracker,
  defaultNodeFromMaterial,
  duplicateNodeById,
  extractDesignerFormConfig,
  findNodeById,
  findSectionById,
  hasMountedDesignerSortables,
  insertNodeByTarget,
  keyToTarget,
  moveNodeByIdToTarget,
  nodesToSchema,
  previewValueByNode,
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
import { ComponentRegistrySymbol, useCreateForm } from '@moluoxixi/vue'
import { ConfigForm } from '@moluoxixi/ui-basic-vue'
import Sortable from 'sortablejs'
import { computed, defineComponent, h, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { DesignerCanvasPane } from './designer/center/DesignerCanvasPane'
import { DesignerMaterialPane } from './designer/left/DesignerMaterialPane'
import { mergeDesignerComponentDefinitions } from './designer/right/component-definitions'
import { mergeDesignerDecoratorDefinitions } from './designer/right/decorator-definitions'
import { DesignerPropertiesPane } from './designer/right/DesignerPropertiesPane'

export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerDecoratorDefinition,
  LowCodeDesignerDecoratorDefinitions,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerRenderContext,
  LowCodeDesignerRenderers,
} from './designer/types'

/**
 */
export interface LowCodeDesignerProps {
  modelValue?: unknown
  disabled?: boolean
  preview?: boolean
  minCanvasHeight?: number
  renderers?: LowCodeDesignerRenderers
  componentDefinitions?: Record<string, LowCodeDesignerComponentDefinition>
  decoratorDefinitions?: Record<string, LowCodeDesignerDecoratorDefinition>
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
  right: 4px;
  transform: translate(0, calc(-100% + 12px));
  z-index: 40;
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
.cf-lc-pane-configform-shell > form > div,
.cf-lc-pane-configform-shell > div:first-child {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
}

.cf-lc-pane-configform-shell > form {
  margin: 0;
}

.cf-lc-side-scroll {
  flex: 1 1 auto;
  min-height: 0;
  height: 100%;
  max-height: 100%;
  overflow: auto;
  padding-right: 2px;
  scrollbar-gutter: stable;
}

.cf-lc-properties-pane-form .ant-tabs,
.cf-lc-properties-pane-form .el-tabs {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
}

.cf-lc-properties-pane-form .ant-tabs-content-holder,
.cf-lc-properties-pane-form .ant-tabs-content,
.cf-lc-properties-pane-form .ant-tabs-tabpane,
.cf-lc-properties-pane-form .el-tabs__content,
.cf-lc-properties-pane-form .el-tab-pane {
  min-height: 0;
  height: 100%;
}

.cf-lc-properties-pane-form .ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden),
.cf-lc-properties-pane-form .el-tab-pane.is-active,
.cf-lc-properties-pane-form .el-tab-pane[aria-hidden="false"] {
  display: flex;
  flex-direction: column;
}

.cf-lc-side-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
  margin-bottom: 10px;
}

.cf-lc-side-tab {
  border: 1px solid #d5e2f3;
  border-radius: 8px;
  padding: 6px 8px;
  font-size: 12px;
  font-weight: 600;
  background: #f8fbff;
  color: #64748b;
  cursor: pointer;
  transition: all .15s ease;
}

.cf-lc-side-tab.is-active {
  border-color: #93c5fd;
  color: #1d4ed8;
  background: #eff6ff;
  box-shadow: 0 6px 12px rgba(37, 99, 235, 0.12);
}

.cf-lc-segment {
  margin-top: 6px;
  display: inline-flex;
  border: 1px solid #d3deeb;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.cf-lc-segment-button {
  border: 0;
  background: transparent;
  padding: 4px 10px;
  font-size: 12px;
  color: #64748b;
  cursor: pointer;
  transition: all .15s ease;
}

.cf-lc-segment-button.is-active {
  background: #eff6ff;
  color: #1d4ed8;
  font-weight: 600;
}

.cf-lc-control-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 6px;
}

.cf-lc-control-label--compact {
  margin-bottom: 6px;
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
.cf-lc-material-pane .el-tab-pane.is-active,
.cf-lc-material-pane .el-tab-pane[aria-hidden="false"] {
  display: flex;
  flex-direction: column;
  overflow: hidden;
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
  pointer-events: none;
}

.cf-lc-sortable-fallback,
.cf-lc-sortable-fallback * {
  pointer-events: none !important;
}

.cf-lc-sortable-fallback {
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
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px;
  border: 1px solid #d5e2f3;
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 -2px 8px rgba(15, 23, 42, 0.08);
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
  width: 20px;
  height: 20px;
  border: 1px solid #d5e2f3;
  border-radius: 4px;
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
  pointer-events: auto;
}

.cf-lc-node-tool--move {
  cursor: grab;
  pointer-events: auto;
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
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  max-height: 100%;
  overflow: auto;
  box-sizing: border-box;
  scrollbar-gutter: stable;
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
  cursor: grab;
}

.cf-lc-node--selected.cf-lc-node--container > .cf-lc-mask-layer > .cf-lc-mask-layer-content,
.cf-lc-node--selected.cf-lc-node--field > .cf-lc-node-preview > .cf-lc-material-preview > .cf-lc-mask-layer > .cf-lc-mask-layer-content {
  padding: 2px;
}

.cf-lc-node--selected::after {
  opacity: 1;
}

.cf-lc-node--selected:active {
  cursor: grabbing;
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
  overflow: visible;
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
  overflow: visible;
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
  overflow: visible;
}

.cf-lc-layout-tabs-nav {
  position: relative;
  z-index: 1;
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
  position: relative;
  z-index: 2;
  display: grid;
  gap: 8px;
  padding: 8px;
  overflow: visible;
}

.cf-lc-layout-collapse-shell {
  display: grid;
  gap: 8px;
  overflow: visible;
}

.cf-lc-section {
  position: relative;
  z-index: 0;
  border: 1px solid transparent;
  border-radius: 9px;
  background: #ffffff;
  padding: 8px;
  overflow: visible;
  transition: border-color .16s ease, box-shadow .16s ease, background-color .16s ease, transform .18s ease;
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
  padding-right: 32px;
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
  right: 4px;
  transform: translate(0, -100%);
  z-index: 40;
  border: 1px solid #d5e2f3;
  border-bottom: 0;
  border-radius: 4px 4px 0 0;
  width: 24px;
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

/**
 * 浅比较两个对象是否键值完全一致。
 *
 * 该函数用于判断“组件默认属性预设”是否真的变化，
 * 避免在 watch 中无意义地替换引用导致额外渲染。
 *
 * @param a 左侧对象。
 * @param b 右侧对象。
 * @returns 两个对象键集合和对应值都一致时返回 true。
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
 * 将 `Map` 转换为普通对象。
 *
 * 组件注册表来自注入上下文时通常为 `Map`，
 * 预览渲染阶段更适合通过对象下标快速读取组件实例。
 *
 * @param map 组件映射表。
 * @returns 以 key 为属性名的普通对象。
 */
function mapToRecord<T>(map: Map<string, T> | undefined): Record<string, T> {
  const record: Record<string, T> = {}
  if (!map)
    return record
  for (const [key, value] of map.entries())
    record[key] = value
  return record
}

/**
 * parse Material Payload：负责“解析parse Material Payload”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse Material Payload 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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

/**
 * create Component Props By Component：负责“创建create Component Props By Component”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Component Props By Component 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * merge Field Node With Component Preset：负责“合并merge Field Node With Component Preset”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 merge Field Node With Component Preset 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * update Field Nodes Recursively：负责“更新update Field Nodes Recursively”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 update Field Nodes Recursively 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * render Fallback Field Preview：负责“渲染render Fallback Field Preview”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Fallback Field Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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

/**
 * render Fallback Container Preview：负责“渲染render Fallback Container Preview”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Fallback Container Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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
  inheritAttrs: false,
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
    decoratorDefinitions: {
      type: Object as PropType<Record<string, LowCodeDesignerDecoratorDefinition> | undefined>,
      default: undefined,
    },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * 低代码设计器主 setup。
   *
   * 负责三栏面板状态编排、拖拽挂载、选中态同步、Schema 双向同步、
   * 以及预览渲染器与组件预设的合并。
   *
   * @param props 组件入参。
   * @returns 设计器根渲染函数。
   */
  setup(props, { emit }) {
    const readonly = computed(() => Boolean(props.disabled || props.preview))
    const nodes = ref<DesignerNode[]>(schemaToNodes(props.modelValue))
    const selectedId = ref<string | null>(nodes.value[0]?.id ?? null)
    const enumDraft = ref('')
    const formConfig = ref<DesignerFormConfig>(extractDesignerFormConfig(props.modelValue))
    const resolvedComponentDefinitions = computed(() =>
      mergeDesignerComponentDefinitions(props.componentDefinitions))
    const resolvedDecoratorDefinitions = computed(() =>
      mergeDesignerDecoratorDefinitions(props.decoratorDefinitions))
    const componentPropsByComponent = ref<Record<string, Record<string, unknown>>>(
      createComponentPropsByComponent(resolvedComponentDefinitions.value),
    )
    const updateFormConfig = (updater: (prev: DesignerFormConfig) => DesignerFormConfig): void => {
      formConfig.value = updater(formConfig.value)
    }

    const designerRoot = ref<HTMLElement | null>(null)
    const materialHost = ref<HTMLElement | null>(null)
    const canvasHost = ref<HTMLElement | null>(null)
    const pointerTracker = createDesignerPointerTracker()
    const dragMeta = { allowCrossTarget: false }
    const sortables = ref<Sortable[]>([])
    let remountTimer: ReturnType<typeof setTimeout> | null = null
    let remountAttempts = 0
    let canvasSelectionRoot: HTMLElement | null = null

    const injectedRegistry = inject(ComponentRegistrySymbol, null)
    const previewComponents = computed<Record<string, Component>>(() =>
      mapToRecord(injectedRegistry?.value?.components as Map<string, Component> | undefined))
    const decoratorOptions = computed(() =>
      Array.from(injectedRegistry?.value?.decorators.keys() ?? []))
    const defaultDecoratorsByComponent = computed(() =>
      mapToRecord(injectedRegistry?.value?.defaultDecorators as Map<string, string> | undefined))
    /** 记录物料区真实 DOM 根节点，供 Sortable 挂载扫描。 */
    const
      setMaterialHost = (element: HTMLElement | null): void => {
        materialHost.value = element
      }
    /** 记录画布区真实 DOM 根节点，供拖拽列表与选中捕获绑定。 */
    const
      setCanvasHost = (element: HTMLElement | null): void => {
        canvasHost.value = element
      }
    const
      setDesignerRoot = (element: HTMLElement | null): void => {
        designerRoot.value = element
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

    const builtSchema = computed(() => applyDesignerFormConfig(nodesToSchema(nodes.value), formConfig.value))
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

        /**
         * 递归遍历节点树，把字段现有 `componentProps` 反向补齐到组件预设。
         *
         * 目的：当外部传入 schema 时，如果字段上已经存在某些属性，
         * 后续同组件新建字段应继承这些属性，保持设计体验一致。
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
      formConfig.value = extractDesignerFormConfig(props.modelValue)
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

    /**
     * 销毁当前已挂载的全部 Sortable 实例。
     *
     * 每次重新扫描画布/物料 DOM 之前必须先清理旧实例，
     * 否则会出现重复监听、事件触发多次和拖拽异常。
     */
    function destroySortables(): void {
      for (const sortable of sortables.value) {
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
      sortables.value = []
    }
    /**
     * resolve Event Element：负责“解析resolve Event Element”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 resolve Event Element 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function resolveEventElement(target: EventTarget | null): HTMLElement | null {
      if (target instanceof HTMLElement)
        return target
      if (target instanceof Node)
        return target.parentElement
      return null
    }
    /**
     * 处理画布捕获阶段指针事件，稳定更新当前选中项。
     *
     * 事件优先级高于冒泡阶段，能够规避拖拽库与遮罩层抢事件导致的“点不中”问题。
     *
     * @param event 指针事件对象。
     */
    function handleCanvasPointerDown(event: Event): void {
      const element = resolveEventElement(event.target)
      if (!element)
        return
      if (element.closest('[data-cf-toolbar-interactive="true"]'))
        return
      const nodeId = element.closest('[data-node-id]')?.getAttribute('data-node-id')
      if (nodeId) {
        selectedId.value = nodeId
        return
      }
      const sectionId = element.closest('[data-section-id]')?.getAttribute('data-section-id')
      if (sectionId)
        selectedId.value = sectionId
    }
    /**
     * 解除画布捕获监听。
     *
     * 在画布根节点变化或组件卸载时调用，防止悬空 DOM 持有事件处理器。
     */
    function detachCanvasSelection(): void {
      if (!canvasSelectionRoot)
        return
      canvasSelectionRoot.removeEventListener('pointerdown', handleCanvasPointerDown, true)
      canvasSelectionRoot = null
    }
    /**
     * 绑定画布捕获监听。
     *
     * 如果目标根节点已绑定则直接返回；否则先清理旧绑定再绑定新根节点。
     *
     * @param root 画布根节点。
     */
    function attachCanvasSelection(root: HTMLElement): void {
      if (canvasSelectionRoot === root)
        return
      detachCanvasSelection()
      root.addEventListener('pointerdown', handleCanvasPointerDown, true)
      canvasSelectionRoot = root
    }

    /**
     * 切换全局拖拽光标样式。
     *
     * 统一在 body 上打标记，保证跨三栏拖拽时视觉反馈一致。
     *
     * @param dragging 是否处于拖拽中。
     */
    function toggleDraggingCursor(dragging: boolean): void {
      if (dragging)
        pointerTracker.start()
      else
        pointerTracker.stop()
      if (typeof document === 'undefined')
        return
      document.body.classList.toggle('cf-lc-body-dragging', dragging)
    }
    const canvasPutHandler = createDesignerCanvasPutHandler(keyToTarget)

    /**
     * 扫描当前 DOM 并挂载物料区/画布区拖拽能力。
     *
     * 返回挂载数量用于外层重试逻辑判断“首帧 DOM 是否已就绪”。
     *
     * @returns 当前轮次物料列表和画布列表的挂载数量。
     */
    async function mountSortables(): Promise<{ materialMounted: number, canvasMounted: number }> {
      await nextTick()
      destroySortables()
      let materialMounted = 0
      let canvasMounted = 0

      const fallbackRoot = designerRoot.value
        ?? (typeof document !== 'undefined' ? document.querySelector<HTMLElement>('.cf-lc-root') : null)
      const materialSortableRoot = materialHost.value ?? fallbackRoot
      if (materialSortableRoot) {
        const materialLists = Array.from(materialSortableRoot.querySelectorAll<HTMLElement>('[data-cf-material-list="true"]'))
        for (const materialList of materialLists) {
          const materialSortable = Sortable.create(materialList, createDesignerMaterialSortableOptions({
            disabled: readonly.value,
            /** 物料开始拖拽时启用全局拖拽光标。 */
            onStart: () => toggleDraggingCursor(true),
            /** 物料拖拽结束后恢复全局光标状态。 */
            onEnd: () => toggleDraggingCursor(false),
            /**
             * 写入物料拖拽 payload。
             *
             * @param dataTransfer 浏览器拖拽数据通道。
             * @param dragElement 当前被拖拽的物料 DOM。
             */
            setData: (dataTransfer, dragElement) => {
              dataTransfer.setData('text/plain', dragElement.getAttribute('data-material-id') ?? '')
            },
          }) as Sortable.Options)
          sortables.value.push(materialSortable)
          ;(materialList as HTMLElement & { __cfSortable?: Sortable }).__cfSortable = materialSortable
          materialList.dataset.cfSortableMounted = 'true'
          materialMounted += 1
        }
      }

      const canvasSortableRoot = canvasHost.value ?? fallbackRoot
      if (!canvasSortableRoot) {
        detachCanvasSelection()
        return { materialMounted, canvasMounted }
      }

      attachCanvasSelection(canvasSortableRoot)

      const dropLists = Array.from(canvasSortableRoot.querySelectorAll<HTMLElement>('[data-cf-drop-list="true"]'))
      for (const list of dropLists) {
        const canvasSortable = Sortable.create(list, createDesignerCanvasSortableOptions({
          disabled: readonly.value,
          targetKey: list.dataset.targetKey,
          put: canvasPutHandler,
          /** 画布拖拽开始时启用全局拖拽光标。 */
          onStart: (event) => {
            toggleDraggingCursor(true)
            const origin = event?.originalEvent?.target
            const originEl = origin instanceof HTMLElement ? origin : null
            dragMeta.allowCrossTarget = Boolean(
              originEl?.closest('.cf-lc-node-tool--move'),
            )
          },
          /**
           * 写入画布节点拖拽 payload。
           *
           * @param dataTransfer 浏览器拖拽数据通道。
           * @param dragElement 当前被拖拽的节点 DOM。
           */
          setData: (dataTransfer, dragElement) => {
            dataTransfer.setData('text/plain', dragElement.getAttribute('data-node-id') ?? '')
          },
          /**
           * 处理“物料拖入画布”。
           *
           * @param event Sortable 事件对象。
           */
          onAdd: (event) => {
            const item = event.item as HTMLElement
            const pointerSnapshot = pointerTracker.getLastPoint() ?? (() => {
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
              nodes.value = moveNodeByIdToTarget(nodes.value, nodeId, toTarget, insertIndex)
              selectedId.value = nodeId
              return
            }

            item.remove()
            const target = keyToTarget(toTargetKey)
            const materialByPayload = parseMaterialPayload(item.dataset.materialPayload)
            const material = materialsById.value.get(materialId)
              ?? materialByPayload
              ?? designerMaterials.value.allMaterials.find(item => item.id === materialId)
            if (!target || !material)
              return

            const insertIndex = pointerIndex ?? resolveDesignerSortableInsertIndex(event)
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
          /**
           * 处理“画布节点移动/重排”。
           *
           * @param event Sortable 事件对象。
           */
          onEnd: (event) => {
            toggleDraggingCursor(false)
            const item = event.item as HTMLElement
            const pointerSnapshot = pointerTracker.getLastPoint() ?? (() => {
              const rect = item.getBoundingClientRect()
              if (!rect || rect.width <= 0 || rect.height <= 0)
                return null
              return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
            })()
            const allowCrossTarget = dragMeta.allowCrossTarget
            dragMeta.allowCrossTarget = false
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
            // 嵌套拖拽时会触发祖先列表的 onEnd，跳过非真实来源列表事件。
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
              nodes.value = moveNodeByIdToTarget(nodes.value, nodeId, target, newIndex)
              selectedId.value = nodeId
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
              nodes.value = moveNodeByIdToTarget(
                nodes.value,
                nodeId,
                actualTarget,
                actualIndex >= 0 ? actualIndex : Number.MAX_SAFE_INTEGER,
              )
              selectedId.value = nodeId
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
              nodes.value = moveNodeByIdToTarget(nodes.value, nodeId, crossTarget, insertIndex)
              selectedId.value = nodeId
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
            nodes.value = moveNodeByIdToTarget(nodes.value, nodeId, toTarget, newIndex)
            selectedId.value = nodeId
          },
        }) as Sortable.Options)
        sortables.value.push(canvasSortable)
        ;(list as HTMLElement & { __cfSortable?: Sortable }).__cfSortable = canvasSortable
        list.dataset.cfSortableMounted = 'true'
        canvasMounted += 1
      }

      return { materialMounted, canvasMounted }
    }

    /**
     * 调度 Sortable 挂载，并在 DOM 尚未稳定时执行有限重试。
     *
     * 设计器包含多个异步渲染区块，首轮挂载可能拿不到目标列表；
     * 因此这里采用“延迟 + 最多 8 次重试”的兜底策略。
     *
     * @param resetAttempts 是否重置重试计数器。
     */
    function scheduleMountSortables(resetAttempts = true): void {
      if (remountTimer)
        clearTimeout(remountTimer)
      if (resetAttempts)
        remountAttempts = 0
      remountTimer = setTimeout(() => {
        remountTimer = null
        void (async () => {
          const mounted = await mountSortables()
          if (hasMountedDesignerSortables(mounted) || remountAttempts >= 8)
            return
          remountAttempts += 1
          scheduleMountSortables(false)
        })()
      }, 80)
    }

    watch([readonly, dropTargetSignature, materialSignature, builtSignature], () => {
      scheduleMountSortables()
    }, { immediate: true })

    onMounted(async () => {
      scheduleMountSortables()
    })

    onBeforeUnmount(() => {
      if (remountTimer)
        clearTimeout(remountTimer)
      toggleDraggingCursor(false)
      detachCanvasSelection()
      destroySortables()
    })

    /**
     * update Field：负责“更新update Field”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 update Field 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function updateField(nodeId: string, updater: (field: DesignerFieldNode) => DesignerFieldNode): void {
      nodes.value = updateNodeById(nodes.value, nodeId, node => (node.kind === 'field' ? updater(node) : node))
    }

    /**
     * update Container：负责“更新update Container”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 update Container 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function updateContainer(nodeId: string, updater: (container: DesignerContainerNode) => DesignerContainerNode): void {
      nodes.value = updateNodeById(nodes.value, nodeId, node => (node.kind === 'container' ? updater(node) : node))
    }

    /**
     * 复制指定节点，并插入到原节点后方。
     *
     * @param nodeId 目标节点 ID。
     */
    function handleDuplicateNode(nodeId: string): void {
      nodes.value = duplicateNodeById(nodes.value, nodeId)
    }

    /**
     * 删除指定节点，并在删除当前选中节点时清空选中态。
     *
     * @param nodeId 目标节点 ID。
     */
    function handleRemoveNode(nodeId: string): void {
      nodes.value = removeNodeById(nodes.value, nodeId)
      if (selectedId.value === nodeId)
        selectedId.value = null
    }

    /**
     * 给容器新增一个分组（Tabs / Collapse）。
     *
     * @param containerId 容器节点 ID。
     */
    function handleAddSection(containerId: string): void {
      nodes.value = addSectionToContainer(nodes.value, containerId)
    }

    /**
     * 删除容器内指定分组。
     *
     * @param containerId 容器节点 ID。
     * @param sectionId 分组节点 ID。
     */
    function handleRemoveSection(containerId: string, sectionId: string): void {
      nodes.value = removeSectionFromContainer(nodes.value, containerId, sectionId)
    }

    /**
     * update Nodes：负责“更新update Nodes”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 update Nodes 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function updateNodes(updater: (prev: DesignerNode[]) => DesignerNode[]): void {
      nodes.value = updater(nodes.value)
    }

    /**
     * update Component Prop By Component Name：负责“更新update Component Prop By Component Name”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 update Component Prop By Component Name 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
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

    /**
     * build Preview Component Props：负责“构建build Preview Component Props”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 build Preview Component Props 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
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

    /**
     * render Node By Registry：负责“渲染render Node By Registry”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Node By Registry 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function renderNodeByRegistry(node: DesignerNode, phase: 'material' | 'canvas' | 'preview'): VNodeChild {
      if (node.kind !== 'field')
        return renderFallbackContainerPreview(node)

      const registeredComponent = previewComponents.value[node.component]
      if (!registeredComponent)
        return renderFallbackFieldPreview(node)

      const decoratorName = phase !== 'material'
        ? (node.decorator || defaultDecoratorsByComponent.value?.[node.component])
        : undefined
      const decoratorComponent = decoratorName
        ? injectedRegistry?.value?.decorators.get(decoratorName)
        : undefined
      const decoratorDefaults = decoratorName
        ? (resolvedDecoratorDefinitions.value?.[decoratorName]?.defaultProps ?? {})
        : {}
      const mergedDecoratorProps = {
        ...decoratorDefaults,
        ...(node.decoratorProps ?? {}),
        label: node.title,
        required: node.required,
        description: node.description,
      }

      return h('div', {
        class: `cf-lc-real-preview-wrap cf-lc-real-preview-wrap--${phase}`,
      }, [
        decoratorComponent
          ? h(decoratorComponent, mergedDecoratorProps, () =>
              h(registeredComponent, buildPreviewComponentProps(node)),
            )
          : h(registeredComponent, buildPreviewComponentProps(node)),
      ])
    }

    /**
     * render Material Preview：负责“渲染render Material Preview”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Material Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
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

    /**
     * render Field Preview Control：负责“渲染render Field Preview Control”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Field Preview Control 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
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

    const designerForm = useCreateForm()

    const DesignerRoot = defineComponent({
      name: 'DesignerRoot',
      props: {
        setRootRef: {
          type: Function as PropType<(element: HTMLDivElement | null) => void>,
          required: true,
        },
      },
      setup(rootProps, { slots }) {
        const rootRef: VNodeRef = (element) => {
          rootProps.setRootRef(element as HTMLDivElement | null)
        }
        return () => h('div', {
          ref: rootRef,
          class: 'cf-lc-root',
          style: {
            width: '100%',
            height: '100%',
            minWidth: 0,
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
          slots.default?.(),
        ])
      },
    })

    const DesignerHeader = defineComponent({
      name: 'DesignerHeader',
      setup() {
        return () => h('div', {
          style: {
            padding: '14px 18px',
            borderBottom: '1px solid #d5e2f3',
            background: 'linear-gradient(112deg, #0f172a 0%, #1e3a8a 58%, #0d9488 120%)',
            color: '#f8fafc',
          },
        }, [
          h('div', { style: { fontSize: '15px', fontWeight: 700 } }, '低代码设计器'),
          h('div', { style: { marginTop: '4px', fontSize: '12px', color: '#dbeafe' } }, '左侧物料、中间画布、右侧属性全部由 ConfigForm 组合渲染。'),
        ])
      },
    })

    const DesignerMainGrid = defineComponent({
      name: 'DesignerMainGrid',
      setup(_, { slots }) {
        return () => h('div', {
          class: 'cf-lc-main-grid',
          style: {
            padding: '12px',
            minHeight: 0,
            minWidth: 0,
            flex: '1 1 auto',
            overflow: 'hidden',
          },
        }, [
          h('div', {
            style: {
              display: 'grid',
              gridTemplateColumns: '260px minmax(520px, 1fr) 340px',
              gap: '12px',
              alignItems: 'stretch',
              width: '100%',
              minWidth: 0,
              minHeight: 0,
              height: '100%',
            },
          }, slots.default?.()),
        ])
      },
    })

    const designerSchema = computed<ISchema>(() => ({
      type: 'object',
      properties: {
        root: {
          type: 'void',
          component: 'DesignerRoot',
          componentProps: { setRootRef: setDesignerRoot },
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
                    componentMaterials: designerMaterials.value.componentMaterials,
                    layoutMaterials: designerMaterials.value.layoutMaterials,
                    setMaterialHost,
                    readonly: readonly.value,
                    renderMaterialPreview,
                  },
                },
                canvas: {
                  type: 'void',
                  component: 'DesignerCanvasPane',
                  componentProps: {
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
                  },
                },
                properties: {
                  type: 'void',
                  component: 'DesignerPropertiesPane',
                  componentProps: {
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
                    decoratorDefinitions: resolvedDecoratorDefinitions.value,
                    componentPropsByComponent: componentPropsByComponent.value,
                    onUpdateComponentPropByComponentName: updateComponentPropByComponentName,
                    decoratorOptions: decoratorOptions.value,
                    defaultDecoratorsByComponent: defaultDecoratorsByComponent.value,
                    formConfig: formConfig.value,
                    onUpdateFormConfig: updateFormConfig,
                  },
                },
              },
            },
          },
        },
      },
    }))

    const designerComponents = {
      DesignerRoot,
      DesignerHeader,
      DesignerMainGrid,
      DesignerMaterialPane,
      DesignerCanvasPane,
      DesignerPropertiesPane,
    }

    return () => h(ConfigForm, {
      form: designerForm,
      schema: designerSchema.value,
      components: designerComponents,
      formTag: false,
    })
  },
})
