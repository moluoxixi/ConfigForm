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

/**
 * Card Decorator：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Card Decorator 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
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
