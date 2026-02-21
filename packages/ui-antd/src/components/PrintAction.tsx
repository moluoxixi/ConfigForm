import type { FormPrintOptions } from '@moluoxixi/plugin-print'
import type { CSSProperties, ReactElement } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message } from 'antd'

export interface PrintActionProps {
  buttonText?: string
  className?: string
  style?: CSSProperties
  options?: FormPrintOptions
}

/**
 * Print Action：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Print Action 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
