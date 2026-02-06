/** 类型守卫工具集 */

const toString = Object.prototype.toString

export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

export function isFunction(val: unknown): val is (...args: any[]) => any {
  return typeof val === 'function'
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

export function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (!isObject(val))
    return false
  const proto = Object.getPrototypeOf(val)
  return proto === Object.prototype || proto === null
}

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

export function isDate(val: unknown): val is Date {
  return toString.call(val) === '[object Date]'
}

export function isRegExp(val: unknown): val is RegExp {
  return toString.call(val) === '[object RegExp]'
}

export function isPromise<T = unknown>(val: unknown): val is Promise<T> {
  return (
    val instanceof Promise
    || (isObject(val) && isFunction((val as Record<string, unknown>).then) && isFunction((val as Record<string, unknown>).catch))
  )
}

export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

export function isEmpty(val: unknown): boolean {
  if (isNullish(val))
    return true
  if (isString(val))
    return val.trim().length === 0
  if (isArray(val))
    return val.length === 0
  if (isObject(val))
    return Object.keys(val).length === 0
  return false
}

export function isUndefined(val: unknown): val is undefined {
  return val === undefined
}

/** 判断一个值是否可用作表单字段值（非 null/undefined） */
export function isValid(val: unknown): boolean {
  return !isNullish(val)
}
