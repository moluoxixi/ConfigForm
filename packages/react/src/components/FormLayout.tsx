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
 * FormLayout 上下文对象。
 * 用于在嵌套布局中逐层传递标签位置、宽度和冒号显示策略。
 */
export const FormLayoutContext = createContext<FormLayoutConfig | null>(null)
FormLayoutContext.displayName = 'ConfigFormLayoutContext'

/**
 * 获取最近的 FormLayout 上下文
 * @returns 返回最近一层布局配置；若未声明布局则返回 `null`。
 */
export function useFormLayout(): FormLayoutConfig | null {
  return useContext(FormLayoutContext)
}

/* ======================== 组件 ======================== */

/**
 * `FormLayout` 组件属性。
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
 * @param props 布局属性对象。
 * @param props.labelPosition 子布局标签位置，未传时继承父布局。
 * @param props.labelWidth 子布局标签宽度，未传时继承父布局。
 * @param props.colon 子布局冒号策略，未传时继承父布局。
 * @param props.children 子布局内容。
 * @returns 返回注入合并布局配置后的上下文容器。
 */
export function FormLayout(props: FormLayoutProps): ReactElement {
  const {
    labelPosition,
    labelWidth,
    colon,
    children,
  } = props
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
