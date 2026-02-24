import type { CSSProperties, ReactElement } from 'react'
import { DatePicker as ADatePicker } from 'antd'
import dayjs from 'dayjs'

/**
 * Cf Date Picker Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/DatePicker.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfDatePickerProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  style?: CSSProperties
}

/**
 * Date Picker：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/DatePicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, placeholder, disabled, preview, style }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DatePicker({ value, onChange, onFocus, onBlur, placeholder, disabled, preview, style }: CfDatePickerProps): ReactElement {
  const parsed = value ? dayjs(value) : undefined
  const pickerValue = parsed && parsed.isValid() ? parsed : undefined
  return (
    <ADatePicker
      value={pickerValue}
      onChange={(_date, dateString) => onChange?.(typeof dateString === 'string' ? dateString : '')}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
      style={{ width: '100%', ...style }}
    />
  )
}
