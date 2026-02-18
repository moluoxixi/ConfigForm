import type React from 'react'
import type { DesignerMaterialToolbarRendererProps } from '../../types'

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
