import type { ObjectFieldInstance, ObjectFieldProps } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import { useContext, useEffect, useRef } from 'react'
import { FieldContext, FormContext } from '../context'
import { observer } from '../reactive'
import { ReactiveField } from './ReactiveField'

/**
 * `FormObjectField` 组件属性。
 */
export interface FormObjectFieldProps {
  name: string
  fieldProps?: Partial<ObjectFieldProps>
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
   * 获取或创建对象字段，并记录是否由本组件创建。
   * 该标记用于卸载阶段精确清理，避免误删外部已存在字段。
   */
  const fieldRef = useRef<ObjectFieldInstance | null>(null)
  const createdByThisRef = useRef(false)
  if (!fieldRef.current || !form.getObjectField(name)) {
    let field = form.getObjectField(name)
    if (!field) {
      field = form.createObjectField({ name, ...fieldProps })
      createdByThisRef.current = true
    }
    fieldRef.current = field
  }
  const field = fieldRef.current

  /**
   * 管理字段生命周期：
   * 挂载时 mount，卸载时 unmount，并在必要时 removeField。
   */
  useEffect(() => {
    const currentField = fieldRef.current
    const fieldName = name
    const created = createdByThisRef.current
    currentField?.mount()
    return () => {
      currentField?.unmount()
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
