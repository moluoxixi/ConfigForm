/**
 * ColorPicker 的阅读态组件（readPretty）
 *
 * 阅读态下显示色块 + HEX 文本，不可交互。
 * 演示 registerComponent 的 readPrettyComponent 选项。
 */

interface PreviewColorPickerProps {
  value?: string
}

export function PreviewColorPicker({ value }: PreviewColorPickerProps): JSX.Element {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 16, height: 16, borderRadius: 3,
        background: value || '#000', border: '1px solid #d9d9d9',
        display: 'inline-block',
      }} />
      <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{value || '—'}</span>
    </span>
  )
}
