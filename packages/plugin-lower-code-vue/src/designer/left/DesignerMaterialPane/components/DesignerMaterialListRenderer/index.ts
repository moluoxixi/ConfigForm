import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { PropType } from 'vue'
import type { RenderMaterialItem } from '../../types'
import { defineComponent, h } from 'vue'

export const DesignerMaterialListRenderer = defineComponent({
  name: 'DesignerMaterialListRenderer',
  props: {
    items: { type: Array as PropType<MaterialItem[]>, required: true },
    renderMaterialItem: {
      type: Function as PropType<RenderMaterialItem>,
      required: true,
    },
  },
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
