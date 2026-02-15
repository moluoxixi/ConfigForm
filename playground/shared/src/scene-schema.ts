import type { ISchema } from '@moluoxixi/core'
import type { SceneConfig } from './types'

/**
 * 解析当前场景应使用的 schema。
 *
 * - 未配置 schemaVariants 时：直接返回静态 schema
 * - 配置 schemaVariants 且有选中值时：使用 factory 生成变体 schema
 */
export function resolveSceneSchema(config: SceneConfig, variantValue?: string): ISchema {
  const variants = config.schemaVariants
  if (variants && variantValue)
    return variants.factory(variantValue)
  return config.schema
}
