import type { ISchema } from '@moluoxixi/core'
import { nodesToSchema, schemaSignature } from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/react'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { DesignerCanvasBodyRenderer } from './components/DesignerCanvasBodyRenderer'
import { DesignerCanvasHeaderRenderer } from './components/DesignerCanvasHeaderRenderer'
import type { DesignerCanvasBodyRendererProps } from './types'

export type DesignerCanvasPaneProps = DesignerCanvasBodyRendererProps

export function DesignerCanvasPane(props: DesignerCanvasPaneProps): ReactElement {
  const paneRenderKey = useMemo(
    () => `${schemaSignature(nodesToSchema(props.nodes))}:${props.selectedId ?? ''}:${props.readonly ? '1' : '0'}`,
    [props.nodes, props.readonly, props.selectedId],
  )

  const paneSchema = useMemo<ISchema>(() => ({
    type: 'object',
    properties: {
      header: {
        type: 'void',
        component: 'DesignerCanvasHeaderRenderer',
      },
      body: {
        type: 'void',
        component: 'DesignerCanvasBodyRenderer',
        componentProps: props,
      },
    },
  }), [props])

  return (
    <section className="cf-lc-panel">
      <ConfigForm
        key={paneRenderKey}
        schema={paneSchema}
        components={{
          DesignerCanvasHeaderRenderer,
          DesignerCanvasBodyRenderer,
        }}
        className="cf-lc-pane-configform-shell"
      />
    </section>
  )
}
