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
 * Preview Color Picker：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/react/src/components/custom/PreviewColorPicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.value 当前颜色值（HEX）。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
