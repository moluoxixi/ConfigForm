import { defineComponent, h } from 'vue'

export const DesignerCanvasHeaderRenderer = defineComponent({
  name: 'DesignerCanvasHeaderRenderer',
  setup() {
    return () => h('div', {
      style: {
        padding: '12px 14px',
        borderBottom: '1px solid #edf2f7',
        background: 'linear-gradient(180deg, #f8fbff 0%, #f5f9ff 100%)',
        fontSize: '13px',
        fontWeight: 700,
      },
    }, '画布')
  },
})
