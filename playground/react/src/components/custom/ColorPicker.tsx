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

export function ColorPicker({ value = '#000000', onChange, presets = [], disabled, preview }: ColorPickerProps): React.ReactElement {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <input
        type="color"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled || preview}
        style={{ width: 40, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, cursor: disabled ? 'not-allowed' : 'pointer', padding: 2 }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        disabled={disabled || preview}
        style={{ width: 90, height: 32, border: '1px solid #d9d9d9', borderRadius: 4, padding: '0 8px', fontFamily: 'monospace', fontSize: 13 }}
        maxLength={7}
      />
      {presets.length > 0 && (
        <div style={{ display: 'flex', gap: 4 }}>
          {presets.map(color => (
            <button
              key={color}
              onClick={() => !disabled && !preview && onChange?.(color)}
              disabled={disabled || preview}
              style={{
                width: 20,
                height: 20,
                borderRadius: 4,
                border: value === color ? '2px solid #1677ff' : '1px solid #d9d9d9',
                background: color,
                cursor: disabled ? 'not-allowed' : 'pointer',
                padding: 0,
              }}
              title={color}
            />
          ))}
        </div>
      )}
      <span style={{ width: 24, height: 24, borderRadius: 4, background: value, border: '1px solid #d9d9d9', display: 'inline-block' }} />
    </div>
  )
}
