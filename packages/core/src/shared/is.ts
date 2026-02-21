/**
 * 类型守卫工具集
 * is String：负责“判断is String”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is String 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * is Number：负责“判断is Number”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Number 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val)
}

/**
 * is Boolean：负责“判断is Boolean”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Boolean 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

/**
 * is Function：负责“判断is Function”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Function 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isFunction(val: unknown): val is (...args: any[]) => any {
  return typeof val === 'function'
}

/**
 * is Object：负责“判断is Object”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Object 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * is Plain Object：负责“判断is Plain Object”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Plain Object 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isPlainObject(val: unknown): val is Record<string, unknown> {
  if (!isObject(val))
    return false
  const proto = Object.getPrototypeOf(val)
  return proto === Object.prototype || proto === null
}

/**
 * is Array：负责“判断is Array”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Array 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val)
}

/**
 * is Date：负责“判断is Date”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Date 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isDate(val: unknown): val is Date {
  return toString.call(val) === '[object Date]'
}

/**
 * is Reg Exp：负责“判断is Reg Exp”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Reg Exp 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isRegExp(val: unknown): val is RegExp {
  return toString.call(val) === '[object RegExp]'
}

export function isPromise<T = unknown>(val: unknown): val is Promise<T> {
  return (
    val instanceof Promise
    || (isObject(val) && isFunction((val as Record<string, unknown>).then) && isFunction((val as Record<string, unknown>).catch))
  )
}

/**
 * is Nullish：负责“判断is Nullish”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Nullish 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

/**
 * is Empty：负责“判断is Empty”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Empty 的主要职责边界，便于维护者快速理解函数在链路中的定位。
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
 * is Undefined：负责“判断is Undefined”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Undefined 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function isUndefined(val: unknown): val is undefined {
  return val === undefined
}

/** 判断一个值是否可用作表单字段值（非 null/undefined） */
export function isValid(val: unknown): boolean {
  return !isNullish(val)
}
