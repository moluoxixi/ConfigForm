import type { CSSProperties, ReactElement, ReactNode } from 'react'
import { InputNumber as AInputNumber } from 'antd'

/**
 * Cf Input Number Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/InputNumber.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
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
  suffix?: ReactNode
  style?: CSSProperties | string
}

/**
 * InputNumber 适配组件
 *
 * Ant Design 的 InputNumber.onChange 传入 number | null，
 * 清空时传 null，统一转为 undefined 传递给表单字段。
 * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
    suffix,
    style,
    ...rest
  } = props as CfInputNumberProps & {
    addonAfter?: unknown
    loading?: unknown
    dataSource?: unknown
  }
  const inputNumberProps = { ...rest } as CfInputNumberProps & { loading?: unknown, dataSource?: unknown }
  delete inputNumberProps.loading
  delete inputNumberProps.dataSource
  delete (inputNumberProps as Record<string, unknown>).addonAfter
  const mergedStyle: CSSProperties = typeof style === 'object'
    ? { width: '100%', ...style }
    : { width: '100%' }

  return (
    <AInputNumber
      {...inputNumberProps}
      value={value}
      onChange={(v) => {
        if (v === null || v === undefined) {
          onChange?.(undefined)
          return
        }
        onChange?.(typeof v === 'number' ? v : Number(v))
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      prefix={prefix}
      suffix={suffix}
      style={mergedStyle}
    />
  )
}
