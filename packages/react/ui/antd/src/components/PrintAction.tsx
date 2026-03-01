import type { FormPrintOptions } from '@moluoxixi/plugin-print'
import type { CSSProperties, ReactElement } from 'react'
import { useForm } from '@moluoxixi/react'
import { Button, message } from 'antd'

/**
 * Print Action Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/PrintAction.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface PrintActionProps {
  buttonText?: string
  className?: string
  style?: CSSProperties
  options?: FormPrintOptions
}

/**
 * Print Action：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-antd/src/components/PrintAction.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  buttonText = '打印预览',
  className,
  style,
  options,
}）用于提供可选配置，调整当前功能模块的执行策略。
 * @param param1.buttonText 按钮文案。
 * @param param1.className 外层容器类名。
 * @param param1.style 外层容器样式。
 * @param param1.options 打印插件参数。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function PrintAction({
  buttonText = '打印预览',
  className,
  style,
  options,
}: PrintActionProps): ReactElement {
  const form = useForm()

  /**
   * handle Print：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-antd/src/components/PrintAction.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   */
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

