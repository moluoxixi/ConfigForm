import type { FormConfig, FormInstance, ISchema, ValidationFeedback } from '@moluoxixi/core'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/react'
import { observer } from '@moluoxixi/reactive-react'
import { Button, Drawer, Space } from 'antd'
import React, { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'

/* ======================== 类型定义 ======================== */

export interface FormDrawerProps<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 抽屉标题 */
  title?: ReactNode
  /** 受控：是否显示抽屉 */
  open?: boolean
  /** 表单 Schema */
  schema: ISchema
  /** 表单配置 */
  formConfig?: FormConfig<Values>
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 外部传入的 form 实例（可选） */
  form?: FormInstance<Values>
  /** 抽屉宽度，默认 520 */
  width?: number | string
  /** 抽屉弹出方向 */
  placement?: 'left' | 'right' | 'top' | 'bottom'
  /** 确认按钮文字 */
  okText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 关闭后是否销毁内部元素 */
  destroyOnClose?: boolean
  /** 局部组件注册 */
  components?: Record<string, ComponentType<unknown>>
  /** 局部装饰器注册 */
  decorators?: Record<string, ComponentType<unknown>>
  /** 提交成功回调 */
  onSubmit?: (values: Values) => void | Promise<void>
  /** 提交失败回调 */
  onSubmitFailed?: (errors: ValidationFeedback[]) => void
  /** 取消/关闭回调 */
  onCancel?: () => void
  /** 自定义子节点 */
  children?: ReactNode
}

/** 命令式 open() 的配置项 */
export interface FormDrawerOpenOptions<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 抽屉标题 */
  title?: ReactNode
  /** 表单 Schema */
  schema: ISchema
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 表单配置 */
  formConfig?: FormConfig<Values>
  /** 抽屉宽度 */
  width?: number | string
  /** 抽屉弹出方向 */
  placement?: 'left' | 'right' | 'top' | 'bottom'
  /** 确认按钮文字 */
  okText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 提交回调 */
  onSubmit?: (values: Values) => void | Promise<void>
}

/* ======================== 声明式组件 ======================== */

/**
 * FormDrawer — 抽屉表单组件
 *
 * 在 Ant Design Drawer 内创建独立的 Form 实例并渲染 Schema 表单。
 * 底部操作栏包含确认/取消按钮，确认时自动触发验证和提交。
 *
 * 支持声明式和命令式两种用法，API 设计与 FormDialog 对齐。
 */
const FormDrawerInner = observer(<Values extends Record<string, unknown> = Record<string, unknown>>(
  props: FormDrawerProps<Values>,
): ReactElement => {
  const {
    title,
    open = false,
    schema,
    formConfig,
    initialValues,
    form: externalForm,
    width = 520,
    placement = 'right',
    okText = '确认',
    cancelText = '取消',
    destroyOnClose = true,
    components,
    decorators,
    onSubmit,
    onSubmitFailed,
    onCancel,
    children,
  } = props

  const internalForm = useCreateForm<Values>({
    ...formConfig,
    initialValues: initialValues ?? formConfig?.initialValues,
  })
  const form = externalForm ?? internalForm

  const [submitting, setSubmitting] = useState(false)

  const handleOk = useCallback(async (): Promise<void> => {
    setSubmitting(true)
    try {
      const result = await form.submit()
      if (result.errors.length > 0) {
        onSubmitFailed?.(result.errors)
        return
      }
      await onSubmit?.(result.values as Values)
    }
    catch (error: unknown) {
      console.error('[FormDrawer] 提交异常', error)
    }
    finally {
      setSubmitting(false)
    }
  }, [form, onSubmit, onSubmitFailed])

  /** 底部操作按钮 */
  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Space>
        <Button onClick={onCancel}>{cancelText}</Button>
        <Button type="primary" loading={submitting} onClick={handleOk}>{okText}</Button>
      </Space>
    </div>
  )

  return (
    <Drawer
      title={title}
      open={open}
      width={width}
      placement={placement}
      destroyOnClose={destroyOnClose}
      onClose={onCancel}
      footer={footer}
      maskClosable={false}
    >
      <FormProvider form={form} components={components} decorators={decorators}>
        <SchemaField schema={schema} />
        {children}
      </FormProvider>
    </Drawer>
  )
}) as unknown as <Values extends Record<string, unknown> = Record<string, unknown>>(
  props: FormDrawerProps<Values>,
) => ReactElement | null

/* ======================== 命令式 API ======================== */

function openFormDrawer<Values extends Record<string, unknown> = Record<string, unknown>>(
  options: FormDrawerOpenOptions<Values>,
): Promise<Values> {
  return new Promise<Values>((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    const destroy = (): void => {
      setTimeout(() => {
        root.unmount()
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 300)
    }

    const form = createForm<Values>({
      ...options.formConfig,
      initialValues: options.initialValues ?? options.formConfig?.initialValues,
    })

    const DrawerWrapper = (): ReactElement => {
      const [open, setOpen] = useState(true)

      const handleSubmit = async (values: Values): Promise<void> => {
        await options.onSubmit?.(values)
        setOpen(false)
        resolve(values)
        destroy()
      }

      const handleCancel = (): void => {
        setOpen(false)
        reject(new Error('FormDrawer cancelled'))
        destroy()
      }

      return (
        <FormDrawerInner<Values>
          title={options.title}
          open={open}
          schema={options.schema}
          form={form}
          width={options.width}
          placement={options.placement}
          okText={options.okText}
          cancelText={options.cancelText}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )
    }

    root.render(<DrawerWrapper />)
  })
}

/* ======================== 组合导出 ======================== */

type FormDrawerType = typeof FormDrawerInner & {
  open: typeof openFormDrawer
}

export const FormDrawer = FormDrawerInner as FormDrawerType
;(FormDrawer as FormDrawerType).open = openFormDrawer
