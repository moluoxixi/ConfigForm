import { Rate as ARate } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 评分组件适配 — 桥接 modelValue + count + allowHalf */
export const Rate = defineComponent({
  name: 'CfRate',
  props: {
    modelValue: { type: Number, default: 0 },
    disabled: Boolean,
    readonly: Boolean,
    /** 星星总数 */
    count: { type: Number, default: 5 },
    /** 是否允许半选 */
    allowHalf: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      return h(ARate, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'count': props.count,
        'allowHalf': props.allowHalf,
        'onUpdate:value': (v: number) => emit('update:modelValue', v),
      })
    }
  },
})
