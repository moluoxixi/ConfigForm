import type { FormPrintOptions } from '@moluoxixi/plugin-print-core'
import type { CSSProperties, ReactElement } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message } from 'antd'

export interface PrintActionProps {
  buttonText?: string
  className?: string
  style?: CSSProperties
  options?: FormPrintOptions
}

export function PrintAction({
  buttonText = '打印预览',
  className,
  style,
  options,
}: PrintActionProps): ReactElement {
  const form = useForm()

  const handlePrint = (): void => {
    const print = form.print
    if (!print) {
      message.error('printPlugin is not installed.')
      return
    }

    print(options).catch((error) => {
      const text = error instanceof Error ? error.message : String(error)
      message.error(`打印失败：${text}`)
    })
  }

  return (
    <div className={className} style={style}>
      <Button
        type="default"
        onClick={handlePrint}
      >
        {buttonText}
      </Button>
    </div>
  )
}
