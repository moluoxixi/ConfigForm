import type { FormPrintOptions } from '@moluoxixi/plugin-print'
import type { PropType } from 'vue'
import { useForm } from '@moluoxixi/vue'
import { ElButton, ElMessage } from 'element-plus'
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
  name: 'CfElementPrintAction',
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
        ElMessage({ type: 'error', message: text })
        emit('message', { tone: 'error', text } satisfies PrintActionMessage)
        return
      }

      print(props.options).catch((error) => {
        const text = error instanceof Error ? error.message : String(error)
        ElMessage({ type: 'error', message: `打印失败：${text}` })
        emit('message', { tone: 'error', text: `打印失败：${text}` } satisfies PrintActionMessage)
      })
    }

    return () => h(ElButton, { onClick: handlePrint }, () => props.buttonText)
  },
})
