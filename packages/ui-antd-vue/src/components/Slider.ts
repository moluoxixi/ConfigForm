import type { PropType } from 'vue'
import { Slider as ASlider } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 滑动输入条适配 — 桥接 modelValue + min/max/step/range */
export const Slider = defineComponent({
  name: 'CfSlider',
  props: {
    modelValue: { type: [Number, Array] as PropType<number | [number, number]>, default: 0 },
    disabled: Boolean,
    readonly: Boolean,
    /** 最小值 */
    min: { type: Number, default: 0 },
    /** 最大值 */
    max: { type: Number, default: 100 },
    /** 步长 */
    step: { type: Number, default: 1 },
    /** 是否为范围选择 */
    range: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      return h(ASlider, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'range': props.range,
        'onUpdate:value': (v: number | [number, number]) => emit('update:modelValue', v),
      })
    }
  },
})
