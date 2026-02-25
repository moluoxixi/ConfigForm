import type { FieldPattern, FormConfig, FormInstance, FormPlugin, FormSchema, ValidationFeedback } from '@moluoxixi/core'
import type { ComponentType, CSSProperties, FormEvent, ReactElement, ReactNode } from 'react'

import type { ComponentScope, RegistryState } from '@moluoxixi/react'
import { FormLifeCycle } from '@moluoxixi/core'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ComponentRegistryContext } from '@moluoxixi/react'
import { useCreateForm } from '@moluoxixi/react'
import { observer } from '@moluoxixi/react'
import { FormProvider } from '@moluoxixi/react'
import { SchemaField } from '@moluoxixi/react'
import { scrollToFirstError } from '../utils/scrollToFirstError'

/**
 * Schema 转换插件桥接能力。
 * 兼容历史命名（`translateSchema`）与当前命名（`transformSchema`）。
 */
interface SchemaTransformPluginBridge {
  translateSchema?: (schema: FormSchema) => FormSchema
  transformSchema?: (schema: FormSchema) => FormSchema
  subscribe?: (listener: () => void) => (() => void) | void
  subscribeSchemaChange?: (listener: () => void) => (() => void) | void
}

/**
 * ConfigForm 组件属性定义。
 * 支持外部传入 form 实例，也支持内部按配置自动创建。
 */
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
  /** 是否渲染为原生 form 标签（嵌套场景可设为 false） */
  formTag?: boolean
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
    formTag,
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

  const useFormTag = formTag !== false
  const FormTag = (useFormTag ? 'form' : 'div') as 'form' | 'div'
  const formProps = useFormTag ? { onSubmit: handleSubmit, noValidate: true } : { role: 'form' }

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
      <FormTag {...formProps} className={className} style={style}>
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
      </FormTag>
    </FormProvider>
  )
}) as <Values extends Record<string, unknown> = Record<string, unknown>>(
  props: ConfigFormProps<Values>,
) => ReactElement | null

interface FormActionsRendererProps {
  showSubmit: boolean
  showReset: boolean
  submitLabel: string
  resetLabel: string
  align: 'left' | 'center' | 'right'
  extraActions?: Record<string, unknown>
  onReset: () => void
}

/**
 * 操作按钮渲染器（优先从 registry 获取 LayoutFormActions）
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

/** 判断值是否为普通对象（非 null 且非数组）。 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 仅抽取插件容器所需最小能力，便于函数间解耦。 */
interface PluginContainerBridge {
  getPlugins?: () => ReadonlyMap<string, unknown> | undefined
}

/**
 * 从已安装插件中提取可用的 schema 转换器。
 * @param form 插件容器桥接对象。
 * @returns 可执行 schema 转换的插件桥接列表。
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
 * 依次应用 schema 转换器。
 * @param schema 原始 schema。
 * @param transformers 转换器列表。
 * @returns 转换后的 schema。
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
 * 过滤表单动作配置中的扩展动作。
 * 会排除 submit/reset/align 这三个保留键。
 * @param actions 原始动作配置。
 * @returns 扩展动作配置。
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

/** 判断扩展动作中是否至少有一个处于启用状态。 */
function hasEnabledExtraActions(actions: Record<string, unknown>): boolean {
  return Object.values(actions).some(isActionEnabled)
}

/** 动作配置只要不显式等于 false，就视为启用。 */
function isActionEnabled(config: unknown): boolean {
  return config !== false
}

/**
 * 归一化动作配置为对象形式。
 * @param config 动作配置，支持字符串或对象。
 * @returns 归一化后的动作属性对象。
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
