/**
 * 自定义组件：颜色选择器
 *
 * 基于原生 <input type="color"> + 预设色板 + HEX 文本输入。
 * 演示如何在 playground 中注册自定义组件。
 */
import React from 'react'

/**
 * Color Picker Props：描述该模块对外暴露的数据结构。
 * 所属模块：`playground/react/src/components/custom/ColorPicker.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  presets?: string[]
  disabled?: boolean
  preview?: boolean
}

/**
 * hex Pattern：定义该模块复用的常量配置。
 * 所属模块：`playground/react/src/components/custom/ColorPicker.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const hexPattern = /^#[0-9a-f]{6}$/i
/**
 * is Hex Color：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/react/src/components/custom/ColorPicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param next 参数 `next`用于提供当前函数执行所需的输入信息。
 * @returns 返回布尔值，用于表示条件是否成立或操作是否成功。
 */
const isHexColor = (next: string): boolean => hexPattern.test(next)

/**
 * Color Picker：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/react/src/components/custom/ColorPicker.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.value 当前颜色值（HEX）。
 * @param param1.onChange 颜色变更回调。
 * @param param1.presets 预设颜色列表。
 * @param param1.disabled 是否禁用输入。
 * @param param1.preview 是否处于预览态。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function ColorPicker({ value = '', onChange, presets = [], disabled, preview }: ColorPickerProps): React.ReactElement {
  const isDisabled = disabled || preview
  const [textDraft, setTextDraft] = React.useState(value ?? '')

  React.useEffect(() => {
    const next = value ?? ''
    setTextDraft(prev => (next !== prev ? next : prev))
  }, [value])

  const safeColor = isHexColor(value ?? '') ? value : '#000000'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <input
        type="color"
        value={safeColor}
        onChange={e => onChange?.(e.target.value)}
        disabled={isDisabled}
        style={{ width: 40, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, cursor: isDisabled ? 'not-allowed' : 'pointer', padding: 2 }}
      />
      <input
        type="text"
        value={textDraft}
        onChange={(e) => {
          const nextValue = e.target.value
          setTextDraft(nextValue)
          if (isHexColor(nextValue)) {
            onChange?.(nextValue)
          }
        }}
        onBlur={() => {
          if (!isHexColor(textDraft)) {
            setTextDraft(value ?? '')
          }
        }}
        disabled={isDisabled}
        style={{ width: 90, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: '0 8px', fontFamily: 'monospace', fontSize: 13 }}
        maxLength={7}
      />
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 4 }}>
          {presets.map(color => (
            <button
              key={color}
              onClick={() => !isDisabled && onChange?.(color)}
              disabled={isDisabled}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border: value === color ? '2px solid #1677ff' : '1px solid #d9d9d9',
                background: color,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                padding: 0,
              }}
              title={color}
            />
          ))}
        </div>
      )}
      <span style={{ width: 24, height: 24, borderRadius: 4, background: safeColor, border: '1px solid #d9d9d9', display: 'inline-block' }} />
    </div>
  )
}
