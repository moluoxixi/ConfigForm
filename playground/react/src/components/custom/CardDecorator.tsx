/**
 * 自定义装饰器：卡片风格
 *
 * 替代默认 FormItem，用带背景和圆角的卡片包裹字段。
 */
import React from 'react'

interface CardDecoratorProps {
  label?: string
  description?: string
  required?: boolean
  errors?: Array<{ message: string }>
  children?: React.ReactNode
}

export function CardDecorator({ label, description, required, errors, children }: CardDecoratorProps): React.ReactElement {
  const hasError = errors && errors.length > 0

  return (
    <div style={{
      padding: '16px 20px',
      marginBottom: 12,
      borderRadius: 8,
      background: hasError ? '#fff2f0' : '#f6f8fa',
      border: hasError ? '1px solid #ffccc7' : '1px solid #e8e8e8',
    }}
    >
      {label && (
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, color: '#333' }}>
          {required && <span style={{ color: '#ff4d4f', marginRight: 4 }}>*</span>}
          {label}
        </div>
      )}
      {description && (
        <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>{description}</div>
      )}
      <div>{children}</div>
      {hasError && (
        <div style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>
          {errors.map((e, i) => <div key={i}>{e.message}</div>)}
        </div>
      )}
    </div>
  )
}
