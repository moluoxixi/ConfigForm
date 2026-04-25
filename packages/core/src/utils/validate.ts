import type { ZodTypeAny } from 'zod'
import type { FieldDef, FormErrors } from '../types'

/**
 * 校验单个字段
 * @returns 错误消息数组，空数组表示通过
 */
export function validateField(
  value: any,
  schema: ZodTypeAny,
): string[] {
  const result = schema.safeParse(value)
  if (result.success)
    return []

  return result.error.issues.map(issue =>
    issue.message || `Validation failed for path: ${issue.path.join('.')}`,
  )
}

/**
 * 校验整个表单
 * 逐字段执行 Zod safeParse，收集所有错误
 */
export function validateForm(
  values: Record<string, any>,
  fields: FieldDef[],
): FormErrors {
  const errors: FormErrors = {}

  for (const field of fields) {
    if (!field.type)
      continue

    const fieldErrors = validateField(values[field.field], field.type)
    if (fieldErrors.length > 0)
      errors[field.field] = fieldErrors
  }

  return errors
}
