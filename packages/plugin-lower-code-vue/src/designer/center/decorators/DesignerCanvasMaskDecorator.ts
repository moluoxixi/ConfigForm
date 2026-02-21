import { defineComponent, h } from 'vue'

export const DesignerCanvasMaskDecorator = defineComponent({
  name: 'DesignerCanvasMaskDecorator',
  inheritAttrs: false,
  props: {
    disablePointerEvents: {
      type: Boolean,
      default: true,
    },
  },
  setup(props, { slots }) {
    return () => h('div', {
      class: [
        'cf-lc-mask-layer',
        'cf-lc-mask-layer--canvas',
        props.disablePointerEvents ? 'cf-lc-mask-layer--locked' : '',
      ],
    }, [
      h('div', { class: 'cf-lc-mask-layer-content' }, slots.default?.()),
      slots.actions
        ? h('div', { class: 'cf-lc-mask-layer-actions' }, slots.actions())
        : null,
      h('span', { 'class': 'cf-lc-mask-layer-overlay', 'aria-hidden': 'true' }),
    ])
  },
})
