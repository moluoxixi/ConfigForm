import type { FormPrintOptions } from '@moluoxixi/plugin-print-core'
import type { PropType } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { Button as AButton, message } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

export interface PrintActionMessage {
  tone: 'error'
  text: string
}

export interface PrintActionProps {
  buttonText?: string
  options?: FormPrintOptions
}

export const PrintAction = defineComponent({
  name: 'CfAntdPrintAction',
  props: {
    buttonText: { type: String, default: '打印预览' },
    options: { type: Object as PropType<PrintActionProps['options']>, default: undefined },
  },
  emits: ['message'],
  setup(props, { emit }) {
    const form = useForm()
    const handlePrint = (): void => {
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
