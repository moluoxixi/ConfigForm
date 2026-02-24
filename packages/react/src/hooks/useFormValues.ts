import { useContext } from 'react'
import { FormContext } from '../context'

/**
 * 读取表单当前值（响应式）。
 *
 * 推荐在 `observer` 包裹的组件中使用，`form.values` 变化时会触发重渲染。
 *
 * @returns 返回当前表单值对象。
 */
export function useFormValues<Values extends Record<string, unknown> = Record<string, unknown>>(): Values {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] useFormValues 必须在 <FormProvider> 内部使用')
  }
  return form.values as Values
}

/**
 * 读取表单当前是否通过校验。
 * @returns 表单有效时返回 `true`，否则返回 `false`。
 */
export function useFormValid(): boolean {
  const form = useContext(FormContext)
  if (!form)
    return false
  return form.valid
}

/**
 * 读取表单当前提交状态。
 * @returns 提交中返回 `true`，非提交中返回 `false`。
 */
export function useFormSubmitting(): boolean {
  const form = useContext(FormContext)
  if (!form)
    return false
  return form.submitting
}
