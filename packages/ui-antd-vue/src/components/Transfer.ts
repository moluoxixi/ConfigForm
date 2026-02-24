import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Transfer as ATransfer } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

const TransferComponent = ATransfer as any

export const Transfer = defineComponent({
  name: 'CfTransfer',
  props: {
    modelValue: { type: Array as PropType<string[]>,
      /**
       * default：执行当前位置的功能处理逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Transfer.ts:12`。
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
       * @returns 返回当前分支执行后的结果。
       */
      default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>,
      /**
       * default：执行当前位置的功能处理逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Transfer.ts:14`。
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
       * @returns 返回当前分支执行后的结果。
       */
      default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],

  /**
   * setup：执行当前位置的功能处理逻辑。
   * 定位：`packages/ui-antd-vue/src/components/Transfer.ts:20`。
   * 功能：完成参数消化、业务分支处理及上下游结果传递。
   * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
   * @param props 参数 props 为当前逻辑所需的输入信息。
   * @returns 返回当前分支执行后的结果。
   */
  setup(props, { emit }) {
    const transferData = computed(() =>
      props.dataSource.map(item => ({
        key: String(item.value),
        title: item.label,
      })),
    )
    return () => h(TransferComponent, {
      'dataSource': transferData.value,
      'targetKeys': props.modelValue,
      'disabled': props.disabled,

      /**
       * render：执行当前位置的功能处理逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Transfer.ts:32`。
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
       * @param item 参数 item 为业务实体对象，用于读写状态或属性。
       * @returns 返回当前分支执行后的结果。
       */
      'render': (item: { title?: string }) => item.title ?? '',

      /**
       * onUpdate:targetKeys：执行当前位置的功能处理逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Transfer.ts:34`。
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
       * @param keys 参数 keys 为当前逻辑所需的输入信息。
       * @returns 返回当前分支执行后的结果。
       */
      'onUpdate:targetKeys': (keys: unknown) => emit('update:modelValue', Array.isArray(keys) ? keys.map(v => String(v)) : []),
    })
  },
})
