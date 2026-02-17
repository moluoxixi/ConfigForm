import type { MaterialItem } from '../designer'
import { COMPONENT_MATERIALS } from './components'
import { LAYOUT_MATERIALS } from './layouts'

export { COMPONENT_MATERIALS, LAYOUT_MATERIALS }

export const MATERIALS: MaterialItem[] = [...COMPONENT_MATERIALS, ...LAYOUT_MATERIALS]
