import type React from 'react'

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
