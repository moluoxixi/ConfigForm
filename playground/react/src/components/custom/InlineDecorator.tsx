/**
 * 自定义装饰器：内联风格
 *
 * 左标签右内容的紧凑单行布局，适合空间紧凑的场景。
 */
import React from 'react'

/**
 * Inline Decorator Props：类型接口定义。
 * 所属模块：`playground/react/src/components/custom/InlineDecorator.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface InlineDecoratorProps {
  label?: string
  required?: boolean
  errors?: Array<{ message: string }>
  children?: React.ReactNode
}

/**
 * Inline Decorator：当前功能模块的核心执行单元。
 * 所属模块：`playground/react/src/components/custom/InlineDecorator.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.label 字段标题文本。
 * @param param1.required 当前字段是否必填。
 * @param param1.errors 字段校验错误列表。
 * @param param1.children 被装饰的字段内容节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
