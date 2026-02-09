import type {
  ComponentType,
  DataSourceItem,
  Disposer,
  FieldDisplay,
  FieldPattern,
} from '@moluoxixi/shared'
import type { ValidationFeedback, ValidationRule, ValidationTrigger } from '@moluoxixi/validator'
import type {
  DataSourceConfig,
  FieldInstance,
  FieldProps,
  FormInstance,
  ReactionRule,
} from '../types'
import { deepClone, FormPath, isArray, uid } from '@moluoxixi/shared'
import { validate } from '@moluoxixi/validator'
import { fetchDataSource } from '../datasource/manager'

/**
 * 字段模型
 *
 * 核心设计：
 * - value 存储在 form.values 中（单一数据源）
 * - 字段状态（visible / disabled 等）各自独立管理
 * - 由 Form.createField() 创建后通过 adapter.makeObservable() 变为响应式
 * - 联动由外部 ReactionEngine 驱动
 *
 * 注意：不要直接 new Field()，应通过 form.createField() 创建。
 */
export class Field<Value = unknown> implements FieldInstance<Value> {
  readonly id: string
  readonly form: FormInstance
  readonly path: string
  readonly name: string

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
  pattern: FieldPattern
  required: boolean

  /** 组件配置 */
  component: string | ComponentType
  componentProps: Record<string, unknown>
  wrapper: string | ComponentType
  wrapperProps: Record<string, unknown>

  /** 数据源 */
  dataSource: DataSourceItem[]
  dataSourceLoading: boolean

  /** 验证状态 */
  errors: ValidationFeedback[]
  warnings: ValidationFeedback[]
  validating: boolean
  rules: ValidationRule[]

  /** 数据处理 */
  format?: (value: Value) => unknown
  parse?: (inputValue: unknown) => Value
  transform?: (value: Value) => unknown
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

  constructor(form: FormInstance, props: FieldProps<Value>, parentPath = '') {
    this.id = uid('field')
    this.form = form
    this.name = props.name
    this.path = parentPath ? FormPath.join(parentPath, props.name) : props.name

    /* 初始化状态 */
    this.label = props.label ?? ''
    this.description = props.description ?? ''
    this.display = props.display ?? (props.visible === false ? 'none' : 'visible')
    this.disabled = props.disabled ?? false
    this.readOnly = props.readOnly ?? false
    this.loading = false
    this.active = false
    this.visited = false
    this.pattern = props.pattern ?? 'editable'
    this.required = props.required ?? false

    /* 组件 */
    this.component = props.component ?? ''
    this.componentProps = props.componentProps ?? {}
    this.wrapper = props.wrapper ?? ''
    this.wrapperProps = props.wrapperProps ?? {}

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
    this.format = props.format
    this.parse = props.parse
    this.transform = props.transform
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
    FormPath.setIn(this.form.initialValues as Record<string, unknown>, this.path, val)
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
   * 设置值（对应 Formily 的 onInput）
   *
   * 参考 Formily 设计：值变化后总是调用 validate('change')。
   * 验证过滤交给规则的 trigger 属性（无 trigger 的规则在所有时机执行）。
   */
  setValue(value: Value): void {
    const oldValue = this.value
    const parsedValue = this.parse ? this.parse(value) : value
    FormPath.setIn(this.form.values as Record<string, unknown>, this.path, parsedValue)

    /* 通知字段级回调 */
    for (const handler of this.valueChangeHandlers) {
      handler(parsedValue, oldValue)
    }

    /* 通知表单级（触发 onValuesChange + reactions） */
    this.form.notifyFieldValueChange(this.path, parsedValue)
    this.form.notifyValuesChange()

    /* 值变化后触发 change 验证（规则级 trigger 过滤） */
    this.validate('change').catch(() => {})
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
    this.dataSourceLoading = true
    this.loading = true
    try {
      const items = await fetchDataSource(config, this.form.values as Record<string, unknown>)
      this.dataSource = items
    }
    catch (err) {
      console.error(`[ConfigForm] 字段 ${this.path} 数据源加载失败:`, err)
    }
    finally {
      this.dataSourceLoading = false
      this.loading = false
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

    this.validating = true
    try {
      const result = await validate(this.value, this.rules, {
        path: this.path,
        label: this.label || this.name,
        getFieldValue: (p: string) => this.form.getFieldValue(p),
        getValues: () => this.form.values as Record<string, unknown>,
      }, trigger)
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
    for (const disposer of this.disposers) {
      disposer()
    }
    this.disposers = []
    this.valueChangeHandlers = []
  }
}
