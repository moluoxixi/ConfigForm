import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 文本域适配 — readonly 显示纯文本保留换行 */
export const Textarea = defineComponent({
  name: 'CfTextarea',
  props: { modelValue: { type: String, default: '' }, placeholder: String, disabled: Boolean, readonly: Boolean, rows: { type: Number, default: 3 } },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：当前功能模块的核心执行单元。
   * 所属模块：`packages/ui-element-plus/src/components/Textarea.ts`。
   * 本函数会对输入参数进行边界处理与状态推演，并在内部收敛必要的分支和副作用。
   * 为了保证可维护性，调用方应仅依赖本注释声明的入参与返回契约。
   * @param props 参数 `props`用于提供当前函数执行所需的输入信息。
   * @param param2 原始解构参数（{ emit }）用于提供当前函数执行所需的输入信息。
   * @returns 返回当前功能模块约定的处理结果，供上层流程继续组合使用。
   */
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', { style: 'white-space: pre-wrap' }, props.modelValue || '—')
      }
      return h(ElInput, {
        'modelValue': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'type': 'textarea',
        'rows': props.rows,
        /**
         * onUpdate:modelValue：执行当前功能逻辑。
         *
         * @param v 参数 v 的输入说明。
         *
         * @returns 返回当前功能的处理结果。
         */

        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
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
