import type { DataSourceConfig, ReactionRule } from '@moluoxixi/core'
import type { ComponentType, DataSourceItem, FieldPattern } from '@moluoxixi/shared'
import type { ValidationRule, ValidationTrigger } from '@moluoxixi/validator'

/* ======================== Schema 定义 ======================== */

/** Schema 节点数据类型 */
export type SchemaType = 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object' | 'void'

/**
 * oneOf 条件分支
 *
 * 每个分支定义一组条件和对应的字段定义。
 * 条件不满足时，该分支下的字段自动隐藏（display: 'none'）。
 */
export interface ISchemaConditionBranch {
  /**
   * 分支激活条件
   *
   * 支持两种写法：
   * - 对象：`{ fieldName: expectedValue }`（所有条件取 AND）
   * - 表达式字符串：`'{{$values.type === "advanced"}}'`
   */
  when: Record<string, unknown> | string
  /** 该分支的子字段定义 */
  properties?: Record<string, ISchema>
}

/**
 * Schema 节点定义（JSON Schema 风格，语义化命名）
 *
 * 参考 Formily 的 ISchema，但不使用 x- 前缀。
 *
 * 设计原则：
 * - `type: 'void'` 作为布局容器（Card / Collapse / Tabs 等），不参与数据收集
 * - `type: 'object'` 作为根节点或嵌套对象
 * - 通过 `properties` 嵌套子节点，而非扁平 fields
 * - 类型自动推断组件：string→Input, number→InputNumber, boolean→Switch, enum→Select
 * - 默认 decorator：非 void 字段自动使用 `'FormItem'`
 *
 * @example
 * ```ts
 * const schema: ISchema = {
 *   type: 'object',
 *   properties: {
 *     username: { type: 'string', title: '用户名', required: true },
 *     gender: { type: 'string', title: '性别', enum: [{ label: '男', value: 'male' }] },
 *     info: {
 *       type: 'void',
 *       component: 'Card',
 *       componentProps: { title: '详细信息' },
 *       properties: {
 *         email: { type: 'string', title: '邮箱', rules: [{ format: 'email' }] },
 *       },
 *     },
 *   },
 * }
 * ```
 */
export interface ISchema {
  /** 数据类型 */
  type?: SchemaType
  /** 标签文字（JSON Schema 标准命名） */
  title?: string
  /** 描述信息 */
  description?: string
  /** 默认值 */
  default?: unknown
  /** 是否必填（字段级为 boolean，object 级可为 string[] 指定哪些子字段必填） */
  required?: boolean | string[]

  /* ---- JSON Schema 标准：$ref / definitions ---- */
  /**
   * Schema 定义区（JSON Schema 标准）。
   *
   * 在根 Schema 中定义可复用的 Schema 片段，通过 $ref 引用。
   * 编译时自动解析，运行时完全透明。
   *
   * @example
   * ```ts
   * const schema: ISchema = {
   *   type: 'object',
   *   definitions: {
   *     address: {
   *       type: 'object',
   *       properties: {
   *         province: { type: 'string', title: '省' },
   *         city: { type: 'string', title: '市' },
   *         detail: { type: 'string', title: '详细地址' },
   *       },
   *     },
   *   },
   *   properties: {
   *     homeAddress: { $ref: '#/definitions/address', title: '家庭地址' },
   *     workAddress: { $ref: '#/definitions/address', title: '工作地址' },
   *   },
   * }
   * ```
   */
  definitions?: Record<string, ISchema>
  /**
   * Schema 引用（JSON Schema 标准）。
   *
   * 引用 definitions 中定义的 Schema 片段。格式：`#/definitions/<name>`
   * 可与本地属性共存，本地属性会覆盖被引用 Schema 的同名属性。
   *
   * @example
   * ```ts
   * { $ref: '#/definitions/address', title: '家庭地址' }
   * // 等价于：将 definitions.address 的内容合并，再用 title: '家庭地址' 覆盖
   * ```
   */
  $ref?: string

  /* ---- 枚举 / 数据源 ---- */
  /** 枚举选项（简写） */
  enum?: Array<string | number | { label: string, value: unknown, disabled?: boolean }>
  /** 数据源（静态数组或远程配置） */
  dataSource?: DataSourceItem[] | DataSourceConfig

  /* ---- 组件 ---- */
  /** 渲染组件（省略时按 type/enum 自动推断；支持字符串名或直接组件引用） */
  component?: string | ((...args: unknown[]) => unknown) | Record<string, unknown>
  /** 组件属性 */
  componentProps?: Record<string, unknown>
  /** 装饰器组件（省略时非 void 字段默认 'FormItem'；支持字符串名或直接组件引用） */
  decorator?: string | ((...args: unknown[]) => unknown) | Record<string, unknown>
  /** 装饰器属性 */
  decoratorProps?: Record<string, unknown>

  /* ---- 嵌套 ---- */
  /** 子节点（JSON Schema properties） */
  properties?: Record<string, ISchema>
  /** 数组项 Schema */
  items?: ISchema

  /* ---- 验证 ---- */
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 验证触发时机 */
  validateTrigger?: ValidationTrigger | ValidationTrigger[]

  /* ---- 联动 ---- */
  /** 联动规则 */
  reactions?: ReactionRule[]

  /* ---- 状态 ---- */
  /** 是否可见 */
  visible?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 字段模式 */
  pattern?: FieldPattern

  /* ---- 数组特有 ---- */
  /** 数组项最小数量 */
  minItems?: number
  /** 数组项最大数量 */
  maxItems?: number
  /** 新增项模板 */
  itemTemplate?: unknown

  /* ---- 数据处理 ---- */
  /**
   * 显示格式化。
   *
   * 支持两种写法：
   * - 函数：`(value) => formattedValue`
   * - 表达式字符串：`'{{$deps[0] / 100}}'`（$deps[0] 为当前值）
   */
  format?: string | ((value: unknown) => unknown)
  /**
   * 输入解析。
   *
   * 支持两种写法：
   * - 函数：`(inputValue) => parsedValue`
   * - 表达式字符串：`'{{$deps[0] * 100}}'`（$deps[0] 为输入值）
   */
  parse?: string | ((value: unknown) => unknown)
  /**
   * 提交转换。
   *
   * 支持两种写法：
   * - 函数：`(value) => transformedValue`
   * - 表达式字符串：`'{{$deps[0].toUpperCase()}}'`（$deps[0] 为当前值）
   */
  transform?: string | ((value: unknown) => unknown)
  /** 提交路径映射 */
  submitPath?: string
  /** 隐藏时是否排除提交数据 */
  excludeWhenHidden?: boolean

  /* ---- 条件 Schema ---- */
  /**
   * 条件分支（类似 JSON Schema oneOf，但更面向表单场景）
   *
   * 根据 discriminator 字段的值自动切换显示不同的字段组。
   * 编译时会生成隐式 reactions：非活跃分支的字段 display 设为 'none'。
   *
   * @example
   * ```ts
   * const schema: ISchema = {
   *   type: 'object',
   *   properties: {
   *     payType: { type: 'string', title: '支付方式', enum: ['credit_card', 'bank_transfer'] },
   *   },
   *   oneOf: [
   *     {
   *       when: { payType: 'credit_card' },
   *       properties: {
   *         cardNumber: { type: 'string', title: '卡号' },
   *         expiry: { type: 'string', title: '有效期' },
   *       },
   *     },
   *     {
   *       when: { payType: 'bank_transfer' },
   *       properties: {
   *         bankAccount: { type: 'string', title: '银行账号' },
   *         bankName: { type: 'string', title: '银行名称' },
   *       },
   *     },
   *   ],
   * }
   * ```
   */
  oneOf?: ISchemaConditionBranch[]
  /**
   * 鉴别器字段路径
   *
   * 指定用于判断 oneOf 分支的字段路径。
   * 如果不指定，从 oneOf[].when 的 key 中自动推断。
   */
  discriminator?: string

  /* ---- 布局提示 ---- */
  /** 栅格占比 */
  span?: number
  /** 排序权重 */
  order?: number
  /**
   * 布局配置（根节点使用）
   *
   * 用于 ConfigForm 根级别的字段容器布局。
   */
  layout?: {
    /** 布局类型 */
    type?: 'grid' | 'inline'
    /** 栅格列数（type='grid' 时使用） */
    columns?: number
    /** 栅格间距（px） */
    gutter?: number
    /**
     * 响应式断点（type='grid' 时使用）
     *
     * 根据容器宽度自动调整列数。
     * key 为最小宽度（px），value 为该断点下的列数。
     * 按宽度从小到大匹配，最后一个满足条件的断点生效。
     *
     * @example
     * ```ts
     * breakpoints: {
     *   0: 1,     // <576px: 1 列
     *   576: 2,   // 576-767px: 2 列
     *   768: 3,   // 768-991px: 3 列
     *   992: 4,   // >=992px: 4 列
     * }
     * ```
     */
    breakpoints?: Record<number, number>
    /** 行内布局的元素间距（type='inline' 时使用，默认 16px） */
    gap?: number
  }

  /* ---- 扩展 ---- */
  /** 自定义扩展属性 */
  [key: `x-${string}`]: unknown
}

/**
 * 表单 Schema（根节点，等价于 type='object' 的 ISchema）
 *
 * ConfigForm 接收此类型。根节点的 decoratorProps 用于传递表单级配置
 * （如 labelWidth、labelPosition 等）。
 */
export type FormSchema = ISchema

/* ======================== 编译结果 ======================== */

/** 编译后的字段节点 */
export interface CompiledField {
  /**
   * 完整地址（含 void 节点），用于渲染 key 和组件查找。
   * 例：`cardGroup.username`（cardGroup 是 void）
   */
  address: string
  /**
   * 数据路径（跳过 void 节点），用于 form.values 读写和 FormField name。
   * 例：`username`（void 节点 cardGroup 被跳过）
   *
   * 参考 Formily：void 字段不参与数据路径。
   */
  dataPath: string
  /** 原始 schema 节点（已标准化 enum → dataSource） */
  schema: ISchema
  /** 推断出的组件（字符串名或直接组件引用） */
  resolvedComponent: ComponentType
  /** 推断出的装饰器（字符串名或直接组件引用） */
  resolvedDecorator: ComponentType
  /** 是否是虚拟字段（type='void'） */
  isVoid: boolean
  /** 是否是数组字段（type='array'） */
  isArray: boolean
  /** 直接子节点地址（address） */
  children: string[]
}

/** Schema 编译结果 */
export interface CompiledSchema {
  /** 根节点 schema */
  root: ISchema
  /** 所有节点（路径 → 编译结果） */
  fields: Map<string, CompiledField>
  /** 渲染顺序 */
  fieldOrder: string[]
}

/** Schema 编译选项 */
export interface CompileOptions {
  /** 类型 → 组件的映射（覆盖默认推断） */
  componentMapping?: Record<string, string>
  /** 默认装饰器组件（默认 'FormItem'） */
  defaultDecorator?: string
}
