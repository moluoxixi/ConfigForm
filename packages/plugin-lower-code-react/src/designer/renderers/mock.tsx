import type { ResolvedLowCodeDesignerRenderers } from './types'
import { renderFieldPreviewControl } from '../materials/registry/field-preview-control'
import { renderMaterialCardPreview } from '../materials/registry/card-preview'

export function createMockRenderers(): ResolvedLowCodeDesignerRenderers {
  return {
    renderMaterialPreview: item => renderMaterialCardPreview(item),
    renderFieldPreviewControl: node => renderFieldPreviewControl(node),
  }
}
