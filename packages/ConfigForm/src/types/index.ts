import type { ZodTypeAny } from 'zod'
import type { Component, SetupContext, VNode } from 'vue'

// ===== 工具类型（内部）=====

type ExtractComponentProps<C> = C extends new (...args: any[]) => { $props: infer P }
  ? P
  : C extends (props: infer P, context: any) => any
    ? P
    : Record<string, any>

// ===== 公共类型 =====

export type FunctionalFieldComponent = (
  props: { modelValue?: any; [key: string]: any },
  context: SetupContext
) => VNode

export type FormValues = Record<string, any>
export type ValidateTrigger = 'submit' | 'blur' | 'change'

// ===== FieldConfig：FieldDef 构造参数（输入协议）=====

export interface FieldConfig {
  field: string
  label?: string
  type?: ZodTypeAny
  span?: number
  component: Component | FunctionalFieldComponent | string
  props?: Record<string, any>
  defaultValue?: any
  validateOn?: ValidateTrigger | ValidateTrigger[]
  visible?: (values: FormValues) => boolean
  disabled?: (values: FormValues) => boolean
  transform?: (value: any, allValues: FormValues) => any
}

// ===== FieldDef：内部字段协议，唯一的 field 表示 =====

/**
 * 字段定义。这是系统中字段的唯一表示形式。
 *
 * 通过两种方式创建，结果等价：
 * - `defineField({ field, component, ... })`
 * - `@Field({ component, ... }) fieldName` + `toFields(MyClass)`
 *
 * 构造时自动规范化 validateOn 为含 'submit' 的数组。
 */
export class FieldDef {
  readonly field: string
  readonly label?: string
  readonly type?: ZodTypeAny
  readonly span?: number
  readonly component: Component | FunctionalFieldComponent | string
  readonly props?: Record<string, any>
  readonly defaultValue?: any
  /** 规范化后的校验时机，始终包含 'submit' */
  readonly validateOn: ValidateTrigger[]
  readonly visible?: (values: FormValues) => boolean
  readonly disabled?: (values: FormValues) => boolean
  readonly transform?: (value: any, allValues: FormValues) => any

  constructor(input: FieldConfig) {
    this.field = input.field
    this.label = input.label
    this.type = input.type
    this.span = input.span
    this.component = input.component
    this.props = input.props
    this.defaultValue = input.defaultValue
    this.visible = input.visible
    this.disabled = input.disabled
    this.transform = input.transform

    const on = input.validateOn
    if (!on) {
      this.validateOn = ['submit']
    }
    else {
      const arr = Array.isArray(on) ? on : [on]
      this.validateOn = arr.includes('submit') ? arr : [...arr, 'submit']
    }
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

// ===== defineField：带组件 props 类型推导的工厂函数 =====

export function defineField<C extends Component | FunctionalFieldComponent>(config: {
  field: string
  label?: string
  type?: ZodTypeAny
  span?: number
  component: C
  props?: ExtractComponentProps<C>
  defaultValue?: any
  validateOn?: ValidateTrigger | ValidateTrigger[]
  visible?: (values: FormValues) => boolean
  disabled?: (values: FormValues) => boolean
  transform?: (value: any, allValues: FormValues) => any
}): FieldDef {
  return new FieldDef(config as FieldConfig)
}

// ===== 表单组件类型 =====

export interface ConfigFormProps {
  namespace?: string
  inline?: boolean
  /** 必须为 FieldDef 实例数组，通过 defineField() 或 toFields() 创建 */
  fields: FieldDef[]
  labelWidth?: string | number
  initialValues?: Record<string, any>
}

export interface ConfigFormEmits {
  (e: 'submit', values: Record<string, any>): void
  (e: 'error', errors: FormErrors): void
}

export interface ConfigFormExpose {
  submit: () => Promise<boolean>
  validate: () => Promise<boolean>
  reset: () => void
}

export interface FormErrors {
  [field: string]: string[]
}
