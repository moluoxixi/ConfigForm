import type { FieldProps } from '@moluoxixi/core'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useRef } from 'react'
import { FieldContext, FormContext } from '../context'
import { ReactiveField } from './ReactiveField'

export interface FormObjectFieldProps {
  name: string
  fieldProps?: Partial<FieldProps>
  children?: React.ReactNode
}

/**
 * 对象字段组件（React 版）
 *
 * 创建 Field 实例，支持嵌套子字段。
 */
export const FormObjectField = observer<FormObjectFieldProps>(({ name, fieldProps, children }) => {
  const form = useContext(FormContext)
  if (!form) throw new Error('[ConfigForm] <FormObjectField> 必须在 <FormProvider> 内部使用')

  const fieldRef = useRef(
    form.getField(name) ?? form.createField({ name, initialValue: {}, ...fieldProps } as any),
  )
  const field = fieldRef.current

  useEffect(() => {
    return () => { form.removeField(name) }
  }, [])

  return (
    <FieldContext.Provider value={field}>
      <ReactiveField field={field}>{children}</ReactiveField>
    </FieldContext.Provider>
  )
})
