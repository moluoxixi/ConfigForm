import type { ZodTypeAny } from 'zod'
import type { FormRuntime } from '@/runtime'
import type { FieldConfig, FieldValidator, FormErrors, FormValues, ValidateTrigger } from '@/types'
import { shouldValidateOn } from '@/models/field'
import { createFormRuntime } from '@/runtime'

/** 校验单个字段值（纯 Zod 调用）。 */
export function validateField(
  value: unknown,
  schema: ZodTypeAny,
  _allValues?: FormValues,
): string[] {
  const result = schema.safeParse(value)
  if (result.success)
    return []
  return result.error.issues.map(i => i.message || `Validation failed: ${i.path.join('.')}`)
}

/**
 * 归一化自定义 validator 的返回值。
 *
 * falsy 值表示校验通过；数组会过滤空消息，字符串会作为单条错误消息返回。
 */
function normalizeValidatorResult(result: Awaited<ReturnType<FieldValidator>>): string[] {
  if (!result)
    return []
  return Array.isArray(result) ? result.filter(Boolean) : [result]
}

/**
 * 校验单个字段，包含 Zod schema 和可访问全量 values 的自定义 validator。
 */
export async function validateFieldRules(
  value: unknown,
  schema: ZodTypeAny | undefined,
  allValues: FormValues,
  validator?: FieldValidator,
): Promise<string[]> {
  const zodErrors = schema ? validateField(value, schema, allValues) : []
  const customErrors = validator
    ? normalizeValidatorResult(await validator(value, allValues))
    : []
  return [...zodErrors, ...customErrors]
}

/**
 * 校验整个表单（按触发时机过滤）。
 * 跳过逻辑由 runtime 统一判断，此处只做遍历。
 */
export async function validateForm(
  values: FormValues,
  fields: FieldConfig[],
  trigger: ValidateTrigger = 'submit',
  runtime: FormRuntime = createFormRuntime(),
): Promise<FormErrors> {
  const errors: FormErrors = {}
  const resolveSnap = runtime.createResolveSnap({ errors, values })
  for (const config of fields) {
    const field = runtime.transformField(config)
    if (!field.schema && !field.validator)
      continue
    const shouldValidateHidden = trigger === 'submit' && field.submitWhenHidden
    const shouldValidateDisabled = trigger === 'submit' && field.submitWhenDisabled

    if (!runtime.resolveVisible(field, resolveSnap) && !shouldValidateHidden)
      continue
    if (runtime.resolveDisabled(field, resolveSnap) && !shouldValidateDisabled)
      continue
    if (!shouldValidateOn(field, trigger))
      continue

    const errs = await validateFieldRules(values[field.field], field.schema, values, field.validator)
    if (errs.length > 0)
      errors[field.field] = errs
  }
  return errors
}
