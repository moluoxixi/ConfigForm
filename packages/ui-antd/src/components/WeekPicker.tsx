import type { CSSProperties, ReactElement } from 'react'
import { DatePicker } from 'antd'

/**
 * Cf Week Picker Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/WeekPicker.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfWeekPickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
  style?: CSSProperties
}

/**
 * Week Picker：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/WeekPicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, disabled, preview, placeholder, style }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @param param1.onChange 参数 onChange 的输入说明。
 * @param param1.onFocus 参数 onFocus 的输入说明。
 * @param param1.onBlur 参数 onBlur 的输入说明。
 * @param param1.disabled 参数 disabled 的输入说明。
 * @param param1.preview 参数 preview 的输入说明。
 * @param param1.placeholder 参数 placeholder 的输入说明。
 * @param param1.style 参数 style 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function WeekPicker({ value, onChange, onFocus, onBlur, disabled, preview, placeholder, style }: CfWeekPickerProps): ReactElement {
  return (
    <DatePicker
      picker="week"
      value={value as unknown as undefined}
      onChange={(_date: unknown, dateString: string | string[]) => onChange?.(dateString as string)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      style={{ width: '100%', ...style }}
    />
  )
}
