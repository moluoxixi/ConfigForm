import type { FormConfig, FormInstance } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { inject, onUnmounted } from 'vue'
import { FormSymbol } from '../context'

/**
 * 读取当前表单实例。
 * 只能在 `FormProvider` 子树内调用。
 *
 * @returns 返回当前上下文绑定的表单实例。
 */
export function useForm<Values extends Record<string, unknown> = Record<string, unknown>>(): FormInstance<Values> {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useForm 必须在 <FormProvider> 内部使用')
  }
  return form as FormInstance<Values>
}

/**
 * 在 `setup` 中创建表单实例。
 *
 * 组件卸载时会自动调用 `dispose`，避免事件和响应式订阅泄漏。
 *
 * @param config 创建表单使用的配置对象。
 * @returns 返回新创建的表单实例。
 */
export function useCreateForm<
  Values extends Record<string, unknown> = Record<string, unknown>,
>(config: FormConfig<Values> = {}): FormInstance<Values> {
  const form = createForm<Values>(config)

  onUnmounted(() => {
    form.dispose()
  })

  return form
}
