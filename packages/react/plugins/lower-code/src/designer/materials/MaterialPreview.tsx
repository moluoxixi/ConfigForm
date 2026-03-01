import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type {
  LowCodeDesignerRenderContext,
} from '../types'
import { MaterialMaskLayer } from '../shared/MaterialMaskLayer'

/**
 * Material Preview Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/MaterialPreview.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface MaterialPreviewProps {
  item: MaterialItem
  phase: LowCodeDesignerRenderContext['phase']
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
  readonly?: boolean
}

/**
 * Material Preview：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/materials/MaterialPreview.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.item 当前物料项，用于决定预览内容。
 * @param param1.phase 渲染阶段（物料区/画布/预览），用于切换交互行为。
 * @param param1.renderMaterialPreview 物料预览渲染函数。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function MaterialPreview({
  item,
  phase,
  renderMaterialPreview,
  readonly = false,
}: MaterialPreviewProps): React.ReactElement {
  return (
    <div className={`cf-lc-material-preview cf-lc-material-preview--material cf-lc-material-preview--${item.id}`}>
      <MaterialMaskLayer>
        {renderMaterialPreview(item, { phase, readonly })}
      </MaterialMaskLayer>
    </div>
  )
}
