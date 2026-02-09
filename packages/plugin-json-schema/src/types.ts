/**
 * 标准 JSON Schema 类型定义（Draft-07 / 2020-12 子集）
 *
 * 仅定义 fromJsonSchema 转换器需要识别和处理的标准属性。
 * 不追求 JSON Schema 规范的完整覆盖，聚焦表单场景常用的子集。
 */

/* ======================== 标准 JSON Schema 类型 ======================== */

/** JSON Schema 基础类型 */
export type JsonSchemaType = 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object' | 'null'

/**
 * 标准 JSON Schema 节点定义
 *
 * 覆盖 Draft-07 和 2020-12 中表单场景常用的属性。
 * 不包含纯数据校验向的高级特性（如 patternProperties、unevaluatedProperties 等）。
 */
export interface StandardJsonSchema {
  /* ---- 元信息 ---- */
  /** 数据类型（支持单个或数组，如 ['string', 'null']） */
  type?: JsonSchemaType | JsonSchemaType[]
  /** 标题 */
  title?: string
  /** 描述 */
  description?: string
  /** 默认值 */
  default?: unknown
  /** 枚举值列表 */
  enum?: unknown[]
  /** 常量值 */
  const?: unknown

  /* ---- 字符串约束 ---- */
  /** 最小长度 */
  minLength?: number
  /** 最大长度 */
  maxLength?: number
  /** 正则模式 */
  pattern?: string
  /** 格式（email / uri / date / date-time / ipv4 / ipv6 / uuid 等） */
  format?: string

  /* ---- 数值约束 ---- */
  /** 最小值（含） */
  minimum?: number
  /** 最大值（含） */
  maximum?: number
  /** 独占最小值（不含） */
  exclusiveMinimum?: number | boolean
  /** 独占最大值（不含） */
  exclusiveMaximum?: number | boolean
  /** 整数倍约束 */
  multipleOf?: number

  /* ---- 对象约束 ---- */
  /** 子属性 */
  properties?: Record<string, StandardJsonSchema>
  /** 必填属性名列表 */
  required?: string[]
  /** 是否允许额外属性 */
  additionalProperties?: boolean | StandardJsonSchema

  /* ---- 数组约束 ---- */
  /** 数组项 Schema */
  items?: StandardJsonSchema | StandardJsonSchema[]
  /** 最小项数 */
  minItems?: number
  /** 最大项数 */
  maxItems?: number
  /** 是否要求唯一 */
  uniqueItems?: boolean

  /* ---- 引用 ---- */
  /** Schema 引用 */
  $ref?: string
  /** 定义区（Draft-07） */
  definitions?: Record<string, StandardJsonSchema>
  /** 定义区（2020-12） */
  $defs?: Record<string, StandardJsonSchema>

  /* ---- 组合 ---- */
  /** 必须满足所有 Schema */
  allOf?: StandardJsonSchema[]
  /** 满足任一 Schema */
  anyOf?: StandardJsonSchema[]
  /** 恰好满足一个 Schema */
  oneOf?: StandardJsonSchema[]
  /** 取反 */
  not?: StandardJsonSchema

  /* ---- 条件 ---- */
  /** 条件判断 */
  if?: StandardJsonSchema
  /** 条件满足时应用 */
  then?: StandardJsonSchema
  /** 条件不满足时应用 */
  else?: StandardJsonSchema

  /* ---- 依赖 ---- */
  /** 属性依赖（Draft-07） */
  dependencies?: Record<string, string[] | StandardJsonSchema>
  /** 条件必填（2020-12） */
  dependentRequired?: Record<string, string[]>
  /** 条件 Schema（2020-12） */
  dependentSchemas?: Record<string, StandardJsonSchema>

  /* ---- 读写提示 ---- */
  /** 只读 */
  readOnly?: boolean
  /** 只写（如密码） */
  writeOnly?: boolean

  /* ---- 透传扩展 ---- */
  /** 允许任意扩展属性 */
  [key: string]: unknown
}

/* ======================== 转换选项 ======================== */

/**
 * JSON Schema → ISchema 转换选项
 */
export interface JsonSchemaAdapterOptions {
  /**
   * 标题生成策略
   *
   * - `'schema'`：使用 JSON Schema 中的 title 属性（默认）
   * - `'keyToLabel'`：将属性名转为可读标签（camelCase → 空格分隔，首字母大写）
   * - 自定义函数：`(key: string, schema: StandardJsonSchema) => string`
   */
  titleStrategy?: 'schema' | 'keyToLabel' | ((key: string, schema: StandardJsonSchema) => string)

  /**
   * 是否将 description 映射到 componentProps.placeholder
   *
   * @default false
   */
  descriptionAsPlaceholder?: boolean

  /**
   * 标准 JSON Schema format → 表单组件映射
   *
   * 覆盖默认映射。键为 JSON Schema format 值，值为组件名。
   *
   * @example
   * ```ts
   * { 'date-time': 'DateTimePicker', 'uri': 'Input' }
   * ```
   */
  formatComponentMapping?: Record<string, string>

  /**
   * 标准 JSON Schema format → 验证格式映射
   *
   * 覆盖默认映射。键为 JSON Schema format 值，值为验证器 format 名。
   *
   * @example
   * ```ts
   * { 'idn-email': 'email' }
   * ```
   */
  formatValidatorMapping?: Record<string, string>

  /**
   * if/then/else 转换策略
   *
   * - `'reactions'`：转换为 reactions 联动规则（默认，更灵活）
   * - `'oneOf'`：转换为 oneOf 条件分支（更声明式）
   */
  conditionalStrategy?: 'reactions' | 'oneOf'

  /**
   * 是否保留未识别的扩展属性到 `x-` 前缀
   *
   * @default true
   */
  preserveExtensions?: boolean
}
