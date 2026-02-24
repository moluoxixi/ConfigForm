/**
 * is Record：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-import/src/serialize.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @returns 返回对象结构，其字段布局遵循当前模块约定。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * ensure Plain Object：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-import/src/serialize.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param input 参数 `input`用于提供当前函数执行所需的输入信息。
 * @returns 返回对象结构，其字段布局遵循当前模块约定。
 */
export function ensurePlainObject(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error('[plugin-import] Import data must be a plain object.')
  }
  return input
}

/**
 * parse JSON：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-import/src/serialize.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param input 参数 `input`用于提供当前函数执行所需的输入信息。
 * @param [reviver] 参数 `reviver`用于提供当前函数执行所需的输入信息。
 * @returns 返回对象结构，其字段布局遵循当前模块约定。
 */
export function parseJSON(input: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): Record<string, unknown> {
  const parsed = JSON.parse(input, reviver)
  return ensurePlainObject(parsed)
}
