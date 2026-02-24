import { ElSwitch } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * Switch Component：变量或常量声明。
 * 所属模块：`packages/ui-element-plus/src/components/Switch.ts`。
 * 该声明用于描述模块的对外契约或内部结构边界。
 */
const SwitchComponent = ElSwitch as any

/** 开关适配 — readonly 显示"是/否"文本 */
export const Switch = defineComponent({
  name: 'CfSwitch',
  props: { modelValue: { type: Boolean, default: false }, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue'],
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/Switch.ts`。
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
      if (props.readonly) {
        return h('span', null, props.modelValue ? '是' : '否')
      }
      return h(SwitchComponent, {
        'modelValue': props.modelValue,
        'disabled': props.disabled,
        /**
         * onUpdate:modelValue：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:modelValue': (v: unknown) => emit('update:modelValue', Boolean(v)),
      })
    }
  },
})
