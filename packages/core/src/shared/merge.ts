import { isArray, isPlainObject } from './is'

/**
 * 深度合并对象
 * - 数组：替换（不合并）
 * - 普通对象：递归合并
 * - 其他类型：source 覆盖 target
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @param sources 参数 `sources`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * @param target 参数 `target`用于提供当前函数执行所需的输入信息。
 * @param sources 参数 `sources`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function shallowMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  return Object.assign(target, ...sources)
}
