/**
 * plugin-lower-code-core 包入口。
 * 该入口统一导出低代码设计器的核心建模、拖拽编排、物料解析与目标定位工具。
 * React/Vue 侧插件均应依赖这里的公共逻辑，避免重复实现导致行为不一致。
 * 新增导出时需同步评估跨端兼容性与命名稳定性。
 */
export {
  addSectionToContainer,
  allowedComponents,
  canDropNodeAtTarget,
  cloneNodes,
  COMPONENT_MATERIALS,
  containerTarget,
  containerUsesSections,
  defaultComponentForType,
  defaultNodeFromMaterial,
  defaultNodes,
  duplicateNodeById,
  findNodeById,
  findSectionById,
  insertNodeByTarget,
  isContainerNode,
  isFieldNode,
  keyToTarget,
  LAYOUT_MATERIALS,
  MATERIALS,
  moveNodeByIdToTarget,
  moveNodeByTarget,
  nodesToSchema,
  normalizeNode,
  normalizeNodes,
  parseEnumDraft,
  previewValueByNode,
  removeNodeById,
  removeSectionFromContainer,
  reorder,
  rootTarget,
  schemaSignature,
  schemaToNodes,
  sectionTarget,
  targetToKey,
  updateNodeById,
  updateSectionById,
} from './designer'

export type {
  DesignerComponent,
  DesignerContainerComponent,
  DesignerContainerNode,
  DesignerDropTarget,
  DesignerFieldComponent,
  DesignerFieldNode,
  DesignerFieldType,
  DesignerNode,
  DesignerSectionNode,
  EnumOption,
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from './designer'

export {
  createDesignerCanvasDraggableSelector,
  createDesignerCanvasPutHandler,
  createDesignerCanvasSortableOptions,
  createDesignerMaterialSortableOptions,
  hasMountedDesignerSortables,
  resolveDesignerSortableIndex,
  resolveDesignerSortableInsertIndex,
  resolveDesignerSortableMoveIndices,
} from './designer-shared/drag'

export type {
  DesignerSortableEventLike,
  DesignerSortableMountResult,
  DesignerSortablePutHandler,
  SortableContainerLike,
} from './designer-shared/drag'

export { resolveDesignerMaterials } from './designer-shared/materials'

export type {
  DesignerMaterials,
  ResolveDesignerMaterialsOptions,
} from './designer-shared/materials'

export type {
  LowCodeDesignerComponentDefinition,
  LowCodeDesignerComponentDefinitions,
  LowCodeDesignerEditableProp,
  LowCodeDesignerEditablePropEditor,
  LowCodeDesignerEditablePropOption,
  LowCodeDesignerRenderContext,
} from './designer-shared/types'

export { LOW_CODE_DESIGNER_TEXT, LOW_CODE_NODE_TOOLBAR_ICONS } from './designer-shared/ui'

export {
  collectDropTargetKeys,
  collectPreviewFields,
  restoreDraggedDomPosition,
} from './designer-shared/utils'

export type { DragRestoreEventLike } from './designer-shared/utils'
