import type { UploadFile, UploadUserFile } from 'element-plus'
import type { PropType } from 'vue'
import { ElButton, ElUpload } from 'element-plus'
import { defineComponent, h } from 'vue'

/**
 * 上传文件信息
 */
export interface FileInfo {
  /** 文件唯一标识 */
  uid?: string | number
  /** 文件名 */
  name: string
  /** 文件 URL（已上传的文件） */
  url?: string
  /** 文件大小 */
  size?: number
  /** 文件类型 */
  type?: string
  /** 上传状态 */
  status?: 'ready' | 'uploading' | 'success' | 'fail'
}

/**
 * 文件上传适配
 *
 * 封装 Element Plus 的 Upload 组件，
 * 自动对接 ConfigForm 的值系统。
 *
 * modelValue 为 FileInfo 数组，组件内部与 Element Plus 的 UploadUserFile 互转。
 */
export const Upload = defineComponent({
  name: 'CfUpload',
  props: {
    modelValue: { type: Array as PropType<FileInfo[]>, default: () => [] },
    /** 上传地址 */
    action: { type: String, default: '' },
    /** 是否支持多文件上传 */
    multiple: Boolean,
    /** 最大文件数 */
    limit: Number,
    /** 接受的文件类型 */
    accept: String,
    /** 是否拖拽上传 */
    drag: Boolean,
    /** 文件列表展示类型 */
    listType: { type: String as PropType<'text' | 'picture' | 'picture-card'>, default: 'text' },
    /** 是否禁用 */
    disabled: Boolean,
    /** 是否只读 */
    readonly: Boolean,
    /** 请求头 */
    headers: { type: Object as PropType<Record<string, string>>, default: () => ({}) },
    /** 按钮文字 */
    buttonText: { type: String, default: '点击上传' },
    /** 提示文字 */
    tip: String,
    /** 自定义上传方法 */
    httpRequest: { type: Function, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    /** FileInfo → UploadUserFile */
    const toUploadFile = (file: FileInfo): UploadUserFile => ({
      uid: file.uid ? Number(file.uid) : Date.now(),
      name: file.name,
      url: file.url,
      status: file.status ?? 'success',
    })

    /** UploadFile → FileInfo */
    const toFileInfo = (file: UploadFile): FileInfo => ({
      uid: file.uid,
      name: file.name,
      url: file.url ?? (file.response as { url?: string })?.url,
      size: file.size,
      type: file.raw?.type,
      status: file.status,
    })

    /** 同步文件列表到 modelValue */
    const syncFiles = (uploadFiles: UploadFile[]): void => {
      const files = uploadFiles.map(toFileInfo)
      emit('update:modelValue', files)
    }

    return () => {
      /* readonly 模式：只展示文件列表 */
      if (props.readonly) {
        if (!props.modelValue || props.modelValue.length === 0) {
          return h('span', null, '暂无文件')
        }
        return h('div', null, props.modelValue.map(file =>
          h('div', { key: file.uid ?? file.name, style: 'margin-bottom: 4px' }, [
            file.url
              ? h('a', { href: file.url, target: '_blank', rel: 'noopener' }, file.name)
              : h('span', null, file.name),
          ]),
        ))
      }

      const uploadProps: Record<string, unknown> = {
        'action': props.action,
        'fileList': props.modelValue.map(toUploadFile),
        'multiple': props.multiple,
        'limit': props.limit,
        'accept': props.accept,
        'drag': props.drag,
        'listType': props.listType,
        'disabled': props.disabled,
        'headers': props.headers,
        'onUpdate:fileList': syncFiles,
      }

      if (props.httpRequest) {
        uploadProps.httpRequest = props.httpRequest
      }

      const children: ReturnType<typeof h>[] = []

      if (props.drag) {
        children.push(
          h('div', null, [
            h('div', { style: 'font-size: 40px; color: #909399' }, '+'),
            h('div', { style: 'color: #606266; font-size: 14px' }, '将文件拖到此处，或点击上传'),
          ]),
        )
      }
      else if (props.listType === 'picture-card') {
        children.push(h('div', { style: 'font-size: 28px; color: #909399' }, '+'))
      }
      else {
        children.push(
          h(ElButton, { type: 'primary' }, () => props.buttonText),
        )
      }

      return h(ElUpload, uploadProps, () => [
        ...children,
        props.tip
          ? h('div', {
              class: 'el-upload__tip',
              style: 'color: #909399; font-size: 12px',
            }, props.tip)
          : null,
      ])
    }
  },
})
