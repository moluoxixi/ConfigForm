import type { output, ZodTypeAny } from 'zod'
import type {
  FieldCondition,
  FieldConfig,
  FieldValidator,
  FormValues,
  NormalizedFieldConfig,
  RuntimeText,
  RuntimeToken,
  SlotContent,
  ValidateTrigger,
} from '@/types'

// ===== 工具类型 =====

/** 从 Vue 组件中提取 props 类型（支持 class / functional 组件） */
export type ExtractComponentProps<C> = C extends abstract new (...args: unknown[]) => { $props: infer P }
  ? P
  : C extends (props: infer P, ...args: unknown[]) => unknown
    ? P
    : Record<string, unknown>

type RuntimeResolvable<T> = T extends (...args: infer TArgs) => infer TReturn
  ? (...args: TArgs) => TReturn
  : T extends string
    ? RuntimeText
    : T extends number | boolean | bigint | symbol | null | undefined
      ? T | RuntimeToken<T>
      : T extends readonly (infer TItem)[]
        ? RuntimeResolvable<TItem>[]
        : T extends object
          ? { [K in keyof T]: RuntimeResolvable<T[K]> }
          : T | RuntimeToken<T>

interface ComponentFieldPart<C> {
  component: C
  props?: RuntimeResolvable<ExtractComponentProps<NoInfer<C>>> & {}
}

type DefinedFieldConfig<TConfig> = TConfig & FieldConfig

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
 *
 * @example
 * ```ts
 * const nameField = defineField({
 *   field: 'name',
 *   component: Input,
 *   defaultValue: '',
 *   validator: value => value.length > 0 ? undefined : '必填',
 * })
 * ```
 */

// 重载 1：不传表单泛型，按 schema/defaultValue 推导 value，values 使用默认 FormValues
export function defineField<
  C = unknown,
  TSchema extends ZodTypeAny = ZodTypeAny,
  TField extends string = string,
>(
  config: SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>>

// 重载 2：没有 schema 时，按 defaultValue 推导 value
export function defineField<
  C = unknown,
  TValue = unknown,
  TField extends string = string,
>(
  config: DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>>

// 重载 3：没有 schema/defaultValue 时，value 使用默认 unknown
export function defineField<
  C = unknown,
  TField extends string = string,
>(
  config: UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>>

// 实现
export function defineField(config: FieldConfig): FieldConfig {
  return { ...config }
}
