import type {
  ComponentType,
  DataSourceItem,
  Disposer,
  Feedback,
  FieldDisplay,
  FieldPattern,
  FieldStateUpdate,
} from '@moluoxixi/shared'
import type { ValidationFeedback, ValidationRule, ValidationTrigger } from '@moluoxixi/validator'
import type { FormEventHandler, FormLifeCycle } from './events'

/* ======================== 字段属性 ======================== */

/** 字段基础属性（创建时传入） */
export interface FieldProps<Value = unknown> {
  /** 字段名（在父级中的 key） */
  name: string
  /** 初始值 */
  initialValue?: Value
  /** 标签文本 */
  label?: string
  /** 描述信息 */
  description?: string
  /** 是否可见（兼容，建议用 display） */
  visible?: boolean
  /** 展示状态：visible/hidden/none（优先于 visible） */
  display?: FieldDisplay
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readOnly?: boolean
  /** 是否必填 */
  required?: boolean
  /** 验证规则 */
  rules?: ValidationRule[]
  /** 验证时机 */
  validateTrigger?: ValidationTrigger | ValidationTrigger[]
  /** 渲染组件标识 */
  component?: string | ComponentType
  /** 组件 Props */
  componentProps?: Record<string, unknown>
  /** 装饰器组件标识 */
  wrapper?: string | ComponentType
  /** 装饰器 Props */
  wrapperProps?: Record<string, unknown>
  /** 数据源配置 */
  dataSource?: DataSourceItem[] | DataSourceConfig
  /** 联动规则 */
  reactions?: ReactionRule[]
  /** 字段模式 */
  pattern?: FieldPattern
  /** 显示格式化 */
  format?: (value: Value) => unknown
  /** 输入解析 */
  parse?: (inputValue: unknown) => Value
  /** 提交转换 */
  transform?: (value: Value) => unknown
  /** 提交路径映射 */
  submitPath?: string
  /** 隐藏时是否排除提交数据 */
  excludeWhenHidden?: boolean
}

/** 数组字段属性 */
export interface ArrayFieldProps<Value extends unknown[] = unknown[]> extends FieldProps<Value> {
  /** 数组项最小数量 */
  minItems?: number
  /** 数组项最大数量 */
  maxItems?: number
  /** 新增项模板 */
  itemTemplate?: Value[number] | (() => Value[number])
  /** 数组项的字段定义 */
  itemProps?: Omit<FieldProps, 'name'>
}

/** 对象字段属性 */
export interface ObjectFieldProps<Value extends Record<string, unknown> = Record<string, unknown>>
  extends FieldProps<Value> {}

/** 虚拟字段属性（不参与数据收集） */
export interface VoidFieldProps {
  name: string
  label?: string
  visible?: boolean
  disabled?: boolean
  readOnly?: boolean
  component?: string | ComponentType
  componentProps?: Record<string, unknown>
  reactions?: ReactionRule[]
  pattern?: FieldPattern
}

/* ======================== 联动系统 ======================== */

/** 联动规则 */
export interface ReactionRule {
  /** 监听的字段路径（支持通配符） */
  watch: string | string[]
  /**
   * 联动目标字段路径。
   * 省略时影响自身，指定后影响目标字段。
   * 参考 Formily x-reactions.target。
   */
  target?: string
  /**
   * 条件判断。
   *
   * 支持两种写法：
   * - 函数：`(field, ctx) => boolean`
   * - 表达式字符串：`'{{$values.type === "advanced"}}'`（可 JSON 序列化）
   */
  when?: ((field: FieldInstance, context: ReactionContext) => boolean) | string
  /** 满足条件时执行 */
  fulfill?: ReactionEffect
  /** 不满足条件时执行 */
  otherwise?: ReactionEffect
  /** 防抖（ms） */
  debounce?: number
}

/** 联动上下文 */
export interface ReactionContext {
  /** 当前字段 */
  self: FieldInstance
  /** 表单实例 */
  form: FormInstance
  /** 所有值 */
  values: Record<string, unknown>
  /**
   * 当前数组行记录。
   * 仅当字段位于数组内时有值（如 contacts.0.name 中，record 为 contacts[0] 对象）。
   */
  record?: Record<string, unknown>
  /**
   * 当前数组索引。
   * 仅当字段位于数组内时有值（如 contacts.0.name 中，index 为 0）。
   */
  index?: number
  /** watch 路径对应的当前依赖值数组 */
  deps?: unknown[]
}

/** 联动效果 */
export interface ReactionEffect {
  /** 更新字段状态 */
  state?: Partial<FieldStateUpdate>
  /**
   * 设置值。
   *
   * 支持三种写法：
   * - 静态值：`42`、`'hello'`
   * - 函数：`(field, ctx) => ctx.values.price * ctx.values.qty`
   * - 表达式字符串：`'{{$values.price * $values.qty}}'`（可 JSON 序列化）
   */
  value?: unknown | ((field: FieldInstance, ctx: ReactionContext) => unknown)
  /** 更新组件 Props */
  componentProps?: Record<string, unknown>
  /** 切换组件 */
  component?: string
  /** 动态数据源 */
  dataSource?: DataSourceConfig | DataSourceItem[]
  /**
   * 自定义执行函数。
   *
   * 支持两种写法：
   * - 函数：`(field, ctx) => { ... }`
   * - 表达式字符串：`'{{$self.setValue($values.a + $values.b)}}'`（可 JSON 序列化）
   */
  run?: ((field: FieldInstance, context: ReactionContext) => void) | string
}

/* ======================== 数据源 ======================== */

/** 数据源配置 */
export interface DataSourceConfig {
  /** 远程 URL */
  url?: string
  /** 请求方法 */
  method?: 'GET' | 'POST'
  /** 请求参数（值可以是字段路径） */
  params?: Record<string, string | ((values: Record<string, unknown>) => unknown)>
  /** 请求头 */
  headers?: Record<string, string>
  /** 响应数据转换 */
  transform?: (response: unknown) => DataSourceItem[]
  /** label 字段映射 */
  labelField?: string
  /** value 字段映射 */
  valueField?: string
  /** children 字段映射 */
  childrenField?: string
  /** 缓存策略 */
  cache?: boolean | { ttl: number }
  /** 分页搜索 */
  searchable?: boolean
  /** 请求适配器名称 */
  requestAdapter?: string
}

/* ======================== 表单 ======================== */

/** 表单配置 */
export interface FormConfig<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 表单模式 */
  pattern?: FieldPattern
  /** 验证时机 */
  validateTrigger?: ValidationTrigger | ValidationTrigger[]
  /** 标签位置 */
  labelPosition?: 'top' | 'left' | 'right'
  /** 标签宽度 */
  labelWidth?: number | string
  /** 表单生命周期 */
  effects?: (form: FormInstance) => void
}

/** 重置选项 */
export interface ResetOptions {
  /** 是否验证重置后的值 */
  validate?: boolean
  /** 强制清空（忽略初始值） */
  forceClear?: boolean
  /** 仅重置指定字段 */
  fields?: string[]
}

/** 提交结果 */
export interface SubmitResult<Values = Record<string, unknown>> {
  values: Values
  errors: ValidationFeedback[]
  warnings: ValidationFeedback[]
}

/* ======================== 请求适配器 ======================== */

/** 请求适配器 */
export interface RequestAdapter {
  request: <T = unknown>(config: RequestConfig) => Promise<T>
}

/** 请求配置 */
export interface RequestConfig {
  url: string
  method: 'GET' | 'POST'
  params?: Record<string, unknown>
  headers?: Record<string, string>
  signal?: AbortSignal
}

/* ======================== Form Graph（状态序列化） ======================== */

/**
 * 字段状态快照（序列化后的字段状态）
 *
 * 用于 Form Graph 的序列化/反序列化。
 */
export interface FieldState {
  /** 字段路径 */
  path: string
  /** 当前值 */
  value: unknown
  /** 初始值 */
  initialValue: unknown
  /** 展示状态 */
  display: FieldDisplay
  /** 是否禁用 */
  disabled: boolean
  /** 是否只读 */
  readOnly: boolean
  /** 是否必填 */
  required: boolean
  /** 字段模式 */
  pattern: FieldPattern
  /** 错误信息 */
  errors: ValidationFeedback[]
  /** 警告信息 */
  warnings: ValidationFeedback[]
  /** 是否已挂载 */
  mounted: boolean
  /** 是否被修改 */
  modified: boolean
  /** 组件标识 */
  component: string | ComponentType
  /** 组件 Props */
  componentProps: Record<string, unknown>
}

/**
 * 表单状态图
 *
 * 完整的表单状态快照，支持序列化存储和反序列化恢复。
 * 用于：草稿保存、撤销/重做、表单状态对比、设计器集成。
 */
export interface FormGraph {
  /** 表单值 */
  values: Record<string, unknown>
  /** 初始值 */
  initialValues: Record<string, unknown>
  /** 所有字段状态（path → FieldState） */
  fields: Record<string, FieldState>
  /** 快照时间戳 */
  timestamp: number
}

/* ======================== 实例类型（避免循环依赖的接口） ======================== */

/** Form 实例接口 */
export interface FormInstance<Values extends Record<string, unknown> = Record<string, unknown>> {
  readonly id: string
  values: Values
  initialValues: Values
  readonly modified: boolean
  readonly valid: boolean
  readonly errors: Feedback[]
  readonly warnings: Feedback[]
  submitting: boolean
  validating: boolean
  pattern: FieldPattern
  /** 验证触发时机 */
  validateTrigger: ValidationTrigger | ValidationTrigger[]
  /** 标签位置 */
  labelPosition: 'top' | 'left' | 'right'
  /** 标签宽度 */
  labelWidth: number | string

  /** 表单是否已挂载到 DOM */
  mounted: boolean

  createField: <V = unknown>(props: FieldProps<V>) => FieldInstance<V>
  createArrayField: <V extends unknown[] = unknown[]>(props: ArrayFieldProps<V>) => ArrayFieldInstance<V>
  createObjectField: <V extends Record<string, unknown> = Record<string, unknown>>(props: ObjectFieldProps<V>) => ObjectFieldInstance<V>
  createVoidField: (props: VoidFieldProps) => VoidFieldInstance
  getField: (path: string) => FieldInstance | undefined
  getArrayField: (path: string) => ArrayFieldInstance | undefined
  getObjectField: (path: string) => ObjectFieldInstance | undefined
  removeField: (path: string) => void
  /** 清理数组字段中索引 >= start 的子字段注册（参考 Formily cleanupArrayChildren） */
  cleanupArrayChildren: (arrayPath: string, start: number) => void
  queryFields: (pattern: string) => FieldInstance[]
  /** 获取所有注册的字段（返回内部 Map 的只读快照） */
  getAllFields: () => ReadonlyMap<string, FieldInstance>
  /** 获取所有虚拟字段（返回内部 Map 的只读快照） */
  getAllVoidFields: () => ReadonlyMap<string, VoidFieldInstance>
  setValues: (values: Partial<Values>, strategy?: 'merge' | 'shallow' | 'replace') => void
  setFieldValue: (path: string, value: unknown) => void
  getFieldValue: (path: string) => unknown
  reset: (options?: ResetOptions) => void
  submit: () => Promise<SubmitResult<Values>>
  validate: (pattern?: string) => Promise<{ valid: boolean, errors: ValidationFeedback[], warnings: ValidationFeedback[] }>
  onValuesChange: (handler: (values: Values) => void) => Disposer
  onFieldValueChange: (path: string, handler: (value: unknown) => void) => Disposer
  /** 通知表单值变化（供 Field 内部调用） */
  notifyValuesChange: () => void
  /** 通知字段值变化（供 Field 内部调用） */
  notifyFieldValueChange: (path: string, value: unknown) => void
  /** 通知字段用户输入（供 Field.onInput 内部调用） */
  notifyFieldInputChange: (path: string, value: unknown) => void
  /** 通知字段初始值变化（供 Field 内部调用） */
  notifyFieldInitialValueChange: (path: string, value: unknown) => void
  /** 通知字段挂载（供框架桥接层调用） */
  notifyFieldMount: (field: FieldInstance | VoidFieldInstance) => void
  /** 通知字段卸载（供框架桥接层调用） */
  notifyFieldUnmount: (field: FieldInstance | VoidFieldInstance) => void
  /** 设置字段状态（支持通配符批量） */
  setFieldState: (pattern: string, state: Partial<FieldStateUpdate>) => void
  /** 订阅特定生命周期事件 */
  on: (type: FormLifeCycle, handler: FormEventHandler) => Disposer
  /** 订阅所有生命周期事件 */
  subscribe: (handler: FormEventHandler) => Disposer
  /** 表单挂载（由框架桥接层调用） */
  mount: () => void
  /** 表单卸载（由框架桥接层调用） */
  unmount: () => void
  batch: (fn: () => void) => void
  /** 导出表单状态快照 */
  getGraph: () => FormGraph
  /** 从快照恢复表单状态 */
  setGraph: (graph: FormGraph) => void
  dispose: () => void
}

/** Field 实例接口 */
export interface FieldInstance<Value = unknown> {
  readonly form: FormInstance
  readonly path: string
  readonly name: string
  value: Value
  initialValue: Value
  readonly modified: boolean
  /** 是否已挂载到 DOM */
  mounted: boolean
  label: string
  description: string
  /** 展示状态三态 */
  display: FieldDisplay
  /** 兼容属性（映射到 display） */
  visible: boolean
  disabled: boolean
  readOnly: boolean
  loading: boolean
  active: boolean
  visited: boolean
  pattern: FieldPattern
  required: boolean
  component: string | ComponentType
  componentProps: Record<string, unknown>
  wrapper: string | ComponentType
  wrapperProps: Record<string, unknown>
  dataSource: DataSourceItem[]
  dataSourceLoading: boolean
  readonly errors: ValidationFeedback[]
  readonly warnings: ValidationFeedback[]
  readonly valid: boolean
  readonly validating: boolean
  rules: ValidationRule[]
  format?: (value: Value) => unknown
  parse?: (inputValue: unknown) => Value
  transform?: (value: Value) => unknown
  submitPath?: string
  excludeWhenHidden: boolean

  /**
   * 用户输入（触发 parse + change 验证 + ON_FIELD_INPUT_VALUE_CHANGE）
   *
   * 由 UI 组件的 onChange 回调调用。
   * 与 setValue 的区别：onInput 会触发 change 验证和 INPUT_VALUE_CHANGE 事件。
   */
  onInput: (value: Value) => void
  /**
   * 程序赋值（不触发验证，仅 emit ON_FIELD_VALUE_CHANGE）
   *
   * 用于联动赋值、初始化等程序控制场景。
   */
  setValue: (value: Value) => void
  setComponentProps: (props: Record<string, unknown>) => void
  setDataSource: (items: DataSourceItem[]) => void
  loadDataSource: (config?: DataSourceConfig) => Promise<void>
  addRule: (rule: ValidationRule) => void
  removeRule: (id: string) => void
  validate: (trigger?: ValidationTrigger) => Promise<ValidationFeedback[]>
  reset: () => void
  focus: () => void
  blur: () => void
  show: () => void
  hide: () => void
  enable: () => void
  disable: () => void
  /** 字段挂载（由框架桥接层调用） */
  mount: () => void
  /** 字段卸载（由框架桥接层调用） */
  unmount: () => void
  onValueChange: (handler: (value: Value, oldValue: Value) => void) => Disposer
  dispose: () => void
}

/** ArrayField 实例接口 */
export interface ArrayFieldInstance<Value extends unknown[] = unknown[]> extends FieldInstance<Value> {
  minItems: number
  maxItems: number
  readonly canAdd: boolean
  readonly canRemove: boolean
  itemTemplate?: Value[number] | (() => Value[number])

  push: (...items: Value[number][]) => void
  pop: () => void
  insert: (index: number, ...items: Value[number][]) => void
  remove: (index: number) => void
  move: (from: number, to: number) => void
  moveUp: (index: number) => void
  moveDown: (index: number) => void
  duplicate: (index: number) => void
  replace: (index: number, item: Value[number]) => void
}

/** ObjectField 实例接口 */
export interface ObjectFieldInstance<Value extends Record<string, unknown> = Record<string, unknown>>
  extends FieldInstance<Value> {
  /** 动态添加属性 */
  addProperty: (name: string, value: unknown) => void
  /** 动态移除属性 */
  removeProperty: (name: string) => void
  /** 检查属性是否存在 */
  existProperty: (name: string) => boolean
  /** 获取所有属性名 */
  getPropertyNames: () => string[]
}

/** VoidField 实例接口 */
export interface VoidFieldInstance {
  readonly form: FormInstance
  readonly path: string
  readonly name: string
  /** 是否已挂载到 DOM */
  mounted: boolean
  label: string
  visible: boolean
  disabled: boolean
  readOnly: boolean
  pattern: FieldPattern
  component: string | ComponentType
  componentProps: Record<string, unknown>
  /** 字段挂载（由框架桥接层调用） */
  mount: () => void
  /** 字段卸载（由框架桥接层调用） */
  unmount: () => void
  dispose: () => void
}
