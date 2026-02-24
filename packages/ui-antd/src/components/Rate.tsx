import type { ReactElement } from 'react'
import { Rate as ARate } from 'antd'

/**
 * Cf Rate Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Rate.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfRateProps {
  value?: number
  onChange?: (value: number) => void
  disabled?: boolean
  preview?: boolean
  count?: number
  allowHalf?: boolean
}

/**
 * Rate：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Rate.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, disabled, preview, count = 5, allowHalf = false }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @param param1.onChange 参数 onChange 的输入说明。
 * @param param1.disabled 参数 disabled 的输入说明。
 * @param param1.preview 参数 preview 的输入说明。
 * @param param1.count 参数 count 的输入说明。
 * @param param1.allowHalf 参数 allowHalf 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Rate({ value, onChange, disabled, preview, count = 5, allowHalf = false }: CfRateProps): ReactElement {
  return (
    <ARate
      value={value}
      onChange={onChange}
      disabled={disabled || preview}
      count={count}
      allowHalf={allowHalf}
    />
  )
}
