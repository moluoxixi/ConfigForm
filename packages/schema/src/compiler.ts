import type {
  CompiledField,
  CompiledSchema,
  CompileOptions,
  FieldSchema,
  FormSchema,
} from './types'
import { isArray, isObject } from '@moluoxixi/shared'

/** 默认类型 → 组件映射 */
const DEFAULT_COMPONENT_MAPPING: Record<string, string> = {
  'string': 'Input',
  'string:textarea': 'Textarea',
  'string:password': 'Password',
  'number': 'InputNumber',
  'boolean': 'Switch',
  'boolean:checkbox': 'Checkbox',
  'date': 'DatePicker',
  'date:range': 'RangePicker',
  'array': 'ArrayField',
  'array:table': 'EditableTable',
  'array:list': 'EditableList',
  'object': 'ObjectField',
  'void': 'VoidField',
}

/** Schema 编译缓存 */
const compileCache = new WeakMap<FormSchema, CompiledSchema>()

/**
 * 解析字段的组件名
 *
 * 优先级：schema.component > enum → Select > type 映射
 */
function resolveComponent(schema: FieldSchema, mapping: Record<string, string>): string {
  if (schema.component)
    return schema.component

  /* 有枚举值自动使用 Select */
  if (schema.enum || (isArray(schema.dataSource) && schema.dataSource.length > 0)) {
    return 'Select'
  }

  /* 有远程数据源也使用 Select */
  if (isObject(schema.dataSource) && (schema.dataSource as Record<string, unknown>).url) {
    return 'Select'
  }

  const typeKey = schema.type
  return mapping[typeKey] ?? mapping.string ?? 'Input'
}

/**
 * 将 enum 简写转为标准数据源
 */
function normalizeEnum(schema: FieldSchema): FieldSchema {
  if (!schema.enum)
    return schema

  const dataSource = schema.enum.map((item) => {
    if (isObject(item)) {
      return item as { label: string, value: unknown, disabled?: boolean }
    }
    return { label: String(item), value: item }
  })

  return {
    ...schema,
    dataSource: dataSource as unknown[],
  } as FieldSchema
}

/**
 * 递归编译字段
 */
function compileField(
  name: string,
  schema: FieldSchema,
  parentPath: string,
  mapping: Record<string, string>,
  result: Map<string, CompiledField>,
  order: string[],
): void {
  const path = parentPath ? `${parentPath}.${name}` : name
  const normalizedSchema = normalizeEnum(schema)
  const isVoid = schema.type === 'void'
  const isArrayField = schema.type === 'array'
  const children: string[] = []

  /* 递归编译子字段 */
  if (schema.properties) {
    const entries = Object.entries(schema.properties)
    /* 按 order 排序 */
    entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    for (const [childName, childSchema] of entries) {
      const childPath = `${path}.${childName}`
      children.push(childPath)
      compileField(childName, childSchema, path, mapping, result, order)
    }
  }

  /* 数组项 */
  if (isArrayField && schema.items) {
    const itemPath = `${path}.*`
    children.push(itemPath)
    compileField('*', schema.items, path, mapping, result, order)
  }

  const compiled: CompiledField = {
    path,
    schema: normalizedSchema,
    resolvedComponent: resolveComponent(normalizedSchema, mapping),
    isVoid,
    isArray: isArrayField,
    children,
  }

  result.set(path, compiled)
  order.push(path)
}

/**
 * 编译 FormSchema
 *
 * 将声明式 Schema 转为结构化的编译结果，包含：
 * - 组件推断
 * - enum 标准化
 * - 字段渲染顺序
 * - 子字段关系
 *
 * @param schema - 表单 Schema
 * @param options - 编译选项
 * @returns 编译结果
 */
export function compileSchema(schema: FormSchema, options?: CompileOptions): CompiledSchema {
  /* 检查缓存 */
  const cached = compileCache.get(schema)
  if (cached)
    return cached

  const mapping = { ...DEFAULT_COMPONENT_MAPPING, ...options?.componentMapping }
  const fields = new Map<string, CompiledField>()
  const fieldOrder: string[] = []

  /* 编译所有顶层字段 */
  const entries = Object.entries(schema.fields)
  entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
  for (const [name, fieldSchema] of entries) {
    compileField(name, fieldSchema, '', mapping, fields, fieldOrder)
  }

  const compiled: CompiledSchema = {
    form: schema.form ?? {},
    fields,
    layout: schema.layout,
    fieldOrder,
  }

  /* 写入缓存 */
  compileCache.set(schema, compiled)

  return compiled
}

/** 清除编译缓存 */
export function clearCompileCache(): void {
  /* WeakMap 无法手动清除，但新的 schema 对象会生成新的编译结果 */
}
