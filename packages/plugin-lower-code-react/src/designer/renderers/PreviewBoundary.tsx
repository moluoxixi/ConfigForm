import type React from 'react'
import { Component } from 'react'

/**
 * Preview Boundary Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface PreviewBoundaryProps {
  fallback: React.ReactElement
  children: React.ReactNode
}

/**
 * Preview Boundary State：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface PreviewBoundaryState {
  hasError: boolean
}

/**
 * Preview Boundary：类定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export class PreviewBoundary extends Component<PreviewBoundaryProps, PreviewBoundaryState> {
  state: PreviewBoundaryState = {
    hasError: false,
  }

  /**
   * get Derived State From Error：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  static getDerivedStateFromError(): PreviewBoundaryState {
    return { hasError: true }
  }

  /**
   * component Did Catch：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   */
  componentDidCatch(): void {
    // noop: fallback UI is handled by getDerivedStateFromError.
  }

  /**
   * component Did Update：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param prevProps 参数 `prevProps`用于提供当前函数执行所需的输入信息。
   */
  componentDidUpdate(prevProps: PreviewBoundaryProps): void {
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.setState({ hasError: false })
    }
  }

  /**
   * render：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-react/src/designer/renderers/PreviewBoundary.tsx`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  render(): React.ReactElement {
    if (this.state.hasError)
      return this.props.fallback
    return <>{this.props.children}</>
  }
}
