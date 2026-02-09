import type { ReactionRule } from '../types'
import type {
  CompiledField,
  CompiledSchema,
  CompileOptions,
  ISchema,
  ISchemaConditionBranch,
} from './types'
import type { ComponentType } from '../shared'
import { isArray, isObject, isString } from '../shared'
import { resolveSchemaRefs } from './ref-resolver'

/** 默认类型 → 组件映射 */
export const DEFAULT_COMPONENT_MAPPING: Record<string, string> = {
  string: 'Input',
  number: 'InputNumber',
  boolean: 'Switch',
  date: 'DatePicker',
  array: 'ArrayItems',
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
export function resolveComponent(schema: ISchema, mapping: Record<string, string>): ComponentType {
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
function resolveDecorator(schema: ISchema, defaultDecorator: string): ComponentType {
  /* decorator 显式设置时使用（包括空字符串 '' 表示不要装饰器） */
  if (schema.decorator !== undefined)
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
 * 从 oneOf 条件分支生成隐式 reactions
 *
 * 策略：将各分支的 properties 全部编译到 Schema 中，
 * 并为每个分支字段自动注入 reactions 规则：
 * - watch discriminator 字段
 * - when 条件满足时 display: 'visible'
 * - when 条件不满足时 display: 'none'
 *
 * 这样运行时通过已有的联动引擎自动切换分支，无需额外的运行时编译器。
 *
 * @param branches - oneOf 分支数组
 * @param discriminator - 鉴别器字段路径（可选，自动推断）
 * @param parentDataPath - 父节点的 dataPath
 * @returns 合并后的 properties 和对应的 reactions 映射
 */
function compileOneOfBranches(
  branches: ISchemaConditionBranch[],
  discriminator: string | undefined,
  parentDataPath: string,
): Record<string, ISchema> {
  const mergedProperties: Record<string, ISchema> = {}

  for (const branch of branches) {
    if (!branch.properties) continue

    /* 推断 discriminator：取 when 对象的第一个 key */
    const resolvedDiscriminator = discriminator ?? (
      isString(branch.when) ? undefined : Object.keys(branch.when)[0]
    )

    /* 构建 watch 路径 */
    const watchPath = resolvedDiscriminator
      ? (parentDataPath ? `${parentDataPath}.${resolvedDiscriminator}` : resolvedDiscriminator)
      : ''

    /* 构建条件表达式 */
    let whenExpression: string
    if (isString(branch.when)) {
      whenExpression = branch.when
    }
    else {
      /* 对象条件：{ payType: 'credit_card' } → 表达式 */
      const conditions = Object.entries(branch.when).map(([key, value]) => {
        const valuePath = parentDataPath ? `$values.${parentDataPath}.${key}` : `$values.${key}`
        return `${valuePath} === ${JSON.stringify(value)}`
      })
      whenExpression = `{{${conditions.join(' && ')}}}`
    }

    /* 为每个分支字段注入隐式 reactions */
    for (const [childName, childSchema] of Object.entries(branch.properties)) {
      const reaction: ReactionRule = {
        watch: watchPath || Object.keys(isString(branch.when) ? {} : branch.when).map(
          k => parentDataPath ? `${parentDataPath}.${k}` : k,
        ),
        when: whenExpression,
        fulfill: { state: { display: 'visible' } },
        otherwise: { state: { display: 'none' } },
      }

      /* 合并到 properties，附加 reactions */
      const existingReactions = childSchema.reactions ?? []
      mergedProperties[childName] = {
        ...childSchema,
        reactions: [reaction, ...existingReactions],
      }
    }
  }

  return mergedProperties
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

  /* 合并 oneOf 分支到 properties */
  let effectiveProperties = schema.properties ? { ...schema.properties } : undefined
  if (schema.oneOf && schema.oneOf.length > 0) {
    const oneOfProperties = compileOneOfBranches(schema.oneOf, schema.discriminator, dataPath)
    effectiveProperties = { ...effectiveProperties, ...oneOfProperties }
  }

  /* 递归编译 properties 子节点 */
  if (effectiveProperties) {
    const entries = Object.entries(effectiveProperties)
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
 * - $ref 解析（definitions 引用替换为实际 Schema）
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

  /*
   * 编译前先解析所有 $ref 引用。
   * resolveSchemaRefs 会递归遍历 Schema 树，将 $ref 替换为 definitions 中的实际定义。
   * 这样后续编译逻辑无需关心 $ref，处理的都是已展开的完整 Schema。
   */
  const resolvedSchema = resolveSchemaRefs(schema)

  /* 合并根级 oneOf 分支 */
  let rootProperties = resolvedSchema.properties ? { ...resolvedSchema.properties } : undefined
  if (resolvedSchema.oneOf && resolvedSchema.oneOf.length > 0) {
    const oneOfProperties = compileOneOfBranches(resolvedSchema.oneOf, resolvedSchema.discriminator, '')
    rootProperties = { ...rootProperties, ...oneOfProperties }
  }

  if (rootProperties) {
    const entries = Object.entries(rootProperties)
    entries.sort(([, a], [, b]) => (a.order ?? 0) - (b.order ?? 0))
    for (const [name, childSchema] of entries) {
      compileNode(name, childSchema, '', '', mapping, defaultDecorator, fields, fieldOrder)
    }
  }

  return {
    root: resolvedSchema,
    fields,
    fieldOrder,
  }
}
