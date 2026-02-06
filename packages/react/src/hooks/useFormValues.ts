import { useContext } from 'react'
import { FormContext } from '../context'

/**
 * 获取表单值（响应式）
 *
 * 在 observer 包装的组件中使用，当值变化时自动重渲染
 */
export function useFormValues<Values extends Record<string, unknown> = Record<string, unknown>>(): Values {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] useFormValues 必须在 <FormProvider> 内部使用')
  }
  return form.values as Values
}

/**
 * 获取表单是否有效
 */
export function useFormValid(): boolean {
  const form = useContext(FormContext)
  if (!form)
    return false
  return form.valid
}

/**
 * 获取表单提交状态
 */
export function useFormSubmitting(): boolean {
  const form = useContext(FormContext)
  if (!form)
    return false
  return form.submitting
}
