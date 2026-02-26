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

type ComponentProps = Record<string, unknown> | undefined

/**
 * 把 CSS 短横线风格键名转成 React style 所需的驼峰键名。
 * @param key 原始样式键名。
 * @returns 驼峰风格键名。
 */
function toCamelCaseStyleKey(key: string): string {
  return key.replace(/-([a-z])/g, (_, chr: string) => chr.toUpperCase())
}

/**
 * 解析内联 style 字符串为 React 可消费的 style 对象。
 * @param styleText 内联样式字符串。
 * @returns 解析后的样式对象；无法解析时返回 undefined。
 */
function parseStyleString(styleText: string): React.CSSProperties | undefined {
  const entries = styleText
    .split(';')
    .map(item => item.trim())
    .filter(Boolean)

  if (!entries.length)
    return undefined

  const style: Record<string, string> = {}
  for (const entry of entries) {
    const [rawKey, ...rawValueParts] = entry.split(':')
    if (!rawKey || rawValueParts.length === 0)
      continue
    const key = toCamelCaseStyleKey(rawKey.trim())
    const value = rawValueParts.join(':').trim()
    if (!key || !value)
      continue
    style[key] = value
  }

  return Object.keys(style).length ? style : undefined
}

/**
 * 归一化组件属性，重点处理 style 的多种输入形式。
 * @param props 组件属性对象。
 * @returns 归一化后的组件属性对象。
 */
function normalizeComponentProps(props: ComponentProps): ComponentProps {
  if (!props || typeof props !== 'object')
    return props

  const styleValue = (props as { style?: unknown }).style
  if (!styleValue)
    return props

  if (typeof styleValue === 'string') {
    const parsed = parseStyleString(styleValue)
    if (!parsed)
      return { ...props, style: undefined }
    return { ...props, style: parsed }
  }

  if (Array.isArray(styleValue)) {
    const merged: Record<string, string> = {}
    for (const item of styleValue) {
      if (typeof item === 'string') {
        const parsed = parseStyleString(item)
        if (parsed)
          Object.assign(merged, parsed)
        continue
      }
      if (item && typeof item === 'object')
        Object.assign(merged, item as Record<string, string>)
    }
    return { ...props, style: Object.keys(merged).length ? merged : undefined }
  }

  return props
}

/** 字段级错误边界的属性。 */
interface FieldErrorBoundaryProps {
  fieldPath: string
  children: ReactNode
}

/** 字段级错误边界的状态。 */
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
  /**
   * 创建字段错误边界实例。
   * @param props 组件属性。
   */
  constructor(props: FieldErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  /**
   * React 错误边界生命周期：根据异常更新状态。
   * @param error 捕获到的错误对象。
   * @returns 新状态。
   */
  static getDerivedStateFromError(error: Error): FieldErrorBoundaryState {
    return { hasError: true, error }
  }

  /**
   * React 错误边界生命周期：记录错误细节。
   * @param error 捕获到的错误对象。
   * @param errorInfo 组件栈信息。
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(`[ConfigForm] 字段 "${this.props.fieldPath}" 子组件渲染异常:`, error, errorInfo)
  }

  /** 渲染错误兜底 UI 或正常子节点。 */
  render(): ReactNode {
    if (this.state.hasError) {
      return null
    }
    return this.props.children
  }
}

/** ReactiveField 组件属性。 */
export interface ReactiveFieldProps {
  field: FieldInstance | VoidFieldInstance
  isVoid?: boolean
  isArray?: boolean
  children?: ReactNode
}

/** 装饰器注册表桥接类型，仅暴露当前文件真正需要的 decorators 能力。 */
interface DecoratorRegistryBridge {
  decorators: Map<string, ComponentType<any>>
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
        const safeProps = normalizeComponentProps(field.componentProps as ComponentProps)
        return (
          <FieldErrorBoundary fieldPath={field.path}>
            <Comp {...safeProps}>{children}</Comp>
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
        return null
      }
      return <>{children}</>
    }

    /**
     * 结构化数组字段：
     * 组件作为容器，不注入 value/onChange。
     * 由数组组件通过 FieldContext 读取 ArrayField 实例并驱动增删改排序。
     */
    if (isArray) {
      const safeProps = normalizeComponentProps(contract.componentProps as ComponentProps)
      const arrayElement = (
        <FieldErrorBoundary fieldPath={dataField.path}>
          <Comp {...safeProps}>{children}</Comp>
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
        const safeProps = normalizeComponentProps(contract.componentProps as ComponentProps)
        const previewElement = (
          <FieldErrorBoundary fieldPath={dataField.path}>
            <ReadPrettyComp
              value={previewValue}
              dataSource={contract.dataSource}
              {...safeProps}
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
    const safeProps = normalizeComponentProps(contract.componentProps as ComponentProps)
    const fieldElement = (
      <FieldErrorBoundary fieldPath={dataField.path}>
        <Comp
          disabled={contract.disabled || contract.preview}
          loading={contract.loading}
          dataSource={contract.dataSource}
          {...contract.ariaProps}
          {...safeProps}
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
    return null
  }
})

/**
 * 渲染对象容器字段。
 *
 * 当字段是 `type: 'object'` 且声明了 `component` 时，
 * 该组件应作为容器包裹其子字段，而不是作为输入控件接收 `value/onChange`。
 *
 * @param dataField 当前对象字段实例，提供路径、装饰器和组件属性等运行时信息。
 * @param Comp 已解析的 React 组件，用作对象字段容器。
 * @param children 对象字段内部的子字段节点。
 * @param form 当前表单实例，用于生成装饰器渲染契约。
 * @param registry 装饰器注册表桥接对象，用于根据名称查找装饰器组件。
 * @returns 返回最终可渲染的 React 元素（已按需包裹装饰器）。
 */
function renderContainerField(
  dataField: FieldInstance,
  Comp: ComponentType<any>,
  children: ReactNode,
  form: FormInstance,
  registry: DecoratorRegistryBridge,
): React.ReactElement {
  const safeProps = normalizeComponentProps(dataField.componentProps as ComponentProps)
  const fieldElement = (
    <FieldErrorBoundary fieldPath={dataField.path}>
      <Comp {...safeProps}>{children}</Comp>
    </FieldErrorBoundary>
  )
  return wrapDecorator(dataField, fieldElement, form, registry)
}

/**
 * 用字段装饰器包裹字段主体节点。
 *
 * 规则：
 * 1. 若字段声明了装饰器且注册表中可解析，使用装饰器组件包裹字段节点。
 * 2. 若无装饰器或无法解析，直接返回原字段节点。
 *
 * @param dataField 当前字段实例，用于读取 decorator、label、errors 等状态。
 * @param fieldElement 字段主体元素（输入控件或容器组件）。
 * @param form 当前表单实例，用于创建装饰器渲染契约。
 * @param registry 装饰器注册表桥接对象，用于根据名称查找装饰器组件。
 * @returns 返回装饰后的字段元素；若无需装饰则返回原字段元素。
 */
function wrapDecorator(
  dataField: FieldInstance,
  fieldElement: React.ReactElement,
  form: FormInstance,
  registry: DecoratorRegistryBridge,
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
