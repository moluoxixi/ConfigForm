import type { ZodTypeAny } from 'zod'
import type { FieldDef } from '../models/FieldDef'
import type { FieldValidator, FormErrors, FormValues, ValidateTrigger } from '../types'

/** 校验单个字段值（纯 Zod 调用）。 */
export function validateField(
  value: any,
  schema: ZodTypeAny,
  _allValues?: FormValues,
): string[] {
  const result = schema.safeParse(value)
  if (result.success)
    return []
  return result.error.issues.map(i => i.message || `Validation failed: ${i.path.join('.')}`)
}

function normalizeValidatorResult(result: Awaited<ReturnType<FieldValidator>>): string[] {
  if (!result)
    return []
  return Array.isArray(result) ? result.filter(Boolean) : [result]
}

/**
 * 校验单个字段，包含 Zod schema 和可访问全量 values 的自定义 validator。
 */
export async function validateFieldRules(
  value: any,
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
 * 跳过逻辑已内聚于 FieldDef 方法，此处只做遍历。
 */
export async function validateForm(
  values: FormValues,
  fields: FieldDef[],
  trigger: ValidateTrigger = 'submit',
): Promise<FormErrors> {
  const errors: FormErrors = {}
  for (const field of fields) {
    if (!field.schema && !field.validator)
      continue
    const shouldValidateHidden = trigger === 'submit' && field.submitWhenHidden
    const shouldValidateDisabled = trigger === 'submit' && field.submitWhenDisabled

    if (!field.isVisible(values) && !shouldValidateHidden)
      continue
    if (field.isDisabled(values) && !shouldValidateDisabled)
      continue
    if (!field.shouldValidateOn(trigger))
      continue

    const errs = await validateFieldRules(values[field.field], field.schema, values, field.validator)
    if (errs.length > 0)
      errors[field.field] = errs
  }
  return errors
}
