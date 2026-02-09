import type { FieldInstance, FormInstance, VoidFieldInstance } from '@moluoxixi/core'
import type { ComponentType, ErrorInfo, ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { Component, useContext } from 'react'
import { ComponentRegistryContext, FormContext } from '../context'

/** 错误边界样式 */
const errorBoundaryStyle: React.CSSProperties = {
  color: '#ff4d4f',
  padding: '8px 12px',
  border: '1px dashed #ff4d4f',
  borderRadius: '4px',
  fontSize: '12px',
  background: '#fff2f0',
}

interface FieldErrorBoundaryProps {
  fieldPath: string
  children: ReactNode
}

interface FieldErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * 字段级错误边界
 *
 * 防止单个字段的组件渲染异常导致整个表单白屏。
 * 捕获子组件树中的渲染错误，展示友好的错误提示。
 */
class FieldErrorBoundary extends Component<FieldErrorBoundaryProps, FieldErrorBoundaryState> {
  constructor(props: FieldErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): FieldErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ConfigForm] 字段 "${this.props.fieldPath}" 子组件渲染异常:`, error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div style={errorBoundaryStyle}>
          ⚠ 字段 &quot;{this.props.fieldPath}&quot; 渲染异常: {this.state.error?.message}
        </div>
      )
    }
    return this.props.children
  }
}

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

  try {
  const fp = field.pattern
  const formP = form?.pattern ?? 'editable'
  const isDisabled = !isVoid && ((field as FieldInstance).disabled || fp === 'disabled' || formP === 'disabled')
  const isReadOnly = !isVoid && ((field as FieldInstance).readOnly || fp === 'readOnly' || formP === 'readOnly')

  /* void 字段：component 作容器 */
  if (isVoid) {
    const componentName = field.component
    const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as ComponentType<any>
    if (Comp) {
      return (
        <FieldErrorBoundary fieldPath={field.path}>
          <Comp {...field.componentProps}>{children}</Comp>
        </FieldErrorBoundary>
      )
    }
    return <>{children}</>
  }

  /* 数据字段 */
  const dataField = field as FieldInstance
  const componentName = dataField.component
  const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as ComponentType<any>

  /**
   * 组件未注册：渲染明确的错误提示，避免字段静默消失导致用户数据缺失。
   * 对于 object 容器字段（无 component），仍然渲染 children。
   */
  if (!Comp) {
    if (componentName) {
      console.warn(`[ConfigForm] 字段 "${field.path}" 未找到组件 "${String(componentName)}"`)
      return <div style={errorBoundaryStyle}>⚠ 组件 &quot;{String(componentName)}&quot; 未注册</div>
    }
    return <>{children}</>
  }

  /**
   * 对象容器字段（type: 'object' + component + children）：
   * 组件作为容器包裹子节点（与 void 字段类似），不传 value/onChange。
   * 典型场景：type: 'object' + component: 'LayoutCard' → LayoutCard 包裹嵌套字段。
   */
  if (children && Comp) {
    const fieldElement = (
      <FieldErrorBoundary fieldPath={dataField.path}>
        <Comp {...dataField.componentProps}>{children}</Comp>
      </FieldErrorBoundary>
    )

    const decoratorName = dataField.decorator
    const Decorator = typeof decoratorName === 'string'
      ? registry.decorators.get(decoratorName)
      : (decoratorName as ComponentType<any>)
    const effectivePattern = form?.pattern ?? 'editable'

    if (Decorator) {
      return (
        <Decorator
          label={dataField.label}
          required={dataField.required}
          errors={dataField.errors}
          warnings={dataField.warnings}
          description={dataField.description}
          labelPosition={form?.labelPosition}
          labelWidth={form?.labelWidth}
          pattern={effectivePattern}
          {...dataField.decoratorProps}
        >
          {fieldElement}
        </Decorator>
      )
    }
    return fieldElement
  }

  /**
   * 参考 Formily ReactiveField：
   * 1. componentProps 在前，value/onChange 在后，确保不被覆盖
   * 2. 使用 field.onInput 代替 setValue（Formily 行为）
   */
  const fieldElement = (
    <FieldErrorBoundary fieldPath={dataField.path}>
      <Comp
        disabled={isDisabled}
        readOnly={isReadOnly}
        loading={dataField.loading}
        dataSource={dataField.dataSource}
        {...dataField.componentProps}
        value={dataField.value}
        onChange={(val: unknown) => dataField.onInput(val)}
        onFocus={() => dataField.focus()}
        onBlur={() => {
          dataField.blur()
          dataField.validate('blur').catch(() => {})
        }}
      />
    </FieldErrorBoundary>
  )

  /* decorator — 支持字符串名和直接组件引用 */
  const decoratorName = dataField.decorator
  const Decorator = typeof decoratorName === 'string'
    ? registry.decorators.get(decoratorName)
    : (decoratorName as ComponentType<any>)

  /** 参考 Formily：将表单 pattern 传递给 Wrapper，用于 readOnly/disabled 时隐藏必填标记 */
  const effectivePattern = form?.pattern ?? 'editable'

  if (Decorator) {
    return (
      <Decorator
        label={dataField.label}
        required={dataField.required}
        errors={dataField.errors}
        warnings={dataField.warnings}
        description={dataField.description}
        labelPosition={form?.labelPosition}
        labelWidth={form?.labelWidth}
        pattern={effectivePattern}
        {...dataField.decoratorProps}
      >
        {fieldElement}
      </Decorator>
    )
  }

  return fieldElement
  }
  catch (err) {
    console.error(`[ConfigForm] 字段 "${field.path}" 渲染异常:`, err)
    return <div style={errorBoundaryStyle}>⚠ 字段 &quot;{field.path}&quot; 渲染异常: {err instanceof Error ? err.message : String(err)}</div>
  }
})
