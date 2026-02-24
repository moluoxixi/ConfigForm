import type { PropType } from 'vue'
import { ElInput } from 'element-plus'
import { defineComponent, h } from 'vue'

/** 文本输入适配 — 桥接 modelValue + readonly 纯文本 */
export const Input = defineComponent({
  name: 'CfInput',
  props: {
    modelValue: { type: [String, Number], default: '' },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    type: { type: String, default: 'text' },
    style: { type: Object as PropType<Record<string, unknown> | undefined>, default: undefined },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  /**
   * setup：执行当前位置的功能逻辑。
   * 定位：`packages/ui-element-plus/src/components/Input.ts:17`。
   * 功能：处理参数消化、状态变更与调用链行为同步。
   * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
   * @param props 参数 props 为当前功能所需的输入信息。
   * @returns 返回当前分支执行后的处理结果。
   */
  setup(props, { emit }) {
    return () => {
      if (props.readonly) {
        return h('span', null, String(props.modelValue || '—'))
      }
      return h(ElInput, {
        'modelValue': String(props.modelValue ?? ''),
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'type': props.type,
        'style': { width: '100%', ...(props.style ?? {}) },
        /**
         * onUpdate:modelValue：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/Input.ts:28`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @param v 参数 v 为当前功能所需的输入信息。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onUpdate:modelValue': (v: string) => emit('update:modelValue', v),
        /**
         * onFocus：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/Input.ts:29`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onFocus': () => emit('focus'),
        /**
         * onBlur：执行当前位置的功能逻辑。
         * 定位：`packages/ui-element-plus/src/components/Input.ts:30`。
         * 功能：处理参数消化、状态变更与调用链行为同步。
         * 流程：先进行输入校验与分支判断，再执行核心处理，最后输出结果或副作用。
         * @returns 返回当前分支执行后的处理结果。
         */
        'onBlur': () => emit('blur'),
      })
    }
  },
})
