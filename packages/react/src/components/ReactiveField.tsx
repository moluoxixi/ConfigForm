import type { FieldInstance, FormInstance, VoidFieldInstance } from '@moluoxixi/core'
import type { ComponentType, ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { useContext } from 'react'
import { ComponentRegistryContext, FormContext } from '../context'

export interface ReactiveFieldProps {
  field: FieldInstance | VoidFieldInstance
  isVoid?: boolean
  children?: ReactNode
}

/**
 * 响应式字段渲染桥接（React 版，参考 Formily ReactiveField）
 *
 * 处理 visible / decorator / component / 状态注入。
 */
export const ReactiveField = observer<ReactiveFieldProps>(({ field, isVoid = false, children }) => {
  const form = useContext(FormContext) as FormInstance
  const registry = useContext(ComponentRegistryContext)

  if (!field || !field.visible)
    return null

  const fp = field.pattern
  const formP = form?.pattern ?? 'editable'
  const isDisabled = !isVoid && ((field as FieldInstance).disabled || fp === 'disabled' || formP === 'disabled')
  const isReadOnly = !isVoid && ((field as FieldInstance).readOnly || fp === 'readOnly' || formP === 'readOnly')

  /* void 字段：component 作容器 */
  if (isVoid) {
    const componentName = field.component
    const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as ComponentType<any>
    if (Comp) {
      return <Comp {...field.componentProps}>{children}</Comp>
    }
    return <>{children}</>
  }

  /* 数据字段 */
  const dataField = field as FieldInstance
  const componentName = dataField.component
  const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as ComponentType<any>

  if (!Comp)
    return null

  /**
   * 参考 Formily ReactiveField：
   * 1. componentProps 在前，value/onChange 在后，确保不被覆盖
   * 2. 使用 field.onInput 代替 setValue（Formily 行为）
   */
  const fieldElement = (
    <Comp
      disabled={isDisabled}
      readOnly={isReadOnly}
      loading={dataField.loading}
      dataSource={dataField.dataSource}
      {...dataField.componentProps}
      value={dataField.value}
      onChange={(val: unknown) => dataField.setValue(val)}
      onFocus={() => dataField.focus()}
      onBlur={() => {
        dataField.blur()
        dataField.validate('blur').catch(() => {})
      }}
    />
  )

  /* decorator — 支持字符串名和直接组件引用 */
  const wrapperName = dataField.wrapper
  const Wrapper = typeof wrapperName === 'string'
    ? registry.wrappers.get(wrapperName)
    : (wrapperName as ComponentType<any>)

  /** 参考 Formily：将表单 pattern 传递给 Wrapper，用于 readOnly/disabled 时隐藏必填标记 */
  const effectivePattern = form?.pattern ?? 'editable'

  if (Wrapper) {
    return (
      <Wrapper
        label={dataField.label}
        required={dataField.required}
        errors={dataField.errors}
        warnings={dataField.warnings}
        description={dataField.description}
        labelPosition={form?.labelPosition}
        labelWidth={form?.labelWidth}
        pattern={effectivePattern}
        {...dataField.wrapperProps}
      >
        {fieldElement}
      </Wrapper>
    )
  }

  return fieldElement
})
