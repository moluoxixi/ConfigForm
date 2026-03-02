import type { FormConfig, FormInstance, ISchema } from '@moluoxixi/core'
import type { App, Component, PropType } from 'vue'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/vue'
import { ElButton, ElDrawer } from 'element-plus'
import { createApp, defineComponent, h, ref } from 'vue'

export interface FormDrawerOpenOptions {
  title?: string
  schema: ISchema
  initialValues?: Record<string, unknown>
  formConfig?: FormConfig
  width?: number | string
  direction?: 'ltr' | 'rtl' | 'ttb' | 'btt'
  okText?: string
  cancelText?: string
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
}

export const FormDrawer = defineComponent({
  name: 'CfFormDrawer',
  props: {
    title: String,
    modelValue: { type: Boolean, default: false },
    schema: { type: Object as PropType<ISchema>, required: true },
    form: { type: Object as PropType<FormInstance>, default: undefined },
    initialValues: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    formConfig: { type: Object as PropType<FormConfig>, default: undefined },
    width: { type: [Number, String] as PropType<number | string>, default: 520 },
    direction: { type: String as PropType<'ltr' | 'rtl' | 'ttb' | 'btt'>, default: 'rtl' },
    okText: { type: String, default: '提交' },
    cancelText: { type: String, default: '取消' },
  },
  emits: ['submit', 'cancel', 'update:modelValue'],
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
      emit('update:modelValue', false)
    }

    return () => h(ElDrawer, {
      title: props.title,
      modelValue: props.modelValue,
      size: props.width,
      direction: props.direction,
      'onUpdate:modelValue': (value: boolean) => emit('update:modelValue', value),
    }, {
      default: () => h(FormProvider, { form: resolveForm() }, () =>
        h(SchemaField, { schema: props.schema })),
      footer: () => [
        h(ElButton, { onClick: handleCancel }, () => props.cancelText),
        h(ElButton, { type: 'primary', onClick: () => { void handleSubmit() } }, () => props.okText),
      ],
    })
  },
}) as unknown as Component & {
  open: (options: FormDrawerOpenOptions) => Promise<Record<string, unknown>>
}

FormDrawer.open = function openFormDrawer(
  options: FormDrawerOpenOptions,
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
      reject(new Error('FormDrawer cancelled'))
      destroy()
    }

    const DrawerWrapper = defineComponent({
      setup() {
        return () => h(FormDrawer, {
          title: options.title,
          modelValue: open.value,
          schema: options.schema,
          form,
          width: options.width,
          direction: options.direction,
          okText: options.okText,
          cancelText: options.cancelText,
          onSubmit: handleSubmit,
          onCancel: handleCancel,
          'onUpdate:modelValue': (value: boolean) => { open.value = value },
        })
      },
    })

    appInstance = createApp(DrawerWrapper)
    appInstance.mount(container)
  })
}
