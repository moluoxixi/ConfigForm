/**
 * 判断值是否为字符串。
 * @param val 待判断值。
 * @returns 当且仅当 val 的运行时类型为 string 时返回 true。
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * 判断值是否为有效数字（排除 NaN）。
 * @param val 待判断值。
 * @returns 当 val 为 number 且不是 NaN 时返回 true。
 */
export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

/**
 * 判断值是否为布尔类型。
 * @param val 待判断值。
 * @returns 当 val 为 true 或 false 时返回 true。
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

/**
 * 判断值是否为函数。
 * @param val 待判断值。
 * @returns 当 val 可被调用时返回 true。
 */
export function isFunction(val: unknown): val is (...args: any[]) => any {
  return typeof val === 'function'
}

/**
 * 判断值是否为对象字面意义上的“对象”。
 * 这里会排除 null 与数组。
 * @param val 待判断值。
 * @returns 当 val 为非 null 且非数组对象时返回 true。
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * 判断值是否为“纯对象”。
 * 纯对象指原型为 Object.prototype 或 null 的对象。
 * @param val 待判断值。
 * @returns 当 val 为纯对象时返回 true。
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (!isObject(val))
    return false
  const proto = Object.getPrototypeOf(val)
  return proto === Object.prototype || proto === null
}

/**
 * 判断值是否为数组。
 * @param val 待判断值。
 * @returns 当 val 为 Array 实例时返回 true。
 */
export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

/**
 * 判断值是否为 Date 对象。
 * @param val 待判断值。
 * @returns 当 val 为 Date 实例时返回 true。
 */
export function isDate(val: unknown): val is Date {
  return toString.call(val) === '[object Date]'
}

/**
 * 判断值是否为 RegExp 对象。
 * @param val 待判断值。
 * @returns 当 val 为 RegExp 实例时返回 true。
 */
export function isRegExp(val: unknown): val is RegExp {
  return toString.call(val) === '[object RegExp]'
}

/**
 * 判断值是否为 Promise 或 Promise-like 对象。
 * Promise-like 需同时具备 then 与 catch 两个函数属性。
 * @param val 待判断值。
 * @returns 当 val 可按 Promise 语义处理时返回 true。
 */
export function isPromise<T = unknown>(val: unknown): val is Promise<T> {
  return (
    val instanceof Promise
    || (isObject(val) && isFunction((val as Record<string, unknown>).then) && isFunction((val as Record<string, unknown>).catch))
  )
}

/**
 * 判断值是否为 null 或 undefined。
 * @param val 待判断值。
 * @returns 当 val 为 null 或 undefined 时返回 true。
 */
export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

/**
 * 判断值是否为空值语义。
 * 判定规则：
 * 1. null / undefined 视为空。
 * 2. 字符串在 trim 后长度为 0 视为空。
 * 3. 数组长度为 0 视为空。
 * 4. 对象无可枚举自有属性视为空。
 * @param val 待判断值。
 * @returns 当值满足空语义时返回 true。
 */
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

/**
 * 判断值是否严格为 undefined。
 * @param val 待判断值。
 * @returns 当值为 undefined 时返回 true。
 */
export function isUndefined(val: unknown): val is undefined {
  return val === undefined
}

/**
 * 判断值是否可作为有效字段值（非 null 且非 undefined）。
 * @param val 待判断值。
 * @returns 当值有效时返回 true。
 */
export function isValid(val: unknown): boolean {
  return !isNullish(val)
}
