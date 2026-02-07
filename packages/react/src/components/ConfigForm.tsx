import type { FormConfig, FormInstance } from '@moluoxixi/core'
import type { FormSchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/shared'
import type { ValidationFeedback } from '@moluoxixi/validator'
import type { ComponentType, CSSProperties, FormEvent, ReactElement, ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import { useCallback, useContext, useEffect } from 'react'
import { ComponentRegistryContext } from '../context'
import { useCreateForm } from '../hooks/useForm'
import { FormProvider } from './FormProvider'
import { SchemaField } from './SchemaField'

export interface ConfigFormProps<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 外部传入的 form 实例（可选） */
  form?: FormInstance<Values>
  /** 表单 Schema */
  schema?: FormSchema<Values>
  /** 表单配置（当不传 form 实例时使用） */
  formConfig?: FormConfig<Values>
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 提交回调 */
  onSubmit?: (values: Values) => void | Promise<void>
  /** 提交失败回调 */
  onSubmitFailed?: (errors: ValidationFeedback[]) => void
  /** 值变化回调 */
  onValuesChange?: (values: Values) => void
  /** 局部组件注册 */
  components?: Record<string, ComponentType<any>>
  /** 局部装饰器注册 */
  wrappers?: Record<string, ComponentType<any>>
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
    onSubmit,
    onSubmitFailed,
    onValuesChange,
    components,
    wrappers,
    children,
    className,
    style,
  } = props

  /** 从根 schema 的 decoratorProps 提取表单级配置 */
  const rootDecoratorProps = (schema?.decoratorProps ?? {}) as Record<string, unknown>

  /* 内部创建或使用外部 form */
  const internalForm = useCreateForm<Values>({
    labelPosition: (rootDecoratorProps.labelPosition ?? 'right') as 'top' | 'left' | 'right',
    labelWidth: rootDecoratorProps.labelWidth as string | number,
    pattern: (rootDecoratorProps.pattern ?? 'editable') as FieldPattern,
    ...formConfig,
    initialValues: initialValues ?? formConfig?.initialValues,
  })
  const form = externalForm ?? internalForm

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

    const result = await form.submit()
    if (result.errors.length > 0) {
      onSubmitFailed?.(result.errors)
    }
    else {
      await onSubmit?.(result.values)
    }
  }, [form, onSubmit, onSubmitFailed])

  /* 操作按钮配置（从 schema.decoratorProps.actions 读取） */
  const actions = rootDecoratorProps.actions as Record<string, unknown>
  const pattern = (schema?.pattern ?? rootDecoratorProps.pattern ?? 'editable') as string
  const isEditable = pattern === 'editable'
  const showActions = !!actions && isEditable
  const submitLabel = typeof actions?.submit === 'string' ? actions.submit : '提交'
  const resetLabel = typeof actions?.reset === 'string' ? actions.reset : '重置'
  const showSubmit = actions?.submit !== false
  const showReset = actions?.reset !== false

  return (
    <FormProvider form={form} components={components} wrappers={wrappers}>
      <form onSubmit={handleSubmit} className={className} style={style} noValidate>
        {schema && <SchemaField schema={schema} />}

        {/* 操作按钮 */}
        {showActions && (
          <FormActionsRenderer
            showSubmit={showSubmit}
            showReset={showReset}
            submitLabel={submitLabel}
            resetLabel={resetLabel}
            onReset={() => form.reset()}
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
  onReset: () => void
}

function FormActionsRenderer({ showSubmit, showReset, submitLabel, resetLabel, onReset }: FormActionsRendererProps): ReactElement {
  const registry = useContext(ComponentRegistryContext)
  const LayoutActions = registry.components.get('LayoutFormActions')

  if (LayoutActions) {
    return (
      <LayoutActions
        showSubmit={showSubmit}
        showReset={showReset}
        submitLabel={submitLabel}
        resetLabel={resetLabel}
        onReset={onReset}
      />
    )
  }

  return (
    <div style={{ marginTop: 16 }}>
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
