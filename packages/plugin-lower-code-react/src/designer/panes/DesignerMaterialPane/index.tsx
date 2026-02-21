import type { ISchema } from '@moluoxixi/core'
import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { DesignerMaterialPaneProps } from './types'
import { ConfigForm } from '@moluoxixi/react'
import React, { useMemo, useState } from 'react'
import { DesignerMaterialListRenderer } from './components/DesignerMaterialListRenderer'
import { DesignerMaterialToolbarRenderer } from './components/DesignerMaterialToolbarRenderer'

export type { DesignerMaterialPaneProps } from './types'

/**
 * Designer Material Pane：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Material Pane 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function DesignerMaterialPane({
  componentMaterials,
  layoutMaterials,
  materialHostRef,
  renderMaterialPreview,
}: DesignerMaterialPaneProps): React.ReactElement {
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

  const totalCount = componentMaterials.length + layoutMaterials.length
  const filteredCount = filteredComponentMaterials.length + filteredLayoutMaterials.length

  const paneSchema = useMemo<ISchema>(() => ({
    type: 'object',
    properties: {
      toolbar: {
        type: 'void',
        component: 'DesignerMaterialToolbarRenderer',
        componentProps: {
          keyword,
          onKeywordChange: setKeyword,
          totalCount,
          filteredCount,
        },
      },
      tabs: {
        type: 'void',
        component: 'LayoutTabs',
        properties: {
          components: {
            type: 'void',
            componentProps: { title: `组件 ${componentMaterials.length}` },
            properties: {
              componentList: {
                type: 'void',
                component: 'DesignerMaterialListRenderer',
                componentProps: {
                  items: filteredComponentMaterials,
                  renderMaterialPreview,
                },
              },
            },
          },
          layouts: {
            type: 'void',
            componentProps: { title: `布局组件 ${layoutMaterials.length}` },
            properties: {
              layoutList: {
                type: 'void',
                component: 'DesignerMaterialListRenderer',
                componentProps: {
                  items: filteredLayoutMaterials,
                  renderMaterialPreview,
                },
              },
            },
          },
        },
      },
    },
  }), [
    componentMaterials.length,
    filteredComponentMaterials,
    filteredCount,
    filteredLayoutMaterials,
    keyword,
    layoutMaterials.length,
    renderMaterialPreview,
    totalCount,
  ])

  return (
    <section className="cf-lc-panel cf-lc-panel--side">
      <div
        ref={materialHostRef}
        className="cf-lc-panel-body cf-lc-side-panel-body cf-lc-side-panel-shell cf-lc-material-panel-body"
      >
        <ConfigForm
          schema={paneSchema}
          components={{
            DesignerMaterialToolbarRenderer,
            DesignerMaterialListRenderer,
          }}
          className="cf-lc-material-pane-form cf-lc-pane-configform-shell"
        />
      </div>
    </section>
  )
}
