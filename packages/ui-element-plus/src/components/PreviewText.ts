import type { PropType } from 'vue'
import { defineComponent, h } from 'vue'

/** 纯文本预览基础组件 */
function createPreview(name: string) {
  return defineComponent({
    name,
    props: {
      modelValue: { type: [String, Number, Boolean, Array, Object] as PropType<unknown>, default: '' },
      dataSource: { type: Array as PropType<Array<{ label: string, value: unknown }>>, default: () => [] },
    },
    setup(props) {
      return () => {
        const value = props.modelValue
        if (value === undefined || value === null || value === '') {
          return h('span', { style: 'color: #c0c4cc' }, '-')
        }
        if (props.dataSource.length > 0) {
          if (Array.isArray(value)) {
            const labels = value.map((v) => {
              const item = props.dataSource.find(d => d.value === v)
              return item?.label ?? String(v)
            })
            return h('span', null, labels.join(', '))
          }
          const item = props.dataSource.find(d => d.value === value)
          return h('span', null, item?.label ?? String(value))
        }
        if (typeof value === 'boolean') {
          return h('span', null, value ? '是' : '否')
        }
        return h('span', null, String(value))
      }
    },
  })
}

export const PreviewInput = createPreview('CfPreviewInput')
export const PreviewPassword = defineComponent({
  name: 'CfPreviewPassword',
  props: { modelValue: { type: String, default: '' } },
  setup(props) {
    return () => h('span', null, props.modelValue ? '••••••' : '-')
  },
})
export const PreviewTextarea = createPreview('CfPreviewTextarea')
export const PreviewInputNumber = createPreview('CfPreviewInputNumber')
export const PreviewSelect = createPreview('CfPreviewSelect')
export const PreviewRadioGroup = createPreview('CfPreviewRadioGroup')
export const PreviewCheckboxGroup = createPreview('CfPreviewCheckboxGroup')
export const PreviewSwitch = defineComponent({
  name: 'CfPreviewSwitch',
  props: { modelValue: { type: Boolean, default: false } },
  setup(props) {
    return () => h('span', null, props.modelValue ? '开' : '关')
  },
})
export const PreviewDatePicker = createPreview('CfPreviewDatePicker')
