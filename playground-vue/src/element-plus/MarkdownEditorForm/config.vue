<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">Markdown 编写 + 实时预览 — ConfigForm + Schema 实现</p>
    <StatusTabs ref="st" v-slot="{ mode, showResult }">
      <ConfigForm
        :schema="withMode(schema, mode)"
        :initial-values="initialValues"
        @submit="showResult"
        @submit-failed="(e: any) => st?.showErrors(e)"
      />
    </StatusTabs>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * Markdown 编辑器 — Config 模式
 *
 * 自定义 MarkdownEditor 组件注册后，在 schema 中通过 component: 'MarkdownEditor' 引用。
 */
import { defineComponent, h, ref } from 'vue'

setupElementPlus()

/** 简易 Markdown → HTML 渲染 */
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

const PREVIEW_STYLE = { border: '1px solid #d9d9d9', borderRadius: '6px', padding: '12px', minHeight: '380px', overflow: 'auto', background: '#fafafa' }

/** Markdown 编辑器组件 */
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
      if (props.readOnly || props.disabled) {
        return h('div', { style: { ...PREVIEW_STYLE, padding: '16px', opacity: props.disabled ? 0.6 : 1 }, innerHTML: rendered })
      }
      return h('div', { style: { display: 'flex', gap: '16px' } }, [
        h('div', { style: { flex: 1 } }, [
          h('div', { style: { fontSize: '12px', color: '#999', marginBottom: '4px' } }, '编辑区'),
          h('textarea', { value: props.value ?? '', rows: 16, style: { width: '100%', fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '6px', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }, onInput: (e: Event) => props.onChange?.((e.target as HTMLTextAreaElement).value) }),
        ]),
        h('div', { style: { flex: 1 } }, [
          h('div', { style: { fontSize: '12px', color: '#999', marginBottom: '4px' } }, '预览区'),
          h('div', { style: PREVIEW_STYLE, innerHTML: rendered }),
        ]),
      ])
    }
  },
})

registerComponent('MarkdownEditor', MarkdownEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'

const initialValues = { docTitle: '使用指南', content: DEFAULT_MD }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    docTitle: { type: 'string', title: '文档标题', required: true, componentProps: { placeholder: '请输入文档标题' } },
    content: { type: 'string', title: 'Markdown', required: true, component: 'MarkdownEditor' },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
