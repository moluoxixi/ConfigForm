import type { ISchema } from '@moluoxixi/core'
import type {
  MaterialContainerItem,
  MaterialFieldItem,
  MaterialItem,
} from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { ConfigForm } from '@moluoxixi/vue'
import { computed, defineComponent, h, ref } from 'vue'
import { DesignerMaterialMaskDecorator } from '../decorators/DesignerMaterialMaskDecorator'
import { DesignerMaterialPreviewRenderer } from '../renderers/DesignerMaterialPreviewRenderer'
import { DesignerMaterialListRenderer } from './components/DesignerMaterialListRenderer'
import { DesignerMaterialToolbarRenderer } from './components/DesignerMaterialToolbarRenderer'

export const DesignerMaterialPane = defineComponent({
  name: 'DesignerMaterialPane',
  props: {
    componentMaterials: { type: Array as PropType<MaterialFieldItem[]>, required: true },
    layoutMaterials: { type: Array as PropType<MaterialContainerItem[]>, required: true },
    setMaterialHost: {
      type: Function as PropType<(element: HTMLElement | null) => void>,
      required: true,
    },
    readonly: { type: Boolean, default: false },
    renderMaterialPreview: {
      type: Function as PropType<(item: MaterialItem) => VNodeChild>,
      required: true,
    },
  },
  setup(props) {
    const keyword = ref('')

    const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
    const filterByKeyword = (item: MaterialItem): boolean => {
      if (!normalizedKeyword.value)
        return true
      const text = `${item.label} ${item.description ?? ''}`.toLowerCase()
      return text.includes(normalizedKeyword.value)
    }

    const filteredComponentMaterials = computed(() =>
      props.componentMaterials.filter(filterByKeyword))
    const filteredLayoutMaterials = computed(() =>
      props.layoutMaterials.filter(filterByKeyword))

    const totalCount = computed(() =>
      props.componentMaterials.length + props.layoutMaterials.length)
    const filteredCount = computed(() =>
      filteredComponentMaterials.value.length + filteredLayoutMaterials.value.length)

    const serializeMaterial = (item: MaterialItem): string => {
      try {
        return JSON.stringify(item)
      }
      catch {
        return ''
      }
    }

    function renderMaskedMaterialPreview(item: MaterialItem): VNodeChild {
      return h(DesignerMaterialMaskDecorator, undefined, {
        default: () => [
          h(DesignerMaterialPreviewRenderer, {
            item,
            render: props.renderMaterialPreview,
          }),
        ],
      })
    }

    function renderMaterialItem(item: MaterialItem): VNodeChild {
      return h('div', {
        key: item.id,
        class: 'cf-lc-material-item',
        'data-material-id': item.id,
        'data-material-payload': serializeMaterial(item),
        style: {
          border: '1px solid #cfe0ff',
          borderRadius: '10px',
          padding: '7px',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)',
          userSelect: 'none',
          display: 'grid',
          gap: '6px',
          cursor: props.readonly ? 'not-allowed' : 'grab',
          opacity: props.readonly ? 0.6 : 1,
        },
      }, [
        h('div', { style: { fontSize: '12px', fontWeight: 700, color: '#0f172a', lineHeight: 1.15 } }, item.label),
        h('div', { style: { fontSize: '10px', color: '#94a3b8', lineHeight: 1.2 } }, item.description),
        h('div', {
          class: 'cf-lc-material-preview',
          style: {
            border: '1px solid #d8e3f2',
            borderRadius: '9px',
            background: '#fff',
            minHeight: '62px',
            padding: '6px 7px',
            boxSizing: 'border-box',
            overflow: 'hidden',
          },
        }, [renderMaskedMaterialPreview(item)]),
      ])
    }

    const paneSchema = computed<ISchema>(() => ({
      type: 'object',
      properties: {
        toolbar: {
          type: 'void',
          component: 'DesignerMaterialToolbarRenderer',
          componentProps: {
            keyword: keyword.value,
            onKeywordChange: (nextKeyword: string) => { keyword.value = nextKeyword },
            totalCount: totalCount.value,
            filteredCount: filteredCount.value,
          },
        },
        tabs: {
          type: 'void',
          component: 'LayoutTabs',
          properties: {
            components: {
              type: 'void',
              componentProps: { title: `组件 ${props.componentMaterials.length}` },
              properties: {
                componentList: {
                  type: 'void',
                  component: 'DesignerMaterialListRenderer',
                  componentProps: {
                    items: filteredComponentMaterials.value,
                    renderMaterialItem,
                  },
                },
              },
            },
            layouts: {
              type: 'void',
              componentProps: { title: `布局组件 ${props.layoutMaterials.length}` },
              properties: {
                layoutList: {
                  type: 'void',
                  component: 'DesignerMaterialListRenderer',
                  componentProps: {
                    items: filteredLayoutMaterials.value,
                    renderMaterialItem,
                  },
                },
              },
            },
          },
        },
      },
    }))

    return () => h('section', {
      class: 'cf-lc-material-pane',
      style: {
        width: '260px',
        flex: '0 0 260px',
        border: '1px solid #dbe4f0',
        borderRadius: '12px',
        background: '#fff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
      },
    }, [
      h('div', {
        ref: (element: unknown) => {
          props.setMaterialHost(element as HTMLElement | null)
        },
        style: {
          height: '100%',
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          gap: '10px',
          boxSizing: 'border-box',
          overflow: 'hidden',
        },
      }, [
        h('div', {
          class: 'cf-lc-pane-configform-shell',
          style: {
            flex: '1 1 auto',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        }, [
          h(ConfigForm, {
            schema: paneSchema.value,
            components: {
              DesignerMaterialToolbarRenderer,
              DesignerMaterialListRenderer,
            },
          }),
        ]),
      ]),
    ])
  },
})
