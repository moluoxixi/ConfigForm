import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import React from 'react'
import { DateMaterialCardPreview } from '../components/date'
import { InputMaterialCardPreview } from '../components/input'
import { NumberMaterialCardPreview } from '../components/number'
import { SelectMaterialCardPreview } from '../components/select'
import { SwitchMaterialCardPreview } from '../components/switch'
import { TextareaMaterialCardPreview } from '../components/textarea'
import { LayoutCardMaterialCardPreview } from '../layouts/layout-card'
import { LayoutCollapseMaterialCardPreview } from '../layouts/layout-collapse'
import { LayoutTabsMaterialCardPreview } from '../layouts/layout-tabs'

const MATERIAL_CARD_RENDERERS: Record<string, () => React.ReactElement> = {
  input: InputMaterialCardPreview,
  textarea: TextareaMaterialCardPreview,
  select: SelectMaterialCardPreview,
  number: NumberMaterialCardPreview,
  switch: SwitchMaterialCardPreview,
  date: DateMaterialCardPreview,
  'layout-card': LayoutCardMaterialCardPreview,
  'layout-tabs': LayoutTabsMaterialCardPreview,
  'layout-collapse': LayoutCollapseMaterialCardPreview,
}

export function renderMaterialCardPreview(item: MaterialItem): React.ReactElement {
  const renderer = MATERIAL_CARD_RENDERERS[item.id] ?? InputMaterialCardPreview
  return renderer()
}
