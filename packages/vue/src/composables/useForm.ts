import type { FormConfig, FormInstance } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { inject, onUnmounted } from 'vue'
import { FormSymbol } from '../context'

/**
 * 获取当前表单上下文
 */
export function useForm<Values extends Record<string, unknown> = Record<string, unknown>>(): FormInstance<Values> {
  const form = inject(FormSymbol)
  if (!form) {
    throw new Error('[ConfigForm] useForm 必须在 <FormProvider> 内部使用')
  }
  return form as FormInstance<Values>
}

/**
 * 创建表单实例
 *
 * 在 setup 中调用，组件卸载时自动销毁。
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
