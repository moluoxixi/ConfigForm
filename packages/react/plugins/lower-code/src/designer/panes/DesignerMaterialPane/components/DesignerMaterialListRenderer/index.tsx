import type React from 'react'
import type { DesignerMaterialListRendererProps } from '../../types'
import { MaterialCard } from '../../../../materials/MaterialCard'

/**
 * Designer Material List Renderer：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/components/DesignerMaterialListRenderer/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.items 当前页签下要展示的物料列表。
 * @param param1.renderMaterialPreview 物料预览渲染函数。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DesignerMaterialListRenderer({
  items,
  renderMaterialPreview,
}: DesignerMaterialListRendererProps): React.ReactElement {
  return (
    <div className="cf-lc-side-scroll">
      <div className="cf-lc-material-list cf-lc-material-list--tab" data-cf-material-list="true">
        {items.map(item => (
          <MaterialCard
            key={item.id}
            item={item}
            renderMaterialPreview={renderMaterialPreview}
          />
        ))}
      </div>
      {items.length === 0
        ? (
            <div className="cf-lc-empty cf-lc-empty--compact">
              未找到匹配物料，请调整搜索关键词。
            </div>
          )
        : null}
    </div>
  )
}
