import type { FieldInstance } from '@moluoxixi/core'
import { useContext } from 'react'
import { FieldContext, FormContext } from '../context'

/**
 * 读取当前字段实例。
 * 只能在 `FormField` 或其子组件中调用。
 *
 * @returns 返回当前字段上下文中的字段实例。
 */
export function useField<Value = unknown>(): FieldInstance<Value> {
  const field = useContext(FieldContext)
  if (!field) {
    throw new Error('[ConfigForm] useField 必须在 <FormField> 内部使用')
  }
  return field as FieldInstance<Value>
}

/**
 * 按字段路径读取指定字段实例。
 * 该方法不依赖当前 `FieldContext`，可在任意 `FormProvider` 子树内使用。
 *
 * @param path 字段路径，例如 `user.name` 或 `items.0.title`。
 * @returns 返回对应路径的字段实例；找不到时返回 `undefined`。
 */
export function useFieldByPath<Value = unknown>(path: string): FieldInstance<Value> | undefined {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] useFieldByPath 必须在 <FormProvider> 内部使用')
  }
  return form.getField(path) as FieldInstance<Value> | undefined
}
