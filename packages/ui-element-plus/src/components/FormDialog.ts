import type { FormConfig, FormInstance, ISchema } from '@moluoxixi/core'
import type { App, PropType } from 'vue'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/vue'
import { ElButton, ElDialog, ElSpace } from 'element-plus'
import { createApp, defineComponent, h, ref } from 'vue'

/* ======================== 声明式组件 ======================== */

/**
 * FormDialog — 弹窗表单组件（Element Plus）
 *
 * 在 ElDialog 内创建独立的 Form 实例并渲染 Schema 表单。
 * 底部操作按钮自动触发验证和提交。
 */
export const FormDialog = defineComponent({
  name: 'CfFormDialog',
  props: {
    title: { type: String, default: undefined },
    modelValue: { type: Boolean, default: false },
    schema: { type: Object as PropType<ISchema>, required: true },
    formConfig: { type: Object as PropType<FormConfig>, default: undefined },
    initialValues: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    form: { type: Object as PropType<FormInstance>, default: undefined },
    width: { type: [Number, String], default: 520 },
    okText: { type: String, default: '确认' },
    cancelText: { type: String, default: '取消' },
    destroyOnClose: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'submit', 'submitFailed', 'cancel'],
  setup(props, { emit, slots }) {
    const submitting = ref(false)

    const internalForm = useCreateForm({
      ...props.formConfig,
      initialValues: props.initialValues ?? props.formConfig?.initialValues,
    })

    const getForm = (): FormInstance => props.form ?? internalForm

    const handleOk = async (): Promise<void> => {
      const form = getForm()
      submitting.value = true
      try {
        const result = await form.submit()
        if (result.errors.length > 0) {
          emit('submitFailed', result.errors)
          return
        }
        emit('submit', result.values)
      }
      catch (error: unknown) {
        console.error('[FormDialog] 提交异常', error)
      }
      finally {
        submitting.value = false
      }
    }

    const handleClose = (): void => {
      emit('update:modelValue', false)
      emit('cancel')
    }

    return () => {
      const form = getForm()

      return h(ElDialog, {
        title: props.title,
        modelValue: props.modelValue,
        width: props.width,
        destroyOnClose: props.destroyOnClose,
        closeOnClickModal: false,
        'onUpdate:modelValue': (val: boolean) => {
          if (!val) handleClose()
        },
      }, {
        default: () => h(FormProvider, { form }, () => [
          h(SchemaField, { schema: props.schema }),
          slots.default?.(),
        ]),
        footer: () => h(ElSpace, null, () => [
          h(ElButton, { onClick: handleClose }, () => props.cancelText),
          h(ElButton, { type: 'primary', loading: submitting.value, onClick: handleOk }, () => props.okText),
        ]),
      })
    }
  },
})

/* ======================== 命令式 API ======================== */

export interface FormDialogOpenOptions {
  title?: string
  schema: ISchema
  initialValues?: Record<string, unknown>
  formConfig?: FormConfig
  width?: number | string
  okText?: string
  cancelText?: string
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
}

FormDialog.open = function openFormDialog(
  options: FormDialogOpenOptions,
): Promise<Record<string, unknown>> {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let appInstance: App | null = null

    const destroy = (): void => {
      setTimeout(() => {
        appInstance?.unmount()
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
      }, 300)
    }

    const form = createForm({
      ...options.formConfig,
      initialValues: options.initialValues ?? options.formConfig?.initialValues,
    })

    const DialogWrapper = defineComponent({
      setup() {
        const open = ref(true)

        const handleSubmit = async (values: Record<string, unknown>): Promise<void> => {
          await options.onSubmit?.(values)
          open.value = false
          resolve(values)
          destroy()
        }

        const handleCancel = (): void => {
          open.value = false
          reject(new Error('FormDialog cancelled'))
          destroy()
        }

        return () => h(FormDialog, {
          title: options.title,
          modelValue: open.value,
          schema: options.schema,
          form,
          width: options.width,
          okText: options.okText,
          cancelText: options.cancelText,
          onSubmit: handleSubmit,
          onCancel: handleCancel,
        })
      },
    })

    appInstance = createApp(DialogWrapper)
    appInstance.mount(container)
  })
}
