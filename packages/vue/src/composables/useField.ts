import type { FieldInstance } from '@moluoxixi/core'
import { inject } from 'vue'
import { FieldSymbol, FormSymbol } from '../context'

/**
 * 读取当前字段实例。
 * 只能在 `FormField` 或其子组件中调用。
 *
 * @returns 返回当前字段上下文实例。
 */
export function useField<Value = unknown>(): FieldInstance<Value> {
  const field = inject(FieldSymbol)
  if (!field) {
    throw new Error('[ConfigForm] useField 必须在 <FormField> 内部使用')
  }
  return field as FieldInstance<Value>
}

/**
 * 按路径读取指定字段实例。
 *
 * @param path 字段路径，例如 `user.name`、`items.0.title`。
 * @returns 返回对应字段实例；找不到时返回 `undefined`。
 */
export function useFieldByPath<Value = unknown>(path: string): FieldInstance<Value> | undefined {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useFieldByPath 必须在 <FormProvider> 内部使用')
  }
  return form.getField(path) as FieldInstance<Value> | undefined
}
