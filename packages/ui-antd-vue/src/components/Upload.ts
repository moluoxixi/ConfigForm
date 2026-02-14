import type { PropType } from 'vue'
import { Button as AButton, Upload as AUpload } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

const UploadComponent = AUpload as any
const ButtonComponent = AButton as any

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
    return () => h(UploadComponent, {
      'fileList': fileList.value,
      'action': props.action,
      'accept': props.accept,
      'maxCount': props.maxCount,
      'disabled': props.disabled,
      'onUpdate:fileList': (list: unknown) => emit('update:modelValue', (list as FileItem[]) ?? []),
    }, () => h(ButtonComponent, {}, () => '点击上传'))
  },
})
