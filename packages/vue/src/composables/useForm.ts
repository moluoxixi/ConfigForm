import type { FormConfig, FormInstance } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { inject, onUnmounted } from 'vue'
import { FormSymbol } from '../context'

/**
 * 获取当前表单上下文
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
 * @param [config] 参数 `config`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
