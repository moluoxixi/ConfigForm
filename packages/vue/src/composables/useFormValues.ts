import type { ComputedRef } from 'vue'
import { computed, inject } from 'vue'
import { FormSymbol } from '../context'

/**
 * 读取表单当前值（响应式）。
 *
 * 由于 form.values 本身就是 Vue reactive 对象，
 * 直接在模板中使用就能自动追踪依赖。
 * @returns 返回当前表单值对象。
 */
export function useFormValues<Values extends Record<string, unknown> = Record<string, unknown>>(): Values {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useFormValues 必须在 <FormProvider> 内部使用')
  }
  return form.values as Values
}

/**
 * 读取表单是否有效（响应式 computed ref）。
 *
 * 返回 ComputedRef<boolean>，在模板中使用 `.value` 访问，
 * 当字段验证状态变化时自动更新。
 * @returns 返回表单有效状态的计算属性。
 */
export function useFormValid(): ComputedRef<boolean> {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useFormValid 必须在 <FormProvider> 内部使用')
  }
  return computed(() => form.valid)
}

/**
 * 读取表单提交状态（响应式 computed ref）。
 *
 * 返回 ComputedRef<boolean>，在模板中使用 `.value` 访问，
 * 当提交状态变化时自动更新。
 * @returns 返回表单提交状态的计算属性。
 */
export function useFormSubmitting(): ComputedRef<boolean> {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useFormSubmitting 必须在 <FormProvider> 内部使用')
  }
  return computed(() => form.submitting)
}
