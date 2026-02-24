import type { MaterialContainerItem } from '../../designer'
import { LAYOUT_CARD_MATERIAL } from './layout-card'
import { LAYOUT_COLLAPSE_MATERIAL } from './layout-collapse'
import { LAYOUT_TABS_MATERIAL } from './layout-tabs'

export {
  LAYOUT_CARD_MATERIAL,
  LAYOUT_COLLAPSE_MATERIAL,
  LAYOUT_TABS_MATERIAL,
}

/**
 * LAYOUT MATERIALS：。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/layouts/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const LAYOUT_MATERIALS: MaterialContainerItem[] = [
  LAYOUT_CARD_MATERIAL,
  LAYOUT_TABS_MATERIAL,
  LAYOUT_COLLAPSE_MATERIAL,
]
