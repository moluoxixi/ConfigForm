import type {
  CompiledField,
  CompiledSchema,
  CompileOptions,
  ISchema,
} from './types'
import { isArray, isObject } from '@moluoxixi/shared'

/** 默认类型 → 组件映射 */
const DEFAULT_COMPONENT_MAPPING: Record<string, string> = {
  string: 'Input',
  number: 'InputNumber',
  boolean: 'Switch',
  date: 'DatePicker',
}

/** 默认装饰器 */
const DEFAULT_DECORATOR = 'FormItem'

/**
 * Schema 编译不再使用模块级缓存。
 *
 * 原因：WeakMap 以对象引用为 key，无法检测响应式代理内部属性变化，
 * 导致修改 schema 属性后仍返回旧的编译结果。
 * 缓存职责交给调用方（Vue 的 computed、React 的 useMemo）。
 */

/**
 * 推断组件名
 *
 * 优先级：schema.component > enum/dataSource → Select > type 映射
 */
function resolveComponent(schema: ISchema, mapping: Record<string, string>): string | unknown {
  if (schema.component)
    return schema.component

  if (schema.enum && schema.enum.length > 0)
    return 'Select'

  if (isArray(schema.dataSource) && (schema.dataSource as unknown[]).length > 0)
    return 'Select'

  if (isObject(schema.dataSource) && (schema.dataSource as Record<string, unknown>).url)
    return 'Select'

  const typeKey = schema.type ?? 'string'
  return mapping[typeKey] ?? 'Input'
}

/**
 * 推断装饰器名
 *
 * void 节点不需要 decorator；其他节点默认 FormItem。
 */
function resolveDecorator(schema: ISchema, defaultDecorator: string): string | unknown {
  if (schema.decorator)
    return schema.decorator
  if (schema.type === 'void')
    return ''
  return defaultDecorator
}

/**
 * 将 enum 简写标准化为 dataSource
 */
function normalizeEnum(schema: ISchema): ISchema {
  if (!schema.enum)
    return schema

  const dataSource = schema.enum.map((item) => {
    if (isObject(item))
      return item as { label: string, value: unknown, disabled?: boolean }
    return { label: String(item), value: item }
  })

  return { ...schema, dataSource: dataSource as unknown[] } as ISchema
}

/** 拼接路径，跳过空字符串 */
function joinPath(parent: string, name: string): string {
  return parent ? `${parent}.${name}` : name
}

/**
 * 递归编译 schema 节点
 *
 * 核心：同时维护 address（含 void）和 dataPath（跳过 void）两条路径。
 * 参考 Formily 的 address / path 分离设计。
 *
 * @param name - 当前节点 key
 * @param schema - 当前节点 schema
 * @param parentAddress - 父节点的 address（含 void）
 * @param parentDataPath - 父节点的 dataPath（跳过 void）
 */
function compileNode(
  name: string,
  schema: ISchema,
  parentAddress: string,
  parentDataPath: string,
  mapping: Record<string, string>,
  defaultDecorator: string,
  result: Map<string, CompiledField>,
  order: string[],
): void {
  const address = joinPath(parentAddress, name)
  const isVoid = schema.type === 'void'
  const isArrayField = schema.type === 'array'

  /* void 节点不参与数据路径 */
  const dataPath = isVoid ? parentDataPath : joinPath(parentDataPath, name)

  const normalizedSchema = normalizeEnum(schema)
  const children: string[] = []

  /* 递归编译 properties 子节点 */
  if (schema.properties) {
    const entries = Object.entries(schema.properties)
    entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    for (const [childName, childSchema] of entries) {
      const childAddress = joinPath(address, childName)
      children.push(childAddress)
      compileNode(childName, childSchema, address, dataPath, mapping, defaultDecorator, result, order)
    }
  }

  /* 数组项 */
  if (isArrayField && schema.items) {
    const itemAddress = `${address}.*`
    children.push(itemAddress)
    compileNode('*', schema.items, address, dataPath, mapping, defaultDecorator, result, order)
  }

  const compiled: CompiledField = {
    address,
    dataPath,
    schema: normalizedSchema,
    resolvedComponent: resolveComponent(normalizedSchema, mapping),
    resolvedDecorator: resolveDecorator(normalizedSchema, defaultDecorator),
    isVoid,
    isArray: isArrayField,
    children,
  }

  result.set(address, compiled)
  order.push(address)
}

/**
 * 编译 ISchema
 *
 * 将声明式 Schema 树转为扁平化的编译结果：
 * - address / dataPath 分离（void 节点不参与数据路径）
 * - 组件推断（type/enum → 组件名）
 * - 装饰器推断（非 void 默认 FormItem）
 * - enum 标准化为 dataSource
 * - 字段渲染顺序 + 子字段关系
 */
export function compileSchema(schema: ISchema, options?: CompileOptions): CompiledSchema {
  const mapping = { ...DEFAULT_COMPONENT_MAPPING, ...options?.componentMapping }
  const defaultDecorator = options?.defaultDecorator ?? DEFAULT_DECORATOR
  const fields = new Map<string, CompiledField>()
  const fieldOrder: string[] = []

  if (schema.properties) {
    const entries = Object.entries(schema.properties)
    entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    for (const [name, childSchema] of entries) {
      compileNode(name, childSchema, '', '', mapping, defaultDecorator, fields, fieldOrder)
    }
  }

  return {
    root: schema,
    fields,
    fieldOrder,
  }
}
