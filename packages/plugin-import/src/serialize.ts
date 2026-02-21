/**
 * is Record：负责“判断is Record”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Record 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * ensure Plain Object：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 ensure Plain Object 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function ensurePlainObject(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error('[plugin-import] Import data must be a plain object.')
  }
  return input
}

/**
 * parse JSON：负责“解析parse JSON”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 parse JSON 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
export function parseJSON(input: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): Record<string, unknown> {
  const parsed = JSON.parse(input, reviver)
  return ensurePlainObject(parsed)
}
