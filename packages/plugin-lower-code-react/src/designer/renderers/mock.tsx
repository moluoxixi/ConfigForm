import type { ResolvedLowCodeDesignerRenderers } from './types'
import { renderMaterialCardPreview } from '../materials/registry/card-preview'
import { renderFieldPreviewControl } from '../materials/registry/field-preview-control'

/**
 * create Mock Renderers：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/mock.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function createMockRenderers(): ResolvedLowCodeDesignerRenderers {
  return {
    /**
     * renderMaterialPreview：执行当前功能逻辑。
     *
     * @param item 参数 item 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    renderMaterialPreview: item => renderMaterialCardPreview(item),
    /**
     * renderFieldPreviewControl：执行当前功能逻辑。
     *
     * @param node 参数 node 的输入说明。
     *
     * @returns 返回当前功能的处理结果。
     */

    renderFieldPreviewControl: node => renderFieldPreviewControl(node),
  }
}
