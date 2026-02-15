import type { FieldInstance, FormInstance, VoidFieldInstance } from '@moluoxixi/core'
import type { ComponentType, ErrorInfo, ReactNode } from 'react'
import {
  createDecoratorRenderContract,
  createFieldInteractionContract,
  createFieldRenderContract,
} from '@moluoxixi/core'
import { Component, useContext } from 'react'
import { ComponentRegistryContext, FormContext } from '../context'
import { observer } from '../reactive'

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
          ⚠ 字段 &quot;
          {this.props.fieldPath}
          &quot; 渲染异常:
          {' '}
          {this.state.error?.message}
        </div>
      )
    }
    return this.props.children
  }
}

export interface ReactiveFieldProps {
  field: FieldInstance | VoidFieldInstance
  isVoid?: boolean
  isArray?: boolean
  children?: ReactNode
}

/**
 * 响应式字段渲染桥接（React 版，参考 Formily ReactiveField）
 *
 * 两条渲染路径：
 * 1. void 字段：component 作容器，children 传入
 * 2. 数据字段：component 作表单控件，注入 value/onChange
 *
 * 特殊处理：
 * - object 容器字段（有 component + children）：component 作容器包裹子节点
 */
export const ReactiveField = observer<ReactiveFieldProps>(({ field, isVoid = false, isArray = false, children }) => {
  const form = useContext(FormContext) as FormInstance
  const registry = useContext(ComponentRegistryContext)

  if (!field || !field.visible)
    return null

  try {
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
      /* 无 component 的 void 节点：直接透传 children */
      return <>{children}</>
    }

    /* 数据字段 */
    const dataField = field as FieldInstance
    const contract = createFieldRenderContract(dataField)
    const componentName = dataField.component
    const Comp = typeof componentName === 'string' ? registry.components.get(componentName) : componentName as ComponentType<any>

    /**
     * 组件未注册时的处理：
     * - 有 componentName 但未注册：显示错误提示
     * - 无 componentName 且有 children：object 容器，透传 children
     */
    if (!Comp) {
      if (componentName) {
        console.warn(`[ConfigForm] 字段 "${field.path}" 未找到组件 "${String(componentName)}"`)
        return (
          <div style={errorBoundaryStyle}>
            ⚠ 组件 &quot;
            {String(componentName)}
            &quot; 未注册
          </div>
        )
      }
      return <>{children}</>
    }

    /**
     * 结构化数组字段：
     * 组件作为容器，不注入 value/onChange。
     * 由数组组件通过 FieldContext 读取 ArrayField 实例并驱动增删改排序。
     */
    if (isArray) {
      const arrayElement = (
        <FieldErrorBoundary fieldPath={dataField.path}>
          <Comp {...contract.componentProps}>{children}</Comp>
        </FieldErrorBoundary>
      )
      return wrapDecorator(dataField, arrayElement, form, registry)
    }

    /**
     * object 容器字段（type: 'object' + component + children）：
     * 组件作为容器包裹子节点，不传 value/onChange。
     * 典型场景：type: 'object' + component: 'LayoutCard' → LayoutCard 包裹嵌套字段。
     */
    if (children) {
      return renderContainerField(dataField, Comp, children, form, registry)
    }

    /**
     * preview 模式：查找 readPretty 替代组件，用纯文本替换输入框
     */
    if (contract.preview) {
      const compName = typeof componentName === 'string' ? componentName : ''
      const ReadPrettyComp = compName ? registry.readPrettyComponents.get(compName) : undefined
      if (ReadPrettyComp) {
        const displayValue = dataField.displayFormat
          ? dataField.displayFormat(contract.value)
          : contract.value
        const formatter = (dataField.componentProps as Record<string, unknown> | undefined)?.formatter
        let previewValue: unknown = displayValue
        if (typeof previewValue === 'number' && Number.isFinite(previewValue)) {
          previewValue = previewValue.toFixed(2)
        }
        if (typeof formatter === 'function') {
          previewValue = (formatter as (value: unknown) => unknown)(previewValue)
        }
        const previewElement = (
          <FieldErrorBoundary fieldPath={dataField.path}>
            <ReadPrettyComp
              value={previewValue}
              dataSource={contract.dataSource}
              {...contract.componentProps}
            />
          </FieldErrorBoundary>
        )
        return wrapDecorator(dataField, previewElement, form, registry)
      }
    }

    /**
     * 叶子数据字段：组件作为表单控件
     * 参考 Formily ReactiveField：
     * 1. componentProps 在前，value/onChange 在后，确保不被覆盖
     * 2. 使用 field.onInput 代替 setValue（Formily 行为）
     */
    const interactions = createFieldInteractionContract(dataField)

    const displayValue = dataField.displayFormat && dataField.inputParse
      ? dataField.displayFormat(contract.value)
      : contract.value
    const fieldElement = (
      <FieldErrorBoundary fieldPath={dataField.path}>
        <Comp
          disabled={contract.disabled || contract.preview}
          loading={contract.loading}
          dataSource={contract.dataSource}
          {...contract.ariaProps}
          {...contract.componentProps}
          value={displayValue}
          onChange={interactions.onInput}
          onFocus={interactions.onFocus}
          onBlur={interactions.onBlur}
        />
      </FieldErrorBoundary>
    )

    return wrapDecorator(dataField, fieldElement, form, registry)
  }
  catch (err) {
    console.error(`[ConfigForm] 字段 "${field.path}" 渲染异常:`, err)
    return (
      <div style={errorBoundaryStyle}>
        ⚠ 字段 &quot;
        {field.path}
        &quot; 渲染异常:
        {err instanceof Error ? err.message : String(err)}
      </div>
    )
  }
})

/** object 容器字段渲染（component 作容器包裹 children） */
function renderContainerField(
  dataField: FieldInstance,
  Comp: ComponentType<any>,
  children: ReactNode,
  form: FormInstance,
  registry: { decorators: Map<string, ComponentType<any>> },
): React.ReactElement {
  const fieldElement = (
    <FieldErrorBoundary fieldPath={dataField.path}>
      <Comp {...dataField.componentProps}>{children}</Comp>
    </FieldErrorBoundary>
  )
  return wrapDecorator(dataField, fieldElement, form, registry)
}

/** 用 decorator 包裹字段 */
function wrapDecorator(
  dataField: FieldInstance,
  fieldElement: React.ReactElement,
  form: FormInstance,
  registry: { decorators: Map<string, ComponentType<any>> },
): React.ReactElement {
  const decoratorName = dataField.decorator
  const Decorator = typeof decoratorName === 'string'
    ? registry.decorators.get(decoratorName)
    : (decoratorName as ComponentType<any>)

  if (Decorator) {
    const decoratorContract = createDecoratorRenderContract(dataField, form)
    return (
      <Decorator
        fieldPath={decoratorContract.fieldPath}
        hasErrors={decoratorContract.hasErrors}
        label={decoratorContract.label}
        required={decoratorContract.required}
        errors={decoratorContract.errors}
        warnings={decoratorContract.warnings}
        description={decoratorContract.description}
        labelPosition={decoratorContract.labelPosition}
        labelWidth={decoratorContract.labelWidth}
        pattern={decoratorContract.pattern}
        {...decoratorContract.decoratorProps}
      >
        {fieldElement}
      </Decorator>
    )
  }

  return fieldElement
}
