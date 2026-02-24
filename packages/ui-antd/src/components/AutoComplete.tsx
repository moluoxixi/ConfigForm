import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { AutoComplete as AAutoComplete } from 'antd'
import { useMemo } from 'react'

/**
 * Cf Auto Complete Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/AutoComplete.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfAutoCompleteProps {
  value?: string
  onChange?: (value: string) => void
  onFocus?: () => void
  onBlur?: () => void
  disabled?: boolean
  preview?: boolean
  placeholder?: string
  dataSource?: DataSourceItem[]
}

/**
 * Auto Complete：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/AutoComplete.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, disabled, preview, placeholder, dataSource = [] }）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function AutoComplete({ value, onChange, onFocus, onBlur, disabled, preview, placeholder, dataSource = [] }: CfAutoCompleteProps): ReactElement {
  const options = useMemo(() => dataSource.map(item => ({ value: String(item.value), label: item.label })), [dataSource])

  return (
    <AAutoComplete
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      disabled={disabled || preview}
      placeholder={placeholder}
      options={options}
    />
  )
}
