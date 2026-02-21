import type { FieldPattern, FormConfig, FormInstance, FormPlugin, FormSchema, ValidationFeedback } from '@moluoxixi/core'
import type { ComponentType, CSSProperties, FormEvent, ReactElement, ReactNode } from 'react'

import type { ComponentScope, RegistryState } from '../registry'
import { FormLifeCycle } from '@moluoxixi/core'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ComponentRegistryContext } from '../context'
import { useCreateForm } from '../hooks/useForm'
import { observer } from '../reactive'
import { FormProvider } from './FormProvider'
import { SchemaField } from './SchemaField'

interface SchemaTransformPluginBridge {
  translateSchema?: (schema: FormSchema) => FormSchema
  transformSchema?: (schema: FormSchema) => FormSchema
  subscribe?: (listener: () => void) => (() => void) | void
  subscribeSchemaChange?: (listener: () => void) => (() => void) | void
}

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
  /** 局部 action 注册（actionName -> ActionComponent） */
  actions?: Record<string, ComponentType<any>>
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
    actions: localActions,
    defaultDecorators,
    readPrettyComponents,
    scope,
    registry,
    pattern: patternProp,
    children,
    className,
    style,
  } = props

  /** 从根 schema 的 decoratorProps 提取表单级配置（用于创建表单） */
  const rawDecoratorProps = (schema?.decoratorProps ?? {}) as Record<string, unknown>

  /** pattern 优先级：props.pattern > schema.decoratorProps.pattern > 'editable' */
  const initialPattern = (patternProp ?? schema?.pattern ?? rawDecoratorProps.pattern ?? 'editable') as FieldPattern

  const resolvedEffects = effects ?? formConfig?.effects
  const resolvedPlugins = plugins ?? formConfig?.plugins
  const internalFormResetKey = useMemo(
    () => (externalForm ? '__external__' : { formConfig, initialValues, resolvedEffects, resolvedPlugins }),
    [externalForm, formConfig, initialValues, resolvedEffects, resolvedPlugins],
  )

  /* 内部创建或使用外部 form */
  const internalForm = useCreateForm<Values>({
    labelPosition: (rawDecoratorProps.labelPosition ?? 'right') as 'top' | 'left' | 'right',
    labelWidth: rawDecoratorProps.labelWidth as string | number,
    pattern: initialPattern,
    ...formConfig,
    initialValues: initialValues ?? formConfig?.initialValues,
    effects: resolvedEffects,
    plugins: resolvedPlugins,
  }, { resetKey: internalFormResetKey })
  const form = externalForm ?? internalForm

  const [schemaTransformVersion, setSchemaTransformVersion] = useState(0)
  const schemaTransformers = useMemo(
    () => collectSchemaTransformers(form),
    [form],
  )

  useEffect(() => {
    const disposers: Array<() => void> = []
    for (const transformer of schemaTransformers) {
      const subscribe = transformer.subscribeSchemaChange ?? transformer.subscribe
      if (typeof subscribe !== 'function') {
        continue
      }
      const dispose = subscribe(() => {
        setSchemaTransformVersion(v => v + 1)
      })
      if (typeof dispose === 'function') {
        disposers.push(dispose)
      }
    }
    return () => {
      for (const dispose of disposers) {
        dispose()
      }
    }
  }, [schemaTransformers])

  const effectiveSchema = useMemo(() => {
    if (!schema)
      return schema
    if (schemaTransformers.length === 0)
      return schema
    void schemaTransformVersion
    return applySchemaTransforms(schema, schemaTransformers)
  }, [schema, schemaTransformers, schemaTransformVersion])

  /** 从根 schema 的 decoratorProps 提取表单级配置 */
  const rootDecoratorProps = (effectiveSchema?.decoratorProps ?? {}) as Record<string, unknown>

  /** pattern 优先级：props.pattern > schema.decoratorProps.pattern > 'editable' */
  const effectivePattern = (patternProp ?? effectiveSchema?.pattern ?? rootDecoratorProps.pattern ?? 'editable') as FieldPattern

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
  const actions = isRecord(rootDecoratorProps.actions) ? rootDecoratorProps.actions : undefined
  const extraActions = extractExtraActions(actions)
  const isEditable = form.pattern === 'editable'
  const showActions = isEditable && (
    (actions ? actions.submit !== false || actions.reset !== false : false)
    || hasEnabledExtraActions(extraActions)
  )
  const submitLabel = typeof actions?.submit === 'string' ? actions.submit : '提交'
  const resetLabel = typeof actions?.reset === 'string' ? actions.reset : '重置'
  const showSubmit = actions?.submit !== false
  const showReset = actions?.reset !== false
  const align = (actions?.align === 'left' || actions?.align === 'right' || actions?.align === 'center')
    ? actions.align
    : 'center'

  /* 布局配置 */
  const layout = effectiveSchema?.layout as {
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
      actions={localActions}
      defaultDecorators={defaultDecorators}
      readPrettyComponents={readPrettyComponents}
      scope={scope}
      registry={registry}
    >
      <form onSubmit={handleSubmit} className={className} style={style} noValidate>
        {effectiveSchema && (
          <div style={fieldContainerStyle}>
            <SchemaField schema={effectiveSchema} />
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
            extraActions={extraActions}
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

/**
 * 操作按钮渲染器（优先从 registry 获取 LayoutFormActions）
 * Form Actions Renderer：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Form Actions Renderer 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function FormActionsRenderer({
  showSubmit,
  showReset,
  submitLabel,
  resetLabel,
  align,
  extraActions = {},
  onReset,
}: FormActionsRendererProps): ReactElement {
  const registry = useContext(ComponentRegistryContext)
  const LayoutActions = registry.components.get('LayoutFormActions')
  const extraActionEntries = Object.entries(extraActions).filter(([, config]) => isActionEnabled(config))
  const extraActionNodes = extraActionEntries.map(([actionName, config]) => {
    const ActionComp = registry.actions.get(actionName)
    if (!ActionComp) {
      return null
    }
    return <ActionComp key={actionName} {...resolveActionProps(config)} />
  })

  if (LayoutActions) {
    return (
      <LayoutActions
        showSubmit={showSubmit}
        showReset={showReset}
        submitLabel={submitLabel}
        resetLabel={resetLabel}
        align={align}
        extraActions={extraActions}
      />
    )
  }

  const justifyContent = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center'

  return (
    <div style={{ marginTop: 16, display: 'flex', justifyContent, gap: 8, flexWrap: 'wrap' }}>
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
      {extraActionNodes}
    </div>
  )
}

const RESERVED_FORM_ACTION_KEYS = new Set(['submit', 'reset', 'align'])

/**
 * is Record：负责“判断is Record”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Record 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

interface PluginContainerBridge {
  getPlugins?: () => ReadonlyMap<string, unknown> | undefined
}

/**
 * collect Schema Transformers：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 collect Schema Transformers 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function collectSchemaTransformers(form: PluginContainerBridge): SchemaTransformPluginBridge[] {
  const plugins = form.getPlugins?.()
  if (!plugins) {
    return []
  }
  const transformers: SchemaTransformPluginBridge[] = []
  for (const pluginApi of plugins.values()) {
    if (!isRecord(pluginApi)) {
      continue
    }
    const bridge = pluginApi as SchemaTransformPluginBridge
    if (typeof bridge.translateSchema === 'function' || typeof bridge.transformSchema === 'function') {
      transformers.push(bridge)
    }
  }
  return transformers
}

/**
 * apply Schema Transforms：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 apply Schema Transforms 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function applySchemaTransforms(schema: FormSchema, transformers: SchemaTransformPluginBridge[]): FormSchema {
  let transformed = schema
  for (const transformer of transformers) {
    const transform = transformer.transformSchema ?? transformer.translateSchema
    if (typeof transform === 'function') {
      transformed = transform(transformed)
    }
  }
  return transformed
}

/**
 * extract Extra Actions：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 extract Extra Actions 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
function extractExtraActions(actions: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!actions) {
    return {}
  }
  const extras: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(actions)) {
    if (!RESERVED_FORM_ACTION_KEYS.has(key)) {
      extras[key] = value
    }
  }
  return extras
}

/**
 * has Enabled Extra Actions：负责“判断has Enabled Extra Actions”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 has Enabled Extra Actions 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function hasEnabledExtraActions(actions: Record<string, unknown>): boolean {
  return Object.values(actions).some(isActionEnabled)
}

/**
 * is Action Enabled：负责“判断is Action Enabled”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 is Action Enabled 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function isActionEnabled(config: unknown): boolean {
  return config !== false
}

/**
 * resolve Action Props：负责“解析resolve Action Props”的核心实现与调用衔接。
 * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
 * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
 *
 * 说明：该注释描述 resolve Action Props 的主要职责边界，便于维护者快速理解函数在链路中的定位。
 */
function resolveActionProps(config: unknown): Record<string, unknown> {
  if (typeof config === 'string') {
    return { buttonText: config }
  }
  if (isRecord(config)) {
    return config
  }
  return {}
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
