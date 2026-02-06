import type { FormConfig, FormInstance } from '@moluoxixi/core'
import { createForm } from '@moluoxixi/core'
import { useContext, useEffect, useRef } from 'react'
import { FormContext } from '../context'

/**
 * 获取当前表单上下文
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
 */
export function useCreateForm<
  Values extends Record<string, unknown> = Record<string, unknown>,
>(config: FormConfig<Values> = {}): FormInstance<Values> {
  const formRef = useRef<FormInstance<Values> | null>(null)

  if (!formRef.current) {
    formRef.current = createForm<Values>(config)
  }

  useEffect(() => {
    return () => {
      formRef.current?.dispose()
      formRef.current = null
    }
  }, [])

  return formRef.current
}
