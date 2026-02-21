import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import type { DesignerPropertiesPaneProps } from './types'
import { nodesToSchema, schemaSignature } from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/react'
import { useMemo } from 'react'
import { DesignerPropertiesRenderer } from './components/DesignerPropertiesRenderer'

export type { DesignerPropertiesPaneProps } from './types'

/**
 * Designer Properties Pane：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Properties Pane 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function DesignerPropertiesPane(props: DesignerPropertiesPaneProps): ReactElement {
  const paneRenderKey = useMemo(
    () => [
      schemaSignature(nodesToSchema(props.nodes)),
      props.selectedField?.id ?? '',
      props.selectedContainer?.id ?? '',
      props.selectedSection?.id ?? '',
      props.readonly ? '1' : '0',
    ].join(':'),
    [
      props.nodes,
      props.readonly,
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
        componentProps: props,
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
