import type { FormPrintOptions } from '@moluoxixi/plugin-print'
import type { PropType } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { Button as AButton, message } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/**
 * Print Action Message：类型接口定义。
 * 所属模块：`packages/ui-antd-vue/src/components/PrintAction.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface PrintActionMessage {
  tone: 'error'
  text: string
}

/**
 * Print Action Props：类型接口定义。
 * 所属模块：`packages/ui-antd-vue/src/components/PrintAction.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface PrintActionProps {
  buttonText?: string
  options?: FormPrintOptions
}

/**
 * Print Action：变量或常量声明。
 * 所属模块：`packages/ui-antd-vue/src/components/PrintAction.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const PrintAction = defineComponent({
  name: 'CfAntdPrintAction',
  props: {
    buttonText: { type: String, default: '打印预览' },
    options: { type: Object as PropType<PrintActionProps['options']>, default: undefined },
  },
  emits: ['message'],
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-antd-vue/src/components/PrintAction.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param context 组件上下文对象。
   * @param context.emit 组件事件派发函数。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, context) {
    const { emit } = context
    const form = useForm()
    /**
     * handle Print：当前功能模块的核心执行单元。
     * 所属模块：`packages/ui-antd-vue/src/components/PrintAction.ts`。
     * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
     * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
     */
    const /**
           * handlePrint：执行当前功能逻辑。
           */
      handlePrint = (): void => {
        const print = form.print
        if (!print) {
          const text = 'printPlugin is not installed.'
          message.error(text)
          emit('message', { tone: 'error', text } satisfies PrintActionMessage)
          return
        }

        print(props.options).catch((error) => {
          const text = error instanceof Error ? error.message : String(error)
          message.error(`打印失败：${text}`)
          emit('message', { tone: 'error', text: `打印失败：${text}` } satisfies PrintActionMessage)
        })
      }

    return () => h(AButton, { onClick: handlePrint }, () => props.buttonText)
  },
})
