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

/**
 * MATERIAL CARD RENDERERS：定义该模块复用的常量配置。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/registry/card-preview.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
 * render Material Card Preview：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/registry/card-preview.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param item 参数 `item`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function renderMaterialCardPreview(item: MaterialItem): React.ReactElement {
  const renderer = MATERIAL_CARD_RENDERERS[item.id] ?? InputMaterialCardPreview
  return renderer()
}
