import type React from 'react'

/**
 * Designer Header：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/Header.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DesignerHeader(): React.ReactElement {
  return (
    <div className="cf-lc-header">
      <h3 className="cf-lc-header-title">低代码设计器（容器化树编辑）</h3>
      <div className="cf-lc-header-desc">
        字段与布局容器（Card / Tabs / Collapse）可混排，支持拖拽到根节点、容器、分组并实时生成 schema。
      </div>
    </div>
  )
}
