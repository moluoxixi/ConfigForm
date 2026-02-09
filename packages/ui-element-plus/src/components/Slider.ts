import type { PropType } from 'vue'
import { ElSlider } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 滑块组件适配
 *
 * 封装 Element Plus 的 ElSlider 组件。
 * readonly 模式下显示当前值的纯文本。
 */
export const Slider = defineComponent({
  name: 'CfSlider',
  props: {
    modelValue: {
      type: [Number, Array] as PropType<number | [number, number]>,
      default: 0,
    },
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
    /** 是否显示输入框 */
    showInput: { type: Boolean, default: false },
    /** 是否显示提示信息 */
    showTooltip: { type: Boolean, default: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      /* readonly 模式显示纯文本 */
      if (props.readonly) {
        const text = Array.isArray(props.modelValue)
          ? `${props.modelValue[0]} - ${props.modelValue[1]}`
          : String(props.modelValue)
        return h('span', null, text)
      }

      return h(ElSlider, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'range': props.range,
        'showInput': props.showInput,
        'showTooltip': props.showTooltip,
        'onUpdate:modelValue': (v: number | [number, number]) => emit('update:modelValue', v),
      })
    }
  },
})
