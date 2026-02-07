import type { ISchema } from './types'
import { deepMerge, isObject } from '@moluoxixi/shared'

/**
 * 合并两个 ISchema
 *
 * 适用于 Schema 继承/覆盖场景：
 * - 基础 Schema + 特定业务覆盖
 * - 后端下发 Schema + 前端本地补丁
 *
 * @param base - 基础 Schema
 * @param override - 覆盖 Schema（部分字段）
 * @returns 合并后的 Schema
 */
export function mergeSchema(
  base: ISchema,
  override: Partial<ISchema>,
): ISchema {
  const result: ISchema = { ...base }

  /* 合并 properties（递归深度合并） */
  if (override.properties) {
    const mergedProps: Record<string, ISchema> = { ...base.properties }
    for (const [name, propOverride] of Object.entries(override.properties)) {
      const baseProp = mergedProps[name]
      if (baseProp && isObject(propOverride)) {
        mergedProps[name] = deepMerge(
          { ...baseProp } as Record<string, unknown>,
          propOverride as Record<string, unknown>,
        ) as unknown as ISchema
      }
      else {
        mergedProps[name] = propOverride
      }
    }
    result.properties = mergedProps
  }

  /* 合并 decoratorProps */
  if (override.decoratorProps) {
    result.decoratorProps = deepMerge(
      { ...(base.decoratorProps ?? {}) },
      override.decoratorProps as Record<string, unknown>,
    )
  }

  /* 合并 componentProps */
  if (override.componentProps) {
    result.componentProps = deepMerge(
      { ...(base.componentProps ?? {}) },
      override.componentProps as Record<string, unknown>,
    )
  }

  /* 合并 reactions */
  if (override.reactions) {
    result.reactions = [...(base.reactions ?? []), ...override.reactions]
  }

  /* 覆盖简单属性 */
  if (override.type !== undefined) result.type = override.type
  if (override.title !== undefined) result.title = override.title
  if (override.component !== undefined) result.component = override.component
  if (override.decorator !== undefined) result.decorator = override.decorator
  if (override.pattern !== undefined) result.pattern = override.pattern

  return result
}
