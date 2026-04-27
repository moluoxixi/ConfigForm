import type { Component, VNode } from 'vue'
import type { ZodTypeAny } from 'zod'
import type { FieldConfig, FormValues, ValidateTrigger, FunctionalFieldComponent } from '@/types'

// 工具类型（内部使用）
type ExtractComponentProps<C> = C extends new (...args: any[]) => { $props: infer P }
  ? P
  : C extends (props: infer P, context: any) => any
    ? P
    : Record<string, any>

/**
 * 字段定义模型。这是系统中字段的唯一运行时代价表示形式。
 *
 * 通过两种方式创建，结果等价：
 * - `defineField({ field, component, ... })`
 * - `@Field({ component, ... }) fieldName` + `toFields(MyClass)`
 *
 * 构造时自动规范化 validateOn 为含 'submit' 的数组，并处理其他默认值。
 */
export class FieldDef {
  readonly field: string
  readonly label?: string
  readonly type?: ZodTypeAny
  readonly span?: number
  readonly component: Component | FunctionalFieldComponent | string
  readonly props?: Record<string, any>
  readonly defaultValue?: any
  readonly valueProp: string
  readonly trigger: string
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
    this.valueProp = input.valueProp || 'modelValue'
    this.trigger = input.trigger || 'update:modelValue'
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

/**
 * 带组件 props 类型推导的工厂函数。
 * 返回一个标准的 FieldDef 实例。
 */
export function defineField<C extends Component | FunctionalFieldComponent>(config: {
  field: string
  label?: string
  type?: ZodTypeAny
  span?: number
  component: C
  props?: ExtractComponentProps<C>
  defaultValue?: any
  valueProp?: string
  trigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  visible?: (values: FormValues) => boolean
  disabled?: (values: FormValues) => boolean
  transform?: (value: any, allValues: FormValues) => any
}): FieldDef {
  return new FieldDef(config as FieldConfig)
}
