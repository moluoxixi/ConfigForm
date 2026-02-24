/**
 * PreviewRadioGroup：执行当前功能逻辑。
 *
 * @returns 返回当前功能的处理结果。
 */
export function PreviewRadioGroup({ value, dataSource = [] }: { value?: string | number, dataSource?: DataSourceItem[] }): React.ReactElement {
  const selectedLabel = dataSource.find(item => item.value === value)?.label
  return <span>{selectedLabel || (value ? String(value) : EMPTY)}</span>
}

/**
 * PreviewSwitch：执行当前功能逻辑。
 *
 * @returns 返回当前功能的处理结果。
 */
export function PreviewSwitch({ value }: { value?: boolean }): React.ReactElement {
  return <span>{value ? '是' : '否'}</span>
}

/**
 * 日期选择阅读态
 * @param param1 原始解构参数（{ value }）用于提供待处理的值并参与结果计算。
 * @param param1.value 参数 value 的输入说明。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function PreviewDatePicker({ value }: { value?: string }): React.ReactElement {
  return <span>{value || EMPTY}</span>
}
