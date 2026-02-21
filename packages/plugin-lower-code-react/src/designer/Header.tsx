import type React from 'react'

/**
 * Designer Header：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Header 的单一职责，调用方可通过函数名快速理解输入输出语义。
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
