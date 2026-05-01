import type { output, ZodTypeAny } from 'zod'
import type {
  FieldCondition,
  FieldConfig,
  FieldKey,
  FieldValidator,
  FormValues,
  NormalizedFieldConfig,
  RuntimeText,
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

// ===== 字段规范化 =====

/** 规范化 validateOn，确保始终包含 'submit' */
export function normalizeValidateOn(on?: ValidateTrigger | ValidateTrigger[]): ValidateTrigger[] {
  if (!on)
    return ['submit']
  const arr = Array.isArray(on) ? on : [on]
  return arr.includes('submit') ? arr : [...arr, 'submit']
}

export function normalizeField(input: FieldConfig): NormalizedFieldConfig {
  return {
    ...input,
    blurTrigger: input.blurTrigger || 'blur',
    props: input.props ?? {},
    span: input.span ?? 24,
    submitWhenDisabled: input.submitWhenDisabled ?? false,
    submitWhenHidden: input.submitWhenHidden ?? false,
    trigger: input.trigger || 'update:modelValue',
    validateOn: normalizeValidateOn(input.validateOn),
    valueProp: input.valueProp || 'modelValue',
  }
}

export function shouldValidateOn(field: Pick<NormalizedFieldConfig, 'validateOn'>, trigger: ValidateTrigger): boolean {
  return field.validateOn.includes(trigger)
}

export function applyFieldTransform(
  field: Pick<NormalizedFieldConfig, 'transform'>,
  value: unknown,
  allValues: FormValues,
): unknown {
  return field.transform ? field.transform(value, allValues) : value
}

// ===== defineField：纯配置工厂 =====

interface FieldConfigBase<
  TValues extends object = FormValues,
  TValue = unknown,
  TField extends string = string,
> {
  field: TField
  label?: RuntimeText
  span?: number
  valueProp?: string
  trigger?: string
  blurTrigger?: string
  validateOn?: ValidateTrigger | ValidateTrigger[]
  validator?: FieldValidator<TValues, TValue>
  visible?: FieldCondition<TValues>
  disabled?: FieldCondition<TValues>
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
  ): FieldConfig {
    return { ...(config as FieldConfig) }
  }
}

// 重载 1：不传表单泛型，按 schema/defaultValue 推导 value，values 使用默认 FormValues
export function defineField<
  C = unknown,
  TSchema extends ZodTypeAny = ZodTypeAny,
  TField extends string = string,
>(
  config: SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>,
): FieldConfig

// 重载 2：没有 schema 时，按 defaultValue 推导 value
export function defineField<
  C = unknown,
  TValue = unknown,
  TField extends string = string,
>(
  config: DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>,
): FieldConfig

// 重载 3：没有 schema/defaultValue 时，value 使用默认 unknown
export function defineField<
  C = unknown,
  TField extends string = string,
>(
  config: UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>,
): FieldConfig

// 重载 4：兼容显式表单泛型；若只传 TValues，字段值会是 TValues[keyof TValues]，精确字段值请使用 defineFieldFor<TValues>()
export function defineField<
  TValues extends object,
  K extends FieldKey<TValues> = FieldKey<TValues>,
  C = unknown,
>(
  config: TypedFieldConfig<TValues, K> & ComponentFieldPart<C>,
): FieldConfig

// 实现
export function defineField(config: FieldConfig): FieldConfig {
  return { ...config }
}
