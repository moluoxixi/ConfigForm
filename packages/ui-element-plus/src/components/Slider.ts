import type { PropType } from 'vue'
import { ElSlider } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * Slider Component：定义该模块复用的常量配置。
 * 所属模块：`packages/ui-element-plus/src/components/Slider.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const SliderComponent = ElSlider as any

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
  /**
   * setup：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-element-plus/src/components/Slider.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param context 组件上下文对象。
   * @param context.emit 组件事件派发函数。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, context) {
    const { emit } = context
    return () => {
      /* readonly 模式显示纯文本 */
      if (props.readonly) {
        const text = Array.isArray(props.modelValue)
          ? `${props.modelValue[0]} - ${props.modelValue[1]}`
          : String(props.modelValue)
        return h('span', null, text)
      }

      return h(SliderComponent, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        'min': props.min,
        'max': props.max,
        'step': props.step,
        'range': props.range,
        'showInput': props.showInput,
        'showTooltip': props.showTooltip,
        /**
         * onUpdate:modelValue：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         */

        'onUpdate:modelValue': (v: unknown) => {
          if (Array.isArray(v)) {
            const start = Number(v[0] ?? 0)
            const end = Number(v[1] ?? start)
            emit('update:modelValue', [start, end] as [number, number])
            return
          }
          emit('update:modelValue', Number(v ?? 0))
        },
      })
    }
  },
})
