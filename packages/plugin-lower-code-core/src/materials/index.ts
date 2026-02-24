import type { MaterialItem } from '../designer'
import { COMPONENT_MATERIALS } from './components'
import { LAYOUT_MATERIALS } from './layouts'

export { COMPONENT_MATERIALS, LAYOUT_MATERIALS }

/**
 * MATERIALS：。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const MATERIALS: MaterialItem[] = [...COMPONENT_MATERIALS, ...LAYOUT_MATERIALS]
