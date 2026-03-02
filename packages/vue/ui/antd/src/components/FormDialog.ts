import type { FormConfig, FormInstance, ISchema } from '@moluoxixi/core'
import type { App, Component, PropType } from 'vue'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/vue'
import { Modal as AModal } from 'ant-design-vue'
import { createApp, defineComponent, h, ref } from 'vue'

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

export const FormDialog = defineComponent({
  name: 'CfFormDialog',
  props: {
    title: String,
    open: { type: Boolean, default: false },
    schema: { type: Object as PropType<ISchema>, required: true },
    form: { type: Object as PropType<FormInstance>, default: undefined },
    initialValues: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    formConfig: { type: Object as PropType<FormConfig>, default: undefined },
    width: { type: [Number, String] as PropType<number | string>, default: 520 },
    okText: { type: String, default: '提交' },
    cancelText: { type: String, default: '取消' },
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const internalForm = useCreateForm({
      ...(props.formConfig ?? {}),
      initialValues: props.initialValues,
    })

    const resolveForm = (): FormInstance => props.form ?? internalForm

    const handleSubmit = async (): Promise<void> => {
      const form = resolveForm()
      const result = await form.submit()
      if (result.errors.length > 0) {
        return
      }
      emit('submit', result.values)
    }

    const handleCancel = (): void => {
      emit('cancel')
    }

    return () => h(AModal, {
      title: props.title,
      open: props.open,
      width: props.width,
      okText: props.okText,
      cancelText: props.cancelText,
      onOk: () => {
        void handleSubmit()
      },
      onCancel: handleCancel,
    }, {
      default: () => h(FormProvider, { form: resolveForm() }, () =>
        h(SchemaField, { schema: props.schema })),
    })
  },
}) as unknown as Component & {
  open: (options: FormDialogOpenOptions) => Promise<Record<string, unknown>>
}

FormDialog.open = function openFormDialog(
  options: FormDialogOpenOptions,
): Promise<Record<string, unknown>> {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let appInstance: App | null = null
    const form = createForm({
      ...(options.formConfig ?? {}),
      initialValues: options.initialValues,
    })
    const open = ref(true)

    const destroy = (): void => {
      appInstance?.unmount()
      appInstance = null
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }
      form.dispose()
    }

    const handleSubmit = async (values: Record<string, unknown>): Promise<void> => {
      open.value = false
      resolve(values)
      if (options.onSubmit) {
        await options.onSubmit(values)
      }
      destroy()
    }

    const handleCancel = (): void => {
      open.value = false
      reject(new Error('FormDialog cancelled'))
      destroy()
    }

    const DialogWrapper = defineComponent({
      setup() {
        return () => h(FormDialog, {
          title: options.title,
          open: open.value,
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
