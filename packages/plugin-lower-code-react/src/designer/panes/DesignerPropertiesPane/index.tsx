import type { ISchema } from '@moluoxixi/core'
import { nodesToSchema, schemaSignature } from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/react'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { DesignerPropertiesRenderer } from './components/DesignerPropertiesRenderer'
import type { DesignerPropertiesPaneProps } from './types'

export type { DesignerPropertiesPaneProps } from './types'

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
