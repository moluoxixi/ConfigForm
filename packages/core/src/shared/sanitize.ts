import { isObject } from './is'

/**
 * 判断值是否为可迭代键值的普通记录对象。
 * @param value 待判断值。
 * @returns 当 value 是对象且不是数组时返回 true。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !Array.isArray(value)
}

/**
 * 深拷贝并过滤对象键（按前缀）
 *
 * - 支持任意层级嵌套对象/数组
 * - 仅过滤对象键名，数组索引不受影响
 * @param value 任意输入值。
 * @param excludePrefixes 需要过滤的键名前缀列表。
 * @returns 过滤后的深拷贝结果。
 */
export function cloneWithoutKeyPrefixes<T = unknown>(
  value: T,
  excludePrefixes: string[] = [],
): T {
  if (Array.isArray(value)) {
    // 数组本身不按前缀过滤，仅对元素递归执行同样规则。
    return value.map(item => cloneWithoutKeyPrefixes(item, excludePrefixes)) as T
  }

  if (!isRecord(value)) {
    return value
  }

  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    // 命中任何一个前缀即跳过该字段。
    if (excludePrefixes.some(prefix => prefix && key.startsWith(prefix))) {
      continue
    }
    next[key] = cloneWithoutKeyPrefixes(child, excludePrefixes)
  }
  return next as T
}
