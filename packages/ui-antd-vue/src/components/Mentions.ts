import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { Mentions as AMentions } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

/** 提及输入适配 — 桥接 modelValue + dataSource + prefix 触发字符 */
export const Mentions = defineComponent({
  name: 'CfMentions',
  props: {
    modelValue: { type: String, default: '' },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
    /** 触发字符，默认 @ */
    prefix: { type: String, default: '@' },
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    /** 将 DataSourceItem[] 转为 ant-design-vue Mentions 的 options 格式 */
    const options = computed(() =>
      props.dataSource.map(item => ({ value: String(item.value), label: item.label })),
    )

    return () => {
      return h(AMentions, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'options': options.value,
        'prefix': props.prefix,
        'onUpdate:value': (v: string) => emit('update:modelValue', v),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
