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
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-antd-vue/src/components/Slider.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ emit }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, { emit }) {
    return () => {
      return h(ASlider, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'range': props.range,
        /**
         * onUpdate:value：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:value': (v: number | [number, number]) => emit('update:modelValue', v),
      })
    }
  },
})
