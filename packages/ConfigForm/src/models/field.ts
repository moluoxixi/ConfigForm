import type { output, ZodTypeAny } from 'zod'
import type {
  ComponentNodeConfig,
  DefinedFormNodeBrand,
  DefinedFormNodeConfig,
  FieldCondition,
  FieldConfig,
  FieldKey,
  FieldValidator,
  FormValues,
  NormalizedFieldConfig,
  RuntimeText,
  RuntimeToken,
  SlotContent,
  ValidateTrigger,
} from '@/types'
import { markDefinedFormNodeConfig } from '@/models/node'

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

interface ComponentNodeConfigCore<C> extends ComponentFieldPart<C> {
  slots?: Record<string, SlotContent>
}

type FormNodeInput = FieldConfig | ComponentNodeConfig

type DefinedFieldConfig<TConfig> = TConfig & FieldConfig & DefinedFormNodeBrand
type DefinedComponentNodeConfig<TConfig> = TConfig & ComponentNodeConfig & DefinedFormNodeBrand
type FieldValueFor<
  TValues extends object,
  TField extends FieldKey<TValues>,
  TFallback,
> = [FormValues] extends [TValues] ? TFallback : TValues[TField]

// ===== 字段规范化 =====

/** Normalize a validation trigger declaration and always include submit validation. */
export function normalizeValidateOn(on?: ValidateTrigger | ValidateTrigger[]): ValidateTrigger[] {
  if (!on)
    return ['submit']
  const arr = Array.isArray(on) ? on : [on]
  return arr.includes('submit') ? arr : [...arr, 'submit']
}

/**
 * Normalize a public field declaration into the internal shape shared by
 * rendering, validation, runtime plugins, and submit serialization.
 */
export function normalizeField(input: FieldConfig): NormalizedFieldConfig {
  const trigger = input.trigger || 'update:modelValue'
  const blurTrigger = input.blurTrigger || 'blur'

  if (trigger === blurTrigger) {
    throw new Error(
      `Field "${input.field}" cannot use the same event for trigger and blurTrigger: ${trigger}`,
    )
  }

  return {
    ...input,
    blurTrigger,
    props: input.props ?? {},
    span: input.span ?? 24,
    submitWhenDisabled: input.submitWhenDisabled ?? false,
    submitWhenHidden: input.submitWhenHidden ?? false,
    trigger,
    validateOn: normalizeValidateOn(input.validateOn),
    valueProp: input.valueProp || 'modelValue',
  }
}

/** Return whether a normalized field should validate on the requested trigger. */
export function shouldValidateOn(field: Pick<NormalizedFieldConfig, 'validateOn'>, trigger: ValidateTrigger): boolean {
  return field.validateOn.includes(trigger)
}

/** Apply a submit-time field transform when one is declared. */
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
  TField extends FieldKey<TValues> = FieldKey<TValues>,
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
  getValueFromEvent?: (...args: unknown[]) => TValue
  submitWhenHidden?: boolean
  submitWhenDisabled?: boolean
  slots?: Record<string, SlotContent>
}

interface SchemaFieldConfigCore<
  TValues extends object,
  TSchema extends ZodTypeAny,
  TField extends FieldKey<TValues> = FieldKey<TValues>,
> extends FieldConfigBase<TValues, FieldValueFor<TValues, TField, output<TSchema>>, TField> {
  schema: TSchema
  defaultValue?: FieldValueFor<TValues, TField, output<TSchema>>
}

interface DefaultValueFieldConfigCore<
  TValues extends object,
  TValue,
  TField extends FieldKey<TValues> = FieldKey<TValues>,
> extends FieldConfigBase<TValues, FieldValueFor<TValues, TField, TValue>, TField> {
  schema?: undefined
  defaultValue: FieldValueFor<TValues, TField, TValue>
}

interface UnknownValueFieldConfigCore<
  TValues extends object = FormValues,
  TField extends FieldKey<TValues> = FieldKey<TValues>,
> extends FieldConfigBase<TValues, FieldValueFor<TValues, TField, unknown>, TField> {
  schema?: undefined
  defaultValue?: undefined
}

type ModelSchemaFieldConfigInput<
  TValues extends object,
  TSchema extends ZodTypeAny,
> = {
  [TField in FieldKey<TValues>]: SchemaFieldConfigCore<TValues, TSchema, TField>
}[FieldKey<TValues>]

type ModelDefaultValueFieldConfigInput<
  TValues extends object,
> = {
  [TField in FieldKey<TValues>]: DefaultValueFieldConfigCore<TValues, TValues[TField], TField>
}[FieldKey<TValues>]

type ModelUnknownValueFieldConfigInput<
  TValues extends object,
> = {
  [TField in FieldKey<TValues>]: UnknownValueFieldConfigCore<TValues, TField>
}[FieldKey<TValues>]

/**
 * 根据 schema/defaultValue 自动推导字段值类型，根据 component 自动推导 props 类型。
 *
 * The returned config is branded so slot node configs can be distinguished from
 * arbitrary objects at runtime. Passing no `field` creates a container node that
 * renders structure only and does not bind a value.
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

/** Infer value from schema when no form model generic is supplied. */
export function defineField<
  C = unknown,
  TSchema extends ZodTypeAny = ZodTypeAny,
  TField extends FieldKey<FormValues> = FieldKey<FormValues>,
>(
  config: SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>>

/** Infer value from defaultValue when no schema or form model generic is supplied. */
export function defineField<
  C = unknown,
  TValue = unknown,
  TField extends FieldKey<FormValues> = FieldKey<FormValues>,
>(
  config: DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>>

/** Use unknown value inference when neither schema nor defaultValue is supplied. */
export function defineField<
  C = unknown,
  TField extends FieldKey<FormValues> = FieldKey<FormValues>,
>(
  config: UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>>

/** Define a container component node for slots or top-level layout. */
export function defineField<C = unknown>(
  config: ComponentNodeConfigCore<C>,
): DefinedComponentNodeConfig<ComponentNodeConfigCore<C>>

/** Infer schema-backed field config against a typed form model. */
export function defineField<
  TValues extends object,
  C = unknown,
  TSchema extends ZodTypeAny = ZodTypeAny,
>(
  config: ModelSchemaFieldConfigInput<TValues, TSchema> & ComponentFieldPart<C>,
): DefinedFieldConfig<ModelSchemaFieldConfigInput<TValues, TSchema> & ComponentFieldPart<C>>

/** Infer defaultValue-backed field config against a typed form model. */
export function defineField<
  TValues extends object,
  C = unknown,
>(
  config: ModelDefaultValueFieldConfigInput<TValues> & ComponentFieldPart<C>,
): DefinedFieldConfig<ModelDefaultValueFieldConfigInput<TValues> & ComponentFieldPart<C>>

/** Define a typed-model field without schema/defaultValue value inference. */
export function defineField<
  TValues extends object,
  C = unknown,
>(
  config: ModelUnknownValueFieldConfigInput<TValues> & ComponentFieldPart<C>,
): DefinedFieldConfig<ModelUnknownValueFieldConfigInput<TValues> & ComponentFieldPart<C>>

/** Define a typed-model container component node. */
export function defineField<_TValues extends object, C = unknown>(
  config: ComponentNodeConfigCore<C>,
): DefinedComponentNodeConfig<ComponentNodeConfigCore<C>>

/** Runtime implementation shared by all defineField overloads. */
export function defineField(config: FormNodeInput): DefinedFormNodeConfig {
  return markDefinedFormNodeConfig({ ...config })
}
