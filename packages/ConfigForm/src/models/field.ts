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

/** 规范化 validateOn，确保始终包含 'submit' */
export function normalizeValidateOn(on?: ValidateTrigger | ValidateTrigger[]): ValidateTrigger[] {
  if (!on)
    return ['submit']
  const arr = Array.isArray(on) ? on : [on]
  return arr.includes('submit') ? arr : [...arr, 'submit']
}

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
  TField extends FieldKey<FormValues> = FieldKey<FormValues>,
>(
  config: SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<SchemaFieldConfigCore<FormValues, TSchema, TField> & ComponentFieldPart<C>>

// 重载 2：没有 schema 时，按 defaultValue 推导 value
export function defineField<
  C = unknown,
  TValue = unknown,
  TField extends FieldKey<FormValues> = FieldKey<FormValues>,
>(
  config: DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<DefaultValueFieldConfigCore<FormValues, TValue, TField> & ComponentFieldPart<C>>

// 重载 3：没有 schema/defaultValue 时，value 使用默认 unknown
export function defineField<
  C = unknown,
  TField extends FieldKey<FormValues> = FieldKey<FormValues>,
>(
  config: UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>,
): DefinedFieldConfig<UnknownValueFieldConfigCore<FormValues, TField> & ComponentFieldPart<C>>

// 重载 4：slot 内无 field 的组件容器节点，也必须通过 defineField 创建
export function defineField<C = unknown>(
  config: ComponentNodeConfigCore<C>,
): DefinedComponentNodeConfig<ComponentNodeConfigCore<C>>

// 模型泛型重载：字段输入按 key 分发，组件 props 仍由独立的 ComponentFieldPart 推导。
export function defineField<
  TValues extends object,
  C = unknown,
  TSchema extends ZodTypeAny = ZodTypeAny,
>(
  config: ModelSchemaFieldConfigInput<TValues, TSchema> & ComponentFieldPart<C>,
): DefinedFieldConfig<ModelSchemaFieldConfigInput<TValues, TSchema> & ComponentFieldPart<C>>

export function defineField<
  TValues extends object,
  C = unknown,
>(
  config: ModelDefaultValueFieldConfigInput<TValues> & ComponentFieldPart<C>,
): DefinedFieldConfig<ModelDefaultValueFieldConfigInput<TValues> & ComponentFieldPart<C>>

export function defineField<
  TValues extends object,
  C = unknown,
>(
  config: ModelUnknownValueFieldConfigInput<TValues> & ComponentFieldPart<C>,
): DefinedFieldConfig<ModelUnknownValueFieldConfigInput<TValues> & ComponentFieldPart<C>>

export function defineField<_TValues extends object, C = unknown>(
  config: ComponentNodeConfigCore<C>,
): DefinedComponentNodeConfig<ComponentNodeConfigCore<C>>

// 实现
export function defineField(config: FormNodeInput): DefinedFormNodeConfig {
  return markDefinedFormNodeConfig({ ...config })
}
