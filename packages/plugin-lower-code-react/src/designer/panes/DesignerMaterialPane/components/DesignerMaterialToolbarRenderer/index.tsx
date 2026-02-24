import type React from 'react'
import type { DesignerMaterialToolbarRendererProps } from '../../types'

/**
 * Designer Material Toolbar Renderer：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/components/DesignerMaterialToolbarRenderer/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  keyword,
  onKeywordChange,
  totalCount,
  filteredCount,
}）用于提供当前函数执行所需的输入信息。
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
