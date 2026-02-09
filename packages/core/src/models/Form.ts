import type { Disposer, Feedback, FieldPattern } from '../shared'
import type { ValidationFeedback, ValidationTrigger } from '../validator'
import type {
  ArrayFieldInstance,
  ArrayFieldProps,
  FieldInstance,
  FieldProps,
  FormConfig,
  FormGraph,
  FormInstance,
  FormPlugin,
  ObjectFieldInstance,
  ObjectFieldProps,
  PluginContext,
  ResetOptions,
  SubmitResult,
  VoidFieldInstance,
  VoidFieldProps,
} from '../types'
import { getReactiveAdapter } from '../reactive'
import { deepClone, deepMerge, FormPath, uid } from '../shared'
import { diff as coreDiff, getDiffView as coreGetDiffView } from '../shared/diff'
import type { DiffFieldView, DiffResult } from '../shared/diff'
import { FormEventEmitter, FormLifeCycle } from '../events'
import { FormHookManager } from '../hooks'
import { ReactionEngine } from '../reaction/engine'
import { ArrayField } from './ArrayField'
import { Field } from './Field'
import { ObjectField } from './ObjectField'
import { VoidField } from './VoidField'

/**
 * 表单模型
 *
 * 核心设计：
 * - values 是深度响应式对象（单一数据源）
 * - 所有 Field 的值从 values 中读取
 * - 通过 ReactionEngine 处理字段联动
 * - 通过 ReactiveAdapter 实现框架无关
 *
 * 注意：不要直接 new Form()，应使用 createForm() 工厂函数，
 * 它会正确处理响应式代理的创建和返回。
 */
export class Form<Values extends Record<string, unknown> = Record<string, unknown>>
implements FormInstance<Values> {
  readonly id: string
  values: Values
  initialValues: Values
  submitting: boolean
  validating: boolean
  /** 表单是否已挂载到 DOM */
  mounted: boolean
  pattern: FieldPattern
  validateTrigger: ValidationTrigger | ValidationTrigger[]
  labelPosition: 'top' | 'left' | 'right'
  labelWidth: number | string

  /** 字段注册表（path → Field 响应式代理） */
  private fields = new Map<string, Field>()
  /** 数组字段注册表 */
  private arrayFields = new Map<string, ArrayField>()
  /** 对象字段注册表 */
  private objectFields = new Map<string, ObjectField>()
  /** 虚拟字段注册表 */
  private voidFields = new Map<string, VoidField>()
  /** 值变化回调 */
  private valuesChangeHandlers: Array<(values: Values) => void> = []
  /** 字段值变化回调 */
  private fieldValueChangeHandlers = new Map<string, Array<(value: unknown) => void>>()
  /** 联动引擎 */
  private reactionEngine: ReactionEngine
  /** 事件发射器（参考 Formily Heart） */
  private _emitter = new FormEventEmitter()
  /** 释放器 */
  private disposers: Disposer[] = []
  /** 并发提交防护：正在执行的提交 Promise */
  private _submitPromise: Promise<SubmitResult<Values>> | null = null
  /** 已安装的插件 API 注册表（name → api） */
  private _pluginAPIs = new Map<string, unknown>()
  /** 已安装的插件销毁函数列表 */
  private _pluginDisposers: Array<() => void> = []
  /** Hook 管理器（管线拦截） */
  private _hookManager = new FormHookManager()

  constructor(config: FormConfig<Values> = {}) {
    this.id = uid('form')
    this.values = (config.initialValues ? deepClone(config.initialValues) : {}) as Values
    this.initialValues = (config.initialValues ? deepClone(config.initialValues) : {}) as Values
    this.submitting = false
    this.validating = false
    this.mounted = false
    this.pattern = config.pattern ?? 'editable'
    this.validateTrigger = config.validateTrigger ?? 'change'
    this.labelPosition = config.labelPosition ?? 'right'
    this.labelWidth = config.labelWidth ?? 'auto'

    this.reactionEngine = new ReactionEngine(this as unknown as FormInstance)

    /* 执行用户定义的 effects */
    if (config.effects) {
      config.effects(this as unknown as FormInstance)
    }

    this._emitter.emit(FormLifeCycle.ON_FORM_INIT, this)
  }

  /** 表单是否被修改 */
  get modified(): boolean {
    for (const field of this.fields.values()) {
      if (field.modified)
        return true
    }
    return false
  }

  /** 表单是否验证通过 */
  get valid(): boolean {
    for (const field of this.fields.values()) {
      if (!field.valid)
        return false
    }
    return true
  }

  /** 所有错误 */
  get errors(): Feedback[] {
    const result: Feedback[] = []
    for (const field of this.fields.values()) {
      for (const err of field.errors) {
        result.push({
          path: err.path,
          message: err.message,
          type: 'error',
          code: err.ruleName,
        })
      }
    }
    return result
  }

  /** 所有警告 */
  get warnings(): Feedback[] {
    const result: Feedback[] = []
    for (const field of this.fields.values()) {
      for (const warn of field.warnings) {
        result.push({
          path: warn.path,
          message: warn.message,
          type: 'warning',
          code: warn.ruleName,
        })
      }
    }
    return result
  }

  /** 创建普通字段（经过 hook 管线） */
  createField<V = unknown>(props: FieldProps<V>): FieldInstance<V> {
    return this._hookManager.runCreateField<V>(
      this as unknown as FormInstance,
      props,
      (p) => this._doCreateField(p),
    )
  }

  /** 原始字段创建逻辑 */
  private _doCreateField<V = unknown>(props: FieldProps<V>): FieldInstance<V> {
    const adapter = getReactiveAdapter()
    const rawField = new Field<V>(this as unknown as FormInstance, props)

    /* 使字段变为响应式，存储并返回代理 */
    const field = adapter.makeObservable(rawField)
    this.fields.set(field.path, field as unknown as Field)

    /* 注册联动 */
    if (field.reactions.length > 0) {
      this.reactionEngine.registerFieldReactions(
        field as unknown as FieldInstance,
        field.reactions,
      )
    }

    this._emitter.emit(FormLifeCycle.ON_FIELD_INIT, field)
    return field as unknown as FieldInstance<V>
  }

  /** 创建数组字段 */
  createArrayField<V extends unknown[] = unknown[]>(
    props: ArrayFieldProps<V>,
  ): ArrayFieldInstance<V> {
    const adapter = getReactiveAdapter()
    const rawField = new ArrayField<V>(this as unknown as FormInstance, props)

    const field = adapter.makeObservable(rawField)
    this.arrayFields.set(field.path, field as unknown as ArrayField)
    this.fields.set(field.path, field as unknown as Field)

    if (field.reactions.length > 0) {
      this.reactionEngine.registerFieldReactions(
        field as unknown as FieldInstance,
        field.reactions,
      )
    }

    return field as unknown as ArrayFieldInstance<V>
  }

  /** 创建对象字段 */
  createObjectField<V extends Record<string, unknown> = Record<string, unknown>>(
    props: ObjectFieldProps<V>,
  ): ObjectFieldInstance<V> {
    const adapter = getReactiveAdapter()
    const rawField = new ObjectField<V>(this as unknown as FormInstance, props)

    const field = adapter.makeObservable(rawField)
    this.objectFields.set(field.path, field as unknown as ObjectField)
    this.fields.set(field.path, field as unknown as Field)

    if (field.reactions.length > 0) {
      this.reactionEngine.registerFieldReactions(
        field as unknown as FieldInstance,
        field.reactions,
      )
    }

    this._emitter.emit(FormLifeCycle.ON_FIELD_INIT, field)
    return field as unknown as ObjectFieldInstance<V>
  }

  /** 创建虚拟字段 */
  createVoidField(props: VoidFieldProps): VoidFieldInstance {
    const adapter = getReactiveAdapter()
    const rawField = new VoidField(this as unknown as FormInstance, props)

    const field = adapter.makeObservable(rawField)
    this.voidFields.set(field.path, field)

    if (field.reactions.length > 0) {
      this.reactionEngine.registerFieldReactions(
        field as unknown as FieldInstance,
        field.reactions,
      )
    }

    return field
  }

  /** 获取字段 */
  getField(path: string): FieldInstance | undefined {
    return this.fields.get(path) as unknown as FieldInstance | undefined
  }

  /** 获取数组字段 */
  getArrayField(path: string): ArrayFieldInstance | undefined {
    return this.arrayFields.get(path) as unknown as ArrayFieldInstance | undefined
  }

  /** 获取对象字段 */
  getObjectField(path: string): ObjectFieldInstance | undefined {
    return this.objectFields.get(path) as unknown as ObjectFieldInstance | undefined
  }

  /**
   * 移除字段
   *
   * 清理字段实例、联动订阅，以及 form.values / form.initialValues 中对应路径的值。
   *
   * 设计说明：条件可见性应使用 field.display（'hidden'/'none'），不触发 removeField，值自然保留。
   * removeField 语义是字段从表单中彻底移除（如 schema 切换），残留值会导致：
   * - 下次 createField 同路径时 initialValue 无法写入（被旧值覆盖）
   * - form.submit() 提交多余数据
   */
  removeField(path: string): void {
    const field = this.fields.get(path)
    if (field) {
      field.dispose()
      this.fields.delete(path)
      this.arrayFields.delete(path)
      this.objectFields.delete(path)
      this.reactionEngine.removeFieldReactions(path)

      /* 清理 values 和 initialValues 中该路径的值，防止状态残留 */
      FormPath.deleteIn(this.values as Record<string, unknown>, path)
      FormPath.deleteIn(this.initialValues as Record<string, unknown>, path)
    }
    const voidField = this.voidFields.get(path)
    if (voidField) {
      voidField.dispose()
      this.voidFields.delete(path)
    }
  }

  /**
   * 清理数组字段中索引 >= start 的子字段注册
   *
   * 参考 Formily cleanupArrayChildren：
   * 当数组缩短时，只清理多余索引的子字段，保留有效部分。
   *
   * @param arrayPath - 数组字段路径（如 'contacts'）
   * @param start - 起始索引，>= start 的子字段将被清理
   */
  cleanupArrayChildren(arrayPath: string, start: number): void {
    const prefix = arrayPath + '.'
    const indexRe = /^(\d+)/

    /**
     * 判断子字段路径是否属于 >= start 的数组项。
     * 如 arrayPath='contacts', path='contacts.2.name' → 提取 index=2
     */
    const shouldCleanup = (path: string): boolean => {
      if (!path.startsWith(prefix)) return false
      const afterPrefix = path.slice(prefix.length)
      const match = afterPrefix.match(indexRe)
      if (!match) return false
      return Number(match[1]) >= start
    }

    /* 清理数据字段 */
    const toRemove: string[] = []
    for (const path of this.fields.keys()) {
      if (shouldCleanup(path)) toRemove.push(path)
    }
    for (const path of toRemove) {
      const field = this.fields.get(path)
      if (field) {
        field.dispose()
        this.fields.delete(path)
        this.arrayFields.delete(path)
        this.reactionEngine.removeFieldReactions(path)
      }
    }

    /* 清理虚拟字段 */
    const toRemoveVoid: string[] = []
    for (const path of this.voidFields.keys()) {
      if (shouldCleanup(path)) toRemoveVoid.push(path)
    }
    for (const path of toRemoveVoid) {
      const voidField = this.voidFields.get(path)
      if (voidField) {
        voidField.dispose()
        this.voidFields.delete(path)
      }
    }
  }

  /** 通过模式匹配查询字段 */
  queryFields(pattern: string): FieldInstance[] {
    const result: FieldInstance[] = []
    for (const [path, field] of this.fields) {
      if (FormPath.match(pattern, path)) {
        result.push(field as unknown as FieldInstance)
      }
    }
    return result
  }

  /** 获取所有注册的字段 */
  getAllFields(): Map<string, Field> {
    return this.fields
  }

  /** 获取所有虚拟字段 */
  getAllVoidFields(): Map<string, VoidField> {
    return this.voidFields
  }

  /** 设置表单值（经过 hook 管线） */
  setValues(values: Partial<Values>, strategy: 'merge' | 'shallow' | 'replace' = 'merge'): void {
    this._hookManager.runSetValues(
      this as unknown as FormInstance,
      values as Record<string, unknown>,
      strategy,
      () => this._doSetValues(values, strategy),
    )
  }

  /** 原始赋值逻辑 */
  private _doSetValues(values: Partial<Values>, strategy: 'merge' | 'shallow' | 'replace'): void {
    const adapter = getReactiveAdapter()
    adapter.batch(() => {
      switch (strategy) {
        case 'replace': {
          const target = this.values as Record<string, unknown>
          const source = values as Record<string, unknown>
          for (const key of Object.keys(target)) {
            if (!(key in source)) {
              delete target[key]
            }
          }
          Object.assign(target, source)
          break
        }
        case 'shallow':
          Object.assign(this.values, values)
          break
        case 'merge':
        default:
          deepMerge(this.values as Record<string, unknown>, values as Record<string, unknown>)
          break
      }
      this.notifyValuesChange()
    })
  }

  /** 设置单个字段值 */
  setFieldValue(path: string, value: unknown): void {
    FormPath.setIn(this.values as Record<string, unknown>, path, value)
    this.notifyFieldValueChange(path, value)
    this.notifyValuesChange()
  }

  /** 获取字段值 */
  getFieldValue(path: string): unknown {
    return FormPath.getIn(this.values, path)
  }

  /** 重置表单（经过 hook 管线） */
  reset(options?: ResetOptions): void {
    this._hookManager.runReset(
      this as unknown as FormInstance,
      options,
      () => this._doReset(options),
    )
  }

  /** 原始重置逻辑 */
  private _doReset(options?: ResetOptions): void {
    const adapter = getReactiveAdapter()
    adapter.batch(() => {
      if (options?.fields) {
        for (const path of options.fields) {
          const field = this.fields.get(path)
          if (field)
            field.reset()
        }
      }
      else {
        if (options?.forceClear) {
          this.values = {} as Values
        }
        else {
          this.values = deepClone(this.initialValues) as Values
        }
        for (const field of this.fields.values()) {
          field.errors = []
          field.warnings = []
          field.active = false
          field.visited = false
        }
      }
    })

    this._emitter.emit(FormLifeCycle.ON_FORM_RESET, this)

    if (options?.validate) {
      this.validate().catch(() => { /* 忽略 */ })
    }
  }

  /**
   * 提交表单（经过 hook 管线）
   *
   * 并发防护：多次调用（如用户快速双击）会复用同一个提交 Promise，
   * 所有调用方拿到相同结果，避免重复提交。
   */
  async submit(): Promise<SubmitResult<Values>> {
    if (this._submitPromise) {
      return this._submitPromise
    }
    this._submitPromise = this._hookManager.runSubmit(
      this as unknown as FormInstance,
      () => this._doSubmit(),
    ) as Promise<SubmitResult<Values>>
    try {
      return await this._submitPromise
    }
    finally {
      this._submitPromise = null
    }
  }

  /** 原始提交逻辑 */
  private async _doSubmit(): Promise<SubmitResult<Values>> {
    this.submitting = true
    this._emitter.emit(FormLifeCycle.ON_FORM_SUBMIT_START, this)
    try {
      const { valid, errors, warnings } = await this.validate()
      if (!valid) {
        if (errors.length > 0) {
          const firstErrorField = this.fields.get(errors[0].path)
          firstErrorField?.focus()
        }
        const result = { values: this.values, errors, warnings }
        this._emitter.emit(FormLifeCycle.ON_FORM_SUBMIT_FAILED, result)
        return result
      }

      const submitValues = this.collectSubmitValues()
      const result = { values: submitValues as Values, errors: [], warnings }
      this._emitter.emit(FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, result)
      return result
    }
    finally {
      this.submitting = false
      this._emitter.emit(FormLifeCycle.ON_FORM_SUBMIT_END, this)
    }
  }

  /** 验证全部或部分字段（经过 hook 管线） */
  async validate(
    pattern?: string,
  ): Promise<{ valid: boolean, errors: ValidationFeedback[], warnings: ValidationFeedback[] }> {
    return this._hookManager.runValidate(
      this as unknown as FormInstance,
      pattern,
      () => this._doValidate(pattern),
    )
  }

  /** 原始验证逻辑 */
  private async _doValidate(
    pattern?: string,
  ): Promise<{ valid: boolean, errors: ValidationFeedback[], warnings: ValidationFeedback[] }> {
    this.validating = true
    this._emitter.emit(FormLifeCycle.ON_FORM_VALIDATE_START, this)
    const allErrors: ValidationFeedback[] = []
    const allWarnings: ValidationFeedback[] = []

    try {
      const fieldsToValidate = pattern
        ? this.queryFields(pattern)
        : Array.from(this.fields.values()) as unknown as FieldInstance[]

      const promises = fieldsToValidate.map(async (field) => {
        if (!field.visible)
          return
        const errors = await field.validate('submit')
        allErrors.push(...errors)
        allWarnings.push(...field.warnings)
      })

      await Promise.all(promises)

      const result = {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
      }

      if (result.valid) {
        this._emitter.emit(FormLifeCycle.ON_FORM_VALIDATE_SUCCESS, result)
      }
      else {
        this._emitter.emit(FormLifeCycle.ON_FORM_VALIDATE_FAILED, result)
      }

      return result
    }
    finally {
      this.validating = false
    }
  }

  /**
   * 分区域验证
   *
   * 用于 Steps / Tabs 等分区域场景，仅验证指定区域的字段。
   * 支持多种指定方式：路径前缀、字段路径数组、通配符模式数组。
   *
   * @param section - 区域标识，支持以下格式：
   *   - `string`：路径前缀或通配符模式（如 'basicInfo.*'）
   *   - `string[]`：精确字段路径数组（如 ['name', 'email', 'phone']）
   * @returns 验证结果
   *
   * @example
   * ```ts
   * // Steps 场景：验证当前步骤的字段
   * const step1Fields = ['name', 'email', 'phone']
   * const step2Fields = ['address.*']
   *
   * // 第一步验证
   * const { valid } = await form.validateSection(step1Fields)
   * if (valid) goToNextStep()
   *
   * // 或使用通配符
   * const { valid } = await form.validateSection('address.*')
   * ```
   */
  async validateSection(
    section: string | string[],
  ): Promise<{ valid: boolean, errors: ValidationFeedback[], warnings: ValidationFeedback[] }> {
    const allErrors: ValidationFeedback[] = []
    const allWarnings: ValidationFeedback[] = []

    /* 收集要验证的字段 */
    let fieldsToValidate: FieldInstance[] = []

    if (typeof section === 'string') {
      /* 单个通配符模式 */
      fieldsToValidate = this.queryFields(section)
    }
    else {
      /* 字段路径数组：逐个查询，支持每个元素为精确路径或通配符 */
      for (const pattern of section) {
        if (pattern.includes('*')) {
          fieldsToValidate.push(...this.queryFields(pattern))
        }
        else {
          const field = this.getField(pattern)
          if (field) fieldsToValidate.push(field)
        }
      }
    }

    /* 去重 */
    const uniqueFields = Array.from(new Map(fieldsToValidate.map(f => [f.path, f])).values())

    const promises = uniqueFields.map(async (field) => {
      if (!field.visible) return
      const errors = await field.validate('submit')
      allErrors.push(...errors)
      allWarnings.push(...field.warnings)
    })

    await Promise.all(promises)

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    }
  }

  /**
   * 清除指定区域的验证错误
   *
   * 配合分区域验证使用，在切换 Step / Tab 时清除前一个区域的错误状态。
   *
   * @param section - 区域标识（同 validateSection）
   */
  clearSectionErrors(section: string | string[]): void {
    const adapter = getReactiveAdapter()
    adapter.batch(() => {
      let fieldsToClean: FieldInstance[] = []

      if (typeof section === 'string') {
        fieldsToClean = this.queryFields(section)
      }
      else {
        for (const pattern of section) {
          if (pattern.includes('*')) {
            fieldsToClean.push(...this.queryFields(pattern))
          }
          else {
            const field = this.getField(pattern)
            if (field) fieldsToClean.push(field)
          }
        }
      }

      for (const field of fieldsToClean) {
        ;(field as { errors: ValidationFeedback[] }).errors = []
        ;(field as { warnings: ValidationFeedback[] }).warnings = []
      }
    })
  }

  /** 监听值变化 */
  onValuesChange(handler: (values: Values) => void): Disposer {
    this.valuesChangeHandlers.push(handler)
    return () => {
      const idx = this.valuesChangeHandlers.indexOf(handler)
      if (idx !== -1)
        this.valuesChangeHandlers.splice(idx, 1)
    }
  }

  /** 监听特定字段值变化 */
  onFieldValueChange(path: string, handler: (value: unknown) => void): Disposer {
    if (!this.fieldValueChangeHandlers.has(path)) {
      this.fieldValueChangeHandlers.set(path, [])
    }
    this.fieldValueChangeHandlers.get(path)!.push(handler)
    return () => {
      const handlers = this.fieldValueChangeHandlers.get(path)
      if (handlers) {
        const idx = handlers.indexOf(handler)
        if (idx !== -1)
          handlers.splice(idx, 1)
      }
    }
  }

  /**
   * 订阅特定生命周期事件
   *
   * @example
   * ```ts
   * form.on(FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, ({ payload }) => {
   *   console.log('提交成功:', payload)
   * })
   * ```
   */
  on(type: FormLifeCycle, handler: (event: { type: FormLifeCycle, payload: unknown }) => void): Disposer {
    return this._emitter.on(type, handler)
  }

  /**
   * 订阅所有生命周期事件
   *
   * @example
   * ```ts
   * form.subscribe(({ type, payload }) => {
   *   console.log('事件:', type, payload)
   * })
   * ```
   */
  subscribe(handler: (event: { type: FormLifeCycle, payload: unknown }) => void): Disposer {
    return this._emitter.subscribe(handler)
  }

  /**
   * 设置字段状态（参考 Formily form.setFieldState）
   *
   * @param pattern - 字段路径或通配符模式
   * @param state - 要设置的状态
   *
   * @example
   * ```ts
   * // 禁用单个字段
   * form.setFieldState('name', { disabled: true })
   *
   * // 通配符批量隐藏
   * form.setFieldState('address.*', { display: 'hidden' })
   * ```
   */
  setFieldState(pattern: string, state: Partial<{
    display: 'visible' | 'hidden' | 'none'
    visible: boolean
    disabled: boolean
    preview: boolean
    loading: boolean
    required: boolean
    pattern: FieldPattern
    value: unknown
    componentProps: Record<string, unknown>
    component: string
  }>): void {
    const fields = pattern.includes('*')
      ? this.queryFields(pattern)
      : (() => { const f = this.getField(pattern); return f ? [f] : [] })()

    const adapter = getReactiveAdapter()
    adapter.batch(() => {
      for (const field of fields) {
        if (state.display !== undefined) (field as any).display = state.display
        if (state.visible !== undefined) field.visible = state.visible
        if (state.disabled !== undefined) field.disabled = state.disabled
        if (state.preview !== undefined) field.preview = state.preview
        if (state.loading !== undefined) field.loading = state.loading
        if (state.required !== undefined) field.required = state.required
        if (state.pattern !== undefined) field.pattern = state.pattern
        if (state.value !== undefined) field.setValue(state.value)
        if (state.componentProps !== undefined) field.setComponentProps(state.componentProps)
        if (state.component !== undefined) field.component = state.component
      }
    })
  }

  /**
   * 表单挂载
   *
   * 由框架桥接层（FormProvider）在组件挂载到 DOM 后调用。
   * 标记表单已渲染完成，emit ON_FORM_MOUNT 事件。
   */
  mount(): void {
    if (this.mounted) return
    this.mounted = true
    this._emitter.emit(FormLifeCycle.ON_FORM_MOUNT, this)
  }

  /**
   * 表单卸载
   *
   * 由框架桥接层（FormProvider）在组件卸载前调用。
   * 标记表单已卸载，emit ON_FORM_UNMOUNT 事件。
   */
  unmount(): void {
    if (!this.mounted) return
    this.mounted = false
    this._emitter.emit(FormLifeCycle.ON_FORM_UNMOUNT, this)
  }

  /** 批量操作 */
  batch(fn: () => void): void {
    const adapter = getReactiveAdapter()
    adapter.batch(fn)
  }

  /**
   * 导出表单状态快照
   *
   * 遍历所有字段，序列化其值和状态为可持久化的 FormGraph 对象。
   * 用于：草稿保存、撤销/重做、表单状态对比。
   */
  getGraph(): FormGraph {
    const fieldStates: Record<string, FormGraph['fields'][string]> = {}

    for (const [path, field] of this.fields) {
      fieldStates[path] = {
        path,
        value: deepClone(FormPath.getIn(this.values, path)),
        initialValue: deepClone(FormPath.getIn(this.initialValues, path)),
        display: field.display,
        disabled: field.disabled,
        preview: field.preview,
        required: field.required,
        pattern: field.pattern,
        errors: deepClone(field.errors),
        warnings: deepClone(field.warnings),
        mounted: field.mounted,
        modified: field.modified,
        component: field.component,
        componentProps: deepClone(field.componentProps) as Record<string, unknown>,
      }
    }

    return {
      values: deepClone(this.values) as Record<string, unknown>,
      initialValues: deepClone(this.initialValues) as Record<string, unknown>,
      fields: fieldStates,
      timestamp: Date.now(),
    }
  }

  /**
   * 从快照恢复表单状态
   *
   * 恢复 values 和逐字段的状态（display / disabled / errors 等）。
   * 不在快照中的字段保持不变，快照中不存在对应注册字段的状态被忽略。
   */
  setGraph(graph: FormGraph): void {
    const adapter = getReactiveAdapter()
    adapter.batch(() => {
      /* 恢复表单值 */
      this.setValues(deepClone(graph.values) as Partial<Values>, 'replace')
      this.initialValues = deepClone(graph.initialValues) as Values

      /* 逐字段恢复状态 */
      for (const [path, state] of Object.entries(graph.fields)) {
        const field = this.fields.get(path)
        if (!field) continue

        field.display = state.display
        field.disabled = state.disabled
        field.preview = state.preview
        field.required = state.required
        field.pattern = state.pattern
        field.errors = deepClone(state.errors)
        field.warnings = deepClone(state.warnings)
        if (typeof state.component === 'string') {
          field.component = state.component
        }
        field.componentProps = deepClone(state.componentProps) as Record<string, unknown>
      }
    })
  }

  /**
   * 安装插件
   *
   * 同名插件重复安装会打印警告并跳过。
   * 插件 install 返回的 dispose 会在表单 dispose 时自动调用。
   *
   * @param plugin - 插件实例
   * @returns 插件暴露的 API（如无则返回 undefined）
   */
  use<API = Record<string, unknown>>(plugin: FormPlugin<API>): API | undefined {
    /* 同名插件去重 */
    if (this._pluginAPIs.has(plugin.name)) {
      console.warn(
        `[ConfigForm] 插件 "${plugin.name}" 已安装，跳过重复安装。`,
      )
      return this._pluginAPIs.get(plugin.name) as API | undefined
    }

    /* 检查依赖是否已安装 */
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this._pluginAPIs.has(dep)) {
          throw new Error(
            `[ConfigForm] 插件 "${plugin.name}" 依赖 "${dep}"，但该插件未安装。`
            + ` 请确保 "${dep}" 在 "${plugin.name}" 之前安装。`,
          )
        }
      }
    }

    /* 构建 PluginContext */
    const hookManager = this._hookManager
    const hookDisposers: Disposer[] = []
    const context: PluginContext = {
      getPlugin: <T = Record<string, unknown>>(name: string): T | undefined => {
        return this._pluginAPIs.get(name) as T | undefined
      },
      hooks: {
        onSubmit: (handler, priority) => {
          const disposer = hookManager.submit.tap(handler, priority)
          hookDisposers.push(disposer)
          return disposer
        },
        onValidate: (handler, priority) => {
          const disposer = hookManager.validate.tap(handler, priority)
          hookDisposers.push(disposer)
          return disposer
        },
        onSetValues: (handler, priority) => {
          const disposer = hookManager.setValues.tap(handler, priority)
          hookDisposers.push(disposer)
          return disposer
        },
        onCreateField: (handler, priority) => {
          const disposer = hookManager.createField.tap(handler, priority)
          hookDisposers.push(disposer)
          return disposer
        },
        onReset: (handler, priority) => {
          const disposer = hookManager.reset.tap(handler, priority)
          hookDisposers.push(disposer)
          return disposer
        },
      },
    }

    const result = plugin.install(this as unknown as FormInstance, context)

    /* 注册 API */
    if (result.api !== undefined) {
      this._pluginAPIs.set(plugin.name, result.api)
    }
    else {
      this._pluginAPIs.set(plugin.name, undefined)
    }

    /* 注册销毁函数（包含 hook disposers） */
    const pluginDispose = (): void => {
      /* 先清理 hook 注册 */
      for (const disposer of hookDisposers) {
        disposer()
      }
      /* 再执行插件自身的 dispose */
      result.dispose?.()
    }
    this._pluginDisposers.push(pluginDispose)

    return result.api
  }

  /**
   * 获取已安装的插件 API
   *
   * @param name - 插件名称
   * @returns 插件 API（未安装则返回 undefined）
   */
  getPlugin<API = Record<string, unknown>>(name: string): API | undefined {
    return this._pluginAPIs.get(name) as API | undefined
  }

  /**
   * 对比当前表单值与另一组值的差异
   *
   * @param otherValues - 要对比的值（默认与 initialValues 对比）
   * @returns 结构化的 Diff 结果
   */
  diff(otherValues?: Record<string, unknown>): DiffResult {
    const base = otherValues ?? this.initialValues
    return coreDiff(base, this.values)
  }

  /**
   * 获取字段级别的 Diff 视图
   *
   * 用于 DiffViewer 组件渲染。
   *
   * @param paths - 要对比的字段路径列表（不传则对比所有注册字段）
   * @param otherValues - 要对比的值（默认与 initialValues 对比）
   */
  getDiffView(paths?: string[], otherValues?: Record<string, unknown>): DiffFieldView[] {
    const base = otherValues ?? this.initialValues
    const targetPaths = paths ?? Array.from(this.fields.keys())
    return coreGetDiffView(base, this.values, targetPaths)
  }

  /**
   * 滚动到第一个有验证错误的字段
   *
   * 遍历 form.errors，找到第一个有 domRef 的错误字段，
   * 调用 scrollIntoView 将其滚动到可视区域并尝试聚焦输入元素。
   *
   * @returns 是否成功定位到错误字段
   */
  scrollToFirstError(): boolean {
    const allErrors = this.errors
    if (allErrors.length === 0) return false

    for (const error of allErrors) {
      const field = this.fields.get(error.path)
      if (field?.domRef) {
        field.domRef.scrollIntoView({ behavior: 'smooth', block: 'center' })
        /* 尝试聚焦到输入元素 */
        const input = field.domRef.querySelector('input, textarea, select') as HTMLElement | null
        if (input) {
          input.focus()
        }
        return true
      }
    }

    /* 兜底：通过 DOM 查询查找错误元素 */
    if (typeof document !== 'undefined') {
      const errorElement = document.querySelector(
        '.ant-form-item-has-error, .el-form-item.is-error, [aria-invalid="true"]',
      )
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        const input = errorElement.querySelector('input, textarea, select') as HTMLElement | null
        input?.focus()
        return true
      }
    }

    return false
  }

  /** 销毁表单 */
  dispose(): void {
    /* 先销毁插件（插件可能依赖字段/事件系统） */
    for (const disposer of this._pluginDisposers) {
      disposer()
    }
    this._pluginDisposers = []
    this._pluginAPIs.clear()
    this._hookManager.dispose()

    this.reactionEngine.dispose()
    for (const field of this.fields.values()) {
      field.dispose()
    }
    for (const voidField of this.voidFields.values()) {
      voidField.dispose()
    }
    for (const disposer of this.disposers) {
      disposer()
    }
    this.fields.clear()
    this.arrayFields.clear()
    this.objectFields.clear()
    this.voidFields.clear()
    this.valuesChangeHandlers = []
    this.fieldValueChangeHandlers.clear()
    this.disposers = []
    this._emitter.clear()
  }

  /** 收集提交数据 */
  private collectSubmitValues(): Record<string, unknown> {
    /**
     * 以 form.values 的深克隆作为基础（单一数据源），
     * 再根据字段配置应用隐藏排除、值转换、提交路径映射。
     *
     * 这样做避免了两个问题：
     * 1. 直接使用响应式引用导致 FormPath.setIn 意外修改 form.values
     * 2. 已删除的数组子字段仍残留在 fields 映射中，产生脏数据
     */
    const result = deepClone(this.values) as Record<string, unknown>

    for (const [path, field] of this.fields) {
      /* 跳过已不存在于 values 中的字段（如已删除的数组子字段） */
      if (!FormPath.existsIn(this.values, path))
        continue

      /**
       * display='none' 的字段排除提交数据。
       * display='hidden' 的字段保留数据（只隐藏 UI）。
       * 兼容旧的 excludeWhenHidden 逻辑。
       */
      if (field.display === 'none' || (!field.visible && field.excludeWhenHidden)) {
        FormPath.deleteIn(result, path)
        continue
      }

      /* 值转换 */
      if (field.submitTransform) {
        const value = FormPath.getIn(result, path)
        const transformed = field.submitTransform(value)
        const submitPath = field.submitPath ?? path
        FormPath.setIn(result, submitPath, transformed)
        if (submitPath !== path) {
          FormPath.deleteIn(result, path)
        }
      }
      else if (field.submitPath && field.submitPath !== path) {
        /* 提交路径映射 */
        const value = FormPath.getIn(result, path)
        FormPath.deleteIn(result, path)
        FormPath.setIn(result, field.submitPath, value)
      }
    }

    return result
  }

  /** 通知值变化（供 Field.setValue 调用） */
  notifyValuesChange(): void {
    for (const handler of this.valuesChangeHandlers) {
      handler(this.values)
    }
    this._emitter.emit(FormLifeCycle.ON_FORM_VALUES_CHANGE, this.values)
  }

  /** 通知字段值变化（供 Field.setValue / Field.onInput 调用） */
  notifyFieldValueChange(path: string, value: unknown): void {
    const handlers = this.fieldValueChangeHandlers.get(path)
    if (handlers) {
      for (const handler of handlers) {
        handler(value)
      }
    }
    this._emitter.emit(FormLifeCycle.ON_FIELD_VALUE_CHANGE, { path, value })
  }

  /** 通知字段用户输入（供 Field.onInput 调用，区分用户输入和程序赋值） */
  notifyFieldInputChange(path: string, value: unknown): void {
    this._emitter.emit(FormLifeCycle.ON_FIELD_INPUT_VALUE_CHANGE, { path, value })
  }

  /** 通知字段初始值变化（供 Field.initialValue setter 调用） */
  notifyFieldInitialValueChange(path: string, value: unknown): void {
    this._emitter.emit(FormLifeCycle.ON_FIELD_INITIAL_VALUE_CHANGE, { path, value })
  }

  /** 通知字段挂载（供 Field.mount 调用） */
  notifyFieldMount(field: FieldInstance | VoidFieldInstance): void {
    this._emitter.emit(FormLifeCycle.ON_FIELD_MOUNT, field)
  }

  /** 通知字段卸载（供 Field.unmount 调用） */
  notifyFieldUnmount(field: FieldInstance | VoidFieldInstance): void {
    this._emitter.emit(FormLifeCycle.ON_FIELD_UNMOUNT, field)
  }
}
