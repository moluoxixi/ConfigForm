import type { ISchema } from './types'
import { deepMerge, isObject } from '@moluoxixi/shared'

/**
 * 需要深度合并（而非直接覆盖）的 object 类属性。
 * 这些属性在 base 和 override 都存在时需要递归合并子属性。
 */
const DEEP_MERGE_KEYS = new Set<keyof ISchema>([
  'decoratorProps',
  'componentProps',
])

/**
 * 需要数组拼接（而非直接覆盖）的 array 类属性。
 * override 的规则追加到 base 的规则列表之后。
 */
const CONCAT_KEYS = new Set<keyof ISchema>([
  'reactions',
  'rules',
])

/**
 * 合并两个 ISchema
 *
 * 适用于 Schema 继承/覆盖场景：
 * - 基础 Schema + 特定业务覆盖
 * - 后端下发 Schema + 前端本地补丁
 *
 * 合并策略：
 * - properties：递归深度合并子节点
 * - items：递归合并数组项 Schema
 * - decoratorProps/componentProps：deepMerge
 * - reactions/rules：数组拼接
 * - 其余属性：override 存在则覆盖 base
 *
 * @param base - 基础 Schema
 * @param override - 覆盖 Schema（部分字段）
 * @returns 合并后的 Schema
 */
export function mergeSchema(
  base: ISchema,
  override: Partial<ISchema>,
): ISchema {
  if (!base)
    return { ...override } as ISchema
  if (!override)
    return { ...base }

  const result: ISchema = { ...base }

  for (const key of Object.keys(override) as Array<keyof ISchema>) {
    const overrideVal = override[key]
    if (overrideVal === undefined)
      continue

    /* properties：递归合并每个子节点 */
    if (key === 'properties' && isObject(overrideVal)) {
      const mergedProps: Record<string, ISchema> = { ...base.properties }
      for (const [name, propOverride] of Object.entries(overrideVal as Record<string, ISchema>)) {
        const baseProp = mergedProps[name]
        if (baseProp && isObject(propOverride)) {
          mergedProps[name] = mergeSchema(baseProp, propOverride)
        }
        else {
          mergedProps[name] = propOverride
        }
      }
      result.properties = mergedProps
      continue
    }

    /* items：递归合并数组项 Schema */
    if (key === 'items' && isObject(overrideVal)) {
      result.items = base.items
        ? mergeSchema(base.items, overrideVal as Partial<ISchema>)
        : overrideVal as ISchema
      continue
    }

    /* decoratorProps / componentProps：深度合并对象属性 */
    if (DEEP_MERGE_KEYS.has(key) && isObject(overrideVal)) {
      const baseVal = (base as Record<string, unknown>)[key]
      ;(result as Record<string, unknown>)[key] = deepMerge(
        { ...(isObject(baseVal) ? baseVal : {}) } as Record<string, unknown>,
        overrideVal as Record<string, unknown>,
      )
      continue
    }

    /* reactions / rules：数组拼接 */
    if (CONCAT_KEYS.has(key) && Array.isArray(overrideVal)) {
      const baseArr = (base as Record<string, unknown>)[key]
      ;(result as Record<string, unknown>)[key] = [
        ...(Array.isArray(baseArr) ? baseArr : []),
        ...overrideVal,
      ]
      continue
    }

    /* 其余属性：直接覆盖 */
    ;(result as Record<string, unknown>)[key] = overrideVal
  }

  return result
}
