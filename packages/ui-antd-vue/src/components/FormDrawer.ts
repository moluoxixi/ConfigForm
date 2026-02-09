import type { FormConfig, FormInstance, ISchema } from '@moluoxixi/core'
import type { App, PropType } from 'vue'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/vue'
import { Button as AButton, Drawer as ADrawer, Space as ASpace } from 'ant-design-vue'
import { createApp, defineComponent, h, ref } from 'vue'

/* ======================== 声明式组件 ======================== */

/**
 * FormDrawer — 抽屉表单组件（Ant Design Vue）
 *
 * 在 Drawer 内创建独立的 Form 实例并渲染 Schema 表单。
 * 底部操作栏包含确认/取消按钮，确认时自动触发验证和提交。
 */
export const FormDrawer = defineComponent({
  name: 'CfFormDrawer',
  props: {
    title: { type: String, default: undefined },
    open: { type: Boolean, default: false },
    schema: { type: Object as PropType<ISchema>, required: true },
    formConfig: { type: Object as PropType<FormConfig>, default: undefined },
    initialValues: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    form: { type: Object as PropType<FormInstance>, default: undefined },
    width: { type: [Number, String], default: 520 },
    placement: { type: String as PropType<'left' | 'right' | 'top' | 'bottom'>, default: 'right' },
    okText: { type: String, default: '确认' },
    cancelText: { type: String, default: '取消' },
    destroyOnClose: { type: Boolean, default: true },
  },
  emits: ['update:open', 'submit', 'submitFailed', 'cancel'],
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
        console.error('[FormDrawer] 提交异常', error)
      }
      finally {
        submitting.value = false
      }
    }

    const handleCancel = (): void => {
      emit('update:open', false)
      emit('cancel')
    }

    return () => {
      const form = getForm()

      /** 底部操作按钮 */
      const footer = h('div', { style: 'display: flex; justify-content: flex-end' }, [
        h(ASpace, null, () => [
          h(AButton, { onClick: handleCancel }, () => props.cancelText),
          h(AButton, { type: 'primary', loading: submitting.value, onClick: handleOk }, () => props.okText),
        ]),
      ])

      return h(ADrawer, {
        title: props.title,
        open: props.open,
        width: props.width,
        placement: props.placement,
        destroyOnClose: props.destroyOnClose,
        maskClosable: false,
        onClose: handleCancel,
      }, {
        default: () => h(FormProvider, { form }, () => [
          h(SchemaField, { schema: props.schema }),
          slots.default?.(),
        ]),
        footer: () => footer,
      })
    }
  },
})

/* ======================== 命令式 API ======================== */

export interface FormDrawerOpenOptions {
  title?: string
  schema: ISchema
  initialValues?: Record<string, unknown>
  formConfig?: FormConfig
  width?: number | string
  placement?: 'left' | 'right' | 'top' | 'bottom'
  okText?: string
  cancelText?: string
  onSubmit?: (values: Record<string, unknown>) => void | Promise<void>
}

FormDrawer.open = function openFormDrawer(
  options: FormDrawerOpenOptions,
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

    const DrawerWrapper = defineComponent({
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
          reject(new Error('FormDrawer cancelled'))
          destroy()
        }

        return () => h(FormDrawer, {
          title: options.title,
          open: open.value,
          schema: options.schema,
          form,
          width: options.width,
          placement: options.placement,
          okText: options.okText,
          cancelText: options.cancelText,
          onSubmit: handleSubmit,
          onCancel: handleCancel,
        })
      },
    })

    appInstance = createApp(DrawerWrapper)
    appInstance.mount(container)
  })
}
