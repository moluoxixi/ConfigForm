import type { FieldInstance, FieldProps } from '@moluoxixi/core'
import type { ComponentType, ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { useContext, useEffect, useRef } from 'react'
import { ComponentRegistryContext, FieldContext, FormContext } from '../context'
import { getDefaultWrapper } from '../registry'

export interface FormFieldProps {
  /** 字段名 */
  name: string
  /** 字段配置（可覆盖 schema 中的配置） */
  fieldProps?: Partial<FieldProps>
  /** 自定义渲染 */
  children?: ReactNode | ((field: FieldInstance) => ReactNode)
  /** 覆盖组件 */
  component?: ComponentType<any>
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
export const FormField = observer<FormFieldProps>(({ name, fieldProps, children, component }) => {
  const form = useContext(FormContext)
  const registry = useContext(ComponentRegistryContext)

  if (!form) {
    throw new Error('[ConfigForm] <FormField> 必须在 <FormProvider> 内部使用')
  }

  /* 获取或创建字段，并记录是否由本组件创建 */
  const fieldRef = useRef<FieldInstance | null>(null)
  const createdByThisRef = useRef(false)
  if (!fieldRef.current) {
    let field = form.getField(name)
    if (!field) {
      const mergedProps: Record<string, unknown> = { ...fieldProps, name }
      if (!mergedProps.pattern && form.pattern !== 'editable') {
        mergedProps.pattern = form.pattern
      }
      /* 未显式指定 wrapper 时，使用组件注册的默认 wrapper */
      if (!mergedProps.wrapper && typeof mergedProps.component === 'string') {
        const dw = getDefaultWrapper(mergedProps.component)
        if (dw) mergedProps.wrapper = dw
      }
      field = form.createField(mergedProps as FieldProps)
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

  /* 自动组件渲染 */
  const Component = component ?? (
    typeof field.component === 'string'
      ? registry.components.get(field.component)
      : field.component as ComponentType<any>
  )

  const Wrapper = typeof field.wrapper === 'string'
    ? registry.wrappers.get(field.wrapper)
    : (field.wrapper as ComponentType<any>)

  if (!Component) {
    console.warn(`[ConfigForm] 字段 "${name}" 未找到组件 "${String(field.component)}"`)
    return null
  }

  /**
   * 根据 pattern 计算有效的交互状态
   * 优先级：字段级 > 字段 pattern > 表单 pattern
   */
  const fp = field.pattern
  const formP = form.pattern
  const isDisabled = field.disabled || fp === 'disabled' || formP === 'disabled'
  const isReadOnly = field.readOnly || fp === 'readOnly' || formP === 'readOnly'

  const fieldElement = (
    <Component
      value={field.value}
      onChange={(val: unknown) => field.setValue(val)}
      onFocus={() => field.focus()}
      onBlur={() => {
        field.blur()
        field.validate('blur').catch(() => {})
      }}
      disabled={isDisabled}
      readOnly={isReadOnly}
      loading={field.loading}
      dataSource={field.dataSource}
      {...field.componentProps}
    />
  )

  const wrappedElement = Wrapper
    ? (
        <Wrapper
          label={field.label}
          required={field.required}
          errors={field.errors}
          warnings={field.warnings}
          description={field.description}
          labelPosition={form.labelPosition}
          labelWidth={form.labelWidth}
          {...field.wrapperProps}
        >
          {fieldElement}
        </Wrapper>
      )
    : fieldElement

  return (
    <FieldContext.Provider value={field}>
      {wrappedElement}
    </FieldContext.Provider>
  )
})
