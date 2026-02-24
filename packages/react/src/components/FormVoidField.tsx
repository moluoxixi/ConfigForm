import type { VoidFieldInstance, VoidFieldProps } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import { useContext, useEffect, useRef } from 'react'
import { FieldContext, FormContext } from '../context'
import { observer } from '../reactive'
import { ReactiveField } from './ReactiveField'

/**
 * `FormVoidField` 组件属性。
 */
export interface FormVoidFieldProps {
  name: string
  fieldProps?: Partial<VoidFieldProps>
  children?: ReactNode
}

/**
 * 虚拟字段组件（React 版）
 *
 * 创建 VoidField 实例，不参与数据收集。
 * 用于布局容器（Card / Collapse / Tabs 等）。
 */
export const FormVoidField = observer<FormVoidFieldProps>(({ name, fieldProps, children }) => {
  const form = useContext(FormContext)
  if (!form)
    throw new Error('[ConfigForm] <FormVoidField> 必须在 <FormProvider> 内部使用')

  /**
   * 兼容 React 18 StrictMode 双挂载：
   * 第二次挂载时若字段已被前一次卸载清理，会自动重新创建并重新注册。
   */
  const fieldRef = useRef<VoidFieldInstance | null>(null)
  const createdByThisRef = useRef(false)
  if (!fieldRef.current || !form.getAllVoidFields().get(name)) {
    let field = form.getAllVoidFields().get(name)
    if (!field) {
      field = form.createVoidField({ name, ...fieldProps })
      createdByThisRef.current = true
    }
    fieldRef.current = field
  }
  const field = fieldRef.current

  /**
   * 管理字段生命周期：
   * 1. 挂载时调用 `mount`。
   * 2. 卸载时调用 `unmount`。
   * 3. 若字段由当前组件创建，额外从 form 注册表中移除。
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

  /**
   * VoidField 注入到 FieldContext 时标注为 any。
   * VoidFieldInstance 与 FieldInstance 形状不同（没有 value/errors 等），
   * 子组件不应对 void 字段调用 useField()（应使用 useForm() 代替）。
   * 注入的目的是让 ReactiveField 等桥接组件能统一处理。
   */
  return (
    <FieldContext.Provider value={field as any}>
      <ReactiveField field={field as any} isVoid>{children}</ReactiveField>
    </FieldContext.Provider>
  )
})
