<template>
  <div>
    <h2>文件、图片上传</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      antd Upload / 文件+图片上传 / 三种模式
    </p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <FormProvider :form="form">
        <form @submit.prevent="handleSubmit(showResult)" novalidate>
          <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } }" />
          <FormField name="files" :field-props="{ label: '附件上传', component: 'FileUpload' }" />
          <FormField name="images" :field-props="{ label: '图片上传', component: 'ImageUpload', componentProps: { maxCount: 6 } }" />
          <LayoutFormActions v-if="mode === 'editable'" @reset="form.reset()" />
        </form>
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
/**
 * 文件 / 图片上传表单 — Field 模式
 *
 * 自定义 FileUpload / ImageUpload 组件注册后，在 fieldProps 中通过名称引用。
 * 文件列表存储在表单字段中，三态由框架自动传播。
 */
import { Button as AButton, Upload as AUpload } from 'ant-design-vue'
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

/** 上传文件信息 */
interface UploadFileInfo {
  fileList: unknown[]
}

/**
 * 文件上传自定义组件
 *
 * - 编辑态：AUpload + 选择按钮
 * - 禁用态：禁用的 AUpload
 * - 只读态：文件名列表
 */
const FileUpload = defineComponent({
  name: 'FileUpload',
  props: {
    modelValue: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      /* 只读态：显示文件名列表 */
      if (props.readonly) {
        if (!props.modelValue?.length) {
          return h('span', { style: { color: '#999' } }, '暂无文件')
        }
        return h('div', (props.modelValue as Array<{ name?: string }>).map((f, i) =>
          h('div', { key: i, style: { padding: '2px 0', color: '#1677ff' } }, f.name || `文件 ${i + 1}`),
        ))
      }

      /* 编辑/禁用态：Upload 组件 */
      return h(AUpload, {
        fileList: props.modelValue ?? [],
        beforeUpload: () => false,
        disabled: props.disabled,
        onChange: (info: UploadFileInfo) => emit('update:modelValue', info.fileList),
      }, {
        default: () => !props.disabled
          ? h(AButton, null, () => '选择文件')
          : null,
      })
    }
  },
})

/** 图片上传文件数量上限 */
const IMAGE_MAX_COUNT = 6

/**
 * 图片上传自定义组件（picture-card 样式）
 *
 * - 编辑态：AUpload picture-card + 上传按钮
 * - 禁用态：禁用的 picture-card
 * - 只读态：图片名称列表
 */
const ImageUpload = defineComponent({
  name: 'ImageUpload',
  props: {
    modelValue: { type: Array, default: () => [] },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
    maxCount: { type: Number, default: IMAGE_MAX_COUNT },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      /* 只读态：显示图片名称 */
      if (props.readonly) {
        if (!props.modelValue?.length) {
          return h('span', { style: { color: '#999' } }, '暂无图片')
        }
        return h('div', { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
          (props.modelValue as Array<{ name?: string }>).map((f, i) =>
            h('div', {
              key: i,
              style: { width: '80px', height: '80px', border: '1px solid #d9d9d9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: '#999', padding: '4px', textAlign: 'center', wordBreak: 'break-all' },
            }, f.name || `图片 ${i + 1}`),
          ),
        )
      }

      /* 编辑/禁用态：picture-card Upload */
      const showUploadBtn = !props.disabled && (props.modelValue?.length ?? 0) < props.maxCount
      return h(AUpload, {
        fileList: props.modelValue ?? [],
        listType: 'picture-card',
        beforeUpload: () => false,
        disabled: props.disabled,
        onChange: (info: UploadFileInfo) => emit('update:modelValue', info.fileList),
      }, {
        default: () => showUploadBtn
          ? h('div', [h('span', '+'), h('div', { style: { marginTop: '4px' } }, '上传')])
          : null,
      })
    }
  },
})

registerComponent('FileUpload', FileUpload, { defaultWrapper: 'FormItem' })
registerComponent('ImageUpload', ImageUpload, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    title: '',
    files: [] as unknown[],
    images: [] as unknown[],
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

/** 提交处理 */
async function handleSubmit(showResult: (data: Record<string, unknown>) => void): Promise<void> {
  const res = await form.submit()
  if (res.errors.length > 0) {
    st.value?.showErrors(res.errors)
  }
  else {
    showResult(res.values)
  }
}
</script>
