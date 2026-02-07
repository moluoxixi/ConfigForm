import type { FieldInstance, FormInstance, VoidFieldInstance } from '@moluoxixi/core'
import { observer } from 'mobx-react-lite'
import React, { useContext } from 'react'
import { ComponentRegistryContext, FormContext } from '../context'

export interface ReactiveFieldProps {
  field: FieldInstance | VoidFieldInstance
  isVoid?: boolean
  children?: React.ReactNode
}

/**
 * 响应式字段渲染桥接（React 版，参考 Formily ReactiveField）
 *
 * 处理 visible / decorator / component / 状态注入。
 */
export const ReactiveField = observer<ReactiveFieldProps>(({ field, isVoid = false, children }) => {
  const form = useContext(FormContext) as FormInstance
  const registry = useContext(ComponentRegistryContext)

  if (!field || !field.visible) return null

  const fp = field.pattern
  const formP = form?.pattern ?? 'editable'
  const isDisabled = !isVoid && ((field as FieldInstance).disabled || fp === 'disabled' || formP === 'disabled')
  const isReadOnly = !isVoid && ((field as FieldInstance).readOnly || fp === 'readOnly' || formP === 'readOnly')

  /* void 字段：component 作容器 */
  if (isVoid) {
    const componentName = field.component
    const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as React.ComponentType<any>
    if (Comp) {
      return <Comp {...field.componentProps}>{children}</Comp>
    }
    return <>{children}</>
  }

  /* 数据字段 */
  const dataField = field as FieldInstance
  const componentName = dataField.component
  const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as React.ComponentType<any>

  if (!Comp) return null

  const fieldElement = (
    <Comp
      value={dataField.value}
      onChange={(val: unknown) => dataField.setValue(val)}
      onFocus={() => dataField.focus()}
      onBlur={() => { dataField.blur(); dataField.validate('blur').catch(() => {}) }}
      disabled={isDisabled}
      readOnly={isReadOnly}
      loading={dataField.loading}
      dataSource={dataField.dataSource}
      {...dataField.componentProps}
    />
  )

  /* decorator */
  const wrapperName = dataField.wrapper
  const Wrapper = typeof wrapperName === 'string' ? registry.wrappers.get(wrapperName) : undefined

  if (Wrapper) {
    return (
      <Wrapper
        label={dataField.label}
        required={dataField.required}
        errors={dataField.errors}
        warnings={dataField.warnings}
        description={dataField.description}
        {...dataField.wrapperProps}
      >
        {fieldElement}
      </Wrapper>
    )
  }

  return fieldElement
})
