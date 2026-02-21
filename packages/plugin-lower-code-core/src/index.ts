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

export {
  collectDropTargetKeys,
  collectPreviewFields,
  restoreDraggedDomPosition,
} from './designer-shared/utils'

export type { DragRestoreEventLike } from './designer-shared/utils'
