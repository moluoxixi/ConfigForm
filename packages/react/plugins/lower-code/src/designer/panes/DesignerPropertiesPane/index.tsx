import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import type { DesignerPropertiesPaneProps } from './types'
import { ConfigForm } from '@moluoxixi/ui-basic-react'
import { DesignerPropertiesRenderer } from './components/DesignerPropertiesRenderer'

export type { DesignerPropertiesPaneProps } from './types'

/**
 * Designer Properties Pane：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerPropertiesPane/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DesignerPropertiesPane(props: DesignerPropertiesPaneProps): ReactElement {
  const hasSelection = Boolean(props.selectedField || props.selectedContainer || props.selectedSection)
  const componentTab: ISchema = {
    type: 'void',
    componentProps: { title: '组件' },
    properties: {
      content: {
        type: 'void',
        component: 'DesignerPropertiesRenderer',
        componentProps: { ...props, tab: 'component' },
      },
    },
  }
  const formTab: ISchema = {
    type: 'void',
    componentProps: { title: '表单' },
    properties: {
      content: {
        type: 'void',
        component: 'DesignerPropertiesRenderer',
        componentProps: { ...props, tab: 'form' },
      },
    },
  }
  const paneSchema: ISchema = ({
    type: 'object',
    properties: {
      tabs: {
        type: 'void',
        component: 'LayoutTabs',
        properties: hasSelection
          ? { component: componentTab, form: formTab }
          : { form: formTab, component: componentTab },
      },
    },
  })

  return (
    <section className="cf-lc-panel cf-lc-panel--side">
      <div className="cf-lc-panel-body cf-lc-side-panel-body cf-lc-side-panel-shell">
        <div className="cf-lc-side-panel-header">
          <div className="cf-lc-side-panel-title">属性</div>
          <div className="cf-lc-side-panel-meta">
            {props.selectedField
              ? `字段 · ${props.selectedField.name}`
              : props.selectedContainer
                ? `容器 · ${props.selectedContainer.component}`
                : props.selectedSection
                  ? `分组 · ${props.selectedSection.name}`
                  : '未选择节点'}
          </div>
        </div>
        <ConfigForm
          schema={paneSchema}
          components={{
            DesignerPropertiesRenderer,
          }}
          formTag={false}
          className="cf-lc-pane-configform-shell cf-lc-properties-pane-form"
        />
      </div>
    </section>
  )
}
