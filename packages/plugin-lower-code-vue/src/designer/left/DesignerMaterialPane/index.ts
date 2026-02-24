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
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:30`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props) {
    const keyword = ref('')

    const normalizedKeyword = computed(() => keyword.value.trim().toLowerCase())
    /**
     * filterByKeyword?????????????????
     * ???`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:50`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param item ?? item ????????????
     * @returns ?????????????
     */
    const /**
           * filterByKeyword：执行当前位置的功能逻辑。
           * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:34`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @param item 参数 item 为业务对象，用于读写状态与属性。
           * @returns 返回当前分支执行后的处理结果。
           */
      filterByKeyword = (item: MaterialItem): boolean => {
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

    /**
     * serializeMaterial?????????????????
     * ???`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:75`?
     * ?????????????????????????????????
     * ??????????????????????????
     * @param item ?? item ????????????
     * @returns ?????????????
     */
    const /**
           * serializeMaterial：执行当前位置的功能逻辑。
           * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:51`。
           * 功能：处理参数消化、状态变更与调用链行为同步。
           * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
           * @param item 参数 item 为业务对象，用于读写状态与属性。
           * @returns 返回当前分支执行后的处理结果。
           */
      serializeMaterial = (item: MaterialItem): string => {
        try {
          return JSON.stringify(item)
        }
        catch {
          return ''
        }
      }

    /**
     * render Masked Material Preview：负责“渲染render Masked Material Preview”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Masked Material Preview 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function renderMaskedMaterialPreview(item: MaterialItem): VNodeChild {
      return h(DesignerMaterialMaskDecorator, undefined, {
        /**
         * default：执行当前位置的功能逻辑。
         * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:69`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        default: () => [
          h(DesignerMaterialPreviewRenderer, {
            item,
            render: props.renderMaterialPreview,
          }),
        ],
      })
    }

    /**
     * render Material Item：负责“渲染render Material Item”的核心实现与调用衔接。
     * 该实现会处理入参规范化、状态迁移和必要的副作用触发，确保各调用点行为一致。
     * 返回值会保持与模块契约一致的结构，便于在上层流程中进行组合、测试与问题定位。
     *
     * 说明：该注释描述 render Material Item 的主要职责边界，便于维护者快速理解函数在链路中的定位。
     */
    function renderMaterialItem(item: MaterialItem): VNodeChild {
      return h('div', {
        'key': item.id,
        'class': 'cf-lc-material-item',
        'data-material-id': item.id,
        'data-material-payload': serializeMaterial(item),
        'style': {
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
            /**
             * onKeywordChange：执行当前位置的功能逻辑。
             * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:131`。
             * 功能：处理参数消化、状态变更与调用链行为同步。
             * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
             * @param nextKeyword 参数 nextKeyword 为当前功能所需的输入信息。
             */
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
        /**
         * ref：执行当前位置的功能逻辑。
         * 定位：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/index.ts:189`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param element 参数 element 为当前功能所需的输入信息。
         */
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
