import type { Component, SetupContext, VNode } from 'vue'
import type { ZodType, ZodTypeAny, ZodTypeDef } from 'zod'
import type { FormRuntimeInput } from '@/runtime/types'

// ===== 公共类型 =====

export type FunctionalFieldComponent = (
  props: { modelValue?: unknown, [key: string]: unknown },
  context: SetupContext,
) => VNode

export type FormValues = Record<string, unknown>
export type ValidateTrigger = 'submit' | 'blur' | 'change'
export type FieldValidatorResult = string | string[] | void | null | undefined
export type FieldSchema<TValue = unknown> = ZodType<TValue, ZodTypeDef, unknown>
export type FieldValidator<T extends object = FormValues, TValue = unknown> = (
  value: TValue,
  allValues: T,
) => FieldValidatorResult | Promise<FieldValidatorResult>

export interface RuntimeToken<TValue = unknown, TType extends string = string> {
  readonly __configFormToken: TType
  readonly __configFormValue?: TValue
}

export type ExpressionInput
  = | string
    | number
    | boolean
    | null
    | { path: string, fallback?: unknown }
    | { op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte', left: ExpressionInput, right: ExpressionInput }
    | { op: 'and' | 'or', items: ExpressionInput[] }
    | { op: 'not', value: ExpressionInput }
    | { op: 'includes', source: ExpressionInput, value: ExpressionInput }

export interface ExpressionToken<TValue = unknown> extends RuntimeToken<TValue, 'expr'> {
  expression: ExpressionInput
  fallback?: TValue
}

export type RuntimeText = string | RuntimeToken<string>
export type FieldCondition<T extends object = FormValues> = boolean | ExpressionToken<boolean> | ((values: T) => boolean)

export type SlotPrimitive = string | number | boolean | null | undefined

export interface FieldSourceMeta {
  id: string
  file: string
  line: number
  column: number
}

export interface SlotFieldConfig {
  field?: string
  __source?: FieldSourceMeta
  label?: RuntimeText
  schema?: ZodTypeAny
  span?: number
  component: Component | FunctionalFieldComponent | string
  props?: Record<string, unknown>
  defaultValue?: unknown
  /** 注入到组件的值的属性名，默认 'modelValue' */
  valueProp?: string
  /** 接收组件值的事件名，同时也作为 change 校验的触发事件，默认 'update:modelValue' */
  trigger?: string
  /** 触发 blur 校验的事件名，默认 'blur' */
  blurTrigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  validator?: FieldValidator<FormValues, unknown>
  visible?: FieldCondition<FormValues>
  disabled?: FieldCondition<FormValues>
  transform?: (value: unknown, allValues: FormValues) => unknown
  submitWhenHidden?: boolean
  submitWhenDisabled?: boolean
  slots?: Record<string, SlotContent>
}

export type SlotRenderable = VNode | VNode[] | SlotPrimitive | RuntimeToken
export type SlotFieldContent = SlotFieldConfig
export type SlotContent = SlotRenderFn | SlotFieldContent | SlotFieldContent[] | SlotRenderable

/** 插槽渲染函数，接收作用域参数，返回 VNode(s) 或递归字段配置 */
export type SlotRenderFn = (scope?: Record<string, unknown>) => SlotContent

// ===== FieldConfig：公开字段输入协议 =====

export interface FieldConfig {
  field: string
  __source?: FieldSourceMeta
  label?: RuntimeText
  schema?: ZodTypeAny
  span?: number
  component: Component | FunctionalFieldComponent | string
  props?: Record<string, unknown>
  defaultValue?: unknown
  /** 注入到组件的值的属性名，默认 'modelValue' */
  valueProp?: string
  /** 接收组件值的事件名，同时也作为 change 校验的触发事件，默认 'update:modelValue' */
  trigger?: string
  /** 触发 blur 校验的事件名，默认 'blur' */
  blurTrigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  validator?: FieldValidator<FormValues, unknown>
  visible?: FieldCondition<FormValues>
  disabled?: FieldCondition<FormValues>
  transform?: (value: unknown, allValues: FormValues) => unknown
  /** 隐藏时仍参与 submit 输出，默认 false */
  submitWhenHidden?: boolean
  /** 禁用时仍参与 submit 输出，默认 false */
  submitWhenDisabled?: boolean
  /** 传递给组件的插槽，可为渲染函数、文本、递归字段配置或配置数组 */
  slots?: Record<string, SlotContent>
}

export interface NormalizedFieldConfig extends Omit<
  FieldConfig,
  'blurTrigger' | 'props' | 'span' | 'submitWhenDisabled' | 'submitWhenHidden' | 'trigger' | 'validateOn' | 'valueProp'
> {
  span: number
  props: Record<string, unknown>
  valueProp: string
  trigger: string
  blurTrigger: string
  validateOn: ValidateTrigger[]
  submitWhenHidden: boolean
  submitWhenDisabled: boolean
}

export interface ResolvedField extends Omit<NormalizedFieldConfig, 'label'> {
  label?: string
}

export type FieldKey<T extends object> = Extract<keyof T, string>

export interface FormFieldDevtoolsNode {
  id: string
  formId: string
  field: string
  embedded: boolean
  parentId?: string
  label?: string
  slotName?: string
  source?: FieldSourceMeta
}

export interface FormFieldPatchMetric {
  id: string
  duration: number
  timestamp: number
}

export interface FormDevtoolsBridge {
  registerField: (node: FormFieldDevtoolsNode, element: HTMLElement | null) => void
  updateField: (node: FormFieldDevtoolsNode, element: HTMLElement | null) => void
  recordPatch: (metric: FormFieldPatchMetric) => void
  unregisterField: (id: string) => void
}

// ===== 表单组件类型 =====

export interface ConfigFormProps<T extends object = FormValues> {
  namespace?: string
  inline?: boolean
  /**
   * 表单字段配置
   */
  fields: FieldConfig[]
  labelWidth?: string | number
  /** v-model 双向绑定表单值 */
  modelValue?: T
  /** 表单运行时，用于组件注册、runtime token、表达式、插件扩展和调试事件 */
  runtime?: FormRuntimeInput
}

export interface ConfigFormEmits<T extends object = FormValues> {
  (e: 'submit', values: T): void
  (e: 'error', errors: FormErrors): void
  (e: 'update:modelValue', values: T): void
}

export interface ConfigFormExpose<T extends object = FormValues> {
  submit: () => Promise<boolean>
  validate: () => Promise<boolean>
  validateField: (field: FieldKey<T> | string, trigger?: ValidateTrigger) => Promise<boolean>
  reset: () => void
  setValue: {
    <K extends FieldKey<T>>(field: K, value: T[K]): void
    (field: string, value: unknown): void
  }
  setValues: (values: Partial<T>, replace?: boolean) => void
  getValue: {
    <K extends FieldKey<T>>(field: K): T[K]
    (field: string): unknown
  }
  /** 获取表单值的浅拷贝快照（保留 Date/Dayjs 等实例） */
  getValues: () => T
  /** 清除指定字段的校验错误；不传字段时清除全部 */
  clearValidate: (field?: FieldKey<T> | string) => void
}

export interface FormErrors {
  [field: string]: string[]
}
