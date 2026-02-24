import type { ReactElement } from 'react'
import { Switch as ASwitch } from 'antd'

/**
 * Cf Switch Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Switch.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfSwitchProps {
  value?: boolean
  onChange?: (value: boolean) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
}

/**
 * Switch：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Switch.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, disabled, preview }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Switch({ value, onChange, onFocus, onBlur, disabled, preview }: CfSwitchProps): ReactElement {
  return (
    <span onFocus={onFocus} onBlur={onBlur}>
      <ASwitch checked={value} onChange={onChange} disabled={disabled || preview} />
    </span>
  )
}
