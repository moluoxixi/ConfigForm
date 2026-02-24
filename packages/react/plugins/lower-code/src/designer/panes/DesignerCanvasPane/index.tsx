import type { ISchema } from '@moluoxixi/core'
import type { ReactElement } from 'react'
import type { DesignerCanvasBodyRendererProps } from './types'
import { nodesToSchema, schemaSignature } from '@moluoxixi/plugin-lower-code-core'
import { ConfigForm } from '@moluoxixi/ui-basic-react'
import { useMemo } from 'react'
import { DesignerCanvasBodyRenderer } from './components/DesignerCanvasBodyRenderer'
import { DesignerCanvasHeaderRenderer } from './components/DesignerCanvasHeaderRenderer'

/**
 * Designer Canvas Pane Props：描述该模块使用的类型别名语义。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerCanvasPane/index.tsx`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export type DesignerCanvasPaneProps = DesignerCanvasBodyRendererProps

/**
 * Designer Canvas Pane：封装该模块的核心渲染与交互逻辑。
 * 所属模块：`packages/plugin-lower-code-react/src/designer/panes/DesignerCanvasPane/index.tsx`。
 * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
 * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
 * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
 * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
 */
export function DesignerCanvasPane(props: DesignerCanvasPaneProps): ReactElement {
  /**
   * ConfigForm 壳层重挂载 key。
   * 当 schema 结构或只读态变化时，强制重建渲染树与投放列表 DOM，避免状态错位。
   */
  const paneRenderKey = useMemo(
    () => schemaSignature(nodesToSchema(props.nodes)),
    [props.nodes],
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
