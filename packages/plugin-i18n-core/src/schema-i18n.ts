import type { DataSourceItem, ISchema } from '@moluoxixi/core'

/**
 * i18n 翻译函数类型
 *
 * 兼容主流 i18n 库（vue-i18n、react-i18next 等）的翻译函数签名。
 * 接收翻译 key，返回翻译后的文本。
 */
export type TranslateFunction = (key: string, params?: Record<string, unknown>) => string

/**
 * Schema i18n 配置
 */
export interface SchemaI18nConfig {
  /** 翻译函数 */
  t: TranslateFunction
  /** 翻译 key 前缀（默认 'schema.'） */
  prefix?: string
  /**
   * 需要翻译的属性列表。
   * 默认翻译 title、description。
   */
  translatableProps?: string[]
  /**
   * 是否递归翻译 enum/dataSource 的 label。
   * 默认 true。
   */
  translateEnumLabels?: boolean
}

/** 默认可翻译属性 */
const DEFAULT_TRANSLATABLE_PROPS = ['title', 'description']

/** 组件属性中可翻译的字段 */
const TRANSLATABLE_COMPONENT_PROPS = ['placeholder', 'label', 'title', 'description']

/**
 * 检测值是否为 i18n 翻译 key
 *
 * 约定：以 `$t:` 前缀标记的字符串为翻译 key。
 *
 * @example
 * ```ts
 * isI18nKey('$t:user.name') // true
 * isI18nKey('用户名')        // false
 * ```
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
export function isI18nKey(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('$t:')
}

/**
 * 提取翻译 key（去掉 $t: 前缀）
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @returns 返回字符串结果，通常用于文本展示或下游拼接。
 */
function extractKey(value: string): string {
  return value.slice(3)
}

/**
 * 翻译 Schema 中的文本
 *
 * 递归遍历 Schema 树，将标记为 i18n key（$t:xxx）的文本替换为翻译结果。
 * 返回新的 Schema 对象（不修改原始 Schema）。
 *
 * 翻译规则：
 * 1. title / description：如果值以 `$t:` 开头，调用 t() 翻译
 * 2. componentProps.placeholder：同上
 * 3. enum/dataSource 的 label：同上
 * 4. 无 `$t:` 前缀的文本保持原样
 *
 * @param schema - 原始 Schema
 * @param config - i18n 配置
 * @returns 翻译后的新 Schema
 */
export function translateSchema(schema: ISchema, config: SchemaI18nConfig): ISchema {
  const {
    t,
    translatableProps = DEFAULT_TRANSLATABLE_PROPS,
    translateEnumLabels = true,
  } = config

  return translateNode(schema, t, translatableProps, translateEnumLabels)
}

/**
 * 递归翻译单个节点
 * @param schema 参数 `schema`用于传入 Schema 结构并参与解析或转换流程。
 * @param t 参数 `t`用于提供当前函数执行所需的输入信息。
 * @param translatableProps 参数 `translatableProps`用于提供当前函数执行所需的输入信息。
 * @param translateEnumLabels 参数 `translateEnumLabels`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function translateNode(
  schema: ISchema,
  t: TranslateFunction,
  translatableProps: string[],
  translateEnumLabels: boolean,
): ISchema {
  const result = { ...schema }

  /* 翻译基础属性 */
  for (const prop of translatableProps) {
    const value = (result as Record<string, unknown>)[prop]
    if (isI18nKey(value)) {
      ;(result as Record<string, unknown>)[prop] = t(extractKey(value))
    }
  }

  /* 翻译组件属性 */
  if (result.componentProps) {
    const translatedProps = { ...result.componentProps }
    for (const prop of TRANSLATABLE_COMPONENT_PROPS) {
      if (isI18nKey(translatedProps[prop])) {
        translatedProps[prop] = t(extractKey(translatedProps[prop] as string))
      }
    }
    result.componentProps = translatedProps
  }

  /* 翻译装饰器属性 */
  if (result.decoratorProps) {
    const translatedProps = { ...result.decoratorProps }
    for (const prop of TRANSLATABLE_COMPONENT_PROPS) {
      if (isI18nKey(translatedProps[prop])) {
        translatedProps[prop] = t(extractKey(translatedProps[prop] as string))
      }
    }
    if (translatedProps.actions && typeof translatedProps.actions === 'object' && !Array.isArray(translatedProps.actions)) {
      translatedProps.actions = translateActionValues(translatedProps.actions as Record<string, unknown>, t)
    }
    result.decoratorProps = translatedProps
  }

  /* 翻译校验规则消息 */
  if (Array.isArray(result.rules)) {
    result.rules = result.rules.map((rule) => {
      if (!rule || typeof rule !== 'object')
        return rule
      const message = (rule as Record<string, unknown>).message
      if (isI18nKey(message)) {
        return { ...(rule as Record<string, unknown>), message: t(extractKey(message)) }
      }
      return rule
    })
  }

  /* 翻译 enum 的 label */
  if (translateEnumLabels && result.enum) {
    result.enum = result.enum.map((item) => {
      if (typeof item === 'object' && item !== null && 'label' in item) {
        const obj = item as { label: string, value: unknown }
        if (isI18nKey(obj.label)) {
          return { ...obj, label: t(extractKey(obj.label)) }
        }
      }
      return item
    })
  }

  /* 翻译 dataSource 的 label */
  if (translateEnumLabels && Array.isArray(result.dataSource)) {
    result.dataSource = translateDataSource(result.dataSource as DataSourceItem[], t)
  }

  /* 递归翻译子节点 */
  if (result.properties) {
    const translatedProperties: Record<string, ISchema> = {}
    for (const [key, childSchema] of Object.entries(result.properties)) {
      translatedProperties[key] = translateNode(childSchema, t, translatableProps, translateEnumLabels)
    }
    result.properties = translatedProperties
  }

  if (result.items) {
    result.items = translateNode(result.items, t, translatableProps, translateEnumLabels)
  }

  /* 翻译 oneOf 分支 */
  if (result.oneOf) {
    result.oneOf = result.oneOf.map(branch => ({
      ...branch,
      properties: branch.properties
        ? Object.fromEntries(
            Object.entries(branch.properties).map(
              ([k, v]) => [k, translateNode(v, t, translatableProps, translateEnumLabels)],
            ),
          )
        : undefined,
    }))
  }

  return result
}

/**
 * 翻译 dataSource 中的 label（递归处理 children）
 * @param items 参数 `items`用于提供集合数据，支撑批量遍历与扩展处理。
 * @param t 参数 `t`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
function translateDataSource(
  items: DataSourceItem[],
  t: TranslateFunction,
): DataSourceItem[] {
  return items.map((item) => {
    const translated = { ...item }
    if (isI18nKey(translated.label)) {
      translated.label = t(extractKey(translated.label))
    }
    if (Array.isArray(translated.children)) {
      translated.children = translateDataSource(translated.children, t)
    }
    return translated
  })
}

/**
 * translate Action Values：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-i18n-core/src/schema-i18n.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @param t 参数 `t`用于提供当前函数执行所需的输入信息。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
function translateActionValues(
  value: Record<string, unknown> | unknown[],
  t: TranslateFunction,
): Record<string, unknown> | unknown[] {
  if (Array.isArray(value)) {
    return value.map(item => translateActionValue(item, t))
  }
  const next: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value)) {
    next[key] = translateActionValue(item, t)
  }
  return next
}

/**
 * translate Action Value：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-i18n-core/src/schema-i18n.ts`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param value 参数 `value`用于提供待处理的值并参与结果计算。
 * @param t 参数 `t`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
function translateActionValue(value: unknown, t: TranslateFunction): unknown {
  if (isI18nKey(value)) {
    return t(extractKey(value))
  }
  if (Array.isArray(value)) {
    return translateActionValues(value, t)
  }
  if (value && typeof value === 'object') {
    return translateActionValues(value as Record<string, unknown>, t)
  }
  return value
}

/**
 * 创建 Schema 翻译器
 *
 * 返回一个绑定了翻译函数的翻译器，方便复用。
 *
 * @param config - i18n 配置
 * @returns 翻译函数
 */
export function createSchemaTranslator(config: SchemaI18nConfig): (schema: ISchema) => ISchema {
  return (schema: ISchema): ISchema => translateSchema(schema, config)
}
