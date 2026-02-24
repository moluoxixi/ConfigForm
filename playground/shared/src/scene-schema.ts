import type { ISchema } from '@moluoxixi/core'
import type { SceneConfig } from './types'

/**
 * 解析当前场景应使用的 schema。
 *
 * - 未配置 schemaVariants 时：直接返回静态 schema
 * - 配置 schemaVariants 且有选中值时：使用 factory 生成变体 schema
 * @param config 参数 `config`用于提供可选配置，调整当前功能模块的执行策略。
 * @param [variantValue] 参数 `variantValue`用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function resolveSceneSchema(config: SceneConfig, variantValue?: string): ISchema {
  const variants = config.schemaVariants
  if (variants && variantValue)
    return variants.factory(variantValue)
  return config.schema
}
