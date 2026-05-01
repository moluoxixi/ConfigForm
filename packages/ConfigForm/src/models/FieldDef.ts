import type { FieldConfig, FieldValidator, FormValues, SlotRenderFn, ValidateTrigger } from '../types'

// ===== 工具类型 =====

/** 从 Vue 组件中提取 props 类型（支持 class / functional 组件） */
export type ExtractComponentProps<C> = C extends abstract new (...args: any) => any
  ? InstanceType<C>['$props']
  : C extends (props: infer P, ...args: any) => any
    ? P
    : Record<string, any>

// ===== 内部工具函数 =====

/** 规范化 validateOn，确保始终包含 'submit' */
function normalizeValidateOn(on?: ValidateTrigger | ValidateTrigger[]): ValidateTrigger[] {
  if (!on)
    return ['submit']
  const arr = Array.isArray(on) ? on : [on]
  return arr.includes('submit') ? arr : [...arr, 'submit']
}

// ===== FieldDef =====

/**
 * 字段定义模型。系统中字段的唯一运行时表示。
 */
export class FieldDef {
  readonly field: string
  readonly label?: string
  readonly schema?: FieldConfig['schema']
  readonly span?: number
  readonly component: FieldConfig['component']
  readonly props?: Record<string, any>
  readonly defaultValue?: any
  readonly valueProp: string
  readonly trigger: string
  readonly blurTrigger: string
  readonly validateOn: ValidateTrigger[]
  readonly validator?: FieldValidator<FormValues>
  readonly visible?: (values: FormValues) => boolean
  readonly disabled?: (values: FormValues) => boolean
  readonly transform?: (value: any, allValues: FormValues) => any
  readonly submitWhenHidden: boolean
  readonly submitWhenDisabled: boolean
  readonly slots?: Record<string, SlotRenderFn>

  constructor(input: FieldConfig) {
    this.field = input.field
    this.label = input.label
    this.schema = input.schema
    this.span = input.span || 24
    this.component = input.component
    this.props = input.props
    this.defaultValue = input.defaultValue
    this.visible = input.visible
    this.disabled = input.disabled
    this.transform = input.transform
    this.slots = input.slots
    this.valueProp = input.valueProp || 'modelValue'
    this.trigger = input.trigger || 'update:modelValue'
    this.blurTrigger = input.blurTrigger || 'blur'
    this.validateOn = normalizeValidateOn(input.validateOn)
    this.validator = input.validator
    this.submitWhenHidden = input.submitWhenHidden ?? false
    this.submitWhenDisabled = input.submitWhenDisabled ?? false
  }

  shouldValidateOn(trigger: ValidateTrigger): boolean {
    return this.validateOn.includes(trigger)
  }

  isVisible(values: FormValues): boolean {
    return this.visible ? this.visible(values) : true
  }

  isDisabled(values: FormValues): boolean {
    return this.disabled ? this.disabled(values) : false
  }

  applyTransform(value: any, allValues: FormValues): any {
    return this.transform ? this.transform(value, allValues) : value
  }
}

// ===== defineField =====

/** 从 FieldConfig / TypedFieldConfig 中提取除 component/props 外的字段类型（内联展开，避免 Omit 破坏上下文推导） */
interface FieldConfigCore<T extends Record<string, any> = Record<string, any>> {
  field: string
  label?: string
  schema?: FieldConfig['schema']
  span?: number
  defaultValue?: any
  valueProp?: string
  trigger?: string
  blurTrigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  validator?: FieldValidator<T>
  visible?: (values: T) => boolean
  disabled?: (values: T) => boolean
  transform?: (value: any, allValues: T) => any
  submitWhenHidden?: boolean
  submitWhenDisabled?: boolean
  slots?: Record<string, SlotRenderFn>
}

/**
 * 根据component自动推导props类型。
 * 传入泛型 T 时，回调参数（visible/disabled/transform）自动推导为 T。
 *
 * @example
 * ```ts
 * // 不传泛型：回调参数为 FormValues
 * defineField({ field: 'name', component: Input })
 *
 * // 传泛型：回调参数自动推导
 * interface MyForm { name: string; age: number }
 * defineField<MyForm, typeof SomeComponent>({
 *   field: 'name',
 *   component: SomeComponent,
 *   disabled: (values) => !values.age, // values → MyForm
 * })
 * ```
 */

// 重载 1：传了泛型 T，回调参数类型为 T
export function defineField<T extends Record<string, any>, C = unknown>(
  config: FieldConfigCore<T> & {
    component: C
    props?: ExtractComponentProps<C> & {}
  },
): FieldDef

// 重载 2：不传泛型，回调参数类型为 Record<string, any>
export function defineField<C = unknown>(
  config: FieldConfigCore<Record<string, any>> & {
    component: C
    props?: ExtractComponentProps<C> & {}
  },
): FieldDef

// 实现
export function defineField(config: FieldConfig): FieldDef {
  return new FieldDef(config)
}
