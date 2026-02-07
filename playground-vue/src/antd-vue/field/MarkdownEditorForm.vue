<template>
  <div>
    <h2>Markdown 编辑器</h2>
    <p style="color: rgba(0,0,0,0.45); margin-bottom: 16px; font-size: 14px;">Markdown 编写 + 实时预览（可接入 md-editor-v3）</p>
    <PlaygroundForm :form="form">
      <template #default="{ form: f, mode }">
        <FormField v-slot="{ field }" name="docTitle"><AFormItem :label="field.label"><span v-if="mode === 'readOnly'">{{ (field.value as string) || '—' }}</span><AInput v-else :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :disabled="mode === 'disabled'" /></AFormItem></FormField>
        <FormField v-slot="{ field }" name="content"><AFormItem :label="field.label">
          <ARow v-if="mode === 'editable'" :gutter="16"><ACol :span="12"><div style="font-size: 12px; color: #999; margin-bottom: 4px">编辑区</div><ATextarea :value="(field.value as string) ?? ''" @update:value="field.setValue($event)" :rows="16" :style="{ fontFamily: 'Consolas, Monaco, monospace', fontSize: '13px' }" /></ACol><ACol :span="12"><div style="font-size: 12px; color: #999; margin-bottom: 4px">预览区</div><div style="border: 1px solid #d9d9d9; border-radius: 6px; padding: 12px; min-height: 380px; overflow: auto; background: #fafafa" v-html="simpleRender((field.value as string) ?? '')" /></ACol></ARow>
          <div v-else style="border: 1px solid #d9d9d9; border-radius: 6px; padding: 16px; background: #fafafa" :style="{ opacity: mode === 'disabled' ? 0.6 : 1 }" v-html="simpleRender((field.value as string) ?? '')" />
        </AFormItem></FormField>
      </template>
    </PlaygroundForm>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue'
import { FormField, useCreateForm } from '@moluoxixi/vue'
import { setupAntdVue } from '@moluoxixi/ui-antd-vue'
import { Input as AInput, FormItem as AFormItem, Textarea as ATextarea, Row as ARow, Col as ACol } from 'ant-design-vue'
import PlaygroundForm from '../../components/PlaygroundForm.vue'
setupAntdVue()
const DEFAULT_MD = '# 标题\n\n## 二级标题\n\n这是**加粗**文字，支持*斜体*和`行内代码`。\n\n- 列表项 1\n- 列表项 2\n\n> 引用文字'
const form = useCreateForm({ initialValues: { docTitle: '使用指南', content: DEFAULT_MD } })
onMounted(() => { form.createField({ name: 'docTitle', label: '文档标题', required: true }); form.createField({ name: 'content', label: 'Markdown', required: true }) })
function simpleRender(md: string): string { return md.replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 4px;border-radius:3px">$1</code>').replace(/^> (.*$)/gm, '<blockquote style="border-left:3px solid #ddd;padding-left:12px;color:#666">$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/\n/g, '<br/>') }
</script>
