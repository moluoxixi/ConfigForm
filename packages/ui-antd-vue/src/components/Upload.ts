import type { PropType } from 'vue'
import { Button as AButton, Upload as AUpload } from 'ant-design-vue'
import { computed, defineComponent, h } from 'vue'

const UploadComponent = AUpload as any
const ButtonComponent = AButton as any

/**
 * FileItem??????
 * ???`packages/ui-antd-vue/src/components/Upload.ts:8`?
 * ??????????????????????????????
 */
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
       * default：执行当前位置的功能处理逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Upload.ts:19`。
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
   * setup：执行当前位置的功能处理逻辑。
   * 定位：`packages/ui-antd-vue/src/components/Upload.ts:28`。
   * 功能：完成参数消化、业务分支处理及上下游结果传递。
   * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
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
       * onUpdate:fileList：执行当前位置的功能处理逻辑。
       * 定位：`packages/ui-antd-vue/src/components/Upload.ts:37`。
       * 功能：完成参数消化、业务分支处理及上下游结果传递。
       * 流程：先执行输入边界处理，再运行核心逻辑，最后返回或触发后续动作。
       * @param list 参数 list 为当前逻辑所需的输入信息。
       * @returns 返回当前分支执行后的结果。
       */
      'onUpdate:fileList': (list: unknown) => emit('update:modelValue', (list as FileItem[]) ?? []),
    }, () => h(ButtonComponent, {}, () => '点击上传'))
  },
})
