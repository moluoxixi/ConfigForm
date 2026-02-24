import type { MaterialFieldItem } from '../../designer'
import { DATE_MATERIAL } from './date'
import { INPUT_MATERIAL } from './input'
import { NUMBER_MATERIAL } from './number'
import { SELECT_MATERIAL } from './select'
import { SWITCH_MATERIAL } from './switch'
import { TEXTAREA_MATERIAL } from './textarea'

export {
  DATE_MATERIAL,
  INPUT_MATERIAL,
  NUMBER_MATERIAL,
  SELECT_MATERIAL,
  SWITCH_MATERIAL,
  TEXTAREA_MATERIAL,
}

/**
 * COMPONENT MATERIALS：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-core/src/materials/components/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const COMPONENT_MATERIALS: MaterialFieldItem[] = [
  INPUT_MATERIAL,
  TEXTAREA_MATERIAL,
  SELECT_MATERIAL,
  NUMBER_MATERIAL,
  SWITCH_MATERIAL,
  DATE_MATERIAL,
]
