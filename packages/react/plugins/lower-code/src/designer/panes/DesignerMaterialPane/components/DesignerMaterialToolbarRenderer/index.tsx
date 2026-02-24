import type React from 'react'
import type { DesignerMaterialToolbarRendererProps } from '../../types'

/**
 * Designer Material Toolbar Renderer：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/components/DesignerMaterialToolbarRenderer/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.keyword 当前搜索关键字。
 * @param param1.onKeywordChange 关键字变更回调。
 * @param param1.totalCount 全部物料数量。
 * @param param1.filteredCount 当前筛选后数量。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DesignerMaterialToolbarRenderer({
  keyword,
  onKeywordChange,
  totalCount,
  filteredCount,
}: DesignerMaterialToolbarRendererProps): React.ReactElement {
  return (
    <div className="cf-lc-material-toolbar">
      <div className="cf-lc-side-panel-header">
        <div className="cf-lc-side-panel-title">物料</div>
        <div className="cf-lc-side-panel-meta">拖拽到画布</div>
      </div>
      <div className="cf-lc-material-search-row">
        <input
          className="cf-lc-control-input cf-lc-material-search"
          value={keyword}
          onChange={event => onKeywordChange(event.target.value)}
          placeholder="搜索组件或布局"
        />
        {keyword
          ? (
              <button
                type="button"
                className="cf-lc-btn"
                onClick={() => onKeywordChange('')}
              >
                清空
              </button>
            )
          : null}
      </div>
      <div className="cf-lc-material-summary">
        <span className="cf-lc-side-pill">
          全部
          {' '}
          {totalCount}
        </span>
        <span className="cf-lc-side-pill">
          筛选
          {' '}
          {filteredCount}
        </span>
        <span className="cf-lc-side-hint">拖拽后可在画布调整顺序</span>
      </div>
    </div>
  )
}
