import type React from 'react'
import type { LowCodeDesignerRenderers } from '../types'
import type { ResolvedLowCodeDesignerRenderers, ResolveLowCodeDesignerRenderersOptions } from './types'
import { isValidElement } from 'react'

function toElement(node: React.ReactNode): React.ReactElement {
  if (isValidElement(node))
    return node
  return <>{node}</>
}

export function mergeRenderers({
  mode,
  custom,
  fallback,
  builtin,
}: ResolveLowCodeDesignerRenderersOptions): ResolvedLowCodeDesignerRenderers {
  const useBuiltin = mode === 'registry' ? builtin : fallback

  return {
    renderMaterialPreview: (item, context) => {
      const customNode = custom?.renderMaterialPreview?.(item, context)
      if (customNode !== undefined)
        return toElement(customNode)
      return useBuiltin.renderMaterialPreview(item, context)
    },
    renderFieldPreviewControl: (node, context) => {
      const customNode = custom?.renderFieldPreviewControl?.(node, context)
      if (customNode !== undefined)
        return toElement(customNode)
      return useBuiltin.renderFieldPreviewControl(node, context)
    },
  }
}

export function isCustomRendererProvided(renderers: LowCodeDesignerRenderers | undefined): boolean {
  return Boolean(renderers?.renderMaterialPreview || renderers?.renderFieldPreviewControl)
}
