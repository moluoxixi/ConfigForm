import type React from 'react'
import type { DesignerMaterialToolbarRendererProps } from '../../types'

/**
 * Designer Material Toolbar Renderer：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Material Toolbar Renderer 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
