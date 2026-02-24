import type { DataSourceItem } from '@moluoxixi/core'
import { Select as ASelect } from 'antd'
import React from 'react'

/**
 * Cf Select Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/Select.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfSelectProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  loading?: boolean
  mode?: 'multiple' | 'tags'
}

/**
 * Select：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/Select.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, dataSource = [], placeholder, disabled, preview, loading, mode }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @param param1.onChange 参数 onChange 的输入说明。
 * @param param1.onFocus 参数 onFocus 的输入说明。
 * @param param1.onBlur 参数 onBlur 的输入说明。
 * @param param1.dataSource 参数 dataSource 的输入说明。
 * @param param1.placeholder 参数 placeholder 的输入说明。
 * @param param1.disabled 参数 disabled 的输入说明。
 * @param param1.preview 参数 preview 的输入说明。
 * @param param1.loading 参数 loading 的输入说明。
 * @param param1.mode 参数 mode 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Select({ value, onChange, onFocus, onBlur, dataSource = [], placeholder, disabled, preview, loading, mode }: CfSelectProps): React.ReactElement {
  return (
    <ASelect
      value={value}
      onChange={onChange}
      onFocus={onFocus}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled || preview}
      loading={loading}
      mode={mode}
      style={{ width: '100%' }}
      options={dataSource.map(item => ({
        label: item.label,
        value: item.value,
        disabled: item.disabled,
      }))}
    />
  )
}
