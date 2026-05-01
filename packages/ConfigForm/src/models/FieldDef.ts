import type { output, ZodTypeAny } from 'zod'
import type {
  FieldConfig,
  FieldKey,
  FieldValidator,
  FormValues,
  SlotContent,
  TypedFieldConfig,
  ValidateTrigger,
} from '@/types'

// ===== 工具类型 =====

/** 从 Vue 组件中提取 props 类型（支持 class / functional 组件） */
export type ExtractComponentProps<C> = C extends abstract new (...args: unknown[]) => { $props: infer P }
  ? P
  : C extends (props: infer P, ...args: unknown[]) => unknown
    ? P
    : Record<string, unknown>

interface ComponentFieldPart<C> {
  component: C
  props?: ExtractComponentProps<C> & {}
}

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
  readonly props?: Record<string, unknown>
  readonly defaultValue?: unknown
  readonly valueProp: string
  readonly trigger: string
  readonly blurTrigger: string
  readonly validateOn: ValidateTrigger[]
  readonly validator?: FieldValidator<FormValues, unknown>
  readonly visible?: (values: FormValues) => boolean
  readonly disabled?: (values: FormValues) => boolean
  readonly transform?: (value: unknown, allValues: FormValues) => unknown
  readonly submitWhenHidden: boolean
  readonly submitWhenDisabled: boolean
  readonly slots?: Record<string, SlotContent>

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

  applyTransform(value: unknown, allValues: FormValues): unknown {
    return this.transform ? this.transform(value, allValues) : value
  }
}

// ===== defineField =====

interface FieldConfigBase<
  TValues extends object = FormValues,
  TValue = unknown,
  TField extends string = string,
> {
  field: TField
  label?: string
  span?: number
  valueProp?: string
  trigger?: string
  blurTrigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  validator?: FieldValidator<TValues, TValue>
  visible?: (values: TValues) => boolean
  disabled?: (values: TValues) => boolean
  transform?: (value: TValue, allValues: TValues) => unknown
  submitWhenHidden?: boolean
  submitWhenDisabled?: boolean
  slots?: Record<string, SlotContent>
}

interface SchemaFieldConfigCore<
  TValues extends object,
  TSchema extends ZodTypeAny,
  TField extends string = string,
> extends FieldConfigBase<TValues, output<TSchema>, TField> {
  schema: TSchema
  defaultValue?: output<TSchema>
}

interface DefaultValueFieldConfigCore<
  TValues extends object,
  TValue,
  TField extends string = string,
> extends FieldConfigBase<TValues, TValue, TField> {
  schema?: undefined
  defaultValue: TValue
}

interface UnknownValueFieldConfigCore<
  TValues extends object = FormValues,
  TField extends string = string,
> extends FieldConfigBase<TValues, unknown, TField> {
  schema?: undefined
  defaultValue?: undefined
}

/**
 * 根据 schema/defaultValue 自动推导字段值类型，根据 component 自动推导 props 类型。
 * 强类型表单推荐使用 defineFieldFor<T>()，可让 field、value 和 values 都精确到字段 key。
 *
 * @example
 * ```ts
 * const nameField = defineField({
 *   field: 'name',
 *   component: Input,
 *   defaultValue: '',
 *   validator: value => value.length > 0 ? undefined : '必填',
 * })
 *
 * interface UserForm { name: string; age: number }
 * const userField = defineFieldFor<UserForm>()({
 *   field: 'name',
 *   component: Input,
 *   validator: (value, values) => values.age > 0 && value.length > 0 ? undefined : '必填',
 * })
 * ```
 */

export function defineFieldFor<TValues extends object>() {
  return function typedDefineField<
    K extends FieldKey<TValues>,
    C = unknown,
  >(
    config: TypedFieldConfig<TValues, K> & ComponentFieldPart<C>,
  ): FieldDef {
    return new FieldDef(config as FieldConfig)
  }
}

// 重载 1：不传表单泛型，按 schema/defaultValue 推导 value，values 使用默认 FormValues
export function defineField<
  C = unknown,
  TSchema extends ZodTypeAny = ZodTypeAny,
  TField extends string = string,
>(
  config: SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>,
): FieldDef

// 重载 2：没有 schema 时，按 defaultValue 推导 value
export function defineField<
  C = unknown,
  TValue = unknown,
  TField extends string = string,
>(
  config: DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>,
): FieldDef

// 重载 3：没有 schema/defaultValue 时，value 使用默认 unknown
export function defineField<
  C = unknown,
  TField extends string = string,
>(
  config: UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>,
): FieldDef

// 重载 4：兼容显式表单泛型；若只传 TValues，字段值会是 TValues[keyof TValues]，精确字段值请使用 defineFieldFor<TValues>()
export function defineField<
  TValues extends object,
  K extends FieldKey<TValues> = FieldKey<TValues>,
  C = unknown,
>(
  config: TypedFieldConfig<TValues, K> & ComponentFieldPart<C>,
): FieldDef

// 实现
export function defineField(config: FieldConfig): FieldDef {
  return new FieldDef(config)
}
