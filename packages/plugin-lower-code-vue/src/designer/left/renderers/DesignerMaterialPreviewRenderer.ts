import type { MaterialItem } from '@moluoxixi/plugin-lower-code-core'
import type { PropType, VNodeChild } from 'vue'
import { defineComponent } from 'vue'

export const DesignerMaterialPreviewRenderer = defineComponent({
  name: 'DesignerMaterialPreviewRenderer',
  props: {
    item: { type: Object as PropType<MaterialItem>, required: true },
    render: { type: Function as PropType<(item: MaterialItem) => VNodeChild>, required: true },
  },
  setup(props) {
    return () => props.render(props.item)
  },
})
