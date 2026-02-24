import type React from 'react'

/**
 * Schema Panel Props：类型接口定义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panels/SchemaPanel.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
interface SchemaPanelProps {
  editorHostRef: React.RefObject<HTMLDivElement>
}

/**
 * Schema Panel：当前功能模块的核心执行单元。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panels/SchemaPanel.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param param1 原始解构参数（{ editorHostRef }）用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function SchemaPanel({ editorHostRef }: SchemaPanelProps): React.ReactElement {
  return (
    <section className="cf-lc-panel">
      <h4 className="cf-lc-panel-title">Schema（JSONEditor）</h4>
      <div ref={editorHostRef} style={{ minHeight: 310 }} />
    </section>
  )
}
