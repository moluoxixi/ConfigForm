import type React from 'react'
import type { DesignerMaterialToolbarRendererProps } from '../../types'
import { LOW_CODE_DESIGNER_TEXT } from '@moluoxixi/plugin-lower-code-core'

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
  const t = LOW_CODE_DESIGNER_TEXT.material
  return (
    <div className="cf-lc-material-toolbar">
      <div className="cf-lc-side-panel-header">
        <div className="cf-lc-side-panel-title">{t.title}</div>
        <div className="cf-lc-side-panel-meta">{t.hint}</div>
      </div>
      <div className="cf-lc-material-search-row">
        <input
          className="cf-lc-control-input cf-lc-material-search"
          value={keyword}
          onChange={event => onKeywordChange(event.target.value)}
          placeholder={t.searchPlaceholder}
        />
        {keyword
          ? (
              <button
                type="button"
                className="cf-lc-btn"
                onClick={() => onKeywordChange('')}
              >
                {t.clear}
              </button>
            )
          : null}
      </div>
      <div className="cf-lc-material-summary">
        <span className="cf-lc-side-pill">
          {t.total}
          {' '}
          {totalCount}
        </span>
        <span className="cf-lc-side-pill">
          {t.filtered}
          {' '}
          {filteredCount}
        </span>
        <span className="cf-lc-side-hint">{t.dragHint}</span>
      </div>
    </div>
  )
}
