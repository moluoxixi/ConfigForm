import type { ISchema } from '@moluoxixi/core'
import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { DesignerMaterialPaneProps } from './types'
import { ConfigForm } from '@moluoxixi/ui-basic-react'
import React, { useMemo, useState } from 'react'
import { DesignerMaterialListRenderer } from './components/DesignerMaterialListRenderer'
import { DesignerMaterialToolbarRenderer } from './components/DesignerMaterialToolbarRenderer'

export type { DesignerMaterialPaneProps } from './types'

/**
 * Designer Material Pane：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.componentMaterials 基础组件物料列表。
 * @param param1.layoutMaterials 布局组件物料列表。
 * @param param1.materialHostRef 左侧物料区根节点引用。
 * @param param1.renderMaterialPreview 物料预览渲染函数。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DesignerMaterialPane({
  componentMaterials,
  layoutMaterials,
  materialHostRef,
  renderMaterialPreview,
}: DesignerMaterialPaneProps): React.ReactElement {
  const [keyword, setKeyword] = useState('')

  const normalizedKeyword = keyword.trim().toLowerCase()
  /**
   * filter By Keyword：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerMaterialPane/index.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param item 参数 `item`用于提供当前函数执行所需的输入信息。
   * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
   */
  const /**
         * filterByKeyword：执行当前功能逻辑。
         *
         * @param item 参数 item 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */
    filterByKeyword = (item: MaterialItem): boolean => {
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
          formTag={false}
          className="cf-lc-material-pane-form cf-lc-pane-configform-shell"
        />
      </div>
    </section>
  )
}
