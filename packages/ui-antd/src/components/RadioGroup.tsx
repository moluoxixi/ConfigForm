import type { DataSourceItem } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import { Radio as ARadio } from 'antd'

/**
 * Cf Radio Group Props：描述该模块对外暴露的数据结构。
 * 所属模块：`packages/ui-antd/src/components/RadioGroup.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface CfRadioGroupProps {
  value?: unknown
  onChange?: (value: unknown) => void
  onFocus?: () => void
  onBlur?: () => void
  dataSource?: DataSourceItem[]
  disabled?: boolean
  preview?: boolean
}

/**
 * Radio Group：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/ui-antd/src/components/RadioGroup.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ value, onChange, onFocus, onBlur, dataSource = [], disabled, preview }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @param param1.onChange 参数 onChange 的输入说明。
 * @param param1.onFocus 参数 onFocus 的输入说明。
 * @param param1.onBlur 参数 onBlur 的输入说明。
 * @param param1.dataSource 参数 dataSource 的输入说明。
 * @param param1.disabled 参数 disabled 的输入说明。
 * @param param1.preview 参数 preview 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function RadioGroup({ value, onChange, onFocus, onBlur, dataSource = [], disabled, preview }: CfRadioGroupProps): ReactElement {
  return (
    <div onFocus={onFocus} onBlur={onBlur}>
      <ARadio.Group
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled || preview}
        options={dataSource.map(item => ({ label: item.label, value: item.value }))}
      />
    </div>
  )
}
