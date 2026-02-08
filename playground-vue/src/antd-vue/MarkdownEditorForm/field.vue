<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">
      Markdown 编写 + 实时预览（可接入 md-editor-v3）
    </p>
    <StatusTabs ref="st" v-slot="{ showResult }">
      <FormProvider :form="form">
          <FormField name="docTitle" :field-props="{ label: '文档标题', required: true, component: 'Input', componentProps: { placeholder: '请输入文档标题' } }" />
          <FormField name="content" :field-props="{ label: 'Markdown', required: true, component: 'MarkdownEditor' }" />
          <LayoutFormActions @submit="showResult" @submit-failed="(e: any) => st?.showErrors(e)" />
      </FormProvider>
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { FieldPattern } from '@moluoxixi/shared'
import { LayoutFormActions, setupAntdVue, StatusTabs } from '@moluoxixi/ui-antd-vue'
import { FormField, FormProvider, registerComponent, useCreateForm } from '@moluoxixi/vue'
import { defineComponent, h, ref, watch } from 'vue'

setupAntdVue()

// ========== Markdown 渲染工具 ==========

/**
 * 简易 Markdown → HTML 渲染
 *
 * 支持标题、加粗、斜体、行内代码、引用、列表
 */
function simpleRender(md: string): string {
  return md
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>')
    .replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/\n/g, '<br/>')
}

// ========== 自定义组件：Markdown 编辑器 ==========

/** 预览容器公共样式 */
const PREVIEW_STYLE = {
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  padding: '12px',
  minHeight: '380px',
  overflow: 'auto',
  background: '#fafafa',
}

/**
 * Markdown 编辑器组件
 *
 * - 编辑态：左右分栏（编辑区 + 预览区）
 * - 只读态：渲染后的 Markdown 预览
 * - 禁用态：渲染预览（降低透明度）
 */
const MarkdownEditor = defineComponent({
  name: 'MarkdownEditor',
  props: {
    value: { type: String, default: '' },
    onChange: { type: Function as PropType<(v: string) => void>, default: undefined },
    disabled: { type: Boolean, default: false },
    readOnly: { type: Boolean, default: false },
  },
  setup(props) {
    return (): ReturnType<typeof h> => {
      const rendered = simpleRender(props.value ?? '')

      /* 只读 / 禁用态：仅展示渲染结果 */
      if (props.readOnly || props.disabled) {
        return h('div', {
          style: {
            ...PREVIEW_STYLE,
            padding: '16px',
            opacity: props.disabled ? 0.6 : 1,
          },
          innerHTML: rendered,
        })
      }

      /* 编辑态：左右分栏 */
      return h('div', {
        style: { display: 'flex', gap: '16px' },
      }, [
        /* 编辑区 */
        h('div', { style: { flex: 1 } }, [
          h('div', { style: { fontSize: '12px', color: '#999', marginBottom: '4px' } }, '编辑区'),
          h('textarea', {
            value: props.value ?? '',
            rows: 16,
            style: {
              width: '100%',
              fontFamily: 'Consolas, Monaco, monospace',
              fontSize: '13px',
              padding: '8px',
              border: '1px solid #d9d9d9',
              borderRadius: '6px',
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            },
            onInput: (e: Event) => props.onChange?.((e.target as HTMLTextAreaElement).value),
          }),
        ]),
        /* 预览区 */
        h('div', { style: { flex: 1 } }, [
          h('div', { style: { fontSize: '12px', color: '#999', marginBottom: '4px' } }, '预览区'),
          h('div', {
            style: PREVIEW_STYLE,
            innerHTML: rendered,
          }),
        ]),
      ])
    }
  },
})

registerComponent('MarkdownEditor', MarkdownEditor, { defaultWrapper: 'FormItem' })

// ========== 表单配置 ==========

const st = ref<InstanceType<typeof StatusTabs>>()

/** 默认 Markdown 内容 */
const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'

const form = useCreateForm({
  initialValues: {
    docTitle: '使用指南',
    content: DEFAULT_MD,
  },
})

/** 同步 StatusTabs 的 mode 到 form.pattern */
watch(() => st.value?.mode, (v) => {
  if (v)
    form.pattern = v as FieldPattern
}, { immediate: true })

</script>
