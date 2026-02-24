import type { FormConfig, FormInstance } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { useContext, useEffect, useMemo } from 'react'
import { FormContext } from '../context'

/**
 * 读取当前表单实例。
 * 只能在 `FormProvider` 子树内调用，超出该范围会抛错提示调用位置不合法。
 *
 * @returns 返回当前上下文绑定的表单实例。
 */
export function useForm<Values extends Record<string, unknown> = Record<string, unknown>>(): FormInstance<Values> {
  const form = useContext(FormContext)
  if (!form) {
    throw new Error('[ConfigForm] useForm 必须在 <FormProvider> 内部使用')
  }
  return form as FormInstance<Values>
}

/**
 * 在组件内部创建表单实例。
 *
 * 设计目标：
 * 1. 同一个 `resetKey` 周期内复用同一实例，避免重复创建。
 * 2. `resetKey` 变化时重建实例，满足动态重置场景。
 * 3. 组件卸载时调用 `dispose`，释放事件与响应式订阅。
 *
 * @param config 创建表单时使用的配置对象。
 * @param options 额外选项，`resetKey` 变化会触发表单实例重建。
 * @param options.resetKey 用于控制实例重建的比较键。
 * @returns 返回可直接用于 `FormProvider` 的表单实例。
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
