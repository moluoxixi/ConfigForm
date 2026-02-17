import type { DesignerFieldNode, DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../types'
import {
  containerTarget,
  containerUsesSections,
  rootTarget,
  sectionTarget,
  targetToKey,
} from '@moluoxixi/plugin-lower-code-core'
import { useEffect, useState } from 'react'
import { CanvasMaskLayer } from '../shared/CanvasMaskLayer'

interface CanvasPanelProps {
  nodes: DesignerNode[]
  minCanvasHeight: number
  selectedId: string | null
  canvasHostRef: React.RefObject<HTMLDivElement>
  onSelect: (id: string) => void
  onDuplicateNode: (nodeId: string) => void
  onRemoveNode: (nodeId: string) => void
  onAddSection: (containerId: string) => void
  onRemoveSection: (containerId: string, sectionId: string) => void
  renderFieldPreviewControl: (node: DesignerFieldNode, context: LowCodeDesignerRenderContext) => React.ReactElement
}

export function CanvasPanel({
  nodes,
  minCanvasHeight,
  selectedId,
  canvasHostRef,
  onSelect,
  onDuplicateNode,
  onRemoveNode,
  onAddSection,
  onRemoveSection,
  renderFieldPreviewControl,
}: CanvasPanelProps): React.ReactElement {
  const [activeTabsByContainer, setActiveTabsByContainer] = useState<Record<string, string>>({})

  useEffect(() => {
    setActiveTabsByContainer((prev) => {
      const next: Record<string, string> = {}
      const walk = (items: DesignerNode[]): void => {
        for (const item of items) {
          if (item.kind !== 'container')
            continue

          if (item.component === 'LayoutTabs') {
            const sectionIds = item.sections.map(section => section.id)
            if (sectionIds.length > 0) {
              const previous = prev[item.id]
              next[item.id] = previous && sectionIds.includes(previous) ? previous : sectionIds[0]
            }
          }

          if (containerUsesSections(item.component)) {
            for (const section of item.sections) {
              walk(section.children)
            }
          }
          else {
            walk(item.children)
          }
        }
      }

      walk(nodes)

      const prevKeys = Object.keys(prev)
      const nextKeys = Object.keys(next)
      if (
        prevKeys.length === nextKeys.length
        && nextKeys.every(key => prev[key] === next[key])
      ) {
        return prev
      }
      return next
    })
  }, [nodes])

  const renderDropList = (
    items: DesignerNode[],
    targetKey: string,
    depth: number,
    emptyText: string,
  ): React.ReactElement => {
    const root = depth === 0
    return (
      <div
        data-cf-drop-list="true"
        data-target-key={targetKey}
        className={`cf-lc-drop-list ${root ? '' : 'cf-lc-drop-list--nested'}`}
        style={{
          minHeight: root ? minCanvasHeight : 58,
          padding: root ? 12 : 8,
        }}
      >
        {items.map(node => renderNodeCard(node, depth, targetKey))}
        {items.length === 0 && <div className="cf-lc-empty">{emptyText}</div>}
      </div>
    )
  }

  const renderNodeToolbar = (
    nodeId: string,
    options?: { allowAddSection?: boolean, onAddSection?: () => void },
  ): React.ReactElement => {
    return (
      <div
        className="cf-lc-node-toolbar"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <span
          data-cf-drag-handle="true"
          className="cf-lc-node-tool cf-lc-node-tool--move"
          role="button"
          aria-label="移动"
          title="按住拖动"
        >
          <span className="cf-lc-icon">⠿</span>
        </span>
        {options?.allowAddSection && options.onAddSection && (
          <button
            type="button"
            className="cf-lc-node-tool cf-lc-node-tool--primary"
            title="新增分组"
            onClick={(event) => {
              event.stopPropagation()
              options.onAddSection?.()
            }}
          >
            <span className="cf-lc-icon">＋</span>
          </button>
        )}
        <button
          type="button"
          className="cf-lc-node-tool"
          title="复制"
          onClick={(event) => {
            event.stopPropagation()
            onDuplicateNode(nodeId)
          }}
        >
          <span className="cf-lc-icon">⎘</span>
        </button>
        <button
          type="button"
          className="cf-lc-node-tool cf-lc-node-tool--danger"
          title="删除"
          onClick={(event) => {
            event.stopPropagation()
            onRemoveNode(nodeId)
          }}
        >
          <span className="cf-lc-icon">✕</span>
        </button>
      </div>
    )
  }

  const renderFieldNode = (node: Extract<DesignerNode, { kind: 'field' }>, parentTargetKey: string): React.ReactElement => {
    const selected = selectedId === node.id
    const componentClassName = node.component
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .toLowerCase() || 'component'
    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-parent-target-key={parentTargetKey}
        className={`cf-lc-node cf-lc-node--field ${selected ? 'cf-lc-node--selected' : ''}`}
        onClick={() => onSelect(node.id)}
      >
        {renderNodeToolbar(node.id)}
        <div className="cf-lc-node-preview">
          <div className={`cf-lc-material-preview cf-lc-material-preview--${componentClassName}`}>
            <CanvasMaskLayer>
              {renderFieldPreviewControl(node, { phase: 'canvas', readonly: false })}
            </CanvasMaskLayer>
          </div>
        </div>
      </div>
    )
  }

  const renderSectionHead = (
    container: Extract<DesignerNode, { kind: 'container' }>,
    section: Extract<DesignerNode, { kind: 'container' }>['sections'][number],
  ): React.ReactElement => {
    const selected = selectedId === section.id
    return (
      <div
        className="cf-lc-section-head"
        onClick={event => event.stopPropagation()}
      >
        <span className={`cf-lc-section-title ${selected ? 'is-selected' : ''}`}>
          {section.title || section.name}
        </span>
        <button
          type="button"
          className="cf-lc-section-action"
          title="删除分组"
          onClick={(event) => {
            event.stopPropagation()
            onRemoveSection(container.id, section.id)
          }}
        >
          <span className="cf-lc-icon">✕</span>
        </button>
      </div>
    )
  }

  const renderSectionBody = (
    container: Extract<DesignerNode, { kind: 'container' }>,
    section: Extract<DesignerNode, { kind: 'container' }>['sections'][number],
    depth: number,
    mode: 'tabs' | 'collapse',
  ): React.ReactElement => {
    const selected = selectedId === section.id
    return (
      <div
        key={section.id}
        className={`cf-lc-section cf-lc-section--${mode} ${selected ? 'cf-lc-section--selected' : ''}`}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(section.id)
        }}
      >
        {renderSectionHead(container, section)}
        {renderDropList(section.children, targetToKey(sectionTarget(section.id)), depth + 1, '拖拽字段到该分组')}
      </div>
    )
  }

  const renderContainerContent = (
    node: Extract<DesignerNode, { kind: 'container' }>,
    depth: number,
  ): React.ReactElement => {
    const title = node.title || node.name

    if (node.component === 'LayoutCard') {
      return (
        <div className="cf-lc-layout-card-shell">
          <div className="cf-lc-layout-card-head">{title}</div>
          {renderDropList(node.children, targetToKey(containerTarget(node.id)), depth + 1, '拖拽字段到该容器')}
        </div>
      )
    }

    if (node.component === 'LayoutTabs') {
      const activeKey = activeTabsByContainer[node.id] ?? node.sections[0]?.id
      const activeSection = node.sections.find(section => section.id === activeKey) ?? node.sections[0] ?? null

      return (
        <div className="cf-lc-layout-tabs-shell">
          <div className="cf-lc-layout-tabs-nav">
            {node.sections.map(section => (
              <button
                key={section.id}
                type="button"
                className={`cf-lc-layout-tabs-tab ${section.id === activeKey ? 'is-active' : ''}`}
                onClick={(event) => {
                  event.stopPropagation()
                  setActiveTabsByContainer(prev => ({ ...prev, [node.id]: section.id }))
                  onSelect(section.id)
                }}
              >
                {section.title || section.name}
              </button>
            ))}
          </div>
          <div className="cf-lc-layout-tabs-panels">
            {activeSection
              ? renderSectionBody(node, activeSection, depth, 'tabs')
              : (
                  <div className="cf-lc-empty">
                    请先新增分组
                  </div>
                )}
          </div>
        </div>
      )
    }

    return (
      <div className="cf-lc-layout-collapse-shell">
        {node.sections.map(section => renderSectionBody(node, section, depth, 'collapse'))}
      </div>
    )
  }

  const renderContainerNode = (
    node: Extract<DesignerNode, { kind: 'container' }>,
    depth: number,
    parentTargetKey: string,
  ): React.ReactElement => {
    const selected = selectedId === node.id
    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-parent-target-key={parentTargetKey}
        className={`cf-lc-node cf-lc-node--container ${selected ? 'cf-lc-node--selected' : ''}`}
        onClick={() => onSelect(node.id)}
      >
        {renderNodeToolbar(node.id, {
          allowAddSection: containerUsesSections(node.component),
          onAddSection: () => onAddSection(node.id),
        })}
        <div className="cf-lc-container-body">
          {renderContainerContent(node, depth)}
        </div>
      </div>
    )
  }

  const renderNodeCard = (node: DesignerNode, depth: number, parentTargetKey: string): React.ReactElement => {
    if (node.kind === 'field')
      return renderFieldNode(node, parentTargetKey)
    return renderContainerNode(node, depth, parentTargetKey)
  }

  return (
    <section className="cf-lc-panel">
      <div ref={canvasHostRef} className="cf-lc-canvas-wrap">
        {renderDropList(nodes, targetToKey(rootTarget()), 0, '从左侧拖拽一个字段或容器到这里开始设计。')}
      </div>
    </section>
  )
}
