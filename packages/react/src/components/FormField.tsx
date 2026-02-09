import type { FieldInstance, FieldProps } from '@moluoxixi/core'
import type { ComponentType, ReactNode } from 'react'
import { observer } from '@moluoxixi/reactive-react'
import { useContext, useEffect, useRef } from 'react'
import { ComponentRegistryContext, FieldContext, FormContext } from '../context'
import { getDefaultDecorator, getReadPrettyComponent } from '../registry'

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
      const mergedProps: Record<string, unknown> = { ...fieldProps, name }
      /* pattern 无需手动注入 form.pattern，field.pattern getter 已自动回退 */
      /* 未显式指定 decorator 时，使用组件注册的默认 decorator */
      if (!mergedProps.decorator && typeof mergedProps.component === 'string') {
        const dd = getDefaultDecorator(mergedProps.component)
        if (dd)
          mergedProps.decorator = dd
      }
      field = form.createField(mergedProps as FieldProps)
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

  /* 自动组件渲染 */
  const Component = component ?? (
    typeof field.component === 'string'
      ? registry.components.get(field.component)
      : field.component as ComponentType<any>
  )

  const Decorator = typeof field.decorator === 'string'
    ? registry.decorators.get(field.decorator)
    : (field.decorator as ComponentType<any>)

  if (!Component) {
    console.warn(`[ConfigForm] 字段 "${name}" 未找到组件 "${String(field.component)}"`)
    return null
  }

  /* pattern 判断已收敛到 field 模型，直接读计算属性 */
  const isDisabled = field.effectiveDisabled
  const isPreview = field.isPreview

  /* readPretty：阅读态时查找替代组件 */
  let fieldElement: React.ReactElement
  const compName = typeof field.component === 'string' ? field.component : ''
  const ReadPrettyComp = isPreview && compName ? getReadPrettyComponent(compName) : undefined

  if (ReadPrettyComp) {
    fieldElement = (
      <ReadPrettyComp
        value={field.value}
        dataSource={field.dataSource}
        {...field.componentProps}
      />
    )
  }
  else {
    fieldElement = (
      <Component
        value={field.value}
        onChange={(val: unknown) => field.onInput(val)}
        onFocus={() => field.focus()}
        onBlur={() => field.blur()}
        disabled={isDisabled || isPreview}
        loading={field.loading}
        dataSource={field.dataSource}
        {...field.componentProps}
      />
    )
  }

  const wrappedElement = Decorator
    ? (
        <Decorator
          label={field.label}
          required={field.required}
          errors={field.errors}
          warnings={field.warnings}
          description={field.description}
          labelPosition={form.labelPosition}
          labelWidth={form.labelWidth}
          pattern={field.pattern}
          {...field.decoratorProps}
        >
          {fieldElement}
        </Decorator>
      )
    : fieldElement

  return (
    <FieldContext.Provider value={field}>
      {wrappedElement}
    </FieldContext.Provider>
  )
})
