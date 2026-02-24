import type React from 'react'
import type { LowCodeDesignerRenderers } from '../types'
import type { ResolvedLowCodeDesignerRenderers, ResolveLowCodeDesignerRenderersOptions } from './types'
import { isValidElement } from 'react'

/**
 * to Element：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/resolve.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param node 参数 `node`用于提供节点数据并定位或更新目标节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function toElement(node: React.ReactNode): React.ReactElement {
  if (isValidElement(node))
    return node
  return <>{node}</>
}

/**
 * merge Renderers：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/resolve.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.mode 渲染器解析模式（registry 或 fallback）。
 * @param param1.custom 外部传入的自定义渲染器集合。
 * @param param1.fallback 兜底渲染器集合。
 * @param param1.builtin 内置渲染器集合。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function mergeRenderers({
  mode,
  custom,
  fallback,
  builtin,
}: ResolveLowCodeDesignerRenderersOptions): ResolvedLowCodeDesignerRenderers {
  const useBuiltin = mode === 'registry' ? builtin : fallback

  return {
    /**
     * renderMaterialPreview：执行当前功能逻辑。
     *
     * @param item 参数 item 的输入说明。
     * @param context 参数 context 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    renderMaterialPreview: (item, context) => {
      const customNode = custom?.renderMaterialPreview?.(item, context)
      if (customNode !== undefined)
        return toElement(customNode)
      return useBuiltin.renderMaterialPreview(item, context)
    },
    /**
     * renderFieldPreviewControl：执行当前功能逻辑。
     *
     * @param node 参数 node 的输入说明。
     * @param context 参数 context 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    renderFieldPreviewControl: (node, context) => {
      const customNode = custom?.renderFieldPreviewControl?.(node, context)
      if (customNode !== undefined)
        return toElement(customNode)
      return useBuiltin.renderFieldPreviewControl(node, context)
    },
  }
}

/**
 * is Custom Renderer Provided：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/resolve.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param renderers 参数 `renderers`用于提供当前函数执行所需的输入信息。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
 */
export function isCustomRendererProvided(renderers: LowCodeDesignerRenderers | undefined): boolean {
  return Boolean(renderers?.renderMaterialPreview || renderers?.renderFieldPreviewControl)
}
