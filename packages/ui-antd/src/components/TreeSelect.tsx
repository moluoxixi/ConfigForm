import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { TreeSelect as ATreeSelect } from 'antd'

/**
 * Cf Tree Select Props：类型接口定义。
 * 所属模块：`packages/ui-antd/src/components/TreeSelect.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfTreeSelectProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  treeData?: unknown[]
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  loading?: boolean
  multiple?: boolean
  treeCheckable?: boolean
  showSearch?: boolean
}

/**
 * 将 DataSourceItem 转为 antd TreeSelect 的 treeData 格式
 * @param items 参数 `items`用于提供集合数据，支撑批量遍历与扩展处理。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
function toTreeData(items: DataSourceItem[]): unknown[] {
  return items.map(item => ({
    title: item.label,
    value: item.value,
    disabled: item.disabled,
    children: item.children ? toTreeData(item.children) : undefined,
  }))
}

/**
 * Tree Select：当前功能模块的核心执行单元。
 * 所属模块：`packages/ui-antd/src/components/TreeSelect.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  value,
  onChange,
  onFocus,
  onBlur,
  dataSource,
  treeData,
  placeholder,
  disabled,
  loading,
  multiple,
  treeCheckable,
  showSearch,
}）用于提供待处理的值并参与结果计算。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function TreeSelect({
  value,
  onChange,
  onFocus,
  onBlur,
  dataSource,
  treeData,
  placeholder,
  disabled,
  loading,
  multiple,
  treeCheckable,
  showSearch,
}: CfTreeSelectProps): ReactElement {
  const data = treeData ?? (dataSource ? toTreeData(dataSource) : [])

  return (
    <ATreeSelect
      value={value as any}
      onChange={nextValue => onChange?.(nextValue)}
      onFocus={onFocus}
      onBlur={onBlur}
      treeData={data as any}
      placeholder={placeholder}
      disabled={disabled}
      loading={loading}
      multiple={multiple}
      treeCheckable={treeCheckable}
      showSearch={showSearch}
      style={{ width: '100%' }}
      allowClear
    />
  )
}
