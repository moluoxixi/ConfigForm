/** ConfigForm 内部可安全当作普通配置对象读取的记录类型。 */
export type PlainRecord = Record<string, unknown>

/** 判断未知值是否是普通对象；数组、null 和 class 实例不会通过。 */
export function isPlainRecord(value: unknown): value is PlainRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    return false

  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/** 读取可合并的普通对象选项；非法值直接抛错暴露配置来源。 */
export function readPlainRecord(value: unknown, optionName: string): PlainRecord {
  if (isPlainRecord(value))
    return value

  throw new TypeError(`${optionName} must be a plain object`)
}
