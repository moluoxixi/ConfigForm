import type React from 'react'
import { CanvasPanel } from '../../../../canvas/CanvasPanel'
import type { DesignerCanvasBodyRendererProps } from '../../types'

export function DesignerCanvasBodyRenderer(
  props: DesignerCanvasBodyRendererProps,
): React.ReactElement {
  return <CanvasPanel {...props} />
}
