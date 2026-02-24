import type { ReactElement, ReactNode } from 'react'
import { createContext, useContext } from 'react'

/* ======================== Context ======================== */

/**
 * FormLayout 上下文
 *
 * 用于嵌套覆盖 labelPosition / labelWidth / labelCol / wrapperCol 等布局属性。
 * FormItem 优先读取最近的 FormLayoutContext，未提供时使用 form 全局配置。
 */
export interface FormLayoutConfig {
  /** 标签位置 */
  labelPosition?: 'top' | 'left' | 'right'
  /** 标签宽度 */
  labelWidth?: string | number
  /** 是否显示冒号 */
  colon?: boolean
}

/**
 * Form Layout Context：变量或常量声明。
 * 所属模块：`packages/react/src/components/FormLayout.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const FormLayoutContext = createContext<FormLayoutConfig | null>(null)
FormLayoutContext.displayName = 'ConfigFormLayoutContext'

/**
 * 获取最近的 FormLayout 上下文
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function useFormLayout(): FormLayoutConfig | null {
  return useContext(FormLayoutContext)
}

/* ======================== 组件 ======================== */

/**
 * Form Layout Props：类型接口定义。
 * 所属模块：`packages/react/src/components/FormLayout.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export interface FormLayoutProps extends FormLayoutConfig {
  children: ReactNode
}

/**
 * FormLayout — 表单布局容器
 *
 * 在 Schema 中使用 `component: 'FormLayout'` 可以嵌套覆盖表单布局属性。
 * 子表单项（FormItem）会优先读取最近的 FormLayout 上下文配置。
 *
 * 支持嵌套：外层 FormLayout 的属性会被内层覆盖。
 *
 * @example
 * ```tsx
 * <FormLayout labelPosition="left" labelWidth={120}>
 *   <FormLayout labelPosition="top">
 *     // 这里的 FormItem 将使用 labelPosition="top"
 *   </FormLayout>
 * </FormLayout>
 * ```
 * @param param1 原始解构参数（{ labelPosition, labelWidth, colon, children }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function FormLayout({ labelPosition, labelWidth, colon, children }: FormLayoutProps): ReactElement {
  const parentLayout = useFormLayout()

  /** 合并：子级覆盖父级，未指定的属性继承父级 */
  const mergedConfig: FormLayoutConfig = {
    labelPosition: labelPosition ?? parentLayout?.labelPosition,
    labelWidth: labelWidth ?? parentLayout?.labelWidth,
    colon: colon ?? parentLayout?.colon,
  }

  return (
    <FormLayoutContext.Provider value={mergedConfig}>
      {children}
    </FormLayoutContext.Provider>
  )
}
