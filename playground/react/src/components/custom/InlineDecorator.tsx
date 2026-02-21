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

/**
 * Inline Decorator：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Inline Decorator 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function InlineDecorator({ label, required, errors, children }: InlineDecoratorProps): React.ReactElement {
  const hasError = errors && errors.length > 0

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8, padding: '4px 0' }}>
      {label && (
        <label style={{ width: 80, flexShrink: 0, textAlign: 'right', fontSize: 13, color: '#555' }}>
          {required && <span style={{ color: '#ff4d4f', marginRight: 2 }}>*</span>}
          {label}
          ：
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
