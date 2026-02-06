import { inject } from 'vue'
import { FormSymbol } from '../context'

/**
 * 获取表单值（响应式）
 *
 * 由于 form.values 本身就是 Vue reactive 对象，
 * 直接在模板中使用就能自动追踪依赖。
 */
export function useFormValues<Values extends Record<string, unknown> = Record<string, unknown>>(): Values {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useFormValues 必须在 <FormProvider> 内部使用')
  }
  return form.values as Values
}

/**
 * 获取表单是否有效
 */
export function useFormValid(): boolean {
  const form = inject(FormSymbol)
  if (!form)
    return false
  return form.valid
}

/**
 * 获取表单提交状态
 */
export function useFormSubmitting(): boolean {
  const form = inject(FormSymbol)
  if (!form)
    return false
  return form.submitting
}
