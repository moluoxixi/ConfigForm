import type { ISchema } from '@moluoxixi/core'
import type { DesignerNode } from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import {
  containerTarget,
  containerUsesSections,
  nodesToSchema,
  rootTarget,
  schemaSignature,
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

    const renderCanvasMask = (
      content: () => VNodeChild,
      options?: { actions?: VNodeChild, disablePointerEvents?: boolean },
    ): VNodeChild => h(DesignerCanvasMaskDecorator, {
      disablePointerEvents: options?.disablePointerEvents ?? true,
    }, {
      default: () => [content()],
      ...(options?.actions
        ? { actions: () => [options.actions] }
        : {}),
    })

    const renderMaskedCanvasPreview = (
      node: DesignerFieldPreviewNode,
      options?: { actions?: VNodeChild },
    ): VNodeChild => renderCanvasMask(
      () => h(DesignerCanvasPreviewRenderer, {
        node,
        render: props.renderFieldPreviewControl,
      }),
      options,
    )

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
      },
    }, [
      ...items.map(node => renderNodeCard(node, depth, targetKey)),
      items.length === 0 ? h('div', { class: 'cf-lc-empty' }, emptyText) : null,
    ])

    const renderSectionHead = (
      container: Extract<DesignerNode, { kind: 'container' }>,
      section: Extract<DesignerNode, { kind: 'container' }>['sections'][number],
    ): VNodeChild => {
      const selected = props.selectedId === section.id
      return h('div', {
        class: 'cf-lc-section-head',
        onClick: (event: Event) => event.stopPropagation(),
      }, [
        h('span', {
          class: `cf-lc-section-title ${selected ? 'is-selected' : ''}`,
        }, section.title || section.name),
        !props.readonly
          ? h('button', {
              type: 'button',
              class: 'cf-lc-section-action',
              title: '删除分组',
              onClick: (event: Event) => {
                event.stopPropagation()
                props.onRemoveSection(container.id, section.id)
              },
            }, '✕')
          : null,
      ])
    }

    const renderSectionBody = (
      container: Extract<DesignerNode, { kind: 'container' }>,
      section: Extract<DesignerNode, { kind: 'container' }>['sections'][number],
      depth: number,
      mode: 'tabs' | 'collapse',
    ): VNodeChild => {
      const selected = props.selectedId === section.id
      return h('div', {
        key: section.id,
        class: `cf-lc-section cf-lc-section--${mode} ${selected ? 'cf-lc-section--selected' : ''}`,
        onMousedownCapture: () => {
          props.onSelect(section.id)
        },
        onClick: (event: Event) => {
          event.stopPropagation()
          props.onSelect(section.id)
        },
      }, [
        renderSectionHead(container, section),
        renderDropList(section.children, targetToKey(sectionTarget(section.id)), depth + 1, '拖拽字段到该分组'),
      ])
    }

    const renderContainerContent = (node: Extract<DesignerNode, { kind: 'container' }>, depth: number): VNodeChild => {
      const title = node.title || node.name

      if (node.component === 'LayoutCard') {
        return h('div', { class: 'cf-lc-layout-card-shell' }, [
          h('div', { class: 'cf-lc-layout-card-head' }, title),
          renderDropList(node.children, targetToKey(containerTarget(node.id)), depth + 1, '拖拽字段到该容器'),
        ])
      }

      if (node.component === 'LayoutTabs') {
        const activeId = activeTabsByContainer.value[node.id] ?? node.sections[0]?.id
        const activeSection = node.sections.find(section => section.id === activeId) ?? node.sections[0] ?? null
        return h('div', { class: 'cf-lc-layout-tabs-shell' }, [
          h('div', { class: 'cf-lc-layout-tabs-nav' }, node.sections.map(section => h('button', {
            key: section.id,
            type: 'button',
            class: `cf-lc-layout-tabs-tab ${section.id === activeId ? 'is-active' : ''}`,
            onClick: (event: Event) => {
              event.stopPropagation()
              activeTabsByContainer.value = { ...activeTabsByContainer.value, [node.id]: section.id }
              props.onSelect(section.id)
            },
          }, section.title || section.name))),
          h('div', { class: 'cf-lc-layout-tabs-panels' }, [
            activeSection
              ? renderSectionBody(node, activeSection, depth, 'tabs')
              : h('div', { class: 'cf-lc-empty' }, '请先新增分组'),
          ]),
        ])
      }

      return h(
        'div',
        { class: 'cf-lc-layout-collapse-shell' },
        node.sections.map(section => renderSectionBody(node, section, depth, 'collapse')),
      )
    }

    const renderFieldNode = (
      node: Extract<DesignerNode, { kind: 'field' }>,
      parentTargetKey: string,
    ): VNodeChild => {
      const selected = props.selectedId === node.id
      const componentClassName = node.component.replace(/[^a-zA-Z0-9_-]/g, '-').toLowerCase() || 'component'
      return h('div', {
        key: node.id,
        class: `cf-lc-node cf-lc-node--field ${selected ? 'cf-lc-node--selected' : ''}`,
        'data-node-id': node.id,
        'data-parent-target-key': parentTargetKey,
        onMousedownCapture: () => {
          props.onSelect(node.id)
        },
        onClick: () => props.onSelect(node.id),
      }, [
        h('div', { class: 'cf-lc-node-preview' }, [
          h('div', { class: `cf-lc-material-preview cf-lc-material-preview--${componentClassName}` }, [
            renderMaskedCanvasPreview(node, { actions: selected ? renderNodeToolbar(node.id) : null }),
          ]),
        ]),
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
        onMousedownCapture: () => {
          props.onSelect(node.id)
        },
        onClick: () => props.onSelect(node.id),
      }, [
        renderCanvasMask(
          () => h('div', { class: 'cf-lc-container-body' }, [renderContainerContent(node, depth)]),
          {
            disablePointerEvents: false,
            actions: selected
              ? renderNodeToolbar(node.id, {
                  allowAddSection: containerUsesSections(node.component),
                  onAddSection: () => props.onAddSection(node.id),
                })
              : null,
          },
        ),
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

    const paneRenderKey = computed(
      () => `${schemaSignature(nodesToSchema(props.nodes))}:${props.selectedId ?? ''}:${props.readonly ? '1' : '0'}`,
    )

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
            key: paneRenderKey.value,
            schema: paneSchema.value,
            components: paneComponents,
          }),
        ]),
      ]),
    ])
  },
})
