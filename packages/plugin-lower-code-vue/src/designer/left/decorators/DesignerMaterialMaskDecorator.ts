import { defineComponent, h } from 'vue'

export const DesignerMaterialMaskDecorator = defineComponent({
  name: 'DesignerMaterialMaskDecorator',
  inheritAttrs: false,
  setup(_, { slots }) {
    return () => h('div', { class: 'cf-lc-mask-layer cf-lc-mask-layer--material cf-lc-mask-layer--locked' }, [
      h('div', { class: 'cf-lc-mask-layer-content' }, slots.default?.()),
      h('span', { 'class': 'cf-lc-mask-layer-overlay', 'aria-hidden': 'true' }),
    ])
  },
})
