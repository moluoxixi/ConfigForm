import type { PropType, VNodeChild } from 'vue'
import { defineComponent } from 'vue'

export const DesignerPropertiesSlotRenderer = defineComponent({
  name: 'DesignerPropertiesSlotRenderer',
  props: {
    render: {
      type: Function as PropType<() => VNodeChild>,
      required: true,
    },
  },
  setup(props) {
    return () => props.render()
  },
})
