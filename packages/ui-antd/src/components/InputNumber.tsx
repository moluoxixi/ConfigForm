import type { CSSProperties, ReactElement } from 'react'
import { InputNumber as AInputNumber } from 'antd'

export interface CfInputNumberProps {
  value?: number
  onChange?: (value?: number) => void
  onFocus?: () => void
  onBlur?: () => void
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  min?: number
  max?: number
  step?: number
  precision?: number
  stringMode?: boolean
  formatter?: (value: string | number | undefined) => string
  parser?: (value: string | undefined) => string | number
  prefix?: string
  style?: CSSProperties | string
}

/**
 * InputNumber 适配组件
 *
 * Ant Design 的 InputNumber.onChange 传入 number | null，
 * 清空时传 null，统一转为 undefined 传递给表单字段。
 */
export function InputNumber(props: CfInputNumberProps): ReactElement {
  const {
    value,
    onChange,
    onFocus,
    onBlur,
    disabled,
    preview,
    prefix,
    style,
    ...rest
  } = props
  const mergedStyle = typeof style === 'object'
    ? { width: '100%', ...style }
    : (style ?? { width: '100%' })

  return (
    <AInputNumber
      {...rest}
      value={value}
      onChange={v => onChange?.(v ?? undefined)}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      style={mergedStyle}
    />
  )
}
