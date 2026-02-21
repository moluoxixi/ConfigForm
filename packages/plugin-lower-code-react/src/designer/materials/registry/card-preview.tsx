import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
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
  'input': InputMaterialCardPreview,
  'textarea': TextareaMaterialCardPreview,
  'select': SelectMaterialCardPreview,
  'number': NumberMaterialCardPreview,
  'switch': SwitchMaterialCardPreview,
  'date': DateMaterialCardPreview,
  'layout-card': LayoutCardMaterialCardPreview,
  'layout-tabs': LayoutTabsMaterialCardPreview,
  'layout-collapse': LayoutCollapseMaterialCardPreview,
}

/**
 * render Material Card Preview：负责“渲染render Material Card Preview”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 render Material Card Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function renderMaterialCardPreview(item: MaterialItem): React.ReactElement {
  const renderer = MATERIAL_CARD_RENDERERS[item.id] ?? InputMaterialCardPreview
  return renderer()
}
