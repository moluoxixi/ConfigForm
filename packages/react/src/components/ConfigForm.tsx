import type { FieldPattern, FormConfig, FormInstance, FormPlugin, FormSchema, ValidationFeedback } from '@moluoxixi/core'
import type { ComponentType, CSSProperties, FormEvent, ReactElement, ReactNode } from 'react'

import type { ComponentScope, RegistryState } from '../registry'
import { FormLifeCycle } from '@moluoxixi/core'
import { useCallback, useContext, useEffect } from 'react'
import { ComponentRegistryContext } from '../context'
import { useCreateForm } from '../hooks/useForm'
import { observer } from '../reactive'
import { FormProvider } from './FormProvider'
import { SchemaField } from './SchemaField'

export interface ConfigFormProps<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 外部传入的 form 实例（可选） */
  form?: FormInstance<Values>
  /** 表单 Schema */
  schema?: FormSchema
  /** 表单配置（当不传 form 实例时使用） */
  formConfig?: FormConfig<Values>
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 表单 effects */
  effects?: (form: FormInstance<Values>) => void
  /** 表单插件 */
  plugins?: FormPlugin[]
  /** 提交回调 */
  onSubmit?: (values: Values) => void | Promise<void>
  /** 提交失败回调 */
  onSubmitFailed?: (errors: ValidationFeedback[]) => void
  /** 重置回调 */
  onReset?: () => void
  /** 值变化回调 */
  onValuesChange?: (values: Values) => void
  /** 局部组件注册 */
  components?: Record<string, ComponentType<any>>
  /** 局部装饰器注册 */
  decorators?: Record<string, ComponentType<any>>
  /** 局部默认装饰器映射（component -> decorator） */
  defaultDecorators?: Record<string, string>
  /** 局部阅读态组件映射（component -> readPrettyComponent） */
  readPrettyComponents?: Record<string, ComponentType<any>>
  /** 组件作用域（与 components/decorators/defaultDecorators/readPrettyComponents 二选一或组合） */
  scope?: ComponentScope
  /** 基础注册表（实例级隔离，默认全局） */
  registry?: RegistryState
  /** 表单模式（优先级高于 schema.decoratorProps.pattern） */
  pattern?: FieldPattern
  /** 自定义子节点 */
  children?: ReactNode
  /** HTML class */
  className?: string
  /** HTML style */
  style?: CSSProperties
}

/**
 * 开箱即用的配置化表单组件
 *
 * 从 schema 根节点的 decoratorProps 读取表单级配置（labelWidth、actions 等），
 * 与 Vue 版 ConfigForm 行为对齐。
 *
 * 两种使用模式：
 * 1. Schema 模式：传入 schema 自动渲染（含操作按钮）
 * 2. 组合模式：通过 children 自定义布局
 */
export const ConfigForm = observer(<Values extends Record<string, unknown> = Record<string, unknown>>(
  props: ConfigFormProps<Values>,
) => {
  const {
    form: externalForm,
    schema,
    formConfig,
    initialValues,
    effects,
    plugins,
    onSubmit,
    onSubmitFailed,
    onReset,
    onValuesChange,
    components,
    decorators,
    defaultDecorators,
    readPrettyComponents,
    scope,
    registry,
    pattern: patternProp,
    children,
    className,
    style,
  } = props

  /** 从根 schema 的 decoratorProps 提取表单级配置 */
  const rootDecoratorProps = (schema?.decoratorProps ?? {}) as Record<string, unknown>

  /** pattern 优先级：props.pattern > schema.decoratorProps.pattern > 'editable' */
  const effectivePattern = (patternProp ?? schema?.pattern ?? rootDecoratorProps.pattern ?? 'editable') as FieldPattern

  const resolvedEffects = effects ?? formConfig?.effects
  const resolvedPlugins = plugins ?? formConfig?.plugins

  /* 内部创建或使用外部 form */
  const internalForm = useCreateForm<Values>({
    labelPosition: (rootDecoratorProps.labelPosition ?? 'right') as 'top' | 'left' | 'right',
    labelWidth: rootDecoratorProps.labelWidth as string | number,
    pattern: effectivePattern,
    ...formConfig,
    initialValues: initialValues ?? formConfig?.initialValues,
    effects: resolvedEffects,
    plugins: resolvedPlugins,
  })
  const form = externalForm ?? internalForm

  /** schema/props 变化时同步更新表单级配置（通过 form.batch 走适配器批处理） */
  useEffect(() => {
    form.batch(() => {
      if (rootDecoratorProps.labelPosition !== undefined) {
        form.labelPosition = rootDecoratorProps.labelPosition as 'top' | 'left' | 'right'
      }
      if (rootDecoratorProps.labelWidth !== undefined) {
        form.labelWidth = rootDecoratorProps.labelWidth as string | number
      }
      form.pattern = effectivePattern
    })
  }, [form, effectivePattern, rootDecoratorProps.labelPosition, rootDecoratorProps.labelWidth])

  /* 注册值变化监听 */
  useEffect(() => {
    if (onValuesChange) {
      return form.onValuesChange(onValuesChange)
    }
  }, [form, onValuesChange])

  /* 提交处理 */
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    await form.submit()
  }, [form])

  /* 重置处理 */
  const handleReset = useCallback(() => {
    form.reset()
  }, [form])

  /* 提交/重置生命周期事件 */
  useEffect(() => {
    const disposeSubmitSuccess = form.on(FormLifeCycle.ON_FORM_SUBMIT_SUCCESS, (event) => {
      const payload = event.payload as { values?: Values } | undefined
      if (payload?.values) {
        void onSubmit?.(payload.values)
      }
    })

    const disposeSubmitFailed = form.on(FormLifeCycle.ON_FORM_SUBMIT_FAILED, (event) => {
      const payload = event.payload as { errors?: ValidationFeedback[] } | undefined
      const errors = payload?.errors ?? []
      onSubmitFailed?.(errors)
      scrollToFirstError(errors)
    })

    const disposeReset = form.on(FormLifeCycle.ON_FORM_RESET, () => {
      onReset?.()
    })

    return () => {
      disposeSubmitSuccess()
      disposeSubmitFailed()
      disposeReset()
    }
  }, [form, onSubmit, onSubmitFailed, onReset])

  /* 操作按钮配置（从 schema.decoratorProps.actions 读取） */
  const actions = rootDecoratorProps.actions as Record<string, unknown>
  const isEditable = effectivePattern === 'editable'
  const showActions = !!actions && isEditable
  const submitLabel = typeof actions?.submit === 'string' ? actions.submit : '提交'
  const resetLabel = typeof actions?.reset === 'string' ? actions.reset : '重置'
  const showSubmit = actions?.submit !== false
  const showReset = actions?.reset !== false
  const align = (actions?.align === 'left' || actions?.align === 'right' || actions?.align === 'center')
    ? actions.align
    : 'center'

  /* 布局配置 */
  const layout = schema?.layout as {
    type?: string
    columns?: number
    gutter?: number
  } | undefined
  const direction = rootDecoratorProps.direction as string | undefined

  let fieldContainerStyle: CSSProperties | undefined
  if (layout?.type === 'grid') {
    const gap = layout.gutter ?? 16
    const cols = layout.columns ?? 1
    fieldContainerStyle = {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: `${gap}px`,
      alignItems: 'start',
    }
  }
  else if (layout?.type === 'inline' || direction === 'inline') {
    const gap = (layout as { gap?: number } | undefined)?.gap ?? 16
    fieldContainerStyle = {
      display: 'flex',
      flexWrap: 'wrap',
      gap: `${gap}px`,
      alignItems: 'flex-start',
    }
  }

  return (
    <FormProvider
      form={form}
      components={components}
      decorators={decorators}
      defaultDecorators={defaultDecorators}
      readPrettyComponents={readPrettyComponents}
      scope={scope}
      registry={registry}
    >
      <form onSubmit={handleSubmit} className={className} style={style} noValidate>
        {schema && (
          <div style={fieldContainerStyle}>
            <SchemaField schema={schema} />
          </div>
        )}

        {/* 操作按钮 */}
        {showActions && (
          <FormActionsRenderer
            showSubmit={showSubmit}
            showReset={showReset}
            submitLabel={submitLabel}
            resetLabel={resetLabel}
            align={align}
            onReset={handleReset}
          />
        )}

        {children}
      </form>
    </FormProvider>
  )
}) as <Values extends Record<string, unknown> = Record<string, unknown>>(
  props: ConfigFormProps<Values>,
) => ReactElement | null

/** 操作按钮渲染器（优先从 registry 获取 LayoutFormActions） */
interface FormActionsRendererProps {
  showSubmit: boolean
  showReset: boolean
  submitLabel: string
  resetLabel: string
  align: 'left' | 'center' | 'right'
  onReset: () => void
}

function FormActionsRenderer({ showSubmit, showReset, submitLabel, resetLabel, align, onReset }: FormActionsRendererProps): ReactElement {
  const registry = useContext(ComponentRegistryContext)
  const LayoutActions = registry.components.get('LayoutFormActions')

  if (LayoutActions) {
    return (
      <LayoutActions
        showSubmit={showSubmit}
        showReset={showReset}
        submitLabel={submitLabel}
        resetLabel={resetLabel}
        align={align}
      />
    )
  }

  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'

  return (
    <div style={{ marginTop: 16, display: 'flex', justifyContent }}>
      {showSubmit && (
        <button type="submit" style={{ marginRight: 8, padding: '4px 16px', cursor: 'pointer' }}>
          {submitLabel}
        </button>
      )}
      {showReset && (
        <button type="button" style={{ padding: '4px 16px', cursor: 'pointer' }} onClick={onReset}>
          {resetLabel}
        </button>
      )}
    </div>
  )
}

/**
 * 滚动到第一个错误字段
 *
 * 验证失败时自动滚动到第一个有错误的字段，让用户看到错误提示。
 * 使用 setTimeout 等待 DOM 更新（错误提示渲染完成后再滚动）。
 */
function scrollToFirstError(errors: Array<{ path: string }>): void {
  if (errors.length === 0)
    return

  setTimeout(() => {
    /* 查找表单中第一个带错误样式的元素 */
    const errorElement = document.querySelector(
      '[data-field-error="true"], [aria-invalid="true"]',
    )
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      /* 尝试聚焦到错误字段的输入元素 */
      const input = errorElement.querySelector('input, textarea, select') as HTMLElement | null
      input?.focus()
      return
    }

    /* 兜底：按字段路径查找 */
    const firstPath = errors[0].path
    const fieldElements = document.querySelectorAll(`[data-field-path="${firstPath}"], [name="${firstPath}"]`)
    if (fieldElements.length > 0) {
      fieldElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, 100)
}
