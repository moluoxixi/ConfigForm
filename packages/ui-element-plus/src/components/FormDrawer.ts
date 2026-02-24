import type { FormConfig, FormInstance, ISchema } from '@moluoxixi/core'
import type { App, Component, PropType } from 'vue'
import { createForm } from '@moluoxixi/core'
import { FormProvider, SchemaField, useCreateForm } from '@moluoxixi/vue'
import { ElButton, ElDrawer, ElSpace } from 'element-plus'
import { createApp, defineComponent, h, ref } from 'vue'

/* ======================== 声明式组件 ======================== */

/**
 * FormDrawer — 抽屉表单组件（Element Plus）
 *
 * 在 ElDrawer 内创建独立的 Form 实例并渲染 Schema 表单。
 * 底部操作栏包含确认/取消按钮。
 */
export const FormDrawer = defineComponent({
  name: 'CfFormDrawer',
  props: {
    title: { type: String, default: undefined },
    modelValue: { type: Boolean, default: false },
    schema: { type: Object as PropType<ISchema>, required: true },
    formConfig: { type: Object as PropType<FormConfig>, default: undefined },
    initialValues: { type: Object as PropType<Record<string, unknown>>, default: undefined },
    form: { type: Object as PropType<FormInstance>, default: undefined },
    components: { type: Object as PropType<Record<string, Component>>, default: undefined },
    decorators: { type: Object as PropType<Record<string, Component>>, default: undefined },
    width: { type: [Number, String], default: 520 },
    direction: { type: String as PropType<'ltr' | 'rtl' | 'ttb' | 'btt'>, default: 'rtl' },
    okText: { type: String, default: '确认' },
    cancelText: { type: String, default: '取消' },
    destroyOnClose: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'submit', 'submitFailed', 'cancel'],
  /**
   * setup：处理当前分支的交互与状态同步。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit, slots }) {
    const submitting = ref(false)

    const internalForm = useCreateForm({
      ...props.formConfig,
      initialValues: props.initialValues ?? props.formConfig?.initialValues,
    })

    /**
     * getForm?????????????????
     * ???`packages/ui-element-plus/src/components/FormDrawer.ts:57`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @returns ?????????????
     */
    const /**
           * getForm：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * @returns 返回当前分支执行后的处理结果。
           */
      getForm = (): FormInstance => props.form ?? internalForm

    /**
     * handleOk?????????????????
     * ???`packages/ui-element-plus/src/components/FormDrawer.ts:65`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleOk：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
      handleOk = async (): Promise<void> => {
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

    /**
     * handleClose?????????????????
     * ???`packages/ui-element-plus/src/components/FormDrawer.ts:90`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleClose：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
      handleClose = (): void => {
        emit('update:modelValue', false)
        emit('cancel')
      }

    return () => {
      const form = getForm()

      return h(ElDrawer, {
        'title': props.title,
        'modelValue': props.modelValue,
        'size': props.width,
        'direction': props.direction,
        'destroyOnClose': props.destroyOnClose,
        'closeOnClickModal': false,
        /**
         * onUpdate:modelValue：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @param val 参数 val 为输入值，用于驱动后续逻辑。
         */
        'onUpdate:modelValue': (val: boolean) => {
          if (!val)
            handleClose()
        },
      }, {
        /**
         * default：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        default: () => h(FormProvider, {
          form,
          components: props.components,
          decorators: props.decorators,
        }, () => [
          h(SchemaField, { schema: props.schema }),
          slots.default?.(),
        ]),
        /**
         * footer：处理当前分支的交互与状态同步。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * @returns 返回当前分支执行后的处理结果。
         */
        footer: () => h(ElSpace, null, () => [
          h(ElButton, { onClick: handleClose }, () => props.cancelText),
          h(ElButton, { type: 'primary', loading: submitting.value, onClick: handleOk }, () => props.okText),
        ]),
      })
    }
  },
})

/* ======================== 命令式 API ======================== */

/**
 * FormDrawerOpenOptions??????
 * ???`packages/ui-element-plus/src/components/FormDrawer.ts:150`?
 * ??????????????????????????????
 */
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

FormDrawer.open = function openFormDrawer(
  options: FormDrawerOpenOptions,
): Promise<Record<string, unknown>> {
  return new Promise<Record<string, unknown>>((resolve, reject) => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let appInstance: App | null = null

    /**
     * destroy?????????????????
     * ???`packages/ui-element-plus/src/components/FormDrawer.ts:177`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * destroy：处理当前分支的交互与状态同步。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           */
      destroy = (): void => {
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
      /**
       * setup：处理当前分支的交互与状态同步。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * @returns 返回当前分支执行后的处理结果。
       */
      setup() {
        const open = ref(true)

        /**
         * handleSubmit?????????????????
         * ???`packages/ui-element-plus/src/components/FormDrawer.ts:209`?
         * ?????????????????????????????????
         * ??????????????????????????
         * @param values ?? values ????????????
         */
        const /**
               * handleSubmit：处理当前分支的交互与状态同步。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * @param values 参数 values 为当前功能所需的输入信息。
               */
          handleSubmit = async (values: Record<string, unknown>): Promise<void> => {
            await options.onSubmit?.(values)
            open.value = false
            resolve(values)
            destroy()
          }

        /**
         * handleCancel?????????????????
         * ???`packages/ui-element-plus/src/components/FormDrawer.ts:222`?
         * ?????????????????????????????????
         * ??????????????????????????
         */
        const /**
               * handleCancel：处理当前分支的交互与状态同步。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               */
          handleCancel = (): void => {
            open.value = false
            reject(new Error('FormDrawer cancelled'))
            destroy()
          }

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
        })
      },
    })

    appInstance = createApp(DrawerWrapper)
    appInstance.mount(container)
  })
}
