import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../types'
import { DesignerCardHeader } from '../shared/CardHeader'
import { MaterialPreview } from './MaterialPreview'

/**
 * Material Card Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/MaterialCard.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface MaterialCardProps {
  item: MaterialItem
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
  readonly?: boolean
}

/**
 * Material Card：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/MaterialCard.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.item 当前物料项，包含物料 id、名称与描述信息。
 * @param param1.renderMaterialPreview 物料预览渲染函数，用于输出卡片内容。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function MaterialCard({
  item,
  renderMaterialPreview,
  readonly = false,
}: MaterialCardProps): React.ReactElement {
  return (
    <div data-material-id={item.id} className="cf-lc-material-item">
      <DesignerCardHeader
        title={item.label}
        description={item.description}
        className="cf-lc-material-head"
        titleClassName="cf-lc-material-title"
        descriptionClassName="cf-lc-material-desc-inline"
      />
      <MaterialPreview
        item={item}
        phase="material"
        renderMaterialPreview={renderMaterialPreview}
        readonly={readonly}
      />
    </div>
  )
}
