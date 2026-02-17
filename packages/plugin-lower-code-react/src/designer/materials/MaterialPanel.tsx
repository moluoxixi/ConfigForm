import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import React, { useMemo, useState } from 'react'
import type { LowCodeDesignerRenderContext } from '../types'
import { MaterialCard } from './MaterialCard'

interface MaterialPanelProps {
  componentMaterials: MaterialItem[]
  layoutMaterials: MaterialItem[]
  materialHostRef: React.RefObject<HTMLDivElement>
  renderMaterialPreview: (item: MaterialItem, context: LowCodeDesignerRenderContext) => React.ReactElement
}

type MaterialTab = 'components' | 'layouts'

export function MaterialPanel({
  componentMaterials,
  layoutMaterials,
  materialHostRef,
  renderMaterialPreview,
}: MaterialPanelProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<MaterialTab>('components')
  const [keyword, setKeyword] = useState('')

  const normalizedKeyword = keyword.trim().toLowerCase()
  const filterByKeyword = (item: MaterialItem): boolean => {
    if (!normalizedKeyword)
      return true
    const text = `${item.label} ${item.description ?? ''}`.toLowerCase()
    return text.includes(normalizedKeyword)
  }

  const filteredComponentMaterials = useMemo(
    () => componentMaterials.filter(filterByKeyword),
    [componentMaterials, normalizedKeyword],
  )
  const filteredLayoutMaterials = useMemo(
    () => layoutMaterials.filter(filterByKeyword),
    [layoutMaterials, normalizedKeyword],
  )

  const componentCount = componentMaterials.length
  const layoutCount = layoutMaterials.length
  const totalCount = componentCount + layoutCount
  const filteredCount = filteredComponentMaterials.length + filteredLayoutMaterials.length
  const activeItems = activeTab === 'components'
    ? filteredComponentMaterials
    : filteredLayoutMaterials
  const activeLabel = activeTab === 'components' ? '组件' : '布局组件'

  return (
    <section className="cf-lc-panel cf-lc-panel--side">
      <div ref={materialHostRef} className="cf-lc-panel-body cf-lc-side-panel-body cf-lc-side-panel-shell cf-lc-material-panel-body">
        <div className="cf-lc-side-panel-header">
          <div className="cf-lc-side-panel-title">物料</div>
          <div className="cf-lc-side-panel-meta">拖拽到画布</div>
        </div>

        <div className="cf-lc-material-toolbar">
          <div className="cf-lc-material-search-row">
            <input
              className="cf-lc-control-input cf-lc-material-search"
              value={keyword}
              onChange={event => setKeyword(event.target.value)}
              placeholder="搜索组件或布局"
            />
            {keyword && (
              <button
                type="button"
                className="cf-lc-btn"
                onClick={() => setKeyword('')}
              >
                清空
              </button>
            )}
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

        <div className="cf-lc-material-tabs" role="tablist" aria-label="物料分类">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'components'}
            className={`cf-lc-material-tab ${activeTab === 'components' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('components')}
          >
            <span className="cf-lc-material-tab-content">
              <span>组件</span>
              <span className="cf-lc-material-tab-count">{componentCount}</span>
            </span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'layouts'}
            className={`cf-lc-material-tab ${activeTab === 'layouts' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('layouts')}
          >
            <span className="cf-lc-material-tab-content">
              <span>布局组件</span>
              <span className="cf-lc-material-tab-count">{layoutCount}</span>
            </span>
          </button>
        </div>

        <div className="cf-lc-material-current">
          当前：
          {' '}
          {activeLabel}
          {' '}
          {activeItems.length}
        </div>

        <div className="cf-lc-side-scroll">
          <div className="cf-lc-material-list-wrap">
            <div className={`cf-lc-material-list cf-lc-material-list--tab ${activeTab === 'components' ? 'is-active' : 'is-hidden'}`} data-cf-material-list="true">
              {filteredComponentMaterials.map(item => (
                <MaterialCard
                  key={item.id}
                  item={item}
                  renderMaterialPreview={renderMaterialPreview}
                />
              ))}
            </div>

            <div className={`cf-lc-material-list cf-lc-material-list--tab ${activeTab === 'layouts' ? 'is-active' : 'is-hidden'}`} data-cf-material-list="true">
              {filteredLayoutMaterials.map(item => (
                <MaterialCard
                  key={item.id}
                  item={item}
                  renderMaterialPreview={renderMaterialPreview}
                />
              ))}
            </div>

            {activeItems.length === 0 && (
              <div className="cf-lc-empty cf-lc-empty--compact">
                未找到匹配物料，请调整搜索关键词。
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  )
}
