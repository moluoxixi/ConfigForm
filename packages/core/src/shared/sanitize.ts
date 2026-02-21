import { isObject } from './is'

/**
 * is Record：负责“判断is Record”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Record 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
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
