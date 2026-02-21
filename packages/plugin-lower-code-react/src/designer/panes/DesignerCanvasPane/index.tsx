import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import type { DesignerCanvasBodyRendererProps } from './types'
import { nodesToSchema, schemaSignature } from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/react'
import { useMemo } from 'react'
import { DesignerCanvasBodyRenderer } from './components/DesignerCanvasBodyRenderer'
import { DesignerCanvasHeaderRenderer } from './components/DesignerCanvasHeaderRenderer'

export type DesignerCanvasPaneProps = DesignerCanvasBodyRendererProps

/**
 * Designer Canvas Pane：负责该函数职责对应的主流程编排。
 * 该实现会统一处理参数边界、状态同步与必要副作用，避免调用方重复拼装流程。
 * 返回值遵循模块约定的数据结构，便于在复杂交互中稳定复用与排障。
 *
 * 说明：该函数聚焦于 Designer Canvas Pane 的单一职责，调用方可通过函数名快速理解输入输出语义。
 */
export function DesignerCanvasPane(props: DesignerCanvasPaneProps): ReactElement {
  /**
   * ConfigForm 壳层重挂载 key。
   * 当 schema 结构或只读态变化时，强制重建渲染树与投放列表 DOM，避免状态错位。
   */
  const paneRenderKey = useMemo(
    () => `${schemaSignature(nodesToSchema(props.nodes))}:${props.readonly ? '1' : '0'}`,
    [props.nodes, props.readonly],
  )

  /**
   * 画布面板本身也通过 ConfigForm 进行组合渲染。
   * header/body 分别由下方注册的渲染组件承载。
   */
  const paneSchema: ISchema = {
    type: 'object',
    properties: {
      header: {
        type: 'void',
        component: 'DesignerCanvasHeaderRenderer',
      },
      body: {
        type: 'void',
        component: 'DesignerCanvasBodyRenderer',
        componentProps: { ...props },
      },
    },
  }

  return (
    <section className="cf-lc-panel">
      <ConfigForm
        key={paneRenderKey}
        schema={paneSchema}
        components={{
          DesignerCanvasHeaderRenderer,
          DesignerCanvasBodyRenderer,
        }}
        className="cf-lc-pane-configform-shell"
      />
    </section>
  )
}
