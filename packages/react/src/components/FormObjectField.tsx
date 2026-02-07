import type { FieldProps } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
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

  const fieldRef = useRef(
    form.getField(name) ?? form.createField({ name, initialValue: {}, ...fieldProps } as any),
  )
  const field = fieldRef.current

  /* 正确的依赖数组，避免 stale closure */
  useEffect(() => {
    const fieldName = name
    return () => {
      form.removeField(fieldName)
    }
  }, [form, name])

  return (
    <FieldContext.Provider value={field}>
      <ReactiveField field={field}>{children}</ReactiveField>
    </FieldContext.Provider>
  )
})
