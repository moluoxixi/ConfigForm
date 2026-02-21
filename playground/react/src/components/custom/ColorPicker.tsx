/**
 * 自定义组件：颜色选择器
 *
 * 基于原生 <input type="color"> + 预设色板 + HEX 文本输入。
 * 演示如何在 playground 中注册自定义组件。
 */
import React from 'react'

interface ColorPickerProps {
  value?: string
  onChange?: (value: string) => void
  presets?: string[]
  disabled?: boolean
  preview?: boolean
}

const hexPattern = /^#[0-9a-f]{6}$/i
const isHexColor = (next: string): boolean => hexPattern.test(next)

/**
 * Color Picker：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Color Picker 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
