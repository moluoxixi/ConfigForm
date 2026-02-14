import type { DataSourceItem } from '@moluoxixi/core'
import type { PropType } from 'vue'
import { AutoComplete as AAutoComplete } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

/** 自动完成输入适配 — 桥接 modelValue + dataSource 选项 */
export const AutoComplete = defineComponent({
  name: 'CfAutoComplete',
  props: {
    modelValue: { type: String, default: '' },
    dataSource: { type: Array as PropType<DataSourceItem[]>, default: () => [] },
    placeholder: String,
    disabled: Boolean,
    readonly: Boolean,
  },
  emits: ['update:modelValue', 'focus', 'blur'],
  setup(props, { emit }) {
    /** 将 DataSourceItem[] 转为 ant-design-vue AutoComplete 的 options 格式 */
    const options = computed(() =>
      props.dataSource.map(item => ({ value: String(item.value), label: item.label })),
    )

    return () => {
      return h(AAutoComplete as any, {
        'value': props.modelValue,
        'placeholder': props.placeholder,
        'disabled': props.disabled,
        'options': options.value as any,
        'style': 'width: 100%',
        'onUpdate:value': (v: unknown) => emit('update:modelValue', String(v ?? '')),
        'onFocus': () => emit('focus'),
        'onBlur': () => emit('blur'),
      })
    }
  },
})
