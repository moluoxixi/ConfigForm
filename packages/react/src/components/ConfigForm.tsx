import type { FormConfig, FormInstance } from '@moluoxixi/core'
import type { FormSchema } from '@moluoxixi/schema'
import type { ValidationFeedback } from '@moluoxixi/validator'
import type { ComponentType, FormEvent, ReactNode } from 'react'
import { observer } from 'mobx-react-lite'
import React, { useCallback } from 'react'
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
  style?: React.CSSProperties
}

/**
 * 开箱即用的配置化表单组件
 *
 * 两种使用模式：
 * 1. Schema 模式：传入 schema 自动渲染
 * 2. 组合模式：通过 children 自定义布局
 *
 * @example
 * ```tsx
 * // Schema 模式
 * <ConfigForm
 *   schema={{
 *     fields: {
 *       name: { type: 'string', label: '姓名', required: true },
 *       age: { type: 'number', label: '年龄' },
 *     }
 *   }}
 *   onSubmit={(values) => console.log(values)}
 * />
 *
 * // 组合模式
 * <ConfigForm form={form}>
 *   <FormField name="name" />
 *   <FormField name="age" />
 *   <button type="submit">提交</button>
 * </ConfigForm>
 * ```
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

  /* 内部创建或使用外部 form：schema.form 提供基础配置，formConfig 显式覆盖 */
  const internalForm = useCreateForm<Values>({
    ...schema?.form,
    ...formConfig,
    initialValues: initialValues ?? formConfig?.initialValues,
  })
  const form = externalForm ?? internalForm

  /* 注册值变化监听 */
  React.useEffect(() => {
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

  return (
    <FormProvider form={form} components={components} wrappers={wrappers}>
      <form onSubmit={handleSubmit} className={className} style={style} noValidate>
        {schema && <SchemaField schema={schema} />}
        {children}
      </form>
    </FormProvider>
  )
}) as <Values extends Record<string, unknown> = Record<string, unknown>>(
  props: ConfigFormProps<Values>,
) => React.ReactElement | null
