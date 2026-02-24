import type { FieldInstance } from '@moluoxixi/core'
import { useContext } from 'react'
import { FieldContext, FormContext } from '../context'

/**
 * 获取当前字段上下文
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function useField<Value = unknown>(): FieldInstance<Value> {
  const field = useContext(FieldContext)
  if (!field) {
    throw new Error('[ConfigForm] useField 必须在 <FormField> 内部使用')
  }
  return field as FieldInstance<Value>
}

/**
 * 通过路径获取指定字段
 * @param path 参数 `path`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function useFieldByPath<Value = unknown>(path: string): FieldInstance<Value> | undefined {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] useFieldByPath 必须在 <FormProvider> 内部使用')
  }
  return form.getField(path) as FieldInstance<Value> | undefined
}
