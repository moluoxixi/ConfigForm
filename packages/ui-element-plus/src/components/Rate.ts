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
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/Rate.ts`。
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
      return h(ElRate, {
        'modelValue': props.modelValue,
        'disabled': props.disabled || props.readonly,
        'max': props.max,
        'allowHalf': props.allowHalf,
        'showText': props.showText,
        'showScore': props.showScore,
        /**
         * onUpdate:modelValue：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:modelValue': (v: number) => emit('update:modelValue', v),
      })
    }
  },
})
