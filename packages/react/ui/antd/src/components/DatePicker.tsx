import type { CSSProperties, ReactElement } from 'react'
import { DatePicker as ADatePicker } from 'antd'
import dayjs from 'dayjs'

/**
 * Cf Date Picker Props：描述该模块对外暴露的数据结构。
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
 * Date Picker：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-antd/src/components/DatePicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, placeholder, disabled, preview, style }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @param param1.onChange 参数 onChange 的输入说明。
 * @param param1.onFocus 参数 onFocus 的输入说明。
 * @param param1.onBlur 参数 onBlur 的输入说明。
 * @param param1.placeholder 参数 placeholder 的输入说明。
 * @param param1.disabled 参数 disabled 的输入说明。
 * @param param1.preview 参数 preview 的输入说明。
 * @param param1.style 参数 style 的输入说明。
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
