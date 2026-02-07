import type { VoidFieldProps } from '@moluoxixi/core'
import { observer } from 'mobx-react-lite'
import React, { useContext, useEffect, useRef } from 'react'
import { FieldContext, FormContext } from '../context'
import { ReactiveField } from './ReactiveField'

export interface FormVoidFieldProps {
  name: string
  fieldProps?: Partial<VoidFieldProps>
  children?: React.ReactNode
}

/**
 * 虚拟字段组件（React 版）
 *
 * 创建 VoidField 实例，不参与数据收集。
 * 用于布局容器（Card / Collapse / Tabs 等）。
 */
export const FormVoidField = observer<FormVoidFieldProps>(({ name, fieldProps, children }) => {
  const form = useContext(FormContext)
  if (!form) throw new Error('[ConfigForm] <FormVoidField> 必须在 <FormProvider> 内部使用')

  const fieldRef = useRef(form.getAllVoidFields().get(name) ?? form.createVoidField({ name, ...fieldProps }))
  const field = fieldRef.current

  if (form.pattern !== 'editable') {
    field.pattern = form.pattern
  }

  useEffect(() => {
    return () => { form.removeField(name) }
  }, [])

  return (
    <FieldContext.Provider value={field as any}>
      <ReactiveField field={field as any} isVoid>{children}</ReactiveField>
    </FieldContext.Provider>
  )
})
