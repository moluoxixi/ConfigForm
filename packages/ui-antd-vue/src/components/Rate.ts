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
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-antd-vue/src/components/Rate.ts`。
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
      return h(ARate, {
        'value': props.modelValue,
        'disabled': props.disabled,
        'count': props.count,
        'allowHalf': props.allowHalf,
        /**
         * onUpdate:value：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:value': (v: number) => emit('update:modelValue', v),
      })
    }
  },
})
