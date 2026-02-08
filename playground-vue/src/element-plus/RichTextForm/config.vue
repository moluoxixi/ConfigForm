<template>
  <div>
    <h2>富文本编辑器</h2>
    <p style="color: #909399; margin-bottom: 16px; font-size: 14px;">富文本集成 / 三种模式 — ConfigForm + Schema 实现</p>
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
import type { ISchema } from '@moluoxixi/schema'
import type { FieldPattern } from '@moluoxixi/core'
import { setupElementPlus, StatusTabs } from '@moluoxixi/ui-element-plus'
import { ConfigForm, registerComponent } from '@moluoxixi/vue'
/**
 * 富文本编辑器 — Config 模式
 *
 * 自定义 RichTextEditor 组件注册后，在 schema 中通过 component: 'RichTextEditor' 引用。
 * 编辑态使用 Textarea 降级；只读/禁用态渲染 HTML 预览。
 */
import { defineComponent, h, ref } from 'vue'

setupElementPlus()

/** 富文本编辑器组件 */
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
      if (props.readonly || props.disabled) {
        return h('div', { innerHTML: props.modelValue || '<span style="color:#999">暂无内容</span>', style: { padding: '12px', border: '1px solid #d9d9d9', borderRadius: '6px', minHeight: '100px', background: '#fafafa', opacity: props.disabled ? 0.6 : 1 } })
      }
      return h('textarea', { value: props.modelValue ?? '', rows: 8, placeholder: '输入 HTML 内容', style: { width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: '6px', fontSize: '14px', resize: 'vertical', boxSizing: 'border-box' }, onInput: (e: Event) => emit('update:modelValue', (e.target as HTMLTextAreaElement).value) })
    }
  },
})

registerComponent('RichTextEditor', RichTextEditor, { defaultWrapper: 'FormItem' })

const st = ref<InstanceType<typeof StatusTabs>>()

const initialValues = { title: '示例文章', content: '<h2>标题</h2><p>这是<strong>富文本</strong>内容。</p>' }

const schema: ISchema = {
  type: 'object',
  decoratorProps: { labelPosition: 'right', labelWidth: '120px', actions: { submit: '提交', reset: '重置' } },
  properties: {
    title: { type: 'string', title: '标题', required: true, componentProps: { placeholder: '请输入标题' } },
    content: { type: 'string', title: '正文', required: true, component: 'RichTextEditor' },
  },
}

/** 将 mode 注入 schema */
function withMode(s: ISchema, mode: FieldPattern): ISchema {
  return { ...s, pattern: mode, decoratorProps: { ...s.decoratorProps, pattern: mode } }
}
</script>
