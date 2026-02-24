import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { TreeSelect as ATreeSelect } from 'antd'

/**
 * Cf Tree Select Props：描述该模块对外暴露的数据结构。
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
 * Tree Select：封装该模块的核心渲染与交互逻辑。
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
  preview,
  loading,
  multiple,
  treeCheckable,
  showSearch,
}）用于提供待处理的值并参与结果计算。
 * @param param1.value 当前树选择值。
 * @param param1.onChange 选择值变更回调。
 * @param param1.onFocus 获得焦点回调。
 * @param param1.onBlur 失去焦点回调。
 * @param param1.dataSource 通用数据源格式。
 * @param param1.treeData antd 原生 treeData 数据。
 * @param param1.placeholder 占位提示文本。
 * @param param1.disabled 是否禁用组件。
 * @param param1.preview 是否处于预览态。
 * @param param1.loading 是否处于加载态。
 * @param param1.multiple 是否开启多选。
 * @param param1.treeCheckable 是否启用复选框。
 * @param param1.showSearch 是否开启搜索。
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
  preview,
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
      disabled={disabled || preview}
      loading={loading}
      multiple={multiple}
      treeCheckable={treeCheckable}
      showSearch={showSearch}
      style={{ width: '100%' }}
      allowClear
    />
  )
}
