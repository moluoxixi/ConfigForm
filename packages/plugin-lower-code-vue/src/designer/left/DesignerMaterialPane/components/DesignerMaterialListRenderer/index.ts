import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { PropType } from 'vue'
import type { RenderMaterialItem } from '../../types'
import { defineComponent, h } from 'vue'

/**
 * Designer Material List Renderer：变量或常量声明。
 * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/components/DesignerMaterialListRenderer/index.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
export const DesignerMaterialListRenderer = defineComponent({
  name: 'DesignerMaterialListRenderer',
  props: {
    items: { type: Array as PropType<MaterialItem[]>, required: true },
    renderMaterialItem: {
      type: Function as PropType<RenderMaterialItem>,
      required: true,
    },
  },
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/plugin-lower-code-vue/src/designer/left/DesignerMaterialPane/components/DesignerMaterialListRenderer/index.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props) {
    return () => h('div', {
      style: {
        flex: '1 1 auto',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      },
    }, [
      h('div', {
        style: {
          flex: '1 1 auto',
          minHeight: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '2px',
        },
      }, [
        h('div', {
          'class': 'cf-lc-material-list',
          'data-cf-material-list': 'true',
          'style': {
            display: 'grid',
            gap: '8px',
            alignContent: 'start',
          },
        }, props.items.map(props.renderMaterialItem)),
        props.items.length === 0
          ? h('div', {
              style: {
                marginTop: '8px',
                border: '1px dashed #dbe4f0',
                borderRadius: '10px',
                padding: '8px 10px',
                background: '#f8fbff',
                color: '#94a3b8',
                fontSize: '12px',
              },
            }, '未找到匹配物料，请调整搜索关键词。')
          : null,
      ]),
    ])
  },
})
