import type { FieldSchema, FormSchema } from './types'
import { deepMerge, isObject } from '@moluoxixi/shared'

/**
 * 合并两个 FormSchema
 *
 * 适用于 Schema 继承/覆盖场景：
 * - 基础 Schema + 特定业务覆盖
 * - 后端下发 Schema + 前端本地补丁
 *
 * @param base - 基础 Schema
 * @param override - 覆盖 Schema（部分字段）
 * @returns 合并后的 Schema
 */
export function mergeSchema(
  base: FormSchema,
  override: Partial<FormSchema>,
): FormSchema {
  const mergedFields: Record<string, FieldSchema> = { ...base.fields }

  /* 逐字段合并（深度合并） */
  if (override.fields) {
    for (const [name, fieldOverride] of Object.entries(override.fields)) {
      const baseField = mergedFields[name]
      if (baseField && isObject(fieldOverride)) {
        mergedFields[name] = deepMerge(
          { ...baseField } as Record<string, unknown>,
          fieldOverride as Record<string, unknown>,
        ) as unknown as FieldSchema
      }
      else {
        mergedFields[name] = fieldOverride
      }
    }
  }

  return {
    form: override.form
      ? deepMerge({ ...(base.form ?? {}) } as Record<string, unknown>, override.form as Record<string, unknown>) as FormSchema['form']
      : base.form,
    fields: mergedFields,
    layout: override.layout ?? base.layout,
    reactions: [
      ...(base.reactions ?? []),
      ...(override.reactions ?? []),
    ],
  }
}
