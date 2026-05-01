import type { Component, SetupContext, VNode } from 'vue'
import type { ZodTypeAny } from 'zod'
import type { FieldDef } from '../models/FieldDef'

// ===== 公共类型 =====

export type FunctionalFieldComponent = (
  props: { modelValue?: any, [key: string]: any },
  context: SetupContext,
) => VNode

export type FormValues = Record<string, any>
export type ValidateTrigger = 'submit' | 'blur' | 'change'
export type FieldValidatorResult = string | string[] | void | null | undefined
export type FieldValidator<T extends object = FormValues> = (
  value: any,
  allValues: T,
) => FieldValidatorResult | Promise<FieldValidatorResult>

/** 插槽渲染函数，接收作用域参数，返回 VNode(s) */
export type SlotRenderFn = (scope?: Record<string, any>) => VNode | VNode[]

// ===== FieldConfig：FieldDef 构造参数（输入协议）=====

export interface FieldConfig {
  field: string
  label?: string
  schema?: ZodTypeAny
  span?: number
  component: Component | FunctionalFieldComponent | string
  props?: Record<string, any>
  defaultValue?: any
  /** 注入到组件的值的属性名，默认 'modelValue' */
  valueProp?: string
  /** 接收组件值的事件名，同时也作为 change 校验的触发事件，默认 'update:modelValue' */
  trigger?: string
  /** 触发 blur 校验的事件名，默认 'blur' */
  blurTrigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  validator?: FieldValidator<FormValues>
  visible?: (values: FormValues) => boolean
  disabled?: (values: FormValues) => boolean
  transform?: (value: any, allValues: FormValues) => any
  /** 隐藏时仍参与 submit 输出，默认 false */
  submitWhenHidden?: boolean
  /** 禁用时仍参与 submit 输出，默认 false */
  submitWhenDisabled?: boolean
  /** 传递给组件的插槽，值为渲染函数 */
  slots?: Record<string, SlotRenderFn>
}

/** 泛型版 FieldConfig，用于 defineField<T> 回调参数类型推导 */
export interface TypedFieldConfig<T extends object> {
  field: string
  label?: string
  schema?: ZodTypeAny
  span?: number
  component: Component | FunctionalFieldComponent | string
  props?: Record<string, any>
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

// ===== 表单组件类型 =====

export interface ConfigFormProps<T extends object = Record<string, any>> {
  namespace?: string
  inline?: boolean
  /**
   * 表单字段配置
   */
  fields: FieldDef[]
  labelWidth?: string | number
  /** v-model 双向绑定表单值 */
  modelValue?: T
}

export interface ConfigFormEmits<T extends object = Record<string, any>> {
  (e: 'submit', values: T): void
  (e: 'error', errors: FormErrors): void
  (e: 'update:modelValue', values: T): void
}

export interface ConfigFormExpose<T extends object = Record<string, any>> {
  submit: () => Promise<boolean>
  validate: () => Promise<boolean>
  validateField: (field: string, trigger?: ValidateTrigger) => Promise<boolean>
  reset: () => void
  setValue: (field: string, value: any) => void
  setValues: (values: Partial<T>, replace?: boolean) => void
  getValue: (field: string) => any
  /** 获取表单值的浅拷贝快照（保留 Date/Dayjs 等实例） */
  getValues: () => T
  /** 清除指定字段的校验错误；不传字段时清除全部 */
  clearValidate: (field?: string) => void
}

export interface FormErrors {
  [field: string]: string[]
}
