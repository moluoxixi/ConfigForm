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
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * @returns 返回当前分支执行后的结果。
       */
      default: () => [] },
    dataSource: { type: Array as PropType<DataSourceItem[]>,
      /**
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * @returns 返回当前分支执行后的结果。
       */
      default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue'],

  /**
   * 功能：完成参数消化、业务分支处理及上下游结果传递。
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
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * @param item 参数 item 为业务实体对象，用于读写状态或属性。
       * @param item.title 列表项标题文本。
       * @returns 返回当前分支执行后的结果。
       */
      'render': (item: { title?: string }) => item.title ?? '',

      /**
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * @param keys 参数 keys 为当前逻辑所需的输入信息。
       * @returns 返回当前分支执行后的结果。
       */
      'onUpdate:targetKeys': (keys: unknown) => emit('update:modelValue', Array.isArray(keys) ? keys.map(v => String(v)) : []),
    })
  },
})
