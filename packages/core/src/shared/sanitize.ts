import { isObject } from './is'

function isRecord(value: unknown): value is Record<string, unknown> {
  return isObject(value) && !Array.isArray(value)
}

/**
 * 深拷贝并过滤对象键（按前缀）
 *
 * - 支持任意层级嵌套对象/数组
 * - 仅过滤对象键名，数组索引不受影响
 */
export function cloneWithoutKeyPrefixes<T = unknown>(
  value: T,
  excludePrefixes: string[] = [],
): T {
  if (Array.isArray(value)) {
    return value.map(item => cloneWithoutKeyPrefixes(item, excludePrefixes)) as T
  }

  if (!isRecord(value)) {
    return value
  }

  const next: Record<string, unknown> = {}
  for (const [key, child] of Object.entries(value)) {
    if (excludePrefixes.some(prefix => prefix && key.startsWith(prefix))) {
      continue
    }
    next[key] = cloneWithoutKeyPrefixes(child, excludePrefixes)
  }
  return next as T
}
