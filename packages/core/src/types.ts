import type {
  ComponentType,
  DataSourceItem,
  Disposer,
  Feedback,
  FieldPattern,
  FieldStateUpdate,
} from '@moluoxixi/shared'
import type { ValidationFeedback, ValidationRule, ValidationTrigger } from '@moluoxixi/validator'

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
  /** 是否可见 */
  visible?: boolean
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
  /** 条件判断 */
  when?: (watchedValues: unknown[], context: ReactionContext) => boolean
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
}

/** 联动效果 */
export interface ReactionEffect {
  /** 更新字段状态 */
  state?: Partial<FieldStateUpdate>
  /** 设置值 */
  value?: unknown | ((ctx: ReactionContext) => unknown)
  /** 更新组件 Props */
  componentProps?: Record<string, unknown>
  /** 切换组件 */
  component?: string
  /** 动态数据源 */
  dataSource?: DataSourceConfig | DataSourceItem[]
  /** 自定义执行函数 */
  run?: (field: FieldInstance, context: ReactionContext) => void
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

  createField: <V = unknown>(props: FieldProps<V>) => FieldInstance<V>
  createArrayField: <V extends unknown[] = unknown[]>(props: ArrayFieldProps<V>) => ArrayFieldInstance<V>
  createVoidField: (props: VoidFieldProps) => VoidFieldInstance
  getField: (path: string) => FieldInstance | undefined
  getArrayField: (path: string) => ArrayFieldInstance | undefined
  removeField: (path: string) => void
  /** 清理指定路径下的所有子字段注册（供 ArrayField 操作时调用） */
  cleanupChildFields: (parentPath: string) => void
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
  batch: (fn: () => void) => void
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
  label: string
  description: string
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

/** VoidField 实例接口 */
export interface VoidFieldInstance {
  readonly form: FormInstance
  readonly path: string
  readonly name: string
  label: string
  visible: boolean
  disabled: boolean
  readOnly: boolean
  pattern: FieldPattern
  component: string | ComponentType
  componentProps: Record<string, unknown>
  dispose: () => void
}
