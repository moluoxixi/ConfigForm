import type { Component, SetupContext, VNode } from 'vue'
import type { ZodType, ZodTypeAny, ZodTypeDef } from 'zod'
import type { FormRuntimeOptions } from '@/runtime/types'

// ===== 公共类型 =====

/** Runtime brand attached to configs created by defineField(...). */
export const CONFIG_FORM_DEFINED_NODE = Symbol.for('moluoxixi.config-form.defined-node')

/** Vue-compatible function component shape accepted by ConfigForm field nodes. */
export type FunctionalFieldComponent = (
  props: { modelValue?: unknown, [key: string]: unknown },
  context: SetupContext,
) => VNode

/** Plain object used as the canonical form value store. */
export type FormValues = Record<string, unknown>

/** Validation lifecycle names understood by ConfigForm. */
export type ValidateTrigger = 'submit' | 'blur' | 'change'

/** Normalized custom validator result before it is converted into string arrays. */
export type FieldValidatorResult = string | string[] | void | null | undefined

/** Zod schema accepted by a field declaration. */
export type FieldSchema<TValue = unknown> = ZodType<TValue, ZodTypeDef, unknown>

/** Custom validator that can read both the current field value and all form values. */
export type FieldValidator<T extends object = FormValues, TValue = unknown> = (
  value: TValue,
  allValues: T,
) => FieldValidatorResult | Promise<FieldValidatorResult>

/** Runtime token resolved by FormRuntime before rendering, validation, or submit. */
export interface RuntimeToken<TValue = unknown, TType extends string = string> {
  /** Token resolver key. */
  readonly __configFormToken: TType
  /** Phantom value type carried for TypeScript inference only. */
  readonly __configFormValue?: TValue
}

/** Text that can be static or deferred to runtime token resolution. */
export type RuntimeText = string | RuntimeToken<string>

/** Boolean field condition that can be static, token-based, or derived from values. */
export type FieldCondition<T extends object = FormValues> = boolean | RuntimeToken<boolean> | ((values: T) => boolean)

/** Primitive slot return values that Vue can render directly. */
export type SlotPrimitive = string | number | boolean | null | undefined

/** Container node config: renders a component and slots without binding a form field. */
export interface ComponentNodeConfig {
  /** Vue component, function component, native tag, or runtime-registered component key. */
  component: Component | FunctionalFieldComponent | string
  /** Props passed to the rendered component after runtime token resolution. */
  props?: Record<string, unknown>
  /** Child slots; nested form node configs must be created with defineField(...). */
  slots?: Record<string, SlotContent>
}

/** Values accepted as direct slot output after runtime resolution. */
export type SlotRenderable = VNode | VNode[] | SlotPrimitive | RuntimeToken

/** Full slot content contract for static nodes, arrays, render functions, and primitives. */
export type SlotContent = SlotRenderFn | DefinedFormNodeConfig | DefinedFormNodeConfig[] | SlotRenderable

/** 插槽渲染函数，接收作用域参数，返回 VNode(s)、容器节点或真实字段节点。 */
export type SlotRenderFn = (scope?: Record<string, unknown>) => SlotContent

// ===== FieldConfig：公开字段输入协议 =====

/** Field node config: renders a component bound to one form value key. */
export interface FieldConfig extends ComponentNodeConfig {
  /** Form value key controlled by this field. */
  field: string
  /** Field label rendered by the adapter; runtime tokens are resolved before render. */
  label?: RuntimeText
  /** Optional Zod schema used by validation. */
  schema?: ZodTypeAny
  /** Grid span consumed by concrete UI adapters. */
  span?: number
  /** Value inserted when the field is missing from the current model. */
  defaultValue?: unknown
  /** 注入到组件的值的属性名，默认 'modelValue' */
  valueProp?: string
  /** 接收组件值的事件名，同时也作为 change 校验的触发事件，默认 'update:modelValue' */
  trigger?: string
  /** 从组件事件参数中提取字段值，默认取第一个参数 */
  getValueFromEvent?: (...args: unknown[]) => unknown
  /** 触发 blur 校验的事件名，默认 'blur' */
  blurTrigger?: string
  /** Validation trigger list; submit is always included after normalization. */
  validateOn?: ValidateTrigger | ValidateTrigger[]
  /** Custom validator executed after schema validation. */
  validator?: FieldValidator<FormValues, unknown>
  /** Field visibility condition; hidden fields are skipped by validation/submit by default. */
  visible?: FieldCondition<FormValues>
  /** Field disabled condition; disabled fields are skipped by validation/submit by default. */
  disabled?: FieldCondition<FormValues>
  /** Submit-time value mapper applied after validation passes. */
  transform?: (value: unknown, allValues: FormValues) => unknown
  /** 隐藏时仍参与 submit 输出，默认 false */
  submitWhenHidden?: boolean
  /** 禁用时仍参与 submit 输出，默认 false */
  submitWhenDisabled?: boolean
}

/** Any top-level ConfigForm node, including real fields and container nodes. */
export type FormNodeConfig = FieldConfig | ComponentNodeConfig

/** Non-enumerable brand added by defineField(...) and runtime resolution. */
export interface DefinedFormNodeBrand {
  readonly [CONFIG_FORM_DEFINED_NODE]: true
}

/** Form node config that has passed through defineField(...). */
export type DefinedFormNodeConfig<TConfig extends FormNodeConfig = FormNodeConfig> = TConfig & DefinedFormNodeBrand

/** Field config after defaults have been applied and scalar options normalized. */
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

/** Render-ready field node after runtime component, token, prop, slot, and label resolution. */
export interface ResolvedField extends Omit<NormalizedFieldConfig, 'label'> {
  label?: string
}

/** Render-ready container node after runtime component, prop, and slot resolution. */
export interface ResolvedComponentNode extends Omit<ComponentNodeConfig, 'props'> {
  props: Record<string, unknown>
}

/** Any node returned by FormRuntime.resolveNode(...). */
export type ResolvedFormNode = ResolvedField | ResolvedComponentNode

/** String keys available on a typed form model. */
export type FieldKey<T extends object> = Extract<keyof T, string>

// ===== 表单组件类型 =====

/** Props accepted by the ConfigForm Vue component. */
export interface ConfigFormProps<T extends object = FormValues> {
  /** CSS class namespace prefix; defaults to "cf". */
  namespace?: string
  /** Render fields in inline mode when supported by the adapter CSS. */
  inline?: boolean
  /**
   * 表单字段配置
   */
  fields: FormNodeConfig[]
  /** Label width forwarded to field layout. */
  labelWidth?: string | number
  /** v-model 双向绑定表单值 */
  modelValue?: T
  /** 表单运行时配置，用于组件注册、runtime token 和插件生命周期。 */
  runtime?: FormRuntimeOptions
}

/** Events emitted by ConfigForm. */
export interface ConfigFormEmits<T extends object = FormValues> {
  (e: 'submit', values: T): void
  (e: 'error', errors: FormErrors): void
  (e: 'update:modelValue', values: T): void
}

/** Methods exposed through ConfigForm template refs. */
export interface ConfigFormExpose<T extends object = FormValues> {
  /** Validate and emit submit/error events. */
  submit: () => Promise<boolean>
  /** Validate all fields for submit. */
  validate: () => Promise<boolean>
  /** Validate one field for the specified trigger. */
  validateField: (field: FieldKey<T> | string, trigger?: ValidateTrigger) => Promise<boolean>
  /** Reset values to defaults and clear validation errors. */
  reset: () => void
  /** Set one field value and clear its validation error. */
  setValue: {
    <K extends FieldKey<T>>(field: K, value: T[K]): void
    (field: string, value: unknown): void
  }
  /** Merge or replace form values, clearing errors for touched fields. */
  setValues: (values: Partial<T>, replace?: boolean) => void
  /** Read one field value. */
  getValue: {
    <K extends FieldKey<T>>(field: K): T[K]
    (field: string): unknown
  }
  /** 获取表单值的浅拷贝快照（保留 Date/Dayjs 等实例） */
  getValues: () => T
  /** 清除指定字段的校验错误；不传字段时清除全部 */
  clearValidate: (field?: FieldKey<T> | string) => void
}

/** Validation errors keyed by form field name. */
export interface FormErrors {
  [field: string]: string[]
}
