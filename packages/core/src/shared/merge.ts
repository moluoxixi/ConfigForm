import { isArray, isPlainObject } from './is'

/**
 * 深度合并对象
 * - 数组：替换（不合并）
 * - 普通对象：递归合并
 * - 其他类型：source 覆盖 target
 * @param target 目标对象（会被原地修改）。
 * @param sources 待合并的源对象列表。
 * @returns 返回合并后的目标对象引用。
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  for (const source of sources) {
    if (!isPlainObject(source))
      continue
    const keys = Object.keys(source) as (keyof T & string)[]
    for (const key of keys) {
      const targetVal = target[key]
      const sourceVal = source[key]

      if (isPlainObject(targetVal) && isPlainObject(sourceVal)) {
        target[key] = deepMerge(
          { ...(targetVal as Record<string, unknown>) },
          sourceVal as Record<string, unknown>,
        ) as T[typeof key]
      }
      else if (isArray(sourceVal)) {
        target[key] = [...sourceVal] as T[typeof key]
      }
      else if (sourceVal !== undefined) {
        target[key] = sourceVal as T[typeof key]
      }
    }
  }
  return target
}

/**
 * 浅合并对象（仅合并第一层）
 * @param target 目标对象（会被原地修改）。
 * @param sources 待合并的源对象列表。
 * @returns 返回合并后的目标对象引用。
 */
export function shallowMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return Object.assign(target, ...sources)
}
