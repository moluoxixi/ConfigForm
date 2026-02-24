import type { ReactElement } from 'react'
import { TimePicker as ATimePicker } from 'antd'

/**
 * Cf Time Picker Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/TimePicker.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfTimePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  format?: string
}

/**
 * Time Picker：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/TimePicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, placeholder, disabled, format = 'HH:mm:ss' }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @param param1.onChange 参数 onChange 的输入说明。
 * @param param1.onFocus 参数 onFocus 的输入说明。
 * @param param1.onBlur 参数 onBlur 的输入说明。
 * @param param1.placeholder 参数 placeholder 的输入说明。
 * @param param1.disabled 参数 disabled 的输入说明。
 * @param param1.format 参数 format 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function TimePicker({ value, onChange, onFocus, onBlur, placeholder, disabled, format = 'HH:mm:ss' }: CfTimePickerProps): ReactElement {
  return (
    <ATimePicker
      value={(value || undefined) as any}
      onChange={(_time, timeString) => onChange?.(timeString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      format={format}
      style={{ width: '100%' }}
    />
  )
}
