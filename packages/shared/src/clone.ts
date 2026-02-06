import { isArray, isDate, isPlainObject, isRegExp } from './is'

/**
 * 深拷贝对象
 * 支持 Date / RegExp / 普通对象 / 数组
 */
export function deepClone<T>(source: T, seen = new WeakMap()): T {
  if (source === null || typeof source !== 'object') {
    return source
  }

  /* 避免循环引用 */
  if (seen.has(source as object)) {
    return seen.get(source as object) as T
  }

  if (isDate(source)) {
    return new Date(source.getTime()) as T
  }

  if (isRegExp(source)) {
    return new RegExp(source.source, source.flags) as T
  }

  if (isArray(source)) {
    const cloned: unknown[] = []
    seen.set(source as object, cloned)
    for (let i = 0; i < source.length; i++) {
      cloned[i] = deepClone(source[i], seen)
    }
    return cloned as T
  }

  if (isPlainObject(source)) {
    const cloned: Record<string, unknown> = {}
    seen.set(source as object, cloned)
    const keys = Object.keys(source)
    for (const key of keys) {
      cloned[key] = deepClone((source as Record<string, unknown>)[key], seen)
    }
    return cloned as T
  }

  /* Map / Set / 其他引用类型不深拷贝，直接返回 */
  return source
}
