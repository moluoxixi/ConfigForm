import { ElRate } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 评分组件适配
 *
 * 封装 Element Plus 的 ElRate 组件。
 * readonly 模式下以 disabled 样式展示当前评分。
 */
export const Rate = defineComponent({
  name: 'CfRate',
  props: {
    modelValue: { type: Number, default: 0 },
    disabled: Boolean,
    readonly: Boolean,
    /** 最大评分值（星星数量），对应 antd 的 count */
    max: { type: Number, default: 5 },
    /** 是否允许半选 */
    allowHalf: { type: Boolean, default: false },
    /** 是否显示辅助文字 */
    showText: { type: Boolean, default: false },
    /** 是否显示当前分数 */
    showScore: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      return h(ElRate, {
        'modelValue': props.modelValue,
        'disabled': props.disabled || props.readonly,
        'max': props.max,
        'allowHalf': props.allowHalf,
        'showText': props.showText,
        'showScore': props.showScore,
        'onUpdate:modelValue': (v: number) => emit('update:modelValue', v),
      })
    }
  },
})
