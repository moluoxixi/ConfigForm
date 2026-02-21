import type { ResolvedLowCodeDesignerRenderers } from './types'
import { renderMaterialCardPreview } from '../materials/registry/card-preview'
import { renderFieldPreviewControl } from '../materials/registry/field-preview-control'

/**
 * create Mock Renderers：负责“创建create Mock Renderers”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 create Mock Renderers 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function createMockRenderers(): ResolvedLowCodeDesignerRenderers {
  return {
    renderMaterialPreview: item => renderMaterialCardPreview(item),
    renderFieldPreviewControl: node => renderFieldPreviewControl(node),
  }
}
