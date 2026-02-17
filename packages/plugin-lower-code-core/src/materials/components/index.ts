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

export const COMPONENT_MATERIALS: MaterialFieldItem[] = [
  INPUT_MATERIAL,
  TEXTAREA_MATERIAL,
  SELECT_MATERIAL,
  NUMBER_MATERIAL,
  SWITCH_MATERIAL,
  DATE_MATERIAL,
]
