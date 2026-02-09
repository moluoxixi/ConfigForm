import type { FormConfig, FormInstance, ISchema, ValidationFeedback } from '@moluoxixi/core'
import type { ComponentType, ReactElement, ReactNode } from 'react'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/react'
import { observer } from '@moluoxixi/reactive-react'
import { Modal } from 'antd'
import React, { useCallback, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

/* ======================== 类型定义 ======================== */

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

/** 命令式 open() 的配置项 */
export interface FormDialogOpenOptions<Values extends Record<string, unknown> = Record<string, unknown>> {
  /** 弹窗标题 */
  title?: ReactNode
  /** 表单 Schema */
  schema: ISchema
  /** 初始值 */
  initialValues?: Partial<Values>
  /** 表单配置 */
  formConfig?: FormConfig<Values>
  /** 弹窗宽度 */
  width?: number | string
  /** 确认按钮文字 */
  okText?: string
  /** 取消按钮文字 */
  cancelText?: string
  /** 提交回调（可异步） */
  onSubmit?: (values: Values) => void | Promise<void>
}

/* ======================== 声明式组件 ======================== */

/**
 * FormDialog — 弹窗表单组件
 *
 * 在 Ant Design Modal 内创建独立的 Form 实例并渲染 Schema 表单。
 * 点击确认按钮时自动触发验证和提交。
 *
 * 支持两种用法：
 * 1. 声明式：`<FormDialog open={open} schema={schema} onSubmit={handleSubmit} />`
 * 2. 命令式：`const values = await FormDialog.open({ schema, onSubmit })`
 *
 * @example
 * ```tsx
 * // 声明式
 * <FormDialog
 *   open={open}
 *   title="新增用户"
 *   schema={userSchema}
 *   initialValues={{ name: '' }}
 *   onSubmit={async (values) => { await api.createUser(values); setOpen(false); }}
 *   onCancel={() => setOpen(false)}
 * />
 *
 * // 命令式
 * const values = await FormDialog.open({
 *   title: '编辑用户',
 *   schema: userSchema,
 *   initialValues: { name: '张三' },
 *   onSubmit: async (values) => await api.updateUser(values),
 * })
 * ```
 */
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

  /** 内部创建 form 实例（当外部未提供时） */
  const internalForm = useCreateForm<Values>({
    ...formConfig,
    initialValues: initialValues ?? formConfig?.initialValues,
  })
  const form = externalForm ?? internalForm

  /** 提交中状态 */
  const [submitting, setSubmitting] = useState(false)

  /** 点击确认 → 验证 + 提交 */
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

/* ======================== 命令式 API ======================== */

/**
 * 命令式打开弹窗表单
 *
 * 创建一个临时 DOM 容器，挂载 FormDialog 组件，
 * 提交成功后自动关闭并返回表单值。
 *
 * @returns 提交成功时 resolve 表单值，取消时 reject
 */
function openFormDialog<Values extends Record<string, unknown> = Record<string, unknown>>(
  options: FormDialogOpenOptions<Values>,
): Promise<Values> {
  return new Promise<Values>((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    /** 卸载清理 */
    const destroy = (): void => {
      /* 延迟卸载，等关闭动画完成 */
      setTimeout(() => {
        root.unmount()
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 300)
    }

    /** 内部创建 form 实例 */
    const form = createForm<Values>({
      ...options.formConfig,
      initialValues: options.initialValues ?? options.formConfig?.initialValues,
    })

    /** 渲染受控组件 */
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

/* ======================== 组合导出 ======================== */

type FormDialogType = typeof FormDialogInner & {
  open: typeof openFormDialog
}

export const FormDialog = FormDialogInner as FormDialogType
;(FormDialog as FormDialogType).open = openFormDialog
