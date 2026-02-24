import type { DataSourceItem } from '@moluoxixi/core'
import type { DefaultOptionType } from 'antd/es/cascader'
import type { ReactElement } from 'react'
import { Cascader as ACascader } from 'antd'

/**
 * Cascader Value：描述该模块使用的类型别名语义。
 * 所属模块：`packages/ui-antd/src/components/Cascader.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
type CascaderValue = Array<string | number | null>

/**
 * Cf Cascader Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/Cascader.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfCascaderProps {
  value?: unknown[]
  onChange?: (value: unknown[]) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  options?: DefaultOptionType[]
  placeholder?: string
  disabled?: boolean
  preview?: boolean
  loading?: boolean
  showSearch?: boolean
  changeOnSelect?: boolean
}

/**
 * 将 DataSourceItem 转为 antd Cascader 的 options 格式
 * @param items 参数 `items`用于提供集合数据，支撑批量遍历与扩展处理。
 * @returns 返回数组结果，用于后续遍历、渲染或进一步转换。
 */
function toCascaderOptions(items: DataSourceItem[]): DefaultOptionType[] {
  return items.map(item => ({
    label: item.label,
    value: item.value as string | number | null,
    disabled: item.disabled,
    children: item.children ? toCascaderOptions(item.children) : undefined,
  }))
}

/**
 * Cascader：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-antd/src/components/Cascader.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  value,
  onChange,
  onFocus,
  onBlur,
  dataSource,
  options,
  placeholder,
  disabled,
  preview,
  loading,
  showSearch,
  changeOnSelect,
}）用于提供可选配置，调整当前功能模块的执行策略。
 * @param param1.value 当前级联选择值。
 * @param param1.onChange 选择值变更回调。
 * @param param1.onFocus 获得焦点回调。
 * @param param1.onBlur 失去焦点回调。
 * @param param1.dataSource 通用数据源格式。
 * @param param1.options antd 原生 options 数据。
 * @param param1.placeholder 占位提示文本。
 * @param param1.disabled 是否禁用组件。
 * @param param1.preview 是否处于预览态。
 * @param param1.loading 是否处于加载态。
 * @param param1.showSearch 是否开启搜索。
 * @param param1.changeOnSelect 是否每级选择即触发变更。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Cascader({
  value,
  onChange,
  onFocus,
  onBlur,
  dataSource,
  options,
  placeholder,
  disabled,
  preview,
  loading,
  showSearch,
  changeOnSelect,
}: CfCascaderProps): ReactElement {
  const data = options ?? (dataSource ? toCascaderOptions(dataSource) : [])

  return (
    <ACascader
      value={value as CascaderValue | undefined}
      onChange={(nextValue) => {
        onChange?.(nextValue as unknown[])
      }}
      onFocus={onFocus}
      onBlur={onBlur}
      options={data}
      placeholder={placeholder}
      disabled={disabled || preview}
      loading={loading}
      showSearch={showSearch}
      changeOnSelect={changeOnSelect}
      style={{ width: '100%' }}
    />
  )
}
