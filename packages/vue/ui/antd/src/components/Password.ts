import { InputPassword as AInputPassword } from 'ant-design-vue'
import { defineComponent, h } from 'vue'

/** 密码输入适配 */
export const Password = defineComponent({
  name: 'CfPassword',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：封装该模块的核心渲染与交互逻辑。
   * 所属模块：`packages/ui-antd-vue/src/components/Password.ts`。
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
      return h(AInputPassword, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        /**
         * onUpdate:value：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        /**
         * onFocus：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前功能逻辑。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onBlur': () => emit('blur'),
      })
    }
  },
})
