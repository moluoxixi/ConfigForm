import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Transfer as ATransfer } from 'antd'

/**
 * Cf Transfer Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/Transfer.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfTransferProps {
  value?: string[]
  onChange?: (value: string[]) => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  preview?: boolean
  showSearch?: boolean
  titles?: [string, string]
}

/**
 * Transfer：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-antd/src/components/Transfer.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{
  value = [],
  onChange,
  dataSource = [],
  disabled,
  showSearch,
  titles,
}）用于提供待处理的值并参与结果计算。
 * @param param1.value 当前已选值列表。
 * @param param1.onChange 选择结果变更回调。
 * @param param1.dataSource 穿梭框数据源。
 * @param param1.disabled 是否禁用组件。
 * @param param1.showSearch 是否开启搜索。
 * @param param1.titles 左右列表标题。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function Transfer({
  value = [],
  onChange,
  dataSource = [],
  disabled,
  showSearch,
  titles,
}: CfTransferProps): ReactElement {
  const transferData = dataSource.map(item => ({
    key: String(item.value),
    title: item.label,
    disabled: item.disabled,
  }))

  return (
    <ATransfer
      dataSource={transferData}
      targetKeys={value}
      onChange={targetKeys => onChange?.(targetKeys.map(key => String(key)))}
      disabled={disabled}
      showSearch={showSearch}
      titles={titles}
      render={item => item.title ?? ''}
      listStyle={{ width: 220, height: 300 }}
    />
  )
}
