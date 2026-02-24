import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import type { DesignerPropertiesPaneProps } from './types'
import { nodesToSchema, schemaSignature } from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/react'
import { useMemo } from 'react'
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
  const paneRenderKey = useMemo(
    () => [
      schemaSignature(nodesToSchema(props.nodes)),
      props.selectedField?.id ?? '',
      props.selectedContainer?.id ?? '',
      props.selectedSection?.id ?? '',
    ].join(':'),
    [
      props.nodes,
      props.selectedContainer?.id,
      props.selectedField?.id,
      props.selectedSection?.id,
    ],
  )

  const paneSchema = useMemo<ISchema>(() => ({
    type: 'object',
    properties: {
      content: {
        type: 'void',
        component: 'DesignerPropertiesRenderer',
        componentProps: { ...props },
      },
    },
  }), [props])

  return (
    <ConfigForm
      key={paneRenderKey}
      schema={paneSchema}
      components={{
        DesignerPropertiesRenderer,
      }}
      className="cf-lc-pane-configform-shell"
    />
  )
}
