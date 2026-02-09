import type {
  ComponentType,
  DataSourceItem,
  Disposer,
  Feedback,
  FieldDisplay,
  FieldPattern,
  FieldStateUpdate,
} from './shared'
import type { ValidationFeedback, ValidationRule, ValidationTrigger } from './validator'
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
  decorator?: string | ComponentType
  /** 装饰器 Props */
  decoratorProps?: Record<string, unknown>
  /** 数据源配置 */
  dataSource?: DataSourceItem[] | DataSourceConfig
  /** 联动规则 */
  reactions?: ReactionRule[]
  /** 字段模式 */
  pattern?: FieldPattern
  /** 显示格式化 */
  displayFormat?: (value: Value) => unknown
  /** 输入解析 */
  inputParse?: (inputValue: unknown) => Value
  /** 提交转换 */
  submitTransform?: (value: Value) => unknown
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
  /**
   * 插件列表
   *
   * 在 createForm 完成响应式代理后自动安装。
   * 插件按数组顺序依次安装，安装后通过 form.getPlugin() 获取 API。
   *
   * @example
   * ```ts
   * const form = createForm({
   *   plugins: [
   *     historyPlugin({ maxLength: 30 }),
   *     draftPlugin({ key: 'user-form' }),
   *   ],
   * })
   * ```
   */
  plugins?: FormPlugin[]
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

/* ======================== 插件系统 ======================== */

/**
 * 插件安装结果
 *
 * 插件 install 方法返回此对象，
 * 包含暴露给外部的 API 和清理函数。
 */
export interface PluginInstallResult<API = unknown> {
  /** 插件暴露的 API（可通过 form.getPlugin() 获取） */
  api?: API
  /** 插件销毁函数（表单 dispose 时自动调用） */
  dispose?: () => void
}

/**
 * 插件上下文
 *
 * 在 plugin.install() 中作为第二个参数传入，
 * 提供跨插件通信和 Hook 拦截能力。
 */
export interface PluginContext {
  /**
   * 获取其他已安装插件的 API
   *
   * 注意：只能获取在当前插件之前安装的插件。
   * 如果需要依赖其他插件，请声明 dependencies。
   */
  getPlugin: <T = Record<string, unknown>>(name: string) => T | undefined
  /** 注册 Hook 拦截器（可拦截 Form 核心操作） */
  hooks: FormHooks
}

/**
 * 表单 Hook 注册接口
 *
 * 插件通过 hooks 注册拦截器，
 * 拦截并修改 Form 的 5 个核心操作管线。
 *
 * 每个 Hook 使用洋葱模型：
 * handler 接收 ctx（上下文）和 next（调用下一层），
 * 可以在 next() 前后执行自定义逻辑、修改参数或结果。
 */
export interface FormHooks {
  /**
   * 拦截提交管线
   *
   * 可用于：重试、日志、转换提交数据、提交后清理草稿等。
   *
   * @param handler - 提交 Hook
   * @param priority - 优先级（数字越小越先执行，默认 100）
   */
  onSubmit: (handler: SubmitHook, priority?: number) => Disposer
  /**
   * 拦截验证管线
   *
   * 可用于：自定义校验器、跳过验证、修改验证结果等。
   *
   * @param handler - 验证 Hook
   * @param priority - 优先级（数字越小越先执行，默认 100）
   */
  onValidate: (handler: ValidateHook, priority?: number) => Disposer
  /**
   * 拦截赋值管线
   *
   * 可用于：值转换、拦截赋值、自动快照等。
   *
   * @param handler - 赋值 Hook
   * @param priority - 优先级（数字越小越先执行，默认 100）
   */
  onSetValues: (handler: SetValuesHook, priority?: number) => Disposer
  /**
   * 拦截字段创建管线
   *
   * 可用于：注入默认属性、权限控制、修改 props 等。
   * next() 接收可能被修改的 props，返回创建后的字段实例。
   *
   * @param handler - 字段创建 Hook
   * @param priority - 优先级（数字越小越先执行，默认 100）
   */
  onCreateField: (handler: CreateFieldHook, priority?: number) => Disposer
  /**
   * 拦截重置管线
   *
   * 可用于：保留部分状态、清理副作用、重置后快照等。
   *
   * @param handler - 重置 Hook
   * @param priority - 优先级（数字越小越先执行，默认 100）
   */
  onReset: (handler: ResetHook, priority?: number) => Disposer
}

/* ======================== Hook Handler 类型 ======================== */

/** 提交管线上下文 */
export interface SubmitHookContext {
  /** 表单实例 */
  form: FormInstance
}

/** 验证管线上下文 */
export interface ValidateHookContext {
  /** 表单实例 */
  form: FormInstance
  /** 验证模式（通配符匹配，undefined 表示全部验证） */
  pattern?: string
}

/** 赋值管线上下文 */
export interface SetValuesHookContext {
  /** 表单实例 */
  form: FormInstance
  /** 要设置的值 */
  values: Record<string, unknown>
  /** 合并策略 */
  strategy: string
}

/** 字段创建管线上下文 */
export interface CreateFieldHookContext {
  /** 表单实例 */
  form: FormInstance
  /** 字段属性（可被 hook 修改后传给 next） */
  props: FieldProps
}

/** 重置管线上下文 */
export interface ResetHookContext {
  /** 表单实例 */
  form: FormInstance
  /** 重置选项 */
  options?: ResetOptions
}

/** 验证结果 */
export interface ValidateResult {
  valid: boolean
  errors: ValidationFeedback[]
  warnings: ValidationFeedback[]
}

/**
 * 提交 Hook
 *
 * 拦截 form.submit() 管线。
 * 调用 next() 继续执行下一层 hook 或原始逻辑，
 * 不调用 next() 则中断管线。
 *
 * @example
 * ```ts
 * // 提交后清除草稿
 * hooks.onSubmit(async (ctx, next) => {
 *   const result = await next()
 *   if (result.errors.length === 0) {
 *     ctx.form.getPlugin<DraftAPI>('draft')?.discard()
 *   }
 *   return result
 * })
 * ```
 */
export type SubmitHook = (
  ctx: SubmitHookContext,
  next: () => Promise<SubmitResult>,
) => Promise<SubmitResult>

/**
 * 验证 Hook
 *
 * 拦截 form.validate() 管线。
 *
 * @example
 * ```ts
 * // 跳过特定条件下的验证
 * hooks.onValidate(async (ctx, next) => {
 *   if (shouldSkipValidation()) {
 *     return { valid: true, errors: [], warnings: [] }
 *   }
 *   return next()
 * })
 * ```
 */
export type ValidateHook = (
  ctx: ValidateHookContext,
  next: () => Promise<ValidateResult>,
) => Promise<ValidateResult>

/**
 * 赋值 Hook
 *
 * 拦截 form.setValues() 管线。
 *
 * @example
 * ```ts
 * // 赋值后自动保存快照
 * hooks.onSetValues((ctx, next) => {
 *   next()
 *   ctx.form.getPlugin<HistoryAPI>('history')?.save('input')
 * })
 * ```
 */
export type SetValuesHook = (
  ctx: SetValuesHookContext,
  next: () => void,
) => void

/**
 * 字段创建 Hook
 *
 * 拦截 form.createField() 管线。
 * next() 接收 FieldProps，返回创建后的 FieldInstance。
 * Hook 可以修改 props 后传给 next，也可以在 next 返回后修改字段实例。
 *
 * @example
 * ```ts
 * // 拦截字段创建，注入权限
 * hooks.onCreateField((ctx, next) => {
 *   const field = next(ctx.props)
 *   applyPermission(field)
 *   return field
 * })
 * ```
 */
export type CreateFieldHook = (
  ctx: CreateFieldHookContext,
  next: (props: FieldProps) => FieldInstance,
) => FieldInstance

/**
 * 重置 Hook
 *
 * 拦截 form.reset() 管线。
 *
 * @example
 * ```ts
 * // 重置后清空历史
 * hooks.onReset((ctx, next) => {
 *   next()
 *   ctx.form.getPlugin<HistoryAPI>('history')?.clear()
 * })
 * ```
 */
export type ResetHook = (
  ctx: ResetHookContext,
  next: () => void,
) => void

/**
 * 表单插件接口
 *
 * 插件通过 install 方法挂载到表单实例上，
 * 可以监听事件、注册 Hook 拦截器、暴露自定义 API。
 *
 * 设计原则：
 * - 插件通过 PluginContext.hooks 拦截 Form 核心操作（洋葱模型）
 * - 插件通过 PluginContext.getPlugin 实现跨插件通信
 * - 插件通过 dependencies 声明依赖顺序
 * - 插件生命周期由 Form 管理（dispose 时自动清理）
 *
 * @example
 * ```ts
 * function myPlugin(config: MyConfig): FormPlugin<MyAPI> {
 *   return {
 *     name: 'my-plugin',
 *     install(form, { hooks, getPlugin }) {
 *       // 拦截提交管线
 *       hooks.onSubmit(async (ctx, next) => {
 *         const result = await next()
 *         console.log('提交结果:', result)
 *         return result
 *       })
 *
 *       return {
 *         api: { doSomething: () => { ... } },
 *         dispose: () => { ... },
 *       }
 *     },
 *   }
 * }
 * ```
 */
export interface FormPlugin<API = unknown> {
  /** 插件唯一名称（重复名称的插件安装时会打印警告并跳过） */
  name: string
  /**
   * 插件依赖（这些插件必须先于当前插件安装）
   *
   * createForm 会根据 dependencies 自动排序插件安装顺序。
   * 运行时调用 form.use() 安装时不会自动排序，需确保依赖已安装。
   */
  dependencies?: string[]
  /**
   * 安装顺序优先级（数字越小越先安装，默认 100）
   *
   * 当多个插件无依赖关系时，按 priority 排序。
   * 同 priority 的插件按数组中的原始顺序安装。
   */
  priority?: number
  /**
   * 安装插件到表单实例
   *
   * @param form - 表单实例
   * @param context - 插件上下文（提供 hooks 和 getPlugin）
   * @returns 插件 API 和清理函数
   */
  install: (form: FormInstance, context: PluginContext) => PluginInstallResult<API>
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
  /**
   * 分区域验证（用于 Steps / Tabs 场景）
   * @param section - 路径前缀、通配符模式或字段路径数组
   */
  validateSection: (section: string | string[]) => Promise<{ valid: boolean, errors: ValidationFeedback[], warnings: ValidationFeedback[] }>
  /**
   * 清除指定区域的验证错误
   * @param section - 同 validateSection
   */
  clearSectionErrors: (section: string | string[]) => void
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
  /**
   * 安装插件
   *
   * 运行时动态安装插件（通常通过 FormConfig.plugins 自动安装）。
   * 同名插件重复安装会打印警告并跳过。
   *
   * @param plugin - 插件实例
   * @returns 插件暴露的 API（如无则返回 undefined）
   */
  use: <API = unknown>(plugin: FormPlugin<API>) => API | undefined
  /**
   * 获取已安装的插件 API
   *
   * @param name - 插件名称
   * @returns 插件 API（未安装则返回 undefined）
   *
   * @example
   * ```ts
   * const history = form.getPlugin<HistoryPluginAPI>('history')
   * history?.undo()
   * ```
   */
  getPlugin: <API = unknown>(name: string) => API | undefined
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
  decorator: string | ComponentType
  decoratorProps: Record<string, unknown>
  dataSource: DataSourceItem[]
  dataSourceLoading: boolean
  readonly errors: ValidationFeedback[]
  readonly warnings: ValidationFeedback[]
  readonly valid: boolean
  readonly validating: boolean
  rules: ValidationRule[]
  displayFormat?: (value: Value) => unknown
  inputParse?: (inputValue: unknown) => Value
  submitTransform?: (value: Value) => unknown
  submitPath?: string
  excludeWhenHidden: boolean

  /**
   * 用户输入（触发 inputParse + change 验证 + ON_FIELD_INPUT_VALUE_CHANGE）
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
