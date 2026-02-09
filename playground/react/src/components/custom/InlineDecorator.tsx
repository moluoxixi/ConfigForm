/**
 * 自定义装饰器：内联风格
 *
 * 左标签右内容的紧凑单行布局，适合空间紧凑的场景。
 */
import React from 'react'

interface InlineDecoratorProps {
  label?: string
  required?: boolean
  errors?: Array<{ message: string }>
  children?: React.ReactNode
}

export function InlineDecorator({ label, required, errors, children }: InlineDecoratorProps): React.ReactElement {
  const hasError = errors && errors.length > 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '4px 0' }}>
      {label && (
        <label style={{ width: 80, flexShrink: 0, textAlign: 'right', fontSize: 13, color: '#555' }}>
          {required && <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>}
          {label}：
        </label>
      )}
      <div style={{ flex: 1 }}>
        {children}
        {hasError && (
          <div style={{ fontSize: 11, color: '#ff4d4f', marginTop: 2 }}>
            {errors[0].message}
          </div>
        )}
      </div>
    </div>
  )
}
