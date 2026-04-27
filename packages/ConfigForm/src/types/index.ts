import type { ZodTypeAny } from 'zod'
import type { Component, SetupContext, VNode } from 'vue'

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
  /** 注入到组件的值的属性名，默认 'modelValue' */
  valueProp?: string
  /** 接收组件值的事件名，默认 'update:modelValue' */
  trigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  visible?: (values: FormValues) => boolean
  disabled?: (values: FormValues) => boolean
  transform?: (value: any, allValues: FormValues) => any
}

import type { FieldDef } from '@/models/FieldDef'

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
