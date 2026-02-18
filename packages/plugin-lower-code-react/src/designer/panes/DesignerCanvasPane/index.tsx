import type { ComponentProps, ReactElement } from 'react'
import { CanvasPanel } from '../../canvas/CanvasPanel'

export type DesignerCanvasPaneProps = ComponentProps<typeof CanvasPanel>

export function DesignerCanvasPane(props: DesignerCanvasPaneProps): ReactElement {
  return <CanvasPanel {...props} />
}
