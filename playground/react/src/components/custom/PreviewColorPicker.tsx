/**
 * ColorPicker 的阅读态组件（readPretty）
 *
 * 阅读态下显示色块 + HEX 文本，不可交互。
 * 演示 registerComponent 的 readPrettyComponent 选项。
 */

interface PreviewColorPickerProps {
  value?: string
}

/**
 * Preview Color Picker：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Preview Color Picker 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function PreviewColorPicker({ value }: PreviewColorPickerProps): JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 16,
        height: 16,
        borderRadius: 3,
        background: value || '#000',
        border: '1px solid #d9d9d9',
        display: 'inline-block',
      }}
      />
      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{value || '—'}</span>
    </span>
  )
}
