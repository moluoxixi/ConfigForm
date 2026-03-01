import type { FormConfig, FormInstance, ISchema, ValidationFeedback } from '@moluoxixi/core'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { createForm } from '@moluoxixi/core'
import { FormProvider, observer, SchemaField, useCreateForm } from '@moluoxixi/react'
import { Modal } from 'antd'
import { useCallback, useState } from 'react'
import { createRoot } from 'react-dom/client'

export interface FormDialogProps<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 弹窗标题 */
  title?: ReactNode
  /** 受控：是否显示弹窗 */
  open?: boolean
  /** 表单 Schema */
  schema: ISchema
  /** 表单配置 */
  formConfig?: FormConfig<Values>
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 外部传入的 form 实例（可选） */
  form?: FormInstance<Values>
  /** 弹窗宽度，默认 520 */
  width?: number | string
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
  /** 提交成功回调（返回 Promise 可阻塞关闭，直到 resolve） */
  onSubmit?: (values: Values) => void | Promise<void>
  /** 提交失败回调 */
  onSubmitFailed?: (errors: ValidationFeedback[]) => void
  /** 取消/关闭回调 */
  onCancel?: () => void
  /** 自定义子节点（追加到 schema 渲染之后） */
  children?: ReactNode
}

export interface FormDialogOpenOptions<Values extends Record<string, unknown> = Record<string, unknown>> {
  title?: ReactNode
  schema: ISchema
  initialValues?: Partial<Values>
  formConfig?: FormConfig<Values>
  width?: number | string
  okText?: string
  cancelText?: string
  onSubmit?: (values: Values) => void | Promise<void>
}

const FormDialogInner = observer(<Values extends Record<string, unknown> = Record<string, unknown>>(
  props: FormDialogProps<Values>,
): ReactElement => {
  const {
    title,
    open = false,
    schema,
    formConfig,
    initialValues,
    form: externalForm,
    width = 520,
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
      console.error('[FormDialog] 提交异常', error)
    }
    finally {
      setSubmitting(false)
    }
  }, [form, onSubmit, onSubmitFailed])

  return (
    <Modal
      title={title}
      open={open}
      width={width}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={submitting}
      destroyOnClose={destroyOnClose}
      onOk={handleOk}
      onCancel={onCancel}
      maskClosable={false}
    >
      <FormProvider form={form} components={components} decorators={decorators}>
        <SchemaField schema={schema} />
        {children}
      </FormProvider>
    </Modal>
  )
}) as unknown as <Values extends Record<string, unknown> = Record<string, unknown>>(
  props: FormDialogProps<Values>,
) => ReactElement | null

function openFormDialog<Values extends Record<string, unknown> = Record<string, unknown>>(
  options: FormDialogOpenOptions<Values>,
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

    const DialogWrapper = (): ReactElement => {
      const [open, setOpen] = useState(true)

      const handleSubmit = async (values: Values): Promise<void> => {
        await options.onSubmit?.(values)
        setOpen(false)
        resolve(values)
        destroy()
      }

      const handleCancel = (): void => {
        setOpen(false)
        reject(new Error('FormDialog cancelled'))
        destroy()
      }

      return (
        <FormDialogInner<Values>
          title={options.title}
          open={open}
          schema={options.schema}
          form={form}
          width={options.width}
          okText={options.okText}
          cancelText={options.cancelText}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )
    }

    root.render(<DialogWrapper />)
  })
}

type FormDialogType = typeof FormDialogInner & {
  open: typeof openFormDialog
}

export const FormDialog = FormDialogInner as FormDialogType
;(FormDialog as FormDialogType).open = openFormDialog
