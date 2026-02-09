import type { FieldInstance, FieldProps } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import { observer } from '@moluoxixi/reactive-react'
import { useContext, useEffect, useRef } from 'react'
import { FieldContext, FormContext } from '../context'
import { ReactiveField } from './ReactiveField'

export interface FormObjectFieldProps {
  name: string
  fieldProps?: Partial<FieldProps>
  children?: ReactNode
}

/**
 * 对象字段组件（React 版）
 *
 * 创建 Field 实例，支持嵌套子字段。
 * 组件卸载时清理由本组件创建的字段注册。
 */
export const FormObjectField = observer<FormObjectFieldProps>(({ name, fieldProps, children }) => {
  const form = useContext(FormContext)
  if (!form)
    throw new Error('[ConfigForm] <FormObjectField> 必须在 <FormProvider> 内部使用')

  /**
   * 获取或创建字段，并记录是否由本组件创建。
   *
   * 兼容 React 18 StrictMode 双挂载（同 FormField / FormVoidField）。
   */
  const fieldRef = useRef<FieldInstance | null>(null)
  const createdByThisRef = useRef(false)
  if (!fieldRef.current || !form.getField(name)) {
    let field = form.getField(name)
    if (!field) {
      field = form.createField({ name, ...fieldProps } as FieldProps)
      createdByThisRef.current = true
    }
    fieldRef.current = field
  }
  const field = fieldRef.current

  /* 组件卸载时清理由本组件创建的字段注册 */
  useEffect(() => {
    const fieldName = name
    const created = createdByThisRef.current
    return () => {
      if (created) {
        form.removeField(fieldName)
      }
    }
  }, [form, name])

  return (
    <FieldContext.Provider value={field}>
      <ReactiveField field={field}>{children}</ReactiveField>
    </FieldContext.Provider>
  )
})
