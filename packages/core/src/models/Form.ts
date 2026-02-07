import type { Disposer, Feedback, FieldPattern } from '@moluoxixi/shared'
import type { ValidationFeedback, ValidationTrigger } from '@moluoxixi/validator'
import type {
  ArrayFieldInstance,
  ArrayFieldProps,
  FieldInstance,
  FieldProps,
  FormConfig,
  FormInstance,
  ResetOptions,
  SubmitResult,
  VoidFieldInstance,
  VoidFieldProps,
} from '../types'
import { getReactiveAdapter } from '@moluoxixi/reactive'
import { deepClone, deepMerge, FormPath, uid } from '@moluoxixi/shared'
import { ReactionEngine } from '../reaction/engine'
import { ArrayField } from './ArrayField'
import { Field } from './Field'
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
  pattern: FieldPattern
  validateTrigger: ValidationTrigger | ValidationTrigger[]
  labelPosition: 'top' | 'left' | 'right'
  labelWidth: number | string

  /** 字段注册表（path → Field 响应式代理） */
  private fields = new Map<string, Field>()
  /** 数组字段注册表 */
  private arrayFields = new Map<string, ArrayField>()
  /** 虚拟字段注册表 */
  private voidFields = new Map<string, VoidField>()
  /** 值变化回调 */
  private valuesChangeHandlers: Array<(values: Values) => void> = []
  /** 字段值变化回调 */
  private fieldValueChangeHandlers = new Map<string, Array<(value: unknown) => void>>()
  /** 联动引擎 */
  private reactionEngine: ReactionEngine
  /** 释放器 */
  private disposers: Disposer[] = []

  constructor(config: FormConfig<Values> = {}) {
    this.id = uid('form')
    this.values = (config.initialValues ? deepClone(config.initialValues) : {}) as Values
    this.initialValues = (config.initialValues ? deepClone(config.initialValues) : {}) as Values
    this.submitting = false
    this.validating = false
    this.pattern = config.pattern ?? 'editable'
    this.validateTrigger = config.validateTrigger ?? 'change'
    this.labelPosition = config.labelPosition ?? 'right'
    this.labelWidth = config.labelWidth ?? 'auto'

    this.reactionEngine = new ReactionEngine(this as unknown as FormInstance)

    /* 执行用户定义的 effects */
    if (config.effects) {
      config.effects(this as unknown as FormInstance)
    }
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

  /** 创建普通字段 */
  createField<V = unknown>(props: FieldProps<V>): FieldInstance<V> {
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

  /** 移除字段 */
  removeField(path: string): void {
    const field = this.fields.get(path)
    if (field) {
      field.dispose()
      this.fields.delete(path)
      this.arrayFields.delete(path)
      this.reactionEngine.removeFieldReactions(path)
    }
    const voidField = this.voidFields.get(path)
    if (voidField) {
      voidField.dispose()
      this.voidFields.delete(path)
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

  /** 设置表单值 */
  setValues(values: Partial<Values>, strategy: 'merge' | 'shallow' | 'replace' = 'merge'): void {
    const adapter = getReactiveAdapter()
    adapter.batch(() => {
      switch (strategy) {
        case 'replace':
          this.values = adapter.observable({ ...values } as Values)
          break
        case 'shallow':
          Object.assign(this.values, values)
          break
        case 'merge':
        default:
          deepMerge(this.values as Record<string, unknown>, values as Record<string, unknown>)
          break
      }
    })
    this.notifyValuesChange()
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

  /** 重置表单 */
  reset(options?: ResetOptions): void {
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
          const keys = Object.keys(this.values)
          for (const key of keys) {
            (this.values as Record<string, unknown>)[key] = undefined
          }
        }
        else {
          const cloned = deepClone(this.initialValues)
          Object.assign(this.values, cloned)
        }
        for (const field of this.fields.values()) {
          field.errors = []
          field.warnings = []
          field.active = false
          field.visited = false
        }
      }
    })

    if (options?.validate) {
      this.validate().catch(() => { /* 忽略 */ })
    }
  }

  /** 提交表单 */
  async submit(): Promise<SubmitResult<Values>> {
    this.submitting = true
    try {
      const { valid, errors, warnings } = await this.validate()
      if (!valid) {
        /* 聚焦到第一个错误字段 */
        if (errors.length > 0) {
          const firstErrorField = this.fields.get(errors[0].path)
          firstErrorField?.focus()
        }
        return { values: this.values, errors, warnings }
      }

      /* 收集提交数据（处理隐藏字段排除、路径映射、值转换） */
      const submitValues = this.collectSubmitValues()
      return { values: submitValues as Values, errors: [], warnings }
    }
    finally {
      this.submitting = false
    }
  }

  /** 验证全部或部分字段 */
  async validate(
    pattern?: string,
  ): Promise<{ valid: boolean, errors: ValidationFeedback[], warnings: ValidationFeedback[] }> {
    this.validating = true
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

      return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
      }
    }
    finally {
      this.validating = false
    }
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

  /** 批量操作 */
  batch(fn: () => void): void {
    const adapter = getReactiveAdapter()
    adapter.batch(fn)
  }

  /** 销毁表单 */
  dispose(): void {
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
    this.voidFields.clear()
    this.valuesChangeHandlers = []
    this.fieldValueChangeHandlers.clear()
    this.disposers = []
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

      /* 隐藏字段排除 */
      if (!field.visible && field.excludeWhenHidden) {
        FormPath.deleteIn(result, path)
        continue
      }

      /* 值转换 */
      if (field.transform) {
        const value = FormPath.getIn(result, path)
        const transformed = field.transform(value)
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
  }

  /** 通知字段值变化（供 Field.setValue 调用） */
  notifyFieldValueChange(path: string, value: unknown): void {
    const handlers = this.fieldValueChangeHandlers.get(path)
    if (handlers) {
      for (const handler of handlers) {
        handler(value)
      }
    }
  }
}
