import type { ZodTypeAny } from 'zod'
import type { FormErrors, FormValues, ValidateTrigger } from '@/types'
import type { FieldDef } from '@/models/FieldDef'

/**
 * 校验单个字段值（纯 Zod 调用）。
 * @param allValues 当前表单全量值，供跨字段 Zod superRefine 使用（预留）
 */
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

/**
 * 校验整个表单（按触发时机过滤）。
 * 跳过逻辑已内聚于 FieldDef 方法，此处只做遍历。
 */
export function validateForm(
  values: FormValues,
  fields: FieldDef[],
  trigger: ValidateTrigger = 'submit',
): FormErrors {
  const errors: FormErrors = {}
  for (const field of fields) {
    if (!field.type)
      continue
    if (!field.isVisible(values))
      continue
    if (field.isDisabled(values))
      continue
    if (!field.shouldValidateOn(trigger))
      continue

    const errs = validateField(values[field.field], field.type, values)
    if (errs.length > 0)
      errors[field.field] = errs
  }
  return errors
}
