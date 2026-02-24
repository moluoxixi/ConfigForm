import type { FormConfig, FormInstance } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { useContext, useEffect, useMemo } from 'react'
import { FormContext } from '../context'

/**
 * 获取当前表单上下文
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function useForm<Values extends Record<string, unknown> = Record<string, unknown>>(): FormInstance<Values> {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] useForm 必须在 <FormProvider> 内部使用')
  }
  return form as FormInstance<Values>
}

/**
 * 创建表单实例（在组件内使用）
 *
 * 保证整个组件生命周期内使用同一个实例，
 * 组件卸载时自动销毁。
 * @param [config] 参数 `config`用于提供可选配置，调整当前功能模块的执行策略。
 * @param [options] 参数 `options`用于提供可选配置，调整当前功能模块的执行策略。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function useCreateForm<
  Values extends Record<string, unknown> = Record<string, unknown>,
>(config: FormConfig<Values> = {}, options?: { resetKey?: unknown }): FormInstance<Values> {
  const form = useMemo(
    () => createForm<Values>(config),
    [options?.resetKey],
  )

  useEffect(() => {
    return () => {
      form.dispose()
    }
  }, [form])

  return form
}
