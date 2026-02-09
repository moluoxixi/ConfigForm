import type {
  ComponentType,
  DataSourceItem,
  Disposer,
  FieldDisplay,
  FieldPattern,
} from '../shared'
import type { ValidationFeedback, ValidationRule, ValidationTrigger } from '../validator'
import type {
  DataSourceConfig,
  FieldInstance,
  FieldProps,
  FormInstance,
  ReactionRule,
} from '../types'
import { deepClone, FormPath, isArray, uid } from '../shared'
import { validate } from '../validator'
import { fetchDataSource } from '../datasource/manager'

/**
 * 字段模型
 *
 * 核心设计：
 * - value 存储在 form.values 中（单一数据源）
 * - 字段状态（visible / disabled 等）各自独立管理
 * - 由 Form.createField() 创建后通过 adapter.makeObservable() 变为响应式
 * - 联动由外部 ReactionEngine 驱动
 * - onInput 和 setValue 分离：用户输入走 onInput（触发验证），程序赋值走 setValue（不触发验证）
 *
 * 注意：不要直接 new Field()，应通过 form.createField() 创建。
 */
export class Field<Value = unknown> implements FieldInstance<Value> {
  readonly id: string
  readonly form: FormInstance
  readonly path: string
  readonly name: string

  /** 是否已挂载到 DOM */
  mounted: boolean

  /**
   * DOM 元素引用
   *
   * 由 UI 层（如 FormItem）在挂载时设置，用于 scrollToFirstError 等功能。
   * 核心层不直接操作此引用，仅做存储。
   */
  domRef: HTMLElement | null

  /* ======================== a11y 无障碍属性 ======================== */

  /** ARIA 标签（覆盖 label） */
  ariaLabel?: string
  /** ARIA describedby（关联描述元素 ID） */
  ariaDescribedBy?: string
  /** ARIA labelledby（关联标签元素 ID） */
  ariaLabelledBy?: string

  /** ARIA invalid（自动从 errors 计算） */
  get ariaInvalid(): boolean {
    return this.errors.length > 0
  }

  /** ARIA required（从 required 同步） */
  get ariaRequired(): boolean {
    return this.required
  }

  /** ARIA 错误消息（自动从 errors 生成） */
  get ariaErrorMessage(): string {
    return this.errors.map(e => e.message).join('; ')
  }

  /**
   * 有效 pattern（计算属性，对齐 Formily）
   *
   * 优先级：字段自身 > 表单级。
   * 当字段自身 pattern 为 'editable'（默认）时，回退到 form.pattern。
   * 消费者只需读 field.pattern，无需手动合并 form.pattern。
   */
  get pattern(): FieldPattern {
    if (this.selfPattern !== 'editable') return this.selfPattern
    return this.form.pattern
  }

  set pattern(val: FieldPattern) {
    this.selfPattern = val
  }

  /** 是否可编辑（综合 pattern + disabled + readOnly） */
  get editable(): boolean {
    return this.pattern === 'editable' && !this.disabled && !this.readOnly
  }

  /** 有效只读状态（综合 readOnly + pattern） */
  get effectiveReadOnly(): boolean {
    return this.readOnly || this.pattern === 'readOnly'
  }

  /** 有效禁用状态（综合 disabled + pattern） */
  get effectiveDisabled(): boolean {
    return this.disabled || this.pattern === 'disabled'
  }

  /** UI 状态 */
  label: string
  description: string
  /**
   * 展示状态（参考 Formily display 三态）
   * - `visible`：正常显示
   * - `hidden`：隐藏 UI 但保留数据
   * - `none`：隐藏 UI 且排除数据
   */
  display: FieldDisplay
  disabled: boolean
  readOnly: boolean
  loading: boolean
  active: boolean
  visited: boolean
  /** 字段自身的 pattern（不含 form 级覆盖，外部一般不直接使用） */
  selfPattern: FieldPattern
  required: boolean

  /** 组件配置 */
  component: string | ComponentType
  componentProps: Record<string, unknown>
  decorator: string | ComponentType
  decoratorProps: Record<string, unknown>

  /** 数据源 */
  dataSource: DataSourceItem[]
  dataSourceLoading: boolean

  /** 验证状态 */
  errors: ValidationFeedback[]
  warnings: ValidationFeedback[]
  validating: boolean
  rules: ValidationRule[]

  /** 数据处理 */
  displayFormat?: (value: Value) => unknown
  inputParse?: (inputValue: unknown) => Value
  submitTransform?: (value: Value) => unknown
  submitPath?: string
  excludeWhenHidden: boolean

  /** 联动规则（由 ReactionEngine 读取） */
  readonly reactions: ReactionRule[]

  /** 内部释放器 */
  private disposers: Disposer[] = []
  /** 值变化回调 */
  private valueChangeHandlers: Array<(value: Value, oldValue: Value) => void> = []
  /** 异步验证取消控制器 */
  private validateAbortController: AbortController | null = null
  /** 数据源请求取消控制器 */
  private _dataSourceAbortController: AbortController | null = null

  constructor(form: FormInstance, props: FieldProps<Value>, parentPath = '') {
    this.id = uid('field')
    this.form = form
    this.name = props.name
    this.path = parentPath ? FormPath.join(parentPath, props.name) : props.name
    this.mounted = false
    this.domRef = null

    /* a11y */
    this.ariaLabel = props.ariaLabel
    this.ariaDescribedBy = props.ariaDescribedBy
    this.ariaLabelledBy = props.ariaLabelledBy

    /* 初始化状态 */
    this.label = props.label ?? ''
    this.description = props.description ?? ''
    this.display = props.display ?? (props.visible === false ? 'none' : 'visible')
    this.disabled = props.disabled ?? false
    this.readOnly = props.readOnly ?? false
    this.loading = false
    this.active = false
    this.visited = false
    this.selfPattern = props.pattern ?? 'editable'
    this.required = props.required ?? false

    /* 组件 */
    this.component = props.component ?? ''
    this.componentProps = props.componentProps ?? {}
    this.decorator = props.decorator ?? ''
    this.decoratorProps = props.decoratorProps ?? {}

    /* 数据源 */
    this.dataSource = isArray(props.dataSource) ? props.dataSource : []
    this.dataSourceLoading = false

    /* 验证 */
    this.errors = []
    this.warnings = []
    this.validating = false
    this.rules = [...(props.rules ?? [])]
    if (this.required && !this.rules.some(r => r.required)) {
      this.rules.unshift({ required: true })
    }

    /* 数据处理 */
    this.displayFormat = props.displayFormat
    this.inputParse = props.inputParse
    this.submitTransform = props.submitTransform
    this.submitPath = props.submitPath
    this.excludeWhenHidden = props.excludeWhenHidden ?? true

    /* 联动 */
    this.reactions = props.reactions ?? []

    /* 设置初始值 */
    if (props.initialValue !== undefined) {
      const currentVal = FormPath.getIn(form.values, this.path)
      if (currentVal === undefined) {
        FormPath.setIn(form.values as Record<string, unknown>, this.path, deepClone(props.initialValue))
      }
      /**
       * 仅在 form.initialValues 中尚未设置该路径时才写入。
       * 避免覆盖 ConfigForm 通过 initialValues prop 传入的值
       * （例如数组字段的 initialValue 默认为 []，会覆盖 form 级的初始数组）。
       */
      const currentInitial = FormPath.getIn(form.initialValues, this.path)
      if (currentInitial === undefined) {
        FormPath.setIn(form.initialValues as Record<string, unknown>, this.path, deepClone(props.initialValue))
      }
    }
  }

  /**
   * visible 兼容属性（映射到 display）
   * - get: display !== 'none' 且 display !== 'hidden' 时为 true
   * - set: true → 'visible', false → 'none'
   */
  get visible(): boolean {
    return this.display === 'visible'
  }

  set visible(val: boolean) {
    this.display = val ? 'visible' : 'none'
  }

  /** 当前值（从 form.values 读取） */
  get value(): Value {
    return FormPath.getIn<Value>(this.form.values, this.path) as Value
  }

  set value(val: Value) {
    this.setValue(val)
  }

  /** 初始值 */
  get initialValue(): Value {
    return FormPath.getIn<Value>(this.form.initialValues, this.path) as Value
  }

  set initialValue(val: Value) {
    const oldValue = this.initialValue
    FormPath.setIn(this.form.initialValues as Record<string, unknown>, this.path, val)
    if (oldValue !== val) {
      this.form.notifyFieldInitialValueChange(this.path, val)
    }
  }

  /** 是否被修改 */
  get modified(): boolean {
    return this.value !== this.initialValue
  }

  /** 是否验证通过 */
  get valid(): boolean {
    return this.errors.length === 0
  }

  /**
   * 用户输入
   *
   * 由 UI 组件的 onChange 回调调用。
   * 完整流程：parse → 写入 values → 通知字段回调 → 通知表单 → 触发 change 验证。
   *
   * 与 setValue 的区别：
   * - onInput 触发 parse 处理
   * - onInput 触发 change 验证
   * - onInput emit ON_FIELD_INPUT_VALUE_CHANGE + ON_FIELD_VALUE_CHANGE
   * - setValue 仅 emit ON_FIELD_VALUE_CHANGE
   */
  onInput(value: Value): void {
    const oldValue = this.value
    const parsedValue = this.inputParse ? this.inputParse(value) : value
    FormPath.setIn(this.form.values as Record<string, unknown>, this.path, parsedValue)

    /* 通知字段级回调 */
    for (const handler of this.valueChangeHandlers) {
      handler(parsedValue, oldValue)
    }

    /* 通知表单级（触发 onValuesChange + reactions + INPUT 事件） */
    this.form.notifyFieldInputChange(this.path, parsedValue)
    this.form.notifyFieldValueChange(this.path, parsedValue)
    this.form.notifyValuesChange()

    /* 值变化后触发 change 验证（规则级 trigger 过滤） */
    this.validate('change').catch(() => {})
  }

  /**
   * 程序赋值（不触发验证）
   *
   * 用于联动赋值、初始化、reset 等程序控制场景。
   * 不执行 parse，不触发 change 验证，避免联动赋值时误触发校验。
   */
  setValue(value: Value): void {
    const oldValue = this.value
    FormPath.setIn(this.form.values as Record<string, unknown>, this.path, value)

    /* 通知字段级回调 */
    for (const handler of this.valueChangeHandlers) {
      handler(value, oldValue)
    }

    /* 通知表单级（触发 onValuesChange + reactions，不触发 INPUT 事件） */
    this.form.notifyFieldValueChange(this.path, value)
    this.form.notifyValuesChange()
  }

  /** 更新组件 Props */
  setComponentProps(props: Record<string, unknown>): void {
    this.componentProps = { ...this.componentProps, ...props }
  }

  /** 设置数据源 */
  setDataSource(items: DataSourceItem[]): void {
    this.dataSource = items
  }

  /** 加载远程数据源 */
  async loadDataSource(config?: DataSourceConfig): Promise<void> {
    if (!config?.url)
      return

    /* 取消上一次数据源请求，避免竞态覆盖 */
    this._dataSourceAbortController?.abort()
    this._dataSourceAbortController = new AbortController()
    const signal = this._dataSourceAbortController.signal

    this.dataSourceLoading = true
    this.loading = true
    try {
      const items = await fetchDataSource(config, this.form.values as Record<string, unknown>, signal)

      /* 请求期间被取消（用户快速切换选项），丢弃过期结果 */
      if (signal.aborted) return

      this.dataSource = items
    }
    catch (err) {
      /* 请求被取消时静默忽略 */
      if (err instanceof DOMException && err.name === 'AbortError') return
      console.error(`[ConfigForm] 字段 ${this.path} 数据源加载失败:`, err)
    }
    finally {
      /* 仅在未取消时重置 loading 状态，避免取消后闪烁 */
      if (!signal.aborted) {
        this.dataSourceLoading = false
        this.loading = false
      }
    }
  }

  /** 添加验证规则 */
  addRule(rule: ValidationRule): void {
    this.rules.push(rule)
  }

  /** 移除验证规则 */
  removeRule(id: string): void {
    this.rules = this.rules.filter(r => r.id !== id)
  }

  /** 执行验证 */
  async validate(trigger?: ValidationTrigger): Promise<ValidationFeedback[]> {
    /* 取消上一次异步验证 */
    this.validateAbortController?.abort()
    this.validateAbortController = new AbortController()
    const signal = this.validateAbortController.signal

    this.validating = true
    try {
      const result = await validate(this.value, this.rules, {
        path: this.path,
        label: this.label || this.name,
        getFieldValue: (p: string) => this.form.getFieldValue(p),
        getValues: () => this.form.values as Record<string, unknown>,
      }, trigger, signal)

      /* 验证期间被取消（用户快速输入），丢弃过期结果 */
      if (signal.aborted) {
        return this.errors
      }

      this.errors = result.errors
      this.warnings = result.warnings
      return result.errors
    }
    finally {
      this.validating = false
    }
  }

  /** 重置字段 */
  reset(): void {
    const initialVal = this.initialValue
    FormPath.setIn(this.form.values as Record<string, unknown>, this.path, deepClone(initialVal))
    this.errors = []
    this.warnings = []
    this.active = false
    this.visited = false
  }

  /** 聚焦 */
  focus(): void {
    this.active = true
    this.visited = true
  }

  /**
   * 失焦（对应 Formily 的 onBlur）
   *
   * 参考 Formily 设计：失焦后总是调用 validate('blur')。
   * 验证过滤交给规则的 trigger 属性。
   */
  blur(): void {
    this.active = false
    this.validate('blur').catch(() => {})
  }

  /** 显示 */
  show(): void {
    this.display = 'visible'
  }

  /** 隐藏（排除数据，等价于 display='none'） */
  hide(): void {
    this.display = 'none'
  }

  /** 启用 */
  enable(): void {
    this.disabled = false
  }

  /** 禁用 */
  disable(): void {
    this.disabled = true
  }

  /**
   * 字段挂载
   *
   * 由框架桥接层在组件挂载到 DOM 后调用。
   * 标记字段已渲染完成，emit ON_FIELD_MOUNT 事件。
   */
  mount(): void {
    if (this.mounted) return
    this.mounted = true
    this.form.notifyFieldMount(this as unknown as FieldInstance)
  }

  /**
   * 字段卸载
   *
   * 由框架桥接层在组件从 DOM 卸载前调用。
   * 标记字段已卸载，emit ON_FIELD_UNMOUNT 事件。
   */
  unmount(): void {
    if (!this.mounted) return
    this.mounted = false
    this.form.notifyFieldUnmount(this as unknown as FieldInstance)
  }

  /** 监听值变化 */
  onValueChange(handler: (value: Value, oldValue: Value) => void): Disposer {
    this.valueChangeHandlers.push(handler)
    return () => {
      const idx = this.valueChangeHandlers.indexOf(handler)
      if (idx !== -1)
        this.valueChangeHandlers.splice(idx, 1)
    }
  }

  /** 销毁字段 */
  dispose(): void {
    this.validateAbortController?.abort()
    this._dataSourceAbortController?.abort()
    for (const disposer of this.disposers) {
      disposer()
    }
    this.disposers = []
    this.valueChangeHandlers = []
    this.mounted = false
  }
}
