import type React from 'react'

/**
 * React Component Map：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry-shared.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type ReactComponentMap = Map<string, React.ComponentType<any>>

/**
 * Registry Snapshot：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry-shared.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface RegistrySnapshot {
  components: ReactComponentMap
  decorators: ReactComponentMap
  actions: ReactComponentMap
  defaultDecorators: Map<string, string>
  readPrettyComponents: ReactComponentMap
}

/**
 * map To Record：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/registry-shared.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param map 参数 `map`用于提供当前函数执行所需的输入信息。
 * @returns 返回对象结构，其字段布局遵循当前模块约定。
 */
export function mapToRecord<T>(map: Map<string, T>): Record<string, T> {
  const record: Record<string, T> = {}
  for (const [key, value] of map.entries()) {
    record[key] = value
  }
  return record
}
