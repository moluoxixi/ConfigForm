import type { FormConfig, FormInstance, ISchema } from '@moluoxixi/core'
import type { App, Component, PropType } from 'vue'
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
    components: { type: Object as PropType<Record<string, Component>>, default: undefined },
    decorators: { type: Object as PropType<Record<string, Component>>, default: undefined },
    width: { type: [Number, String], default: 520 },
    placement: { type: String as PropType<'left' | 'right' | 'top' | 'bottom'>, default: 'right' },
    okText: { type: String, default: '确认' },
    cancelText: { type: String, default: '取消' },
    destroyOnClose: { type: Boolean, default: true },
  },
  emits: ['update:open', 'submit', 'submitFailed', 'cancel'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:34`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
     * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:57`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @returns ?????????????
     */
    const /**
           * getForm：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:42`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @returns 返回当前分支执行后的处理结果。
           */
      getForm = (): FormInstance => props.form ?? internalForm

    /**
     * handleOk?????????????????
     * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:65`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleOk：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:44`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
     * handleCancel?????????????????
     * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:90`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * handleCancel：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:63`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           */
      handleCancel = (): void => {
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
        /**
         * default：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:88`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
         * footer：执行当前位置的功能逻辑。
         * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:96`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        footer: () => footer,
      })
    }
  },
})

/* ======================== 命令式 API ======================== */

/**
 * FormDrawerOpenOptions??????
 * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:145`?
 * ??????????????????????????????
 */
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

    /**
     * destroy?????????????????
     * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:172`?
     * ?????????????????????????????????
     * ??????????????????????????
     */
    const /**
           * destroy：执行当前位置的功能逻辑。
           * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:125`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
       * setup：执行当前位置的功能逻辑。
       * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:140`。
       * 功能：处理参数消化、状态变更与调用链行为同步。
       * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
       * @returns 返回当前分支执行后的处理结果。
       */
      setup() {
        const open = ref(true)

        /**
         * handleSubmit?????????????????
         * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:204`?
         * ?????????????????????????????????
         * ??????????????????????????
         * @param values ?? values ????????????
         */
        const /**
               * handleSubmit：执行当前位置的功能逻辑。
               * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:143`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
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
         * ???`packages/ui-antd-vue/src/components/FormDrawer.ts:217`?
         * ?????????????????????????????????
         * ??????????????????????????
         */
        const /**
               * handleCancel：执行当前位置的功能逻辑。
               * 定位：`packages/ui-antd-vue/src/components/FormDrawer.ts:150`。
               * 功能：处理参数消化、状态变更与调用链行为同步。
               * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
               */
          handleCancel = (): void => {
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
