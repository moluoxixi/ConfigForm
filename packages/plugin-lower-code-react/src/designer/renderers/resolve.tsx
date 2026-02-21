import type React from 'react'
import type { LowCodeDesignerRenderers } from '../types'
import type { ResolvedLowCodeDesignerRenderers, ResolveLowCodeDesignerRenderersOptions } from './types'
import { isValidElement } from 'react'

/**
 * to Element：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 to Element 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function toElement(node: React.ReactNode): React.ReactElement {
  if (isValidElement(node))
    return node
  return <>{node}</>
}

/**
 * merge Renderers：负责“合并merge Renderers”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 merge Renderers 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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

/**
 * is Custom Renderer Provided：负责“判断is Custom Renderer Provided”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Custom Renderer Provided 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isCustomRendererProvided(renderers: LowCodeDesignerRenderers | undefined): boolean {
  return Boolean(renderers?.renderMaterialPreview || renderers?.renderFieldPreviewControl)
}
