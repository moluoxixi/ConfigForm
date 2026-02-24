import type { ArrayFieldInstance, ArrayFieldProps } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import { useContext, useEffect, useRef } from 'react'
import { FieldContext, FormContext } from '../context'
import { observer } from '../reactive'
import { ReactiveField } from './ReactiveField'

/**
 * `FormArrayField` 组件属性。
 */
export interface FormArrayFieldComponentProps {
  name: string
  fieldProps?: Partial<ArrayFieldProps>
  children?: ((field: ArrayFieldInstance) => ReactNode) | ReactNode
}

/**
 * 数组字段组件
 *
 * 提供 ArrayField 实例给子组件，支持增删改排序等操作。
 * 组件卸载时清理由本组件创建的字段注册，防止内存泄漏。
 *
 * @example
 * ```tsx
 * <FormArrayField name="contacts">
 *   {(field) => (
 *     <div>
 *       {field.value?.map((_, index) => (
 *         <div key={index}>
 *           <FormField name={`contacts.${index}.name`} />
 *           <button onClick={() => field.remove(index)}>删除</button>
 *         </div>
 *       ))}
 *       <button onClick={() => field.push({})}>添加</button>
 *     </div>
 *   )}
 * </FormArrayField>
 * ```
 */
export const FormArrayField = observer<FormArrayFieldComponentProps>(
  ({ name, fieldProps, children }) => {
    const form = useContext(FormContext)

    if (!form) {
      throw new Error('[ConfigForm] <FormArrayField> 必须在 <FormProvider> 内部使用')
    }

    /**
     * 兼容 React 18 StrictMode 双挂载。
     * 若字段在第一次卸载时被移除，第二次挂载会自动重新创建。
     */
    const fieldRef = useRef<ArrayFieldInstance | null>(null)
    const createdByThisRef = useRef(false)
    if (!fieldRef.current || !form.getArrayField(name)) {
      let field = form.getArrayField(name)
      if (!field) {
        field = form.createArrayField({ name, ...fieldProps })
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

    if (!field.visible)
      return null

    return (
      <FieldContext.Provider value={field}>
        {typeof children === 'function'
          ? children(field)
          : <ReactiveField field={field} isArray>{children}</ReactiveField>}
      </FieldContext.Provider>
    )
  },
)
