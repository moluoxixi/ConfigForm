import type { DesignerFieldNode, DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type React from 'react'
import type { LowCodeDesignerRenderContext } from '../types'
import {
  containerTarget,
  containerUsesSections,
  LOW_CODE_DESIGNER_TEXT,
  LOW_CODE_NODE_TOOLBAR_ICONS,
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
  readonly?: boolean
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
  readonly = false,
}: CanvasPanelProps): React.ReactElement {
  const [activeTabsByContainer, setActiveTabsByContainer] = useState<Record<string, string>>({})

  const isToolbarInteraction = (target: EventTarget | null): boolean => {
    const element = target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null
    return Boolean(element?.closest('[data-cf-toolbar-interactive="true"]'))
  }

  const closestNodeId = (target: EventTarget | null): string | null => {
    const element = target instanceof Element
      ? target
      : target instanceof Node
        ? target.parentElement
        : null
    return element?.closest('[data-node-id]')?.getAttribute('data-node-id') ?? null
  }

  const isNodeSelfEvent = (target: EventTarget | null, nodeId: string): boolean =>
    closestNodeId(target) === nodeId

  const consumeToolbarPointer = (event: React.SyntheticEvent): void => {
    event.preventDefault()
    event.stopPropagation()
  }

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
      if (prevKeys.length === nextKeys.length && nextKeys.every(key => prev[key] === next[key])) {
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
        style={{ minHeight: root ? minCanvasHeight : 58, padding: root ? 12 : 8 }}
      >
        {items.map(node => renderNodeCard(node, depth, targetKey))}
        {items.length === 0 && <div className="cf-lc-empty">{emptyText}</div>}
      </div>
    )
  }

  const renderNodeToolbar = (
    nodeId: string,
    options?: { allowAddSection?: boolean, onAddSection?: () => void },
  ): React.ReactElement | null => {
    if (readonly)
      return null
    const t = LOW_CODE_DESIGNER_TEXT.toolbar
    return (
      <div
        className="cf-lc-node-toolbar"
        data-cf-toolbar-interactive="true"
        onClick={(event) => {
          event.stopPropagation()
        }}
      >
        <span
          data-cf-toolbar-interactive="true"
          className="cf-lc-node-tool cf-lc-node-tool--move"
          role="button"
          aria-label="移动"
          title={t.move}
          onClick={(event) => {
            event.stopPropagation()
          }}
        >
          <span className="cf-lc-icon">{LOW_CODE_NODE_TOOLBAR_ICONS.move}</span>
        </span>
        {options?.allowAddSection && options.onAddSection && (
          <button
            type="button"
            className="cf-lc-node-tool cf-lc-node-tool--primary"
            data-cf-toolbar-interactive="true"
            title={t.addSection}
            onMouseDown={consumeToolbarPointer}
            onPointerDown={consumeToolbarPointer}
            onClick={(event) => {
              event.stopPropagation()
              options.onAddSection?.()
            }}
          >
            <span className="cf-lc-icon">{LOW_CODE_NODE_TOOLBAR_ICONS.addSection}</span>
          </button>
        )}
        <button
          type="button"
          className="cf-lc-node-tool"
          data-cf-toolbar-interactive="true"
          title={t.duplicate}
          onMouseDown={consumeToolbarPointer}
          onPointerDown={consumeToolbarPointer}
          onClick={(event) => {
            event.stopPropagation()
            onDuplicateNode(nodeId)
          }}
        >
          <span className="cf-lc-icon">{LOW_CODE_NODE_TOOLBAR_ICONS.duplicate}</span>
        </button>
        <button
          type="button"
          className="cf-lc-node-tool cf-lc-node-tool--danger"
          data-cf-toolbar-interactive="true"
          title={t.remove}
          onMouseDown={consumeToolbarPointer}
          onPointerDown={consumeToolbarPointer}
          onClick={(event) => {
            event.stopPropagation()
            onRemoveNode(nodeId)
          }}
        >
          <span className="cf-lc-icon">{LOW_CODE_NODE_TOOLBAR_ICONS.remove}</span>
        </button>
      </div>
    )
  }

  const renderFieldNode = (
    node: Extract<DesignerNode, { kind: 'field' }>,
    parentTargetKey: string,
  ): React.ReactElement => {
    const selected = selectedId === node.id
    const componentClassName = node.component.replace(/[^\w-]/g, '-').toLowerCase() || 'component'
    return (
      <div
        key={node.id}
        data-node-id={node.id}
        data-parent-target-key={parentTargetKey}
        className={`cf-lc-node cf-lc-node--field ${selected ? 'cf-lc-node--selected' : ''}`}
        onClick={(event) => {
          if (isToolbarInteraction(event.target))
            return
          onSelect(node.id)
        }}
      >
      <div className="cf-lc-node-preview">
        <div className={`cf-lc-material-preview cf-lc-material-preview--${componentClassName}`}>
          <CanvasMaskLayer actions={selected ? renderNodeToolbar(node.id) : null}>
              {renderFieldPreviewControl(node, { phase: 'canvas', readonly })}
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
    const t = LOW_CODE_DESIGNER_TEXT.toolbar
    return (
      <div className="cf-lc-section-head" onClick={event => event.stopPropagation()}>
        <span className={`cf-lc-section-title ${selected ? 'is-selected' : ''}`}>
          {section.title || section.name}
        </span>
        {!readonly && (
          <button
            type="button"
            className="cf-lc-section-action"
            data-cf-toolbar-interactive="true"
            title={t.removeSection}
            onMouseDown={consumeToolbarPointer}
            onPointerDown={consumeToolbarPointer}
            onClick={(event) => {
              event.stopPropagation()
              onRemoveSection(container.id, section.id)
            }}
          >
            <span className="cf-lc-icon">✕</span>
          </button>
        )}
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
        data-section-id={section.id}
        className={`cf-lc-section cf-lc-section--${mode} ${selected ? 'cf-lc-section--selected' : ''}`}
        onPointerDownCapture={(event) => {
          if (isToolbarInteraction(event.target))
            return
          if (closestNodeId(event.target))
            return event.stopPropagation()
          onSelect(section.id)
        }}
        onMouseDownCapture={(event) => {
          if (isToolbarInteraction(event.target))
            return
          if (closestNodeId(event.target))
            return event.stopPropagation()
          onSelect(section.id)
        }}
        onClick={(event) => {
          if (isToolbarInteraction(event.target))
            return
          if (closestNodeId(event.target))
            return event.stopPropagation()
          onSelect(section.id)
        }}
      >
        {renderSectionHead(container, section)}
        {renderDropList(
          section.children,
          targetToKey(sectionTarget(section.id)),
          depth + 1,
          LOW_CODE_DESIGNER_TEXT.canvas.emptySection,
        )}
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
          {renderDropList(
            node.children,
            targetToKey(containerTarget(node.id)),
            depth + 1,
            LOW_CODE_DESIGNER_TEXT.canvas.emptyContainer,
          )}
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
                    {LOW_CODE_DESIGNER_TEXT.canvas.emptyTabs}
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
        onPointerDownCapture={(event) => {
          if (isToolbarInteraction(event.target))
            return
          if (!isNodeSelfEvent(event.target, node.id))
            return
          onSelect(node.id)
        }}
        onMouseDownCapture={(event) => {
          if (isToolbarInteraction(event.target))
            return
          if (!isNodeSelfEvent(event.target, node.id))
            return
          onSelect(node.id)
        }}
        onClick={(event) => {
          if (isToolbarInteraction(event.target))
            return
          if (!isNodeSelfEvent(event.target, node.id))
            return
          onSelect(node.id)
        }}
      >
        <CanvasMaskLayer
          actions={selected
            ? renderNodeToolbar(node.id, {
                allowAddSection: containerUsesSections(node.component),
                onAddSection: () => onAddSection(node.id),
              })
            : null}
          disablePointerEvents={false}
        >
          <div className="cf-lc-container-body">
            {renderContainerContent(node, depth)}
          </div>
        </CanvasMaskLayer>
      </div>
    )
  }

  function renderNodeCard(node: DesignerNode, depth: number, parentTargetKey: string): React.ReactElement {
    if (node.kind === 'field')
      return renderFieldNode(node, parentTargetKey)
    return renderContainerNode(node, depth, parentTargetKey)
  }

  return (
    <div ref={canvasHostRef} className="cf-lc-canvas-wrap">
      {renderDropList(nodes, targetToKey(rootTarget()), 0, LOW_CODE_DESIGNER_TEXT.canvas.emptyRoot)}
    </div>
  )
}
