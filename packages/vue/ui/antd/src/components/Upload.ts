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
    modelValue: { type: Array as PropType<FileItem[]>,
      /**
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * @returns 返回当前分支执行后的结果。
       */
      default: () => [] },
    disabled: Boolean,
    readonly: Boolean,
    action: { type: String, default: '' },
    accept: String,
    maxCount: Number,
  },
  emits: ['update:modelValue'],

  /**
   * 功能：完成参数消化、业务分支处理及上下游结果传递。
   * @param props 参数 props 为当前逻辑所需的输入信息。
   * @returns 返回当前分支执行后的结果。
   */
  setup(props, { emit }) {
    const fileList = computed(() => props.modelValue || [])
    return () => h(UploadComponent, {
      'fileList': fileList.value,
      'action': props.action,
      'accept': props.accept,
      'maxCount': props.maxCount,
      'disabled': props.disabled,

      /**
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * @param list 参数 list 为当前逻辑所需的输入信息。
       * @returns 返回当前分支执行后的结果。
       */
      'onUpdate:fileList': (list: unknown) => emit('update:modelValue', (list as FileItem[]) ?? []),
    }, () => h(ButtonComponent, {}, () => '点击上传'))
  },
})

