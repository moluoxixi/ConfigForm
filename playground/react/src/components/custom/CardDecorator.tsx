/**
 * 自定义装饰器：卡片风格
 *
 * 替代默认 FormItem，用带背景和圆角的卡片包裹字段。
 */
import React from 'react'

/**
 * Card Decorator Props：描述该模块对外暴露的数据结构。
 * 所属模块：`playground/react/src/components/custom/CardDecorator.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface CardDecoratorProps {
  label?: string
  description?: string
  required?: boolean
  errors?: Array<{ message: string }>
  children?: React.ReactNode
}

/**
 * Card Decorator：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`playground/react/src/components/custom/CardDecorator.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 组件入参对象。
 * @param param1.label 字段标题文本。
 * @param param1.description 字段描述文本。
 * @param param1.required 当前字段是否必填。
 * @param param1.errors 字段校验错误列表。
 * @param param1.children 被装饰的字段内容节点。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
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
