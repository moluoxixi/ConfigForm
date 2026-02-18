import type { ISchema } from '@moluoxixi/core'
import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import {
  containerTarget,
  containerUsesSections,
  rootTarget,
  sectionTarget,
  targetToKey,
} from '@moluoxixi/plugin-lower-code-core'
import { computed, defineComponent, h, ref, watch } from 'vue'
import { DesignerCanvasMaskDecorator } from '../decorators/DesignerCanvasMaskDecorator'
import { DesignerCanvasPreviewRenderer } from '../renderers/DesignerCanvasPreviewRenderer'
import { DesignerCanvasBodyRenderer } from './components/DesignerCanvasBodyRenderer'
import { DesignerCanvasHeaderRenderer } from './components/DesignerCanvasHeaderRenderer'
import type { DesignerFieldPreviewNode } from './types'

export const DesignerCanvasPane = defineComponent({
  name: 'DesignerCanvasPane',
  props: {
    nodes: { type: Array as PropType<DesignerNode[]>, required: true },
    minCanvasHeight: { type: Number, default: 420 },
    selectedId: { type: String as PropType<string | null>, default: null },
    readonly: { type: Boolean, default: false },
    setCanvasHost: {
      type: Function as PropType<(element: HTMLElement | null) => void>,
      required: true,
    },
    onSelect: {
      type: Function as PropType<(id: string) => void>,
      required: true,
    },
    onDuplicateNode: {
      type: Function as PropType<(nodeId: string) => void>,
      required: true,
    },
    onRemoveNode: {
      type: Function as PropType<(nodeId: string) => void>,
      required: true,
    },
    onAddSection: {
      type: Function as PropType<(containerId: string) => void>,
      required: true,
    },
    onRemoveSection: {
      type: Function as PropType<(containerId: string, sectionId: string) => void>,
      required: true,
    },
    renderFieldPreviewControl: {
      type: Function as PropType<(node: DesignerFieldPreviewNode) => VNodeChild>,
      required: true,
    },
  },
  setup(props) {
    const activeTabsByContainer = ref<Record<string, string>>({})

    const renderMaskedCanvasPreview = (node: DesignerFieldPreviewNode): VNodeChild => {
      return h(DesignerCanvasMaskDecorator, undefined, {
        default: () => [
          h(DesignerCanvasPreviewRenderer, {
            node,
            render: props.renderFieldPreviewControl,
          }),
        ],
      })
    }

    watch(
      () => props.nodes,
      (nodes) => {
        const next: Record<string, string> = {}
        const walk = (items: DesignerNode[]): void => {
          for (const item of items) {
            if (item.kind !== 'container')
              continue
            if (item.component === 'LayoutTabs') {
              const sectionIds = item.sections.map(section => section.id)
              if (sectionIds.length > 0) {
                const previous = activeTabsByContainer.value[item.id]
                next[item.id] = previous && sectionIds.includes(previous) ? previous : sectionIds[0]
              }
            }
            if (containerUsesSections(item.component)) {
              for (const section of item.sections)
                walk(section.children)
            }
            else {
              walk(item.children)
            }
          }
        }
        walk(nodes)
        activeTabsByContainer.value = next
      },
      { immediate: true, deep: true },
    )

    const renderNodeToolbar = (nodeId: string, options?: { allowAddSection?: boolean, onAddSection?: () => void }): VNodeChild => {
      if (props.readonly)
        return null
      return h('div', {
        class: 'cf-lc-node-toolbar',
        onClick: (event: Event) => event.stopPropagation(),
      }, [
        h('button', {
          type: 'button',
          class: 'cf-lc-node-tool cf-lc-node-tool--move',
          'data-cf-drag-handle': 'true',
          title: '拖动排序',
          onClick: (event: Event) => {
            event.stopPropagation()
          },
        }, '↕'),
        options?.allowAddSection && options.onAddSection
          ? h('button', {
              type: 'button',
              class: 'cf-lc-node-tool cf-lc-node-tool--primary',
              title: '新增分组',
              onClick: (event: Event) => {
                event.stopPropagation()
                options.onAddSection?.()
              },
            }, '＋')
          : null,
        h('button', {
          type: 'button',
          class: 'cf-lc-node-tool',
          title: '复制',
          onClick: (event: Event) => {
            event.stopPropagation()
            props.onDuplicateNode(nodeId)
          },
        }, '⎘'),
        h('button', {
          type: 'button',
          class: 'cf-lc-node-tool cf-lc-node-tool--danger',
          title: '删除',
          onClick: (event: Event) => {
            event.stopPropagation()
            props.onRemoveNode(nodeId)
          },
        }, '✕'),
      ])
    }

    const renderDropList = (
      items: DesignerNode[],
      targetKey: string,
      depth: number,
      emptyText: string,
    ): VNodeChild => h('div', {
      class: `cf-lc-drop-list ${depth === 0 ? '' : 'cf-lc-drop-list--nested'}`,
      'data-cf-drop-list': 'true',
      'data-target-key': targetKey,
      style: {
        width: '100%',
        boxSizing: 'border-box',
        minHeight: depth === 0 ? `${props.minCanvasHeight}px` : '56px',
        padding: depth === 0 ? '12px' : '8px',
        border: '1px dashed #d7e4f8',
        borderRadius: '10px',
        background: depth === 0 ? '#fcfdff' : '#f8fbff',
        display: 'grid',
        gap: '8px',
      },
    }, [
      ...items.map(node => renderNodeCard(node, depth, targetKey)),
      items.length === 0 ? h('div', { style: { color: '#94a3b8', fontSize: '12px' } }, emptyText) : null,
    ])

    const renderSection = (
      container: Extract<DesignerNode, { kind: 'container' }>,
      section: Extract<DesignerNode, { kind: 'container' }>['sections'][number],
      depth: number,
      mode: 'tabs' | 'collapse',
    ): VNodeChild => {
      const selected = props.selectedId === section.id
      return h('div', {
        key: section.id,
        class: `cf-lc-section cf-lc-section--${mode} ${selected ? 'cf-lc-section--selected' : ''}`,
        onClick: (event: Event) => {
          event.stopPropagation()
          props.onSelect(section.id)
        },
        style: {
          width: '100%',
          boxSizing: 'border-box',
          border: selected ? '1px solid #60a5fa' : '1px solid #dbe4f0',
          borderRadius: '8px',
          padding: '8px',
          background: selected ? '#eff6ff' : '#fff',
          display: 'grid',
          gap: '8px',
        },
      }, [
        h('div', {
          style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
          onClick: (event: Event) => event.stopPropagation(),
        }, [
          h('span', {
            style: {
              fontSize: '12px',
              fontWeight: 700,
              color: selected ? '#1d4ed8' : '#334155',
            },
          }, section.title || section.name),
          !props.readonly
            ? h('button', {
                type: 'button',
                onClick: (event: Event) => {
                  event.stopPropagation()
                  props.onRemoveSection(container.id, section.id)
                },
                style: {
                  border: '1px solid #fecaca',
                  borderRadius: '999px',
                  width: '20px',
                  height: '20px',
                  background: '#fff5f5',
                  color: '#dc2626',
                  cursor: 'pointer',
                },
              }, '✕')
            : null,
        ]),
        renderDropList(section.children, targetToKey(sectionTarget(section.id)), depth + 1, '拖拽字段到该分组'),
      ])
    }

    const renderContainerContent = (node: Extract<DesignerNode, { kind: 'container' }>, depth: number): VNodeChild => {
      if (node.component === 'LayoutCard') {
        return h('div', {
          style: { border: '1px solid #dbe4f0', borderRadius: '10px', overflow: 'hidden', background: '#fff' },
        }, [
          h('div', {
            style: {
              padding: '8px 10px',
              borderBottom: '1px solid #edf2f7',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              background: '#f8fbff',
            },
          }, node.title || node.name),
          h('div', { style: { padding: '8px' } }, [
            renderDropList(node.children, targetToKey(containerTarget(node.id)), depth + 1, '拖拽字段到该容器'),
          ]),
        ])
      }

      if (node.component === 'LayoutTabs') {
        const activeId = activeTabsByContainer.value[node.id] ?? node.sections[0]?.id
        const activeSection = node.sections.find(section => section.id === activeId) ?? node.sections[0] ?? null
        return h('div', {
          style: { border: '1px solid #dbe4f0', borderRadius: '10px', background: '#fff', overflow: 'hidden' },
        }, [
          h('div', {
            style: {
              display: 'flex',
              gap: '6px',
              padding: '6px 8px 0',
              borderBottom: '1px solid #edf2f7',
              background: '#f8fbff',
            },
          }, node.sections.map(section => h('button', {
            key: section.id,
            type: 'button',
            onClick: (event: Event) => {
              event.stopPropagation()
              activeTabsByContainer.value = { ...activeTabsByContainer.value, [node.id]: section.id }
              props.onSelect(section.id)
            },
            style: {
              border: '1px solid',
              borderColor: section.id === activeId ? '#bfdbfe' : 'transparent',
              borderRadius: '7px 7px 0 0',
              padding: '5px 10px',
              background: section.id === activeId ? '#fff' : 'transparent',
              color: section.id === activeId ? '#1d4ed8' : '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
            },
          }, section.title || section.name))),
          h('div', { style: { padding: '8px' } }, [
            activeSection
              ? renderSection(node, activeSection, depth, 'tabs')
              : h('div', { style: { color: '#94a3b8', fontSize: '12px' } }, '请先新增分组'),
          ]),
        ])
      }

      return h('div', { style: { display: 'grid', gap: '8px' } }, node.sections.map(section => renderSection(node, section, depth, 'collapse')))
    }

    const renderFieldNode = (
      node: Extract<DesignerNode, { kind: 'field' }>,
      parentTargetKey: string,
    ): VNodeChild => {
      const selected = props.selectedId === node.id
      return h('div', {
        key: node.id,
        class: `cf-lc-node cf-lc-node--field ${selected ? 'cf-lc-node--selected' : ''}`,
        'data-node-id': node.id,
        'data-parent-target-key': parentTargetKey,
        onClick: () => props.onSelect(node.id),
        style: {
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          border: selected ? '1px solid #60a5fa' : '1px solid #dbe4f0',
          borderRadius: '10px',
          background: selected ? '#eff6ff' : '#fff',
          padding: '10px',
          display: 'grid',
          gap: '8px',
        },
      }, [
        renderNodeToolbar(node.id),
        h('div', {
          style: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', background: '#fff' },
        }, [renderMaskedCanvasPreview(node)]),
      ])
    }

    const renderContainerNode = (
      node: Extract<DesignerNode, { kind: 'container' }>,
      depth: number,
      parentTargetKey: string,
    ): VNodeChild => {
      const selected = props.selectedId === node.id
      return h('div', {
        key: node.id,
        class: `cf-lc-node cf-lc-node--container ${selected ? 'cf-lc-node--selected' : ''}`,
        'data-node-id': node.id,
        'data-parent-target-key': parentTargetKey,
        onClick: () => props.onSelect(node.id),
        style: {
          width: '100%',
          boxSizing: 'border-box',
          position: 'relative',
          border: selected ? '1px solid #60a5fa' : '1px solid #dbe4f0',
          borderRadius: '10px',
          background: selected ? '#eff6ff' : '#fff',
          padding: '10px',
        },
      }, [
        renderNodeToolbar(node.id, {
          allowAddSection: containerUsesSections(node.component),
          onAddSection: () => props.onAddSection(node.id),
        }),
        h('div', { style: { paddingTop: '10px' } }, [renderContainerContent(node, depth)]),
      ])
    }

    const renderNodeCard = (node: DesignerNode, depth: number, parentTargetKey: string): VNodeChild => {
      if (node.kind === 'field')
        return renderFieldNode(node, parentTargetKey)
      return renderContainerNode(node, depth, parentTargetKey)
    }

    const paneSchema = computed<ISchema>(() => ({
      type: 'object',
      properties: {
        header: {
          type: 'void',
          component: 'DesignerCanvasHeaderRenderer',
        },
        body: {
          type: 'void',
          component: 'DesignerCanvasBodyRenderer',
          componentProps: {
            nodes: props.nodes,
            minCanvasHeight: props.minCanvasHeight,
            rootTargetKey: targetToKey(rootTarget()),
            setCanvasHost: props.setCanvasHost,
            renderDropList,
          },
        },
      },
    }))

    const paneComponents = {
      DesignerCanvasHeaderRenderer,
      DesignerCanvasBodyRenderer,
    }

    return () => h('section', {
      style: {
        flex: '1 1 0',
        minWidth: '0',
        minHeight: 0,
        border: '1px solid #dbe4f0',
        borderRadius: '12px',
        background: '#fff',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      },
    }, [
      h('div', {
        style: {
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
        },
      }, [
        h('div', {
          class: 'cf-lc-pane-configform-shell',
          style: {
            flex: '1 1 auto',
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          },
        }, [
          h(ConfigForm, {
            schema: paneSchema.value,
            components: paneComponents,
          }),
        ]),
      ]),
    ])
  },
})
