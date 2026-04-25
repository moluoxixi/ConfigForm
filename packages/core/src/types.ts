import type { ZodTypeAny } from 'zod'
import type { Component, SetupContext, VNode } from 'vue'

// ===== Props 提取工具类型 =====

/** 从 Vue 组件类型中提取 $props */
type ExtractComponentProps<C> = C extends new (...args: any[]) => { $props: infer P }
  ? P
  : C extends (props: infer P, context: any) => any
    ? P
    : Record<string, any>

// ===== 函数式组件类型 =====

/** 函数式字段组件：接收 props（含 modelValue）和 context，返回 VNode */
export type FunctionalFieldComponent = (
  props: { modelValue?: any; [key: string]: any },
  context: SetupContext
) => VNode

// ===== 字段定义 =====

/** 运行时字段定义 */
export interface FieldDef {
  /** 字段标识，作为表单值的 key 和校验错误的索引 */
  field: string
  /** 字段标签文本 */
  label?: string
  /** Zod schema，用于校验 */
  type?: ZodTypeAny
  /** 栅格占比（仅非 inline 模式），默认 24 */
  span?: number
  /** 渲染组件：Vue 组件对象 / 函数式组件 / 全局注册组件名 */
  component: Component | FunctionalFieldComponent | string
  /** 传递给 component 的 props */
  props?: Record<string, any>
}

/** 泛型 defineField 辅助函数 —— 纯类型推导工具，运行时零开销 */
export function defineField<C extends Component | FunctionalFieldComponent>(config: {
  field: string
  label?: string
  type?: ZodTypeAny
  span?: number
  component: C
  props?: ExtractComponentProps<C>
  label?: string
}): FieldDef {
  return config as FieldDef
}

// ===== 表单组件类型 =====

/** ConfigForm 组件 Props */
export interface ConfigFormProps {
  /** 命名空间前缀，影响 CSS 类名，默认 'cf' */
  namespace?: string
  /** 行内布局模式 */
  inline?: boolean
  /** 字段配置数组 */
  fields: FieldDef[]
  /** 标签统一宽度，支持 string（如 '100px'）或 number（自动加 px） */
  labelWidth?: string | number
  /** 表单初始值 */
  initialValues?: Record<string, any>
}

/** ConfigForm 组件 Emits */
export interface ConfigFormEmits {
  (e: 'submit', values: Record<string, any>): void
  (e: 'error', errors: FormErrors): void
}

/** ConfigForm 组件 Expose */
export interface ConfigFormExpose {
  /** 提交：先校验，通过 emit submit，失败 emit error */
  submit: () => Promise<boolean>
  /** 校验：失败 emit error */
  validate: () => Promise<boolean>
  /** 重置表单值和错误 */
  reset: () => void
}

/** 校验错误映射：field → 错误消息数组 */
export interface FormErrors {
  [field: string]: string[]
}
