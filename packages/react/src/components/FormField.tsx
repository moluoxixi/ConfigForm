import type { FieldInstance, FieldProps } from '@moluoxixi/core'
import type { ReactNode } from 'react'
import { useContext, useEffect, useRef } from 'react'
import { ComponentRegistryContext, FieldContext, FormContext } from '../context'
import { observer } from '../reactive'
import { ReactiveField } from './ReactiveField'

export interface FormFieldProps {
  /** 字段名 */
  name: string
  /** 字段配置（可覆盖 schema 中的配置） */
  fieldProps?: Partial<FieldProps>
  /** 自定义渲染 */
  children?: ReactNode | ((field: FieldInstance) => ReactNode)
}

/**
 * 表单字段组件
 *
 * 自动从 Form 中获取/创建 Field，并注入 FieldContext。
 * 组件卸载时清理由本组件创建的字段注册，防止内存泄漏。
 *
 * 支持两种渲染模式：
 * 1. 自动渲染（根据注册表查找组件）
 * 2. 自定义渲染（children render prop）
 */
export const FormField = observer<FormFieldProps>(({ name, fieldProps, children }) => {
  const form = useContext(FormContext)
  const registry = useContext(ComponentRegistryContext)

  if (!form) {
    throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用')
  }

  /**
   * 获取或创建字段，并记录是否由本组件创建。
   *
   * 兼容 React 18 StrictMode 双挂载：
   * 首次挂载 → 创建 field → StrictMode 卸载 → removeField → 二次挂载
   * 此时 fieldRef.current 仍存在，但 form 中已无该 field，需重新注册。
   */
  const fieldRef = useRef<FieldInstance | null>(null)
  const createdByThisRef = useRef(false)
  if (!fieldRef.current || !form.getField(name)) {
    let field = form.getField(name)
    if (!field) {
      const mergedProps: FieldProps = { ...(fieldProps ?? {}), name }
      /* pattern 无需手动注入 form.pattern，field.pattern getter 已自动回退 */
      /* 未显式指定 decorator 时，使用组件注册的默认 decorator */
      if (!mergedProps.decorator && typeof mergedProps.component === 'string') {
        const dd = registry.defaultDecorators.get(mergedProps.component)
        if (dd)
          mergedProps.decorator = dd
      }
      field = form.createField(mergedProps)
      createdByThisRef.current = true
    }
    fieldRef.current = field
  }
  const field = fieldRef.current

  /* 组件挂载时通知字段 mount，卸载时 unmount + 清理注册 */
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

  /* 不可见时不渲染 */
  if (!field.visible)
    return null

  /* 自定义渲染 */
  if (typeof children === 'function') {
    return (
      <FieldContext.Provider value={field}>
        {children(field)}
      </FieldContext.Provider>
    )
  }

  /* 有子节点直接渲染 */
  if (children) {
    return (
      <FieldContext.Provider value={field}>
        {children}
      </FieldContext.Provider>
    )
  }

  return (
    <FieldContext.Provider value={field}>
      <ReactiveField field={field} />
    </FieldContext.Provider>
  )
})
