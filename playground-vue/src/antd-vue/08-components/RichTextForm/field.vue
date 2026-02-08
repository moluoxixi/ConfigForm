<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      富文本集成 / 三种模式（未安装三方库时使用 Textarea 降级）
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="title" :field-props="{ label: '标题', required: true, component: 'Input', componentProps: { placeholder: '请输入标题' } }" />
          <FormField name="content" :field-props="{ label: '正文', required: true, component: 'RichTextEditor' }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { FieldPattern } from '@moluoxixi/core'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
/**
 * 富文本编辑器表单 — Field 模式
 *
 * 自定义 RichTextEditor 组件注册后，在 fieldProps 中通过 component: 'RichTextEditor' 引用。
 * 编辑态使用 Textarea 降级方案（实际项目可接入 @wangeditor/editor-for-vue）；
 * 只读/禁用态渲染 HTML 预览。
 */
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

/**
 * 富文本编辑器自定义组件
 *
 * - 编辑态：Textarea（实际项目可接入 @wangeditor/editor-for-vue）
 * - 禁用态：HTML 渲染区域（半透明）
 * - 只读态：HTML 渲染区域
 */
const RichTextEditor = defineComponent({
  name: 'RichTextEditor',
  props: {
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    readonly: { type: Boolean, default: false },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => {
      /* 只读/禁用态：渲染 HTML 预览 */
      if (props.readonly || props.disabled) {
        return h('div', {
          innerHTML: props.modelValue || '<span style="color:#999">暂无内容</span>',
          style: {
            padding: '12px',
            border: '1px solid #d9d9d9',
            borderRadius: '6px',
            minHeight: '100px',
            background: '#fafafa',
            opacity: props.disabled ? 0.6 : 1,
          },
        })
      }

      /* 编辑态：原生 textarea 降级方案 */
      return h('textarea', {
        value: props.modelValue ?? '',
        rows: 8,
        placeholder: '输入 HTML 内容（实际项目可接入 @wangeditor/editor-for-vue）',
        style: { width: '100%', padding: '8px 12px', border: '1px solid #d9d9d9', borderRadius: '6px', fontSize: '14px', resize: 'vertical', outline: 'none', fontFamily: 'inherit' },
        onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value),
      })
    }
  },
})

registerComponent('RichTextEditor', RichTextEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const form = useCreateForm({
  initialValues: {
    title: '示例文章',
    content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>',
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
