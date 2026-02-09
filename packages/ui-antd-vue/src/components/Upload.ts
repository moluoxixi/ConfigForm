import { Upload as AUpload, Button as AButton } from 'ant-design-vue'
import { defineComponent, h, computed } from 'vue'
import type { PropType } from 'vue'

interface FileItem {
  uid: string
  name: string
  status?: string
  url?: string
}

export const Upload = defineComponent({
  name: 'CfUpload',
  props: {
    modelValue: { type: Array as PropType<FileItem[]>, default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
    action: { type: String, default: '' },
    accept: String,
    maxCount: Number,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const fileList = computed(() => props.modelValue || [])
    return () => h(AUpload, {
      'fileList': fileList.value,
      'action': props.action,
      'accept': props.accept,
      'maxCount': props.maxCount,
      'disabled': props.disabled,
      'onUpdate:fileList': (list: FileItem[]) => emit('update:modelValue', list),
    }, () => h(AButton, null, () => '点击上传'))
  },
})
