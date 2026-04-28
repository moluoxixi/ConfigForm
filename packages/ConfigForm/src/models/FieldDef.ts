import type { FieldConfig, FormValues, ValidateTrigger } from '@/types'

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
  if (!on) return ['submit']
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
  readonly visible?: (values: FormValues) => boolean
  readonly disabled?: (values: FormValues) => boolean
  readonly transform?: (value: any, allValues: FormValues) => any

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
    this.valueProp = input.valueProp || 'modelValue'
    this.trigger = input.trigger || 'update:modelValue'
    this.blurTrigger = input.blurTrigger || 'blur'
    this.validateOn = normalizeValidateOn(input.validateOn)
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

/**
 * 带组件 props 类型推导的工厂函数，返回 FieldDef 实例。
 *
 * 泛型 C 由 component 属性自动推导，无需手动传入。
 */
export function defineField<C>(
  config: Omit<FieldConfig, 'component' | 'props'> & {
    component: C
    /** 交叉 {} 阻断反向推导，强制 TS 从 component 单向推导 C */
    props?: ExtractComponentProps<C> & {}
  },
): FieldDef {
  return new FieldDef(config as FieldConfig)
}
