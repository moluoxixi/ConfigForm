import { defineComponent, h } from 'vue'

export const DesignerCanvasMaskDecorator = defineComponent({
  name: 'DesignerCanvasMaskDecorator',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => h('div', { class: 'cf-lc-mask-layer cf-lc-mask-layer--canvas' }, [
      h('div', { class: 'cf-lc-mask-layer-content' }, slots.default?.()),
      h('span', { class: 'cf-lc-mask-layer-overlay', 'aria-hidden': 'true' }),
    ])
  },
})
